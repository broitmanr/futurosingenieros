const errors = require('../const/error')
const { handleTransaction } = require('../const/transactionHelper')
const models = require('../database/models/index')
const GoogleDriveService = require('../services/GoogleDriveService') // Importa el servicio de Google Drive
const fs = require('fs') // Para manejar el stream de archivos
const { PDFDocument } = require('pdf-lib') // Importa la biblioteca pdf-lib
const pico = require('picocolors')

const googleDriveService = new GoogleDriveService()

const crearEntrega = async (req, res, next) => {
  const files = req.files
  console.log(pico.blue(`Iniciando creación de entrega con ${files.length} archivos`))
  try {
    const { entregaPactadaId } = req.body
    console.log(pico.yellow(`EntregaPactadaId: ${entregaPactadaId}`))

    const entregaPactada = await models.EntregaPactada.findByPk(entregaPactadaId, {
      include: [
        {
          model: models.InstanciaEvaluativa,
          attributes: ['grupo', 'curso_id']
        }
      ]
    })

    if (!entregaPactada) {
      console.warn(pico.red('Advertencia: EntregaPactada no encontrada.'))
      return next({ ...errors.NotFoundError, details: 'EntregaPactada no encontrada' })
    }

    console.log(pico.green(`EntregaPactada encontrada: ${JSON.stringify(entregaPactada, null, 2)}`))

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
        return next({ ...errors.NotFoundError, details: 'No se encontró grupo para la persona y la entrega es grupal' })
      }
      grupoId = personaXgrupo.grupo_ID
    }

    // Verificar si ya existe una entrega
    let entrega = await models.Entrega.findOne({
      where: {
        entregaPactada_ID: entregaPactadaId,
        grupo_ID: grupoId,
        persona_id: res.locals.usuario.persona_id
      }
    })

    if (entrega) {
      console.log(pico.yellow(`Entrega ya existente encontrada con ID: ${entrega.ID}`))
    } else {
      console.log(pico.magenta('Creando nueva entrega en la base de datos'))
      entrega = await handleTransaction(async (transaction) => {
        const nuevaEntrega = await models.Entrega.create({
          fecha: Date.now(),
          nota: null,
          grupo_ID: grupoId ?? null,
          persona_id: res.locals.usuario.persona_id,
          entregaPactada_ID: entregaPactadaId,
          updated_by: res.locals.usuario.ID
        }, { transaction })

        console.log(pico.green(`Nueva entrega creada: ${JSON.stringify(nuevaEntrega, null, 2)}`))
        return nuevaEntrega
      }, next)
    }

    console.log(pico.blue('Obteniendo o creando carpetas en Google Drive'))
    const folderId = process.env.GOOGLE_DRIVE_MAIN_FOLDER_ID
    console.log(pico.yellow(`Folder ID principal: ${folderId}`))
    const entregasFolderId = await googleDriveService.getOrCreateFolder(folderId, 'Entregas')
    console.log(pico.green(`Folder ID de Entregas: ${entregasFolderId}`))
    const entregaPactadaFolderId = await googleDriveService.getOrCreateFolder(entregasFolderId, entregaPactadaId.toString())
    console.log(pico.green(`Folder ID de EntregaPactada: ${entregaPactadaFolderId}`))

    const archivos = await asociarArchivos(files, entrega, entregaPactadaFolderId, req)

    console.log(pico.blue(`Entrega creada exitosamente con ${archivos.length} archivos`))
    res.status(201).json({
      entrega,
      archivos
    })
  } catch (error) {
    console.error(pico.red(`Error al crear la entrega y subir los archivos: ${error.message}`))
    console.error(pico.red(error.stack))
    next({
      ...errors.InternalServerError,
      details: 'Error al crear la entrega y subir los archivos: ' + error.message
    })
  } finally {
    for (const file of files) {
      if (file && file.path) {
        req.tempFiles.push(file.path)
      }
    }
  }
}
const asociarArchivos = async (files, entrega, entregaPactadaFolderId, req, next) => {
  const archivos = []
  if (!files || !files.length) {
    console.warn(pico.yellow('Advertencia: No se encontraron archivos para subir'))
    return next({ ...errors.BadRequestError, details: 'No se encontraron archivos para asociar' })
  } else if (files.length >= 1) {
    const esEntregaPactadaIdValido = await models.EntregaPactada.findByPk(entrega.entregaPactada_ID)
    if (!esEntregaPactadaIdValido) {
      console.warn(pico.yellow('Advertencia: El ID de la entrega pactada no es válido'))
      return next({ ...errors.NotFoundError, details: 'El ID de la entrega pactada no es válido' })
    } else {
      for (const file of files) {
        console.log(pico.magenta(`Procesando archivo: ${file.originalname}`))
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

        console.log(pico.blue(`Subiendo archivo a Google Drive: ${fileName}`))
        const { file: driveFile, folder: driveFolder } = await googleDriveService.uploadFile(fileStream, fileName, mimeType, entregaPactadaFolderId)

        console.log(pico.green(`Archivo subido. Drive File: ${JSON.stringify(driveFile, null, 2)}`))
        console.log(pico.green(`Carpeta contenedora: ${JSON.stringify(driveFolder, null, 2)}`))

        // Actualizar el registro del archivo con el nombre y la referencia correctos
        await archivo.update({
          nombre: fileName,
          referencia: driveFile.webViewLink
        })

        archivos.push(archivo)
      }
      return archivos
    }
  }
}

// Un docente puede listar las entregas
async function listarEntregasDocente (req, res, next) {
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
async function actualizar (req, res, next) {
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
        console.warn(pico.yellow(`Advertencia: Entrega con ID ${id} no encontrada.`))
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
    console.error(pico.red('Error al actualizar la entrega:', error))
    next(error) // Pasa el error al middleware de errores
  }
}

// Función para eliminar una entrega
async function eliminar (req, res, next) {
  const { id } = req.params

  const entregaEliminada = await handleTransaction(async (transaction) => {
    const entrega = await models.Entrega.findByPk(id, {
      attributes: ['ID'],
      transaction
    })

    if (!entrega) {
      console.warn(pico.yellow(`Advertencia: Entrega con ID ${id} no encontrada.`))
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

    console.log(pico.bgWhite(`Archivo encontrado: ${JSON.stringify(archivo)}`))

    // Asegúrate de que archivo.referencia contiene solo el ID del archivo
    const fileId = googleDriveService.extractFileIdFromLink(archivo.referencia)
    console.log(pico.bgRed(`ID del archivo en Google Drive: ${fileId}`))

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

// Función para calificar una entrega
const calificarEntrega = async (req, res, next) => {
  const { idEntrega } = req.params
  const { nota } = req.body

  try {
    const entrega = await models.Entrega.findByPk(idEntrega)

    if (!entrega) {
      console.warn(pico.yellow(`Advertencia: Entrega con ID ${idEntrega} no encontrada.`))
      return next({ ...errors.NotFoundError, details: 'Entrega no encontrada' })
    }

    entrega.nota = nota
    entrega.updated_by = res.locals.usuario.ID

    await entrega.save()

    res.status(200).json(entrega)
  } catch (error) {
    console.error(pico.red('Error al calificar la entrega:', error))
    next({
      ...errors.InternalServerError,
      details: 'Error al calificar la entrega: ' + error.message
    })
  }
}

module.exports = {
  listarEntregasDocente,
  crearEntrega,
  asociarArchivos,
  obtenerArchivo,
  calificarEntrega
}
