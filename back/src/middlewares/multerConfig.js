const multer = require('multer')
const path = require('path')

// Ruta de la carpeta donde se guardarán los archivos
const uploadsDir = path.join(__dirname, '../uploads')

// Configuración de multer para guardar archivos en el servidor
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir) // Carpeta donde se guardarán los archivos
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`) // Cambiar nombre real
  }
})

// Configuración de límites y filtros de archivos
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Límite de tamaño de archivo de 10MB
  fileFilter: (req, file, cb) => {
    if (!file) {
      return cb(new Error('No se ha proporcionado ningún archivo')) // next
    }
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Solo se permiten archivos PDF')) // next
    }
    cb(null, true)
  }
})

module.exports = upload
