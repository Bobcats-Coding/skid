import { $, os } from 'zx'

export const gitStatus = async (): Promise<string[]> => 
  (await $`git status --porcelain`.quiet())
    .stdout
    .trim()
    .split(os.EOL)

export const gitStatusHasChanges = async (directory: string = '/'): Promise<boolean> => {
  const status = await gitStatus()
  return status.some(line => line.includes(directory))
}

export const gitAdd = async (paths: string[]) => {
  await $`git add ${paths.join(' ')}`.quiet()
}

export const gitCommit = async (message: string) => {
  await $`git commit -m ${message}`.quiet()
}

export const gitTag = async (tag: string, commit?: string) => {
  await $`git tag ${tag}${commit ? commit : ' '}`.quiet()
}

type GitPushOptions = {
  branch: string
  force: boolean
  tags: boolean
}

export const gitPush = async ({ branch, force, tags }: GitPushOptions) => {
  await $`git push ${branch} ${force ? '--force' : ''} ${tags ? '--tags' : ''}`.quiet()
}
