/* gcs-bucket types */

export type GcsBucketConfig = {
  // Optional explicit project; if omitted, ADC picks it up
  projectId?: string
}

export type GcsWriteOptions = {
  contentType?: string
  gzip?: boolean
  metadata?: Record<string, string>
}

export type GcsListOptions = {
  prefix?: string
  maxResults?: number
  delimiter?: string
  pageToken?: string
}

export type GcsSignedUrlAction = 'read' | 'write'

export type GcsSignedUrlOptions = {
  action: GcsSignedUrlAction
  expiresInSeconds: number
  contentType?: string // for write URLs
}

export type GcsListResult = {
  objects: string[]
  nextPageToken?: string
}

export type GcsClient = {
  writeObject: (
    bucket: string,
    objectName: string,
    data: Buffer | string,
    options?: GcsWriteOptions,
  ) => Promise<void>
  readObject: (bucket: string, objectName: string) => Promise<Buffer>
  deleteObject: (bucket: string, objectName: string) => Promise<void>
  existsObject: (bucket: string, objectName: string) => Promise<boolean>
  listObjects: (bucket: string, options?: GcsListOptions) => Promise<GcsListResult>
  getSignedUrl: (
    bucket: string,
    objectName: string,
    options: GcsSignedUrlOptions,
  ) => Promise<string>
  writeStream: (
    bucket: string,
    objectName: string,
    options?: GcsWriteOptions,
  ) => NodeJS.WritableStream
  readStream: (bucket: string, objectName: string) => NodeJS.ReadableStream
}
