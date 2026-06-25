import { assertDefined } from '../core/util'
import { type GoogleDriveClient, type GoogleDriveConfig, type GoogleDriveFile } from './types'

import { readFileSync } from 'fs'
import { google } from 'googleapis'
import type { drive_v3 } from 'googleapis'
import { Readable } from 'stream'

const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder'

export const createGoogleDriveClient = (config?: GoogleDriveConfig): GoogleDriveClient => {
  const scopes = ['https://www.googleapis.com/auth/drive']

  type Credentials = { client_email: string; private_key: string }
  let credentials: Credentials | undefined

  if (config?.clientEmail !== undefined && config?.privateKey !== undefined) {
    credentials = {
      client_email: config.clientEmail,
      private_key: config.privateKey,
    }
  } else if (config?.keyFilename !== undefined) {
    const fileContents = readFileSync(config.keyFilename, 'utf8')
    credentials = JSON.parse(fileContents) as Credentials
  }

  const authClient =
    credentials !== undefined
      ? new google.auth.JWT({
          email: credentials.client_email,
          key: credentials.private_key,
          scopes,
        })
      : new google.auth.GoogleAuth({ scopes })

  const drive = google.drive({ version: 'v3', auth: authClient })

  const toGoogleDriveFile = (file: drive_v3.Schema$File): GoogleDriveFile => ({
    id: file.id ?? '',
    name: file.name ?? '',
    mimeType: file.mimeType ?? '',
    webViewLink: file.webViewLink ?? '',
    webContentLink: file.webContentLink ?? '',
  })

  return {
    async createFolder(name, parentFolderId, driveId) {
      const fileMetadata: drive_v3.Schema$File = {
        name,
        mimeType: FOLDER_MIME_TYPE,
        parents: parentFolderId !== undefined ? [parentFolderId] : null,
        driveId: driveId ?? null,
      }

      const response = await drive.files.create({
        requestBody: fileMetadata,
        fields: 'id, name, mimeType, webViewLink, webContentLink',
        supportsAllDrives: true,
      })

      return toGoogleDriveFile(response.data)
    },

    async uploadFile(fileMetadata, content) {
      const buffer = typeof content === 'string' ? Buffer.from(content) : content
      const stream = Readable.from(buffer)

      const response = await drive.files.create({
        requestBody: {
          name: fileMetadata.name ?? null,
          mimeType: fileMetadata.mimeType ?? null,
          parents: fileMetadata.parents ?? null,
          driveId: fileMetadata.driveId ?? null,
        },
        media: {
          mimeType:
            fileMetadata.sourceMimeType ?? fileMetadata.mimeType ?? 'application/octet-stream',
          body: stream,
        },
        fields: 'id, name, mimeType, webViewLink, webContentLink',
        supportsAllDrives: true,
      })

      return toGoogleDriveFile(response.data)
    },

    async getFile(fileId) {
      const response = await drive.files.get({
        fileId,
        fields: 'id, name, mimeType, webViewLink, webContentLink',
        supportsAllDrives: true,
      })

      return toGoogleDriveFile(response.data)
    },

    async deleteFile(fileId) {
      await drive.files.delete({ fileId, supportsAllDrives: true })
    },

    async listFiles(options) {
      const query: string[] = []

      if (options?.folderId !== undefined) {
        query.push(`'${options.folderId}' in parents`)
      }

      if (options?.query !== undefined) {
        query.push(options.query)
      }

      const response = await drive.files.list({
        q: query.length > 0 ? query.join(' and ') : '',
        pageSize: options?.pageSize ?? 100,
        pageToken: options?.pageToken ?? '',
        fields: 'nextPageToken, files(id, name, mimeType, webViewLink, webContentLink)',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      })

      return {
        files: (response.data.files ?? []).map(toGoogleDriveFile),
        nextPageToken: response.data.nextPageToken ?? '',
      }
    },

    async findFolderByName(name, parentFolderId, driveId) {
      const query: string[] = [
        `name='${name.replace(/'/g, "\\'")}'`,
        `mimeType='${FOLDER_MIME_TYPE}'`,
        'trashed=false',
      ]

      if (parentFolderId !== undefined) {
        query.push(`'${parentFolderId}' in parents`)
      }

      const response = await drive.files.list({
        q: query.join(' and '),
        pageSize: 1,
        fields: 'files(id, name, mimeType, webViewLink, webContentLink)',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        corpora: driveId !== undefined ? 'drive' : '',
        driveId: driveId ?? '',
      })

      const files = response.data.files ?? []
      return files.length > 0 ? toGoogleDriveFile(assertDefined(files[0])) : undefined
    },

    async getOrCreateFolder(name, parentFolderId, driveId) {
      const existing = await this.findFolderByName(name, parentFolderId, driveId)
      if (existing !== undefined) {
        return existing
      }
      return await this.createFolder(name, parentFolderId, driveId)
    },
  }
}
