import type { Interactor } from '../type.ts'
import type { StartedNetwork, StartedTestContainer } from 'testcontainers'
import { GenericContainer } from 'testcontainers'
import { ReplaySubject } from 'rxjs'
import { NODE_CONTAINER_IMAGE } from '../constants.ts'

export type CommandResult = {
  output: string
  exitCode: number
}

export type ExecContext = {
  user: string
  workingDir: string
  environment: Record<string, string>
}

export type NodeCommandLineContext = {
  exec: (command: string, context?: Partial<ExecContext>) => Promise<CommandResult>
  execWithAssertions: (command: string, context?: Partial<ExecContext>) => Promise<CommandResult>
}

export type NodeCommandLineConfig = {
  workingDir: string
  environment?: Record<string, string>
  network?: StartedNetwork
  path?: string
}

export const nodeCommandLineInteractor = ({
  workingDir,
  environment = {},
  network,
  path,
}: NodeCommandLineConfig): Interactor<NodeCommandLineContext> => {
  let runningContainer: StartedTestContainer | undefined
  const reportEntry$ = new ReplaySubject<{ entry: string; type: 'text/plain' }>()

  const container = new GenericContainer(NODE_CONTAINER_IMAGE)
    .withWorkingDir(workingDir)
    .withEnvironment(environment)
    // Keep container running with tail -f
    .withCommand(['tail', '-f', '/dev/null'])
    .withLogConsumer((stream) => {
      stream.on('data', (line) => {
        console.log(line)
      })
      stream.on('err', (line) => {
        console.error(line)
      })
      stream.on('end', () => {
        console.log(`Container closed: ${NODE_CONTAINER_IMAGE}`)
      })
    })

  if (network !== undefined) {
    container.withNetwork(network)
  }

  if (path !== undefined) {
    container.withCopyDirectoriesToContainer([
      {
        source: path,
        target: '/opt/app/',
      },
    ])
  }

  const createContext = (container: StartedTestContainer): NodeCommandLineContext => {
    const runCommand = async (command: string, context?: Partial<ExecContext>) => {
      // Unfortunately, testcontainers does not support reading stderr
      const redirectedCommand = `${command} 2>&1`
      const result = await container.exec(['sh', '-c', redirectedCommand], context)
      reportEntry$.next({
        entry: `Command executed: ${command}\nExit code: ${result.exitCode}`,
        type: 'text/plain'
      })
      return result
    }
    return {
      exec: async (command, context) => {
        return runCommand(command, context)
      },
      execWithAssertions: async (command, context) => {
        const result = await runCommand(command, context)
        if (result.exitCode !== 0) {
          console.error(result.output)
          throw new Error(`Command failed: ${command}\nExit code: ${result.exitCode}\nOutput: ${result.output}`)
        }
        return result
      }
    }
  }

  return {
    start: async () => {
      runningContainer = await container.start()
    },
    stop: async () => {
      if (runningContainer !== undefined) {
        await runningContainer.stop()
        console.log(`Container stopped: ${workingDir}`)
      }
    },
    startContext: async () => {
      if (!runningContainer) {
        throw new Error('Container not started')
      }
      return {
        context: createContext(runningContainer),
        reportEntry$: reportEntry$.asObservable()
      }
    },
    stopContext: async () => {
      // Context cleanup handled in stop()
    },
    onFailure: async (_context: NodeCommandLineContext, testName: string) => ({
      entry: `Node command line failed during test: ${testName}`,
      type: 'text/plain'
    })
  }
} 