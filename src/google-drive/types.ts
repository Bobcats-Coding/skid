/* google-drive types */

export type GoogleDriveConfig = {
  // Optional explicit credentials; if omitted, ADC picks it up
  keyFilename?: string
  clientEmail?: string
  privateKey?: string
}

export type GoogleDriveFileMetadata = {
  name: string
  mimeType?: string // Target MIME type (e.g., 'application/vnd.google-apps.spreadsheet')
  sourceMimeType?: string // Source content MIME type (e.g., 'text/csv'), defaults to mimeType if not specified
  parents?: string[] // folder IDs
  driveId?: string // Shared drive ID
}

export type GoogleDriveFile = {
  id: string
  name: string
  mimeType: string
  webViewLink?: string
  webContentLink?: string
}

export type GoogleDriveListOptions = {
  folderId?: string
  pageSize?: number
  pageToken?: string
  query?: string // Google Drive query string
}

export type GoogleDriveListResult = {
  files: GoogleDriveFile[]
  nextPageToken?: string
}

export type GoogleDriveClient = {
  createFolder: (
    name: string,
    parentFolderId?: string,
    driveId?: string,
  ) => Promise<GoogleDriveFile>
  uploadFile: (
    fileMetadata: GoogleDriveFileMetadata,
    content: Buffer | string,
  ) => Promise<GoogleDriveFile>
  getFile: (fileId: string) => Promise<GoogleDriveFile>
  deleteFile: (fileId: string) => Promise<void>
  listFiles: (options?: GoogleDriveListOptions) => Promise<GoogleDriveListResult>
  findFolderByName: (
    name: string,
    parentFolderId?: string,
    driveId?: string,
  ) => Promise<GoogleDriveFile | undefined>
  getOrCreateFolder: (
    name: string,
    parentFolderId?: string,
    driveId?: string,
  ) => Promise<GoogleDriveFile>
}
