const { google } = require('googleapis')
const { GoogleAuth } = require('google-auth-library')
const dotenv = require('dotenv')
const { green, blue, yellow, red, magenta } = require('picocolors')
dotenv.config()

class GoogleDriveService {
  constructor () {
    this.credentials = {
      type: process.env.GOOGLE_TYPE,
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: process.env.GOOGLE_AUTH_URI,
      token_uri: process.env.GOOGLE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
      universe_domain: process.env.GOOGLE_UNIVERSE_DOMAIN
    }
    this.applicationName = 'Your Application Name'
    this.SCOPES = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive']
    this.driveClient = null
  }

  async getDriveService () {
    if (!this.driveClient) {
      const auth = new GoogleAuth({
        credentials: this.credentials,
        scopes: this.SCOPES
      })
      const authClient = await auth.getClient()
      this.driveClient = google.drive({ version: 'v3', auth: authClient })
    }
    return this.driveClient
  }

  async createFolder (folderName, parentFolderId) {
    try {
      console.log(blue(`Intentando crear carpeta: ${folderName} en padre: ${parentFolderId}`))
      const drive = await this.getDriveService()
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : []
      }
      const folder = await drive.files.create({
        resource: fileMetadata,
        fields: 'id, name, webViewLink'
      })
      console.log(green(`Carpeta creada exitosamente: ${JSON.stringify(folder.data, null, 2)}`))
      return folder.data
    } catch (error) {
      console.error(red(`Error al crear la carpeta en Google Drive: ${error.message}`))
      throw error
    }
  }

  async uploadFile (fileStream, fileName, mimeType, folderId) {
    try {
      console.log(blue(`Iniciando carga de archivo DENTRO API DRIVE: ${fileName} en carpeta: ${folderId}`))
      const drive = await this.getDriveService()
      const response = await drive.files.create({
        requestBody: {
          name: fileName,
          parents: [folderId]
        },
        media: {
          mimeType,
          body: fileStream
        },
        fields: 'id, name, webViewLink'
      })

      console.log(green(`Archivo subido exitosamente - DENTRO DE API DRIVE : ${JSON.stringify(response.data, null, 2)}`))

      /* console.log(yellow(`Añadiendo permisos al archivo: ${response.data.id}`))
      await drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'writer',
          type: 'user',
          emailAddress: 'm3gacuenta@gmail.com'
        }
      })
      */
      console.log(magenta(`Obteniendo información de la carpeta DENTRO DE API DRIVE: ${folderId}`))
      const folderResponse = await drive.files.get({
        fileId: folderId,
        fields: 'id, name, webViewLink'
      })

      /* console.log(yellow(`Añadiendo permisos a la carpeta: ${folderId}`))
      await drive.permissions.create({
        fileId: folderId,
        requestBody: {
          role: 'writer',
          type: 'user',
          emailAddress: 'm3gacuenta@gmail.com'
        }
      })
      */
      console.log(green('Operación completada con éxito'))
      return {
        file: response.data,
        folder: folderResponse.data
      }
    } catch (error) {
      console.error(red(`Error dentro de Google API al subir el archivo a Google Drive: ${error.message}`))
      throw error
    }
  }

  async getFolderByName (parentFolderId, folderName) {
    try {
      console.log(blue(`Buscando carpeta: ${folderName} en padre: ${parentFolderId}`))
      const drive = await this.getDriveService()
      const query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and '${parentFolderId}' in parents and trashed = false`
      const response = await drive.files.list({
        q: query,
        fields: 'files(id, name, webViewLink)'
      })
      console.log(green(`Resultado de la búsqueda: ${JSON.stringify(response.data.files, null, 2)}`))
      return response.data.files[0]
    } catch (error) {
      console.error(red(`Error al obtener la carpeta de Google Drive: ${error.message}`))
      throw error
    }
  }

  async getOrCreateFolder (parentFolderId, folderName) {
    try {
      console.log(magenta(`Intentando obtener o crear carpeta: ' ${folderName}' en padre: ${parentFolderId}`))
      let folder = await this.getFolderByName(parentFolderId, folderName)
      if (!folder) {
        console.log(yellow(`Carpeta no encontrada, creando nueva: ${folderName}`))
        folder = await this.createFolder(folderName, parentFolderId)
      }
      console.log(green(`Carpeta obtenida/creada: ${JSON.stringify(folder, null, 2)}`))
      return folder.id
    } catch (error) {
      console.error(red(`Error al obtener o crear la carpeta en Google Drive: ${error.message}`))
      throw error
    }
  }

  async getFile (fileId) {
    try {
      const drive = await this.getDriveService()
      const response = await drive.files.get({
        fileId,
        alt: 'media'
      }, { responseType: 'stream' })

      const fileMetadata = await drive.files.get({
        fileId,
        fields: 'mimeType'
      })

      return { data: response.data, mimeType: fileMetadata.data.mimeType }
    } catch (error) {
      console.error('Error al obtener el archivo de Google Drive:', error)
      throw error
    }
  }

  extractFileIdFromLink (link) {
    const regex = /\/d\/(.*?)\//
    const match = link.match(regex)
    if (match && match[1]) {
      return match[1]
    } else {
      throw new Error('No se pudo extraer el ID del archivo del enlace')
    }
  }

  async listFilesInFolder (folderId) {
    try {
      const drive = await this.getDriveService()
      const response = await drive.files.list({
        q: `'${folderId}' in parents`,
        fields: 'files(id, name, webViewLink)'
      })
      return response.data.files
    } catch (error) {
      console.error('Error al listar archivos en la carpeta:', error)
      throw error
    }
  }

  async deleteFile (fileId) {
    const drive = await this.getDriveService()
    await drive.files.delete({
      fileId
    })
  }
}

module.exports = GoogleDriveService
