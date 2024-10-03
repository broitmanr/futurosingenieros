const multer = require('multer')
const path = require('path')

// Ruta de la carpeta donde se guardarán todos los archivos
const uploadsDir = path.join(__dirname, '../uploads')

// Configuración de multer para guardar archivos en el servidor
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir) // Carpeta donde se guardarán todos los archivos
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`) // Cambiar nombre real
  }
})

// Configuración de límites y filtros de archivos de imagen
const uploadImagenes = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite de tamaño de archivo de 5MB
  fileFilter: (req, file, cb) => {
    if (!file) {
      return cb(new Error('No se ha proporcionado ningún archivo')) // next
    }
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Solo se permiten archivos de imagen')) // next
    }
    cb(null, true)
  }
})

// Configuración de límites y filtros de archivos PDF
const uploadPDFs = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Límite de tamaño de archivo de 10MB
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf/
    const mimetype = filetypes.test(file.mimetype)
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Solo se permiten archivos PDF'))
    }
  }
})

const uploadExcel = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Límite de tamaño de archivo de 10MB
  fileFilter: (req, file, cb) => {
    if (!file) {
      return cb(new Error('No se ha proporcionado ningún archivo')) // next
    }
    if (file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      return cb(new Error('Solo se permiten archivos Excels')) // next
    }
    cb(null, true)
  }
})

module.exports = {
  uploadImagenes,
  uploadPDFs,
  uploadExcel
}
