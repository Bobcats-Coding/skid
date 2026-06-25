import {
  type GcsBucketConfig,
  type GcsClient,
  type GcsListOptions,
  type GcsListResult,
  type GcsSignedUrlOptions,
  type GcsWriteOptions,
} from './types'

import { Storage } from '@google-cloud/storage'
import { PassThrough, type Readable, type Writable } from 'stream'

const toContentType = (opts?: GcsWriteOptions): string | undefined => opts?.contentType

export const createGcsClient = (config?: GcsBucketConfig): GcsClient => {
  const storage = new Storage(
    config?.projectId !== undefined ? { projectId: config.projectId } : undefined,
  )

  return {
    async writeObject(bucketName, objectName, data, options) {
      const bucket = storage.bucket(bucketName)
      const file = bucket.file(objectName)
      const dataBuf = typeof data === 'string' ? Buffer.from(data) : data
      const saveOpts: { gzip?: boolean; contentType?: string; metadata?: Record<string, string> } =
        {}
      if (options?.gzip !== undefined) saveOpts.gzip = options.gzip
      const ct = toContentType(options)
      if (ct !== undefined) saveOpts.contentType = ct
      if (options?.metadata !== undefined) saveOpts.metadata = options.metadata
      await file.save(dataBuf, saveOpts)
    },

    async readObject(bucketName, objectName) {
      const bucket = storage.bucket(bucketName)
      const file = bucket.file(objectName)
      const [buf] = await file.download()
      return buf
    },

    async deleteObject(bucketName, objectName) {
      const bucket = storage.bucket(bucketName)
      const file = bucket.file(objectName)
      await file.delete({ ignoreNotFound: true })
    },

    async existsObject(bucketName, objectName) {
      const bucket = storage.bucket(bucketName)
      const file = bucket.file(objectName)
      const [exists] = await file.exists()
      return !!exists
    },

    async listObjects(bucketName, options?: GcsListOptions): Promise<GcsListResult> {
      const bucket = storage.bucket(bucketName)
      // Basic listing; pagination token handling can be added if needed
      const query: {
        prefix?: string
        maxResults?: number
        delimiter?: string
        pageToken?: string
      } = {}
      if (options?.prefix !== undefined) query.prefix = options.prefix
      if (options?.maxResults !== undefined) query.maxResults = options.maxResults
      if (options?.delimiter !== undefined) query.delimiter = options.delimiter
      if (options?.pageToken !== undefined) query.pageToken = options.pageToken
      const [files] = await bucket.getFiles(Object.keys(query).length > 0 ? query : undefined)
      return {
        objects: files.map((f) => f.name),
      }
    },

    async getSignedUrl(bucketName, objectName, options: GcsSignedUrlOptions): Promise<string> {
      const bucket = storage.bucket(bucketName)
      const file = bucket.file(objectName)
      const action = options.action === 'write' ? 'write' : 'read'
      const expires = Date.now() + Math.max(1, options.expiresInSeconds) * 1000
      const cfg: { action: 'read' | 'write'; expires: number; contentType?: string } = {
        action,
        expires,
      }
      if (options.contentType !== undefined) cfg.contentType = options.contentType
      const [url] = await file.getSignedUrl(cfg)
      return url
    },

    writeStream(bucketName, objectName, options?: GcsWriteOptions): Writable {
      const bucket = storage.bucket(bucketName)
      const file = bucket.file(objectName)
      const createOpts: {
        gzip?: boolean
        contentType?: string
        metadata?: Record<string, string>
      } = {}
      if (options?.gzip !== undefined) createOpts.gzip = options.gzip
      const ct = toContentType(options)
      if (ct !== undefined) createOpts.contentType = ct
      if (options?.metadata !== undefined) createOpts.metadata = options.metadata
      const stream = file.createWriteStream(createOpts)
      const pt = new PassThrough()
      pt.pipe(stream)
      return pt
    },

    readStream(bucketName, objectName): Readable {
      const bucket = storage.bucket(bucketName)
      const file = bucket.file(objectName)
      return file.createReadStream()
    },
  }
}
