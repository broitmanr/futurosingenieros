const errors = require('../const/error')
const models = require('../database/models/index')
const GoogleDriveService = require('../services/GoogleDriveService')
const pico = require('picocolors')
const sharp = require('sharp')
const { PassThrough } = require('stream')
const googleDriveService = new GoogleDriveService()
const { handleTransaction } = require('../const/transactionHelper')
const fs = require('fs')
const { normalizeFileName } = require('../const/normalizarNombre')

// Función para obtener una imagen
const obtenerImagen = async (req, res, next) => {
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
    // Asegúrate de que archivo.referencia contiene solo el ID del archivo
    const fileId = googleDriveService.extractFileIdFromLink(archivo.referencia)
    console.log(pico.bgRed(`ID del acolorsrchivo en Google Drive: ${fileId}`))
    const { data: fileStream, mimeType } = await googleDriveService.getFile(fileId)
    res.setHeader('Content-Type', mimeType || 'image/jpeg')
    res.setHeader('Content-Disposition', `inline; filename="${archivo.nombre}"`)
    fileStream.pipe(res)
  } catch (error) {
    console.error('Error al obtener el archivo:', error)
    next({
      ...errors.InternalServerError,
      details: 'Error al obtener el archivo: ' + error.message
    })
  }
}
const inicializarArchivosDesdeCarpeta = async (carpetaId) => {
  console.log('Inicializando archivos desde la carpeta...')
  try {
    console.log('entre al try de inicializar archivos desde carpeta')
    const archivos = await googleDriveService.listFilesInFolder(carpetaId)
    console.log('Archivos:', archivos)
    for (const archivo of archivos) {
      await models.Archivo.create({
        nombre: archivo.name,
        entrega_id: null,
        extension: 'png',
        referencia: archivo.webViewLink,
        updated_at: new Date(),
        updated_by: 'bd'
      })
      console.log(pico.bgGreen(`Archivo:  ${archivo.name} agregado a la base de datos.`))
    }
  } catch (error) {
    console.error('Error al inicializar archivos desde la carpeta:', error)
  }
}

const obtenerImagenByNombre = async (req, res, next) => {
  const { nombre } = req.params
  const nombrePng = nombre + '.png'
  try {
    const archivo = await models.Archivo.findOne({
      where: { nombre: nombrePng },
      attributes: ['ID', 'nombre', 'referencia']
    })

    if (!archivo) {
      console.warn(`Advertencia: Archivo con nombre ${nombre}`)
      return next({ ...errors.NotFoundError, details: 'Archivo no encontrado' })
    }
    // Asegúrate de que archivo.referencia contiene solo el ID del archivo
    const fileId = googleDriveService.extractFileIdFromLink(archivo.referencia)
    const { data: fileStream } = await googleDriveService.getFile(fileId)

    // Crear un PassThrough stream
    const passThroughStream = new PassThrough()

    // Procesar el fileStream con sharp
    const sharpStream = sharp()
      .resize({ width: 800 })
      .jpeg({ quality: 30 })

    // Pipe del fileStream a sharp y luego al PassThrough
    fileStream.pipe(sharpStream).pipe(passThroughStream)

    // Configurar las cabeceras de la respuesta
    res.setHeader('Content-Type', 'image/jpeg')
    res.setHeader('Content-Disposition', `inline; filename=${archivo.nombre}`)

    // Enviar el PassThrough stream en la respuesta
    passThroughStream.pipe(res)

    // Manejo de errores
    sharpStream.on('error', (err) => {
      console.error('Error al procesar la imagen:', err)
      next({ ...errors.InternalServerError, details: 'Error al procesar la imagen: ' + err.message })
    })

    fileStream.on('error', (err) => {
      console.error('Error al obtener el archivo:', err)
      next({ ...errors.InternalServerError, details: 'Error al obtener el archivo: ' + err.message })
    })
  } catch (error) {
    console.error('Error al obtener el archivo:', error)
    next({
      ...errors.InternalServerError,
      details: 'Error al obtener el archivo: ' + error.message
    })
  }
}

const obtenerFile = async (req, res, next) => {
  const { id } = req.params
  try {
    const archivo = await models.Archivo.findOne({
      where: { ID: id },
      attributes: ['ID', 'nombre', 'referencia']
    })

    if (!archivo) {
      return next({ ...errors.NotFoundError, details: 'Archivo no encontrado' })
    }

    const fileId = googleDriveService.extractFileIdFromLink(archivo.referencia)
    const { data: fileStream, mimeType } = await googleDriveService.getFile(fileId)
    res.setHeader('Content-Type', mimeType || 'application/octet-stream')
    res.setHeader('Content-Disposition', `inline; filename="${archivo.nombre}"`)
    fileStream.pipe(res)
  } catch (error) {
    console.error('Error al obtener el archivo:', error)
    next({
      ...errors.InternalServerError,
      details: 'Error al obtener el archivo: ' + error.message
    })
  }
}

const hacerComentario = async (req, res, next) => {
  const { id } = req.params
  const {
    comment,
    type,
    position,
    content
  } = req.body
  try {
    const archivo = await models.Archivo.findByPk(id, {
      include: [
        {
          model: models.Entrega
        }
      ]
    })

    if (!archivo) {
      return next({ ...errors.NotFoundError, details: 'Archivo no encontrado' })
    }
    if (!archivo.Entrega) {
      return next({ ...errors.NotFoundError, details: 'El archivo no tiene una entrega asociada' })
    }

    const comentario = await models.Comentario.create({
      archivo_id: archivo.ID,
      emisor_id: res.locals.usuario.persona_id,
      entrega_id: archivo.Entrega.ID,
      comentario: comment,
      type,
      position,
      content,
      updated_by: res.locals.usuario.ID
    })

    res.status(200).json(comentario)
  } catch (error) {
    console.error('Error al obtener el archivo:', error)
    next({
      ...errors.InternalServerError,
      details: 'Error al obtener el archivo: ' + error.message
    })
  }
}

const getComentarios = async (req, res, next) => {
  const { id } = req.params

  try {
    const archivo = await models.Archivo.findByPk(id, {
      include: [
        {
          model: models.Entrega
        }
      ]
    })

    if (!archivo) {
      return next({ ...errors.NotFoundError, details: 'Archivo no encontrado' })
    }
    if (!archivo.Entrega) {
      return next({ ...errors.NotFoundError, details: 'El archivo no tiene una entrega asociada' })
    }

    const comentarios = await models.Comentario.findAll({
      where: {
        archivo_id: archivo.ID
      },
      include: [
        {
          model: models.Persona,
          attributes: ['nombre', 'apellido', 'rol']
        }

      ]
    })

    // Mapea los resultados para devolverlos en el formato deseado
    const result = comentarios.map(comment => ({
      ID: comment.ID,
      comentario: comment.comentario,
      content: comment.content,
      position: comment.position,
      type: comment.type,
      fecha: comment.fecha,
      usuario: `${comment.Persona.nombre} ${comment.Persona.apellido}`,
      mine: comment.Persona.rol === res.locals.usuario.rol
    }))

    res.status(200).json(result)
  } catch (error) {
    console.error('Error al obtener comentarios:', error)
    next({
      ...errors.InternalServerError,
      details: 'Error al obtener comentarios: ' + error.message
    })
  }
}
const editComentario = async (req, res, next) => {
  const { id } = req.params // ID del comentario
  const { type, content, position, comment } = req.body // Datos a actualizar

  try {
    const comentario = await models.Comentario.findByPk(id) // Encuentra el comentario por ID

    if (!comentario) {
      next({ ...errors.NotFoundError })
    }

    // Actualiza el comentario
    comentario.type = type
    comentario.content = content // Asegúrate de que el formato sea el adecuado
    comentario.position = position // Actualiza la posición si es necesario
    comentario.comentario = comment // Actualiza el texto del comentario
    await comentario.save() // Guarda los cambios

    return res.status(200).json({ message: 'Comentario actualizado correctamente' })
  } catch (error) {
    console.error('Error al editar el comentario:', error)
    return next({
      ...errors.InternalServerError,
      details: 'Error al obtener el archivo: ' + error.message
    })
  }
}

const deleteComentario = async (req, res, next) => {
  const { id } = req.params // ID del comentario a eliminar

  try {
    const comentario = await models.Comentario.findByPk(id) // Encuentra el comentario por ID

    if (!comentario) {
      next({ ...errors.NotFoundError })
    }

    await comentario.destroy() // Elimina el comentario de la base de datos
    return res.status(200).json({ message: 'Comentario eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar el comentario:', error)
    return next({
      ...errors.InternalServerError,
      details: 'Error al obtener el archivo: ' + error.message
    })
  }
}

const subirMaterialCursada = async (req, res, next) => {
  const { cursoId } = req.params
  const files = req.files
  const archivos = []
  const fileIds = []

  try {
    const curso = await models.Curso.findByPk(cursoId)
    if (!curso) {
      return next({ ...errors.NotFoundError, details: 'Curso con ID no encontrado: ' + cursoId })
    }
    // Obtener la carpeta raiz del drive, generar la estructura de carpeta y subir los archivos
    console.log(pico.red('Obteniendo o creando carpetas en Google Drive'))
    const folderId = process.env.GOOGLE_DRIVE_MAIN_FOLDER_ID
    const archivosCarpetaId = await googleDriveService.getOrCreateFolder(folderId, 'Archivos')
    const cursadaCarpetaId = await googleDriveService.getOrCreateFolder(archivosCarpetaId, cursoId.toString())
    try {
      for (const file of files) {
        const fileStream = fs.createReadStream(file.path)
        const nameCorrecto = await normalizeFileName(file.originalname, next)
        const { file: driveFile, folder: driveFolder } = await googleDriveService.uploadFile(fileStream, nameCorrecto, file.mimetype, cursadaCarpetaId)
        if (!driveFile) {
          return next({ ...errors.InternalServerError, details: 'Error al subir el archivo a Google Drive antes de la creacion del archivo' })
        }
        console.log(pico.cyan(`CONTROLLER CHECK - Archivo subido en Drive File: ${JSON.stringify({
          id: driveFile.id,
          name: driveFile.name,
          webViewLink: driveFile.webViewLink
        }, null, 2)}`))

        console.log(pico.cyan(`CONTROLLER CHECK - Carpeta contenedora del archivo: ${JSON.stringify({
          id: driveFolder.id,
          name: driveFolder.name,
          webViewLink: driveFolder.webViewLink
        }, null, 2)}`))
        fileIds.push(driveFile.id)
        const nuevoArchivo = await handleTransaction(async (transaction) => {
          return await models.Archivo.create({
            nombre: nameCorrecto,
            extension: file.mimetype.split('/')[1],
            referencia: driveFile.webViewLink,
            updated_by: res.locals.usuario.ID,
            curso_id: cursoId
          }, { transaction })
        }, next)
        archivos.push(nuevoArchivo)
      }
    } catch (errorFile) {
      console.error(pico.red('Error al subir el archivo a Google Drive dentro de la iteracion del FOR'), errorFile)
      return next({ ...errors.InternalServerError, details: 'Error al subir el archivo a Google Drive dentro de la iteracion del FOR' + errorFile })
    }
    if (archivos.length === 0) {
      return next({ ...errors.InternalServerError, details: 'No se subieron archivos a Google Drive, el array de archivos creados fue nula' })
    }
    res.status(201).json({ message: 'Material de cursada subido exitosamente', data: archivos })
  } catch (error) {
    console.error('Error al subir el material de cursada en el catch principal:', error)
    for (const fileId of fileIds) {
      try {
        await googleDriveService.deleteFile(fileId)
        console.log(pico.yellow(`Archivo con ID ${fileId} eliminado de Google Drive debido a un error`))
      } catch (deleteError) {
        console.error(pico.red(`Error al eliminar archivo de Google Drive: ${deleteError}`))
      }
    }
    next({
      ...errors.InternalServerError,
      details: 'Error al subir el material de cursada: ' + error.message
    })
  } finally {
    for (const file of files) {
      if (file && file.path) {
        req.tempFiles.push(file.path)
      }
    }
  }
}

// Entrega el 'archivo' por nombre de la carpeta del curso con el valor del archivo
const getMaterialCursadaByName = async (req, res, next) => {
  const { nombre, cursoId } = req.params
  try {
    const archivo = await models.Archivo.findOne({
      where: { nombre, curso_id: cursoId }, // Buscar por el nombre original
      attributes: ['ID', 'nombre', 'referencia']
    })

    if (!archivo) {
      console.warn(`Advertencia: Archivo con nombre ${nombre} no encontrado.`)
      return next({ ...errors.NotFoundError, details: 'Archivo no encontrado' })
    }
    const fileId = googleDriveService.extractFileIdFromLink(archivo.referencia)
    const { data: fileStream, mimeType } = await googleDriveService.getFile(fileId)
    res.setHeader('Content-Type', mimeType || 'application/octet-stream')
    res.setHeader('Content-Disposition', `inline; filename="${archivo.nombre}"`)
    fileStream.pipe(res)
  } catch (error) {
    console.error('Error al obtener el archivo:', error)
    next({
      ...errors.InternalServerError,
      details: 'Error al obtener el archivo: ' + error.message
    })
  }
}

const getListaMaterialCursada = async (req, res, next) => {
  const { cursoId } = req.params
  try {
    // Consultar la base de datos para obtener los archivos correspondientes al curso
    const archivosDB = await models.Archivo.findAll({
      where: { curso_id: cursoId }
    })

    if (archivosDB && archivosDB.length > 0) {
      // Si se encuentran archivos en la base de datos, devolverlos
      return res.status(200).json(archivosDB)
    }

    // Si no se encuentran archivos en la base de datos, intentamos obtenerlos desde Google Drive
    console.warn(pico.yellow(`Advertencia: No se encontraron archivos en la base de datos para el curso con ID ${cursoId}. Intentando obtener desde Google Drive.`))

    const folderName = cursoId.toString()
    console.log(pico.red('Obteniendo carpetas en Google Drive'))
    const folderRaiz = process.env.GOOGLE_DRIVE_MAIN_FOLDER_ID
    const archivosCarpetaId = await googleDriveService.getOrCreateFolder(folderRaiz, 'Archivos')
    const carpetaIdCurso = await googleDriveService.getFolderByName(archivosCarpetaId, folderName)

    if (!carpetaIdCurso) {
      console.warn(`Advertencia: No se encontró la carpeta para el curso con ID ${cursoId}.`)
      return next({ ...errors.NotFoundError, details: 'No se encontró la carpeta para el curso' })
    }

    // Obtener la lista de archivos en la carpeta
    const archivosDrive = await googleDriveService.listFilesInFolder(carpetaIdCurso.id)

    if (!archivosDrive || archivosDrive.length === 0) {
      console.warn(`Advertencia: No se encontraron archivos en la carpeta para el curso con ID ${cursoId}.`)
      return next({ ...errors.NotFoundError, details: 'No se encontraron archivos en la carpeta para el curso' })
    }

    // Mapear los archivos de Google Drive a la estructura de la base de datos
    const archivos = archivosDrive.map(file => ({
      id: file.id,
      nombre: file.name,
      referencia: file.webViewLink,
      extension: file.name.split('.').pop(),
      curso_id: cursoId
    }))

    res.status(200).json(archivos)
  } catch (error) {
    console.error('Error al obtener la lista de archivos:', error)
    next({
      ...errors.InternalServerError,
      details: 'Error al obtener la lista de archivos: ' + error.message
    })
  }
}
module.exports = {
  obtenerImagen,
  obtenerImagenByNombre,
  inicializarArchivosDesdeCarpeta,
  obtenerFile,
  hacerComentario,
  subirMaterialCursada,
  getMaterialCursadaByName,
  getListaMaterialCursada,
  getComentarios,
  editComentario,
  deleteComentario
}
