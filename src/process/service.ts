import { type ProcessService, type Spawn } from './type'

import { combineLatest, firstValueFrom, map, scan, startWith, Subject } from 'rxjs'

export const createProcessService = (spawn: Spawn): ProcessService => {
  const run: ProcessService['run'] = (command, args) => {
    const stdout$ = new Subject<string>()
    const stderror$ = new Subject<string>()
    const exitCode$ = new Subject<number | undefined>()
    const spawnProcess = spawn(command, args ?? [], {})
    const accumulateOutput = (acc: string, value: string): string => acc + value
    const output$ = combineLatest([
      stdout$.pipe(startWith(''), scan(accumulateOutput, '')),
      stderror$.pipe(startWith(''), scan(accumulateOutput, '')),
      exitCode$,
    ]).pipe(
      map(([stdout, stderror, exitCode]) => ({
        stdout,
        stderror,
        exitCode,
      })),
    )

    spawnProcess.stdout?.on('data', (data) => {
      stdout$.next(String(data))
    })

    spawnProcess.stderr?.on('data', (data) => {
      stderror$.next(String(data))
    })

    spawnProcess.on('close', (exitCode) => {
      exitCode$.next(exitCode ?? undefined)
      stderror$.complete()
      stdout$.complete()
      exitCode$.complete()
    })

    return {
      stdout$,
      stderror$,
      exitCode$,
      output$,
    }
  }

  const runAsync: ProcessService['runAsync'] = async (command, args) => {
    return await firstValueFrom(run(command, args).output$)
  }

  return {
    run,
    runAsync,
  }
}
