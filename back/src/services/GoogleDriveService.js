const { google } = require('googleapis')
const { GoogleAuth } = require('google-auth-library')
const dotenv = require('dotenv')
const errors = require('../const/error')

dotenv.config()

class GoogleDriveService {
  constructor () {
    this.credentials = {
      type: process.env.GOOGLE_TYPE,
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Reemplaza \n por saltos de línea reales
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
    this.driveClient = null;
  }

  async getDriveService () {
    if (!this.driveClient){
      console.log("entro por el no")
      const auth = new GoogleAuth({
      credentials: this.credentials,
      scopes: this.SCOPES
      })
      const authClient = await auth.getClient()
      this.driveClient = google.drive({ version: 'v3', auth: authClient })
    }
    return this.driveClient
  }

  async createFolder (folderName, parentFolderId, next) {
    try {
      const drive = await this.getDriveService()
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : []
      }
      const folder = await drive.files.create({
        resource: fileMetadata,
        fields: 'id'
      })
      return folder.data.id
    } catch (error) {
      console.error('Error al crear la carpeta en Google Drive:', error)
      next({ ...errors.InternalServerError, details: 'Error al crear la carpeta en Google Drive - ' + error.message })
    }
  }

  async uploadFile (fileStream, fileName, mimeType, folderId, next) {
    try {
      const drive = await this.getDriveService()
      const fileMetadata = {
        name: fileName,
        parents: [folderId]
      }
      const media = {
        mimeType,
        body: fileStream
      }
      const file = await drive.files.create({
        resource: fileMetadata,
        media,
        fields: 'id, webViewLink'
      })
      return file.data
    } catch (error) {
      console.error('Error al subir el archivo a Google Drive:', error)
      next({ ...errors.InternalServerError, details: 'Error al subir el archivo a Google Drive - ' + error.message })
    }
  }

  async getFolderByName (parentFolderId, folderName, next) {
    try {
      const drive = await this.getDriveService()
      const query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and '${parentFolderId}' in parents and trashed = false`
      const response = await drive.files.list({
        q: query,
        fields: 'files(id, name)'
      })
      return response.data.files[0]
    } catch (error) {
      console.error('Error al obtener la carpeta de Google Drive:', error)
      next({ ...errors.InternalServerError, details: 'Error al obtener la carpeta de Google Drive - ' + error.message })
    }
  }

  async getOrCreateFolder (parentFolderId, folderName, next) {
    try {
      let folder = await this.getFolderByName(parentFolderId, folderName, next)
      if (!folder) {
        folder = await this.createFolder(folderName, parentFolderId, next)
      }
      return folder.id
    } catch (error) {
      console.error('Error al obtener o crear la carpeta en Google Drive:', error)
      next({ ...errors.InternalServerError, details: 'Error al obtener o crear la carpeta en Google Drive - ' + error.message })
    }
  }

  async getFile (fileId, next) {
    try {
      console.log(`Obteniendo archivo con ID: ${fileId}`)
      console.time('getDriveService');
      const drive = await this.getDriveService()
      console.timeEnd('getDriveService');
      console.time('response');
      const response = await drive.files.get({
        fileId,
        alt: 'media'
      }, { responseType: 'stream' })
      console.timeEnd('response');
      return response.data
    } catch (error) {
      console.error('Error al obtener el archivo de Google Drive:', error)
      next({ ...errors.InternalServerError, details: 'Error al obtener el archivo de Google Drive - ' + error.message })
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

  async listFilesInFolder (folderId, next) {
    try {
      const drive = await this.getDriveService() // Asegúrate de obtener el servicio de Google Drive
      const response = await drive.files.list({
        q: `'${folderId}' in parents`, // Filtrar por folderId
        fields: 'files(id, name, webViewLink)'
      })
      return response.data.files
    } catch (error) {
      console.error('Error al listar archivos en la carpeta:', error)
      next({ ...errors.InternalServerError, details: 'Error al listar archivos en la carpeta' + error.message })
    }
  }
}

module.exports = GoogleDriveService
