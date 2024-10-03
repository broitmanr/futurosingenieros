const fs = require('fs')
const pico = require('picocolors')

const gestionArchivosTemporales = (req, res, next) => {
    req.tempFiles = []

    res.on('finish', () => {
        req.tempFiles.forEach(filePath => {
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error(pico.red(`Error al eliminar el archivo temporal ${filePath}: ${unlinkErr.message}`))
                    } else {
                        console.log(pico.yellow(`Archivo temporal ${filePath} eliminado`))
                    }
                })
            }
        })
    })

    next()
}

module.exports = gestionArchivosTemporales
