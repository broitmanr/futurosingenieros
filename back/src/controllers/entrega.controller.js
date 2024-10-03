const errors = require('../const/error')
const { red, yellow } = require('picocolors')
const { handleTransaction } = require('../const/transactionHelper')
const models = require('../database/models/index')
const GoogleDriveService = require('../services/GoogleDriveService') // Importa el servicio de Google Drive
const fs = require('fs') // Para manejar el stream de archivos
const picocolors = require('picocolors')

const googleDriveService = new GoogleDriveService()

const crearEntrega = async (req, res, next) => {
  const file = req.file
  try {
    const { entregaPactadaId } = req.body
    const entregaPactada = await models.EntregaPactada.findByPk(entregaPactadaId, {
      include: [
        {
          model: models.InstanciaEvaluativa,
          attributes: ['grupo', 'curso_id']
        }
      ]
    }) // Encuentra la EntregaPactada
    if (!entregaPactada) {
      console.warn(yellow('Advertencia: EntregaPactada no encontrada.'))
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
    // Verificar si ya existe una entrega con los mismos datos
    const verificarEntregaExistente = async (entregaPactadaId, personaId) => {
      const entregaExistente = await models.Entrega.findOne({
        where: {
          entregaPactada_ID: entregaPactadaId,
          grupo_ID: grupoId,
          persona_id: personaId
        }
      })
      return entregaExistente !== null
    }
    const entregaExistente = await verificarEntregaExistente(entregaPactadaId, grupoId, res.locals.usuario.persona_id)
    if (entregaExistente) {
      return next({ ...errors.ConflictError, details: 'Ya existe una entrega con los mismos datos' })
    } else {
      const nuevaEntrega = await handleTransaction(async (transaction) => {
        const entrega = await models.Entrega.create({
          fecha: Date.now(),
          nota: null,
          grupo_ID: grupoId ?? null,
          persona_id: res.locals.usuario.persona_id,
          entregaPactada_ID: entregaPactadaId,
          updated_by: res.locals.usuario.ID
        }, { transaction })

        const entregaPactadaNombre = entregaPactada.nombre
        const usuarioId = res.locals.usuario.ID
        const folderId = process.env.GOOGLE_DRIVE_MAIN_FOLDER_ID
        const usuarioFolderId = await googleDriveService.getOrCreateFolder(folderId, usuarioId.toString())
        const entregaPactadaFolderId = await googleDriveService.getOrCreateFolder(usuarioFolderId, entregaPactadaNombre)
        const mimeType = file.mimetype

        const archivo = await models.Archivo.create({
          nombre: '', // Nombre temporal, se actualizará después
          referencia: '',
          extension: file.mimetype.split('/')[1],
          entrega_id: entrega.ID
        }, { transaction })

        // Cambiar el nombre del archivo al ID del archivo.pdf
        const fileName = `${archivo.ID}.pdf`
        console.log(`Nombre del archivo: ${fileName}`)

        const fileStream = fs.createReadStream(file.path)
        const driveFile = await googleDriveService.uploadFile(fileStream, fileName, mimeType, entregaPactadaFolderId)

        // Actualizar el registro del archivo con el nombre y la referencia correctos
        await archivo.update({
          nombre: fileName,
          referencia: driveFile.webViewLink
        }, { transaction })

        return { entrega, archivo }
      }, next)

      if (nuevaEntrega) {
        res.status(201).json({
          message: 'Entrega y archivo subidos exitosamente',
          entrega: nuevaEntrega.entrega,
          archivo: nuevaEntrega.archivo
        })
      }
    }
  } catch (error) {
    console.error('Error al crear la entrega y subir el archivo:', error)
    next({ ...errors.InternalServerError, details: 'No se pudo crear la entrega -' + error.message })
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

// Función para ver una entrega
async function ver (req, res, next) {
  const { id } = req.params

  try {
    const entrega = await models.Entrega.findOne({
      where: { ID: id },
      attributes: ['ID', 'fecha', 'nota', 'grupo_ID', 'persona_id'],
      include: [
        {
          model: models.Grupo,
          attributes: ['ID', 'numero', 'nombre'],
          include: [
            {
              model: models.Persona,
              attributes: ['ID', 'rol', 'dni', 'legajo', 'apellido', 'nombre']
            }
          ]
        },
        {
          model: models.Persona,
          attributes: ['ID', 'rol', 'dni', 'legajo', 'apellido', 'nombre']
        }
      ]
    })

    if (!entrega) {
      console.warn(`Advertencia: Entrega con ID ${id} no encontrada.`)
      return next({ ...errors.NotFoundError, details: 'Entrega no encontrada' })
    }

    res.status(200).json(entrega)
  } catch (error) {
    console.error('Error al obtener la entrega:', error)
    next(error) // Pasa el error al middleware de errores
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
async function eliminar (req, res, next) {
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
  ver,
  obtenerArchivo
}
