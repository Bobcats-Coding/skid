export const isRunningInPackageManagerScripts = (): boolean => {
  return Boolean(
    process.env['_']
      ?.split('/')
      .pop()
      ?.match(/pnpm|yarn|npm/),
  )
}

export const getPackageManagerName = (): string => {
  const packageManagerName = process.env['_']
    ?.split('/')
    .pop()
    ?.match(/pnpm|yarn|npm/)
  if (packageManagerName === undefined || packageManagerName === null) {
    throw new Error('Could not determine package manager name')
  }
  return packageManagerName[0]
}

const getPackageManagerScriptName = (): string => {
  const packageManagerName = getPackageManagerName()
  const packageManagerRunCommand = packageManagerName === 'npm' ? 'npm run' : packageManagerName
  const packageManagerScriptName = process.env['npm_lifecycle_event']
  return `${packageManagerRunCommand} ${packageManagerScriptName} --`
}

export const getScriptName = (): string => {
  return isRunningInPackageManagerScripts()
    ? getPackageManagerScriptName()
    : __filename.split('/').pop() ?? ''
}

export const getUsage = (usageInfo: string[]): ((isError: boolean) => void) => {
  const scriptName = getScriptName()
  return (isError: boolean): void => {
    const usage = usageInfo.map((line) => `${scriptName} ${line}`)
    const log = isError ? console.error : console.log
    log('Usage:')
    usage.forEach((line) => {
      log(line)
    })
    process.exit(isError ? 1 : 0)
  }
}
