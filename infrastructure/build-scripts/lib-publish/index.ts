import yargs from 'yargs'
import { gitStatus } from '@bobcats-coding/skid/zx/git.ts'
import { printCatchedError } from '@bobcats-coding/skid/zx/print.ts'

export type PublishLibVersionOptions = {
  monorepo?: {
    packagePath: string
    packageName: string
  }
  mirrorRepo?: {
    repoUrl: string,
    folderToMirror: string
  }
}

export const publishLibVersion = async ({ monorepo, mirrorRepo }: PublishLibVersionOptions = {}) => {  
  try {
    const { libraryVersion } = validatePublishLibCliArgs()
    const libDir = monorepo?.packagePath ?? '/'
    await checkGitChanges(libDir)

    console.log(libraryVersion, mirrorRepo)
  } catch (error) {
    printCatchedError(error)
    process.exit(1)
  }
}

export const validatePublishLibCliArgs = (): { libraryVersion: string } => {
  return yargs()
    .scriptName('lib-publish')
    .positional('libraryVersion', {
      describe: 'Version to publish (semver or patch/minor/major)',
      type: 'string',
      demandOption: true
    })
    .strict()
    .parseSync()
}

const VERSION_KEYWORDS = ['patch', 'minor', 'major'] as const

const buildSemverRegex = () => {
  const NUMBERS = '\\d+'
  const DOT = '\\.'
  const VERSION_CORE = `${NUMBERS}${DOT}${NUMBERS}${DOT}${NUMBERS}`
  const ALLOWED_CHARS = '[0-9A-Za-z-]'
  const PRERELEASE_IDENTIFIER = `${ALLOWED_CHARS}+`
  const PRERELEASE_SUBSEQUENT = `(?:\\.${PRERELEASE_IDENTIFIER})*`
  const PRERELEASE = `(?:-(?:${PRERELEASE_IDENTIFIER}${PRERELEASE_SUBSEQUENT}))?`
  const BUILD_METADATA_IDENTIFIER = `${ALLOWED_CHARS}+(?:\\.${ALLOWED_CHARS}+)*`
  const BUILD_METADATA = `(?:\\+${BUILD_METADATA_IDENTIFIER})?`
  return new RegExp(`^${VERSION_CORE}${PRERELEASE}${BUILD_METADATA}$`)
}

const SEMVER_REGEX = buildSemverRegex()

export const validateVersionArgument = (version: string): boolean => {
  const isVersionKeyword = VERSION_KEYWORDS.some(keyword => keyword === version)
  if (isVersionKeyword) {
    return true
  } 
  return SEMVER_REGEX.test(version)
}

const checkGitChanges = async (libDir: string): Promise<void> => {
  const changedFilesInGit = await gitStatus()
  const startsWithLibDir = (file: string) => file.includes(` ${libDir}`)
  const libDirChanges = changedFilesInGit.filter(startsWithLibDir)
  if (libDirChanges.length > 0) {
    throw new Error(`Git status is not clean in lib directory: ${libDir}\n${libDirChanges.join('\n')}`)
  }
}


