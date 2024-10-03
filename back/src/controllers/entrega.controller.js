const errors = require('../const/error')
const { red, yellow } = require('picocolors')
const { handleTransaction } = require('../const/transactionHelper')
const models = require('../database/models/index')
const GoogleDriveService = require('../services/GoogleDriveService') // Importa el servicio de Google Drive
const fs = require('fs') // Para manejar el stream de archivos
const { PDFDocument } = require('pdf-lib') // Importa la biblioteca pdf-lib
const picocolors = require('picocolors')

const googleDriveService = new GoogleDriveService()

// Función para crear una entrega
const crearEntrega = async (req, res, next) => {
  const files = req.files
  try {
    const { entregaPactadaId } = req.body
    const entregaPactada = await models.EntregaPactada.findByPk(entregaPactadaId, {
      include: [
        {
          model: models.InstanciaEvaluativa,
          attributes: ['grupo', 'curso_id']
        }
      ]
    })

    if (!entregaPactada) {
      console.warn(yellow('Advertencia: EntregaPactada no encontrada.'))
      throw new Error('EntregaPactada no encontrada')
    }

    const entregaGrupal = entregaPactada.InstanciaEvaluativa.grupo
    let grupoId = null
    if (entregaGrupal) {
      const personaXgrupo = await models.PersonaXGrupo.findOne({
        where: {
          persona_id: res.locals.usuario.persona_id
        },
        include: [
          {
            model: models.Grupo,
            where: {
              curso_id: entregaPactada.InstanciaEvaluativa.curso_id
            }
          }
        ]
      })
      if (!personaXgrupo) {
        throw new Error('No se encontró grupo para la persona y la entrega es grupal')
      }
      grupoId = personaXgrupo.grupo_ID
    }

    const verificarEntregaExistente = async (entregaPactadaId, personaId) => {
      return await models.Entrega.findOne({
        where: {
          entregaPactada_ID: entregaPactadaId,
          grupo_ID: grupoId,
          persona_id: personaId
        }
      })
    }

    const entregaExistente = await verificarEntregaExistente(entregaPactadaId, res.locals.usuario.persona_id)
    if (entregaExistente) {
      throw new Error('Ya existe una entrega con los mismos datos')
    }

    const entrega = await handleTransaction(async (transaction) => {
      const nuevaEntrega = await models.Entrega.create({
        fecha: Date.now(),
        nota: null,
        grupo_ID: grupoId ?? null,
        persona_id: res.locals.usuario.persona_id,
        entregaPactada_ID: entregaPactadaId,
        updated_by: res.locals.usuario.ID
      }, { transaction })

      return nuevaEntrega
    }, next)

    const folderId = process.env.GOOGLE_DRIVE_MAIN_FOLDER_ID
    const entregasFolderId = await googleDriveService.getOrCreateFolder(folderId, 'Entregas')
    const entregaPactadaFolderId = await googleDriveService.getOrCreateFolder(entregasFolderId, entregaPactadaId.toString())

    const archivos = []
    for (const file of files) {
      const mimeType = file.mimetype
      const filePath = file.path

      // Leer el archivo PDF y comprimir
      const pdfBytes = fs.readFileSync(filePath)
      const pdfDoc = await PDFDocument.load(pdfBytes)
      const compressedPdfBytes = await pdfDoc.save({ useObjectStreams: false })

      // Guardar el archivo comprimido temporalmente
      const compressedFilePath = `${filePath}-compressed.pdf`
      fs.writeFileSync(compressedFilePath, compressedPdfBytes)

      // Registrar el archivo comprimido temporal
      req.tempFiles.push(compressedFilePath)

      // Crear el registro del archivo en la base de datos para obtener su ID
      const archivo = await models.Archivo.create({
        nombre: '', // Nombre temporal, se actualizará después
        referencia: '',
        extension: file.mimetype.split('/')[1],
        entrega_id: entrega.ID
      })

      // Cambiar el nombre del archivo al ID del archivo.pdf
      const fileName = `${archivo.ID}.pdf`
      console.log(`Nombre del archivo: ${fileName}`)

      const fileStream = fs.createReadStream(compressedFilePath)
      const { file: driveFile, folder: driveFolder } = await googleDriveService.uploadFile(fileStream, fileName, mimeType, entregaPactadaFolderId)

      // Actualizar el registro del archivo con el nombre y la referencia correctos
      await archivo.update({
        nombre: fileName,
        referencia: driveFile.webViewLink
      })

      archivos.push(archivo)

      // Registrar información en la consola
      console.log(yellow('Soy Controller - Archivo subido:', driveFile))
      console.log(yellow('Soy Controller - Carpeta contenedora:', driveFolder))
    }

    res.status(201).json({
      entrega,
      archivos
    })
  } catch (error) {
    console.error('Error al crear la entrega y subir los archivos:', error)
    next(error)
  } finally {
    for (const file of files) {
      if (file && file.path) {
        try {
          fs.unlinkSync(file.path)
          console.log(`Archivo temporal ${file.path} eliminado`)
        } catch (err) {
          console.error(`Error al eliminar el archivo temporal ${file.path}:`, err)
        }
      }
    }
  }
}

// Un docente puede listar las entregas
async function listarEntregasDocente(req, res, next) {
  const { grupoId } = req.params

  try {
    const entregas = await models.Entrega.findAll({
      where: { grupo_ID: grupoId },
      attributes: ['ID', 'fecha', 'nota'],
      include: [
        {
          model: models.Persona,
          attributes: ['ID', 'rol', 'dni', 'legajo', 'apellido', 'nombre']
        }
      ]
    })

    if (!entregas.length) {
      return next({ ...errors.NotFoundError, details: 'No se encontraron entregas para el grupo' })
    }

    res.status(200).json(entregas)
  } catch (error) {
    next({
      ...errors.InternalServerError,
      details: 'Error al listar las entregas: ' + error.message
    })
  }
}

// Función para actualizar una entrega
async function actualizar(req, res, next) {
  const { id } = req.params
  const { fecha, nota, grupoId, personaId } = req.body

  try {
    await handleTransaction(async (transaction) => {
      const entrega = await models.Entrega.findOne({
        where: { ID: id },
        attributes: ['ID'],
        transaction
      })

      if (!entrega) {
        console.warn(yellow(`Advertencia: Entrega con ID ${id} no encontrada.`))
        await transaction.rollback()
        return next({ ...errors.NotFoundError, details: 'Entrega no encontrada' })
      }

      await entrega.update({
        fecha,
        nota,
        grupo_ID: grupoId,
        persona_id: personaId,
        updated_by: res.locals.usuario.ID
      }, { transaction })

      res.status(200).json(entrega)
    }, next)
  } catch (error) {
    console.error(red('Error al actualizar la entrega:', error))
    next(error) // Pasa el error al middleware de errores
  }
}

// Función para eliminar una entrega
async function eliminar(req, res, next) {
  const { id } = req.params

  const entregaEliminada = await handleTransaction(async (transaction) => {
    const entrega = await models.Entrega.findByPk(id, {
      attributes: ['ID'],
      transaction
    })

    if (!entrega) {
      console.warn(yellow(`Advertencia: Entrega con ID ${id} no encontrada.`))
      await transaction.rollback()
      return next({ ...errors.NotFoundError, details: 'Entrega no encontrada' })
    }

    await entrega.destroy({ transaction })
    return entrega
  }, next)

  if (entregaEliminada) {
    res.status(200).json({ message: 'Entrega eliminada exitosamente' })
  }
}

// Función para obtener un archivo
const obtenerArchivo = async (req, res, next) => {
  const { id } = req.params
  try {
    const archivo = await models.Archivo.findOne({
      where: { ID: id },
      attributes: ['ID', 'nombre', 'referencia']
    })

    if (!archivo) {
      console.warn(`Advertencia: Archivo con ID ${id} no encontrado.`)
      return next({ ...errors.NotFoundError, details: 'Archivo no encontrado' })
    }

    console.log(picocolors.bgWhite(`Archivo encontrado: ${JSON.stringify(archivo)}`))

    // Asegúrate de que archivo.referencia contiene solo el ID del archivo
    const fileId = googleDriveService.extractFileIdFromLink(archivo.referencia)
    console.log(picocolors.bgRed(`ID del archivo en Google Drive: ${fileId}`))

    const fileStream = await googleDriveService.getFile(fileId)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename=${archivo.nombre}`)
    fileStream.pipe(res)
  } catch (error) {
    console.error('Error al obtener el archivo:', error)
    next({
      ...errors.InternalServerError,
      details: 'Error al obtener el archivo: ' + error.message
    })
  }
}
/* const asociarArchivoAEntrega = async (req, res, next) => {
    const file = req.file
    const { entregaId } = req.params
    const { entregaPactadaId } = req.body

    try {
      let entrega = await models.Entrega.findByPk(entregaId)

      if (!entrega) {
        console.warn(yellow(`Advertencia: Entrega con ID ${entregaId} no encontrada. Creando nueva entrega.`))

        const entregaPactada = await models.EntregaPactada.findByPk(entregaPactadaId, {
          include: [
            {
              model: models.InstanciaEvaluativa,
              attributes: ['grupo', 'curso_id']
            }
          ]
        })

        if (!entregaPactada) {
          return next({ ...errors.NotFoundError, details: 'EntregaPactada no encontrada' })
        }

        const entregaGrupal = entregaPactada.InstanciaEvaluativa.grupo
        let grupoId = null
        if (entregaGrupal) {
          const personaXgrupo = await models.PersonaXGrupo.findOne({
            where: {
              persona_id: res.locals.usuario.persona_id
            },
            include: [
              {
                model: models.Grupo,
                where: {
                  curso_id: entregaPactada.InstanciaEvaluativa.curso_id
                }
              }
            ]
          })
          if (!personaXgrupo) {
            return next({ ...errors.NotFoundError, details: 'No se encontro grupo para la persona y la entrega es grupal' })
          }
          grupoId = personaXgrupo.grupo_ID
        }

        const entregaExistente = await models.Entrega.findOne({
          where: {
            entregaPactada_ID: entregaPactadaId,
            grupo_ID: grupoId,
            persona_id: res.locals.usuario.persona_id
          }
        })

        if (entregaExistente) {
          return next({ ...errors.ConflictError, details: 'Ya existe una entrega con los mismos datos' })
        }

        entrega = await handleTransaction(async (transaction) => {
          const nuevaEntrega = await models.Entrega.create({
            fecha: Date.now(),
            nota: null,
            grupo_ID: grupoId ?? null,
            persona_id: res.locals.usuario.persona_id,
            entregaPactada_ID: entregaPactadaId,
            updated_by: res.locals.usuario.ID
          }, { transaction })

          return nuevaEntrega
        }, next)
      }

      const entregaPactadaNombre = entregaPactadaId // Obtenemos el nombre de EntregaPactada
      const usuarioId = res.locals.usuario.ID // ID del usuario

      const folderId = process.env.GOOGLE_DRIVE_MAIN_FOLDER_ID // ID de la carpeta raíz

      // Obtenemos la carpeta del usuario y la entrega pactada, si no existe la creamos
      const usuarioFolderId = await googleDriveService.getOrCreateFolder(folderId, usuarioId.toString())
      const entregaPactadaFolderId = await googleDriveService.getOrCreateFolder(usuarioFolderId, entregaPactadaNombre)
      const mimeType = file.mimetype
      console.log(picocolors.bgYellow(`Tipo de archivo: ${file.mimetype}`))
      // Crear el registro del archivo en la base de datos para obtener su ID
      const archivo = await models.Archivo.create({
        nombre: '', // Nombre temporal, se actualizará después
        referencia: '',
        extension: file.mimetype.split('/')[1],
        entrega_id: entrega.ID
      })

      // Cambiar el nombre del archivo al ID del archivo.pdf
      const fileName = `${archivo.ID}.pdf`
      console.log(`Nombre del archivo: ${fileName}`)

      const fileStream = fs.createReadStream(file.path)
      const driveFile = await googleDriveService.uploadFile(fileStream, fileName, mimeType, entregaPactadaFolderId)

      // Actualizar el registro del archivo con el nombre y la referencia correctos
      await archivo.update({
        nombre: fileName,
        referencia: driveFile.webViewLink
      })

      res.status(201).json({
        message: 'Archivo asociado exitosamente',
        entrega,
        archivo
      })
    } catch (error) {
      console.error('Error al asociar el archivo a la entrega:', error)
      next({ ...errors.InternalServerError, details: 'No se pudo asociar el archivo -' + error.message })
    } finally {
      // Eliminar el archivo temporal
      if (file && file.path) {
        fs.unlink(file.path, (err) => {
          if (err) {
            console.error(red('Error al eliminar el archivo temporal:', err))
          } else {
            console.log(yellow(`Archivo temporal ${file.path} eliminado`))
          }
        })
      }
    }
  }
  */
module.exports = {
  listarEntregasDocente,
  crearEntrega,
  obtenerArchivo
}
