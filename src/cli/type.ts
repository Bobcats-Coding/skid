import type { ArgumentsCamelCase, Argv } from 'yargs'

export type CommandModule<T = Record<string, unknown>> = {
  command: string
  describe: string
  builder: (yargs: Argv) => Argv
  handler: (args: ArgumentsCamelCase<T>) => Promise<void>
}

export type StdioMessage = {
  type: 'stdout' | 'stderr'
  message: string
}
