import { $ } from 'zx'

export const getPackageVersionInWorkspace = async (workspaceName: string, path: string) =>
  JSON.parse(
    (
      await $`yarn workspace ${workspaceName} info ${workspaceName}@workspace:${path} --json`.quiet()
    ).stdout,
  )['children']['Version'].trim()

export const getPackageVersion = async () => {
  const packageJson = JSON.parse(
    (await $`npm pkg get version`.quiet()).stdout
  )
  return packageJson.replace(/"/g, '')
}
