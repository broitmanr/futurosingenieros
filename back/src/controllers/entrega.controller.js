const errors = require('../const/error')
const { red, yellow } = require('picocolors')
const { handleTransaction } = require('../const/transactionHelper')
const models = require('../database/models/index')
const GoogleDriveService = require('../services/GoogleDriveService') // Importa el servicio de Google Drive
const fs = require('fs') // Para manejar el stream de archivos

const googleDriveService = new GoogleDriveService()

const crearEntrega = async (req, res, next) => {
  try {
    const { fecha, nota, grupoId, personaId, entregaPactadaId } = req.body
    const file = req.file
    const entregaPactada = await models.EntregaPactada.findByPk(entregaPactadaId) // Encuentra la EntregaPactada
    if (!entregaPactada) {
      console.warn(yellow('Advertencia: EntregaPactada no encontrada.'))
      return next({ ...errors.NotFoundError, details: 'EntregaPactada no encontrada' })
    }

    const nuevaEntrega = await handleTransaction(async (transaction) => {
      const entrega = await models.Entrega.create({
        fecha,
        nota,
        grupo_ID: grupoId,
        persona_id: personaId,
        entregaPactada_ID: entregaPactadaId,
        updated_by: res.locals.usuario.ID
      }, { transaction })

      const entregaPactadaNombre = entregaPactada.nombre // Obtenemos el nombre de EntregaPactada
      const usuarioId = res.locals.usuario.ID // ID del usuario

      const folderId = process.env.GOOGLE_DRIVE_MAIN_FOLDER_ID // ID de la carpeta raíz

      // Obtenemos la carpeta del usuario y la entrega pactada, si no existe la creamos
      const usuarioFolderId = await googleDriveService.getOrCreateFolder(folderId, usuarioId.toString())
      const entregaPactadaFolderId = await googleDriveService.getOrCreateFolder(usuarioFolderId, entregaPactadaNombre)

      // Crear el registro del archivo en la base de datos para obtener su ID
      const archivo = await models.Archivo.create({
        nombre: '', // Nombre temporal, se actualizará después
        referencia: '',
        extension: file.mimetype.split('/')[1],
        entrega_id: entrega.ID
      }, { transaction })

      // Cambiar el nombre del archivo al ID del archivo.pdf
      const fileName = `${archivo.ID}.pdf`
      const mimeType = file.mimetype

      const fileStream = fs.createReadStream(file.path)
      const driveFile = await googleDriveService.uploadFile(fileStream, fileName, mimeType, entregaPactadaFolderId)

      // Actualizar el registro del archivo con el nombre y la referencia correctos
      await archivo.update({
        nombre: fileName,
        referencia: driveFile.webViewLink
      }, { transaction })

      // Eliminar el archivo temporal
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error(red('Error al eliminar el archivo temporal:', err))
        } else {
          console.log(yellow(`Archivo temporal ${file.path} eliminado`))
        }
      })

      return { entrega, archivo }
    }, next)

    if (nuevaEntrega) {
      res.status(201).json({
        message: 'Entrega y archivo subidos exitosamente',
        entrega: nuevaEntrega.entrega,
        archivo: nuevaEntrega.archivo
      })
    }
  } catch (error) {
    console.error('Error al crear la entrega y subir el archivo:', error)
    next({
      ...errors.InternalServerError,
      details: 'Error al crear la entrega y subir el archivo: ' + error.message
    })
  }
}
// Función para ver una entrega
async function ver(req, res, next) {
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
    next({
      ...errors.InternalServerError,
      details: 'Error al obtener la entrega: ' + error.message
    })
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
    next({
      ...errors.InternalServerError,
      details: 'Error al actualizar la entrega: ' + error.message
    })
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

module.exports = {
  listarEntregasDocente,
  uploadEntregaFile,
  crearEntrega,
  ver
}
