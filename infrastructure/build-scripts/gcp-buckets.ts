import { Storage } from '@google-cloud/storage'

type ListFilesInBucketArgs = {
  projectId: string
  bucketName: string
}

export const listFilesInBucket = async ({
  projectId,
  bucketName,
}: ListFilesInBucketArgs): Promise<string[]> => {
  const storage = new Storage({ projectId })
  try {
    const [files] = await storage.bucket(bucketName).getFiles()
    return files.map((file) => file.name)
  } catch (error) {
    console.error('Error fetching files:', error)
    return []
  }
}

type GetFileContentArgs = {
  projectId: string
  bucketName: string
  filePath: string
}

export const getFileContent = async ({
  projectId,
  bucketName,
  filePath,
}: GetFileContentArgs): Promise<string> => {
  console.log(`Getting file content from gs://${bucketName}/${filePath}`)
  try {
    const storage = new Storage({ projectId })
    const file = storage.bucket(bucketName).file(filePath)
    const contents = await file.download()
    return contents.toString()
  } catch (error) {
    console.error('Error fetching file content:', error)
    return ''
  }
}

export const getAllFilesInBucket = async ({
  projectId,
  bucketName,
}: ListFilesInBucketArgs): Promise<Array<{ name: string; content: string }>> => {
  console.log(`Getting all files from gs://${bucketName}`)
  const files = await listFilesInBucket({ projectId, bucketName })
  const allFiles = await Promise.all(
    files.map(async (filePath) => {
      const content = await getFileContent({ projectId, bucketName, filePath })
      return {
        name: filePath,
        content,
      }
    }),
  )
  return allFiles
}
