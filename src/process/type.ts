import { type ChildProcess, type SpawnOptions } from 'node:child_process'
import { type Observable } from 'rxjs'

export type Spawn = (command: string, args: string[], options: SpawnOptions) => ChildProcess

export type ProcessService = {
  run: (
    command: string,
    args?: string[],
  ) => {
    stdout$: Observable<string>
    stderror$: Observable<string>
    exitCode$: Observable<number | undefined>
    output$: Observable<{
      stdout: string
      stderror: string
      exitCode: number | undefined
    }>
  }
  runAsync: (
    command: string,
    args?: string[],
  ) => Promise<{
    stdout: string
    stderror: string
    exitCode: number | undefined
  }>
}
