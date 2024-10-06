const iconv = require('iconv-lite')
const unorm = require('unorm')

const fixEncoding = (str) => {
  const buffer = Buffer.from(str, 'binary')
  return iconv.decode(buffer, 'utf-8')
}

const normalizeFileName = async (fileName, next) => {
  try {
    // Corregir potenciales problemas de codificación
    const correctedFileName = fixEncoding(fileName)
    // 1. Normalizar caracteres Unicode usando unorm
    let normalized = unorm.nfc(correctedFileName)
    // 2. Reemplazar caracteres problemáticos
    normalized = normalized.replace(/[<>:"/\\|?*]+/g, '')
    // 3. Reemplazar o eliminar caracteres específicos
    normalized = normalized.replace(/[°�]/g, '') // Reemplazar o eliminar caracteres específicos como `°` y `�`

    // 4. Eliminar espacios adicionales y limpiar
    normalized = normalized.replace(/\s+/g, ' ').trim() // Reemplazar múltiples espacios por uno solo y eliminar espacios al principio y al final

    // 5. Identificar la extensión final y separar el nombre del archivo
    const parts = normalized.split('.')
    const ext = parts.length > 1 ? parts.pop().trim() : '' // La última parte es la extensión
    const baseName = parts.join('.').trim() // Reunir el resto del nombre del archivo sin la última extensión

    // 6. Eliminar cualquier extensión intermedia en el baseName
    const cleanBaseName = baseName.split('.').filter((part, index, parts) => {
      // Si la parte actual es una extensión válida y no es la última, la eliminamos.
      return !(index < parts.length - 1 && /^[a-zA-Z0-9]+$/.test(part) && part.length <= 4)
    }).join(' ')
    // 7. Reconstruir el nombre del archivo normalizado con solo la última extensión
    const finalFileName = ext ? `${cleanBaseName}.${ext}` : cleanBaseName

    return finalFileName
  } catch (error) {
    console.error('Error al normalizar el nombre del archivo:', error)
    next(error)
  }
}

module.exports = { normalizeFileName }
