const errors = require('../const/error')
const models = require('../database/models/index')
const GoogleDriveService = require('../services/GoogleDriveService') // Importa el servicio de Google Drive
const picocolors = require('picocolors')

const googleDriveService = new GoogleDriveService()

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

    console.log(picocolors.bgWhite(`Archivo encontrado: ${JSON.stringify(archivo)}`))

    // Asegúrate de que archivo.referencia contiene solo el ID del archivo
    const fileId = googleDriveService.extractFileIdFromLink(archivo.referencia)
    console.log(picocolors.bgRed(`ID del archivo en Google Drive: ${fileId}`))

    const fileStream = await googleDriveService.getFile(fileId)

    res.setHeader('Content-Type', 'image/jpeg') // Cambia esto según el tipo de imagen
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
      console.log(picocolors.bgGreen(`Archivo ${archivo.name} agregado a la base de datos.`))
    }
  } catch (error) {
    console.error('Error al inicializar archivos desde la carpeta:', error)
  }
}
module.exports = {
  obtenerImagen,
  inicializarArchivosDesdeCarpeta
}
