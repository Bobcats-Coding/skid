import { createFakeSpawn } from './fake'
import { createProcessService } from './service'

import { coreMarbles } from '@bobcats-coding/skid/core/marbles-vitest'

import { spawn } from 'child_process'
import { firstValueFrom } from 'rxjs'
import { expect, test } from 'vitest'

test(
  'processService.$stdout',
  coreMarbles(({ expect }) => {
    const { spawn: fakeSpawn } = createFakeSpawn([
      {
        command: 'ls',
        args: [],
        stdout: 'file.ts',
        exitCode: 1,
      },
    ])
    const processService = createProcessService(fakeSpawn)
    expect(processService.run('ls').stdout$).toBeObservable('-(1|)', {
      '1': 'file.ts',
    })
  }),
)

test(
  'processService.$stderror',
  coreMarbles(({ expect }) => {
    const { spawn: fakeSpawn } = createFakeSpawn([
      {
        command: 'ls',
        args: [],
        stdout: '',
        stderror: 'Error',
        exitCode: 1,
      },
    ])
    const processService = createProcessService(fakeSpawn)
    expect(processService.run('ls').stderror$).toBeObservable('-(1|)', {
      '1': 'Error',
    })
  }),
)

test(
  'processService.$exitCode',
  coreMarbles(({ expect }) => {
    const { spawn: fakeSpawn } = createFakeSpawn([
      {
        command: 'ls',
        args: [],
        stdout: 'file.ts',
        exitCode: 1,
      },
    ])
    const processService = createProcessService(fakeSpawn)
    expect(processService.run('ls').exitCode$).toBeObservable('-(1|)', {
      '1': 1,
    })
  }),
)

test(
  'processService.$output',
  coreMarbles(({ expect }) => {
    const { spawn: fakeSpawn } = createFakeSpawn([
      {
        command: 'ls',
        args: [],
        stdout: 'file.ts',
        stderror: 'Error',
        exitCode: 1,
      },
    ])
    const processService = createProcessService(fakeSpawn)
    expect(processService.run('ls').output$).toBeObservable('-(1|)', {
      '1': {
        stdout: 'file.ts',
        stderror: 'Error',
        exitCode: 1,
      },
    })
  }),
)

test(
  'processService.$output no error',
  coreMarbles(({ expect }) => {
    const { spawn: fakeSpawn } = createFakeSpawn([
      {
        command: 'ls',
        args: [],
        stdout: 'file.ts',
        exitCode: 1,
      },
    ])
    const processService = createProcessService(fakeSpawn)
    expect(processService.run('ls').output$).toBeObservable('-(1|)', {
      '1': {
        stdout: 'file.ts',
        stderror: '',
        exitCode: 1,
      },
    })
  }),
)

test(
  'processService $executedCommands',
  coreMarbles(({ expect }) => {
    const { spawn: fakeSpawn, $executedCommands } = createFakeSpawn([
      {
        command: 'ls',
        args: [],
        stdout: 'file.ts',
        exitCode: 1,
      },
    ])
    const processService = createProcessService(fakeSpawn)
    processService.run('ls')
    expect($executedCommands).toBeObservable('-1', {
      '1': {
        command: 'ls',
        args: [],
      },
    })
  }),
)

test('processService.runAsync', async () => {
  const { spawn: fakeSpawn, executedCommands } = createFakeSpawn([
    {
      command: 'ls',
      args: [],
      stdout: 'file.ts',
      exitCode: 1,
    },
  ])
  const processService = createProcessService(fakeSpawn)
  const { stdout, stderror, exitCode } = await processService.runAsync('ls')
  expect(stdout).toBe('file.ts')
  expect(stderror).toBe('')
  expect(exitCode).toBe(1)
  expect(executedCommands).toEqual([{ command: 'ls', args: [] }])
})

test('processService integration', async () => {
  const processService = createProcessService(spawn)
  const { stdout, stderror, exitCode } = await firstValueFrom(processService.run('ls').output$)
  expect(typeof stdout).toBe('string')
  expect(typeof stderror).toBe('string')
  expect(typeof exitCode).toBe('number')
})
