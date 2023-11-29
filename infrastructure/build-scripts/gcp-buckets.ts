import { $ } from 'zx'

type ListFilesInBucketArgs = {
  projectId: string
  bucketName: string
}

export const listFilesInBucket = async ({
  projectId,
  bucketName,
}: ListFilesInBucketArgs): Promise<string[]> => {
  const originalProject = (await $`gcloud config get-value project`.quiet()).stdout.trim()
  await $`gcloud config set project ${projectId}`.quiet()
  const bucketsOutput = await $`gsutil ls gs://${bucketName}`.quiet()
  await $`gcloud config set project ${originalProject}`.quiet()
  return bucketsOutput.stdout.trim().split('\n')
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
  const originalProject = (await $`gcloud config get-value project`.quiet()).stdout.trim()
  await $`gcloud config set project ${projectId}`.quiet()
  const bucketsOutput = await $`gsutil cat gs://${bucketName}/${filePath}`.quiet()
  await $`gcloud config set project ${originalProject}`.quiet()
  return bucketsOutput.stdout.trim()
}

export const getFilePath = (url: string): string => {
  const pattern = /^gs:\/\/[^/]+\/(.+)$/
  const match = url.match(pattern)
  return match !== null ? match[1] ?? '' : ''
}

export const getAllFilesInBucket = async ({
  projectId,
  bucketName,
}: ListFilesInBucketArgs): Promise<Array<{ name: string, content: string }>> => {
  console.log(`Getting all files from gs://${bucketName}`)
  const files = await listFilesInBucket({ projectId, bucketName })
  const allFiles = await Promise.all(
    files.map(async (file) => {
      const filePath = getFilePath(file)
      const content = await getFileContent({ projectId, bucketName, filePath })
      return {
        name: filePath,
        content,
      }
    }),
  )
  return allFiles
}
