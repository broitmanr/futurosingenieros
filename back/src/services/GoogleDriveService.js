const { google } = require('googleapis')
const { GoogleAuth } = require('google-auth-library')
const dotenv = require('dotenv')

dotenv.config()

class GoogleDriveService {
  constructor() {
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
    this.SCOPES = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.comments']
  }

  async getDriveService() {
    const auth = new GoogleAuth({
      credentials: this.credentials,
      scopes: this.SCOPES
    })
    const authClient = await auth.getClient()
    return google.drive({ version: 'v3', auth: authClient })
  }

  async createFolder(folderName, parentFolderId) {
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
  }

  async uploadFile(fileStream, fileName, mimeType, folderId) {
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
  }

  async getFolderByName(parentFolderId, folderName) {
    const drive = await this.getDriveService()
    const query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and '${parentFolderId}' in parents and trashed = false`
    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name)'
    })
    return response.data.files[0]
  }

  async getFile(fileId) {
    const drive = await this.getDriveService()
    const response = await drive.files.get({
      fileId,
      alt: 'media'
    }, { responseType: 'stream' })
    return response.data
  }

  async getOrCreateFolder(parentFolderId, folderName) {
    let folder = await this.getFolderByName(parentFolderId, folderName)
    if (!folder) {
      folder = await this.createFolder(folderName, parentFolderId)
    }
    return folder.id
  }

  /* async createComment (fileId, content) {
  const drive = await this.getDriveService()
  const comment = await drive.comments.create({
    fileId,
    resource: {
      content
    }
  })
  return comment.data
}

async listComments (fileId) {
  const drive = await this.getDriveService()
  const response = await drive.comments.list({
    fileId,
    fields: 'comments(id, content, createdTime, modifiedTime)'
  })
  return response.data.comments
}

async updateComment (fileId, commentId, content) {
  const drive = await this.getDriveService()
  const comment = await drive.comments.update({
    fileId,
    commentId,
    resource: {
      content
    }
  })
  return comment.data
}

async deleteComment (fileId, commentId) {
  const drive = await this.getDriveService()
  await drive.comments.delete({
    fileId,
    commentId
  })
} */
}

module.exports = GoogleDriveService
