import type { Runner } from '@bobcats-coding/skid/test/type'

import type { StartedTestContainer } from 'testcontainers'
import { GenericContainer, TestContainers, Wait } from 'testcontainers'

export type NodeProcessRunnerConfig = {
  path: string
  args: string[]
  port: number
  environment?: Record<string, string>
}

const GLOBAL_EXPOSED_PORTS = new Set<number>()

export const nodeProcessRunner = ({
  path,
  args,
  port,
  environment = {},
}: NodeProcessRunnerConfig): Runner => {
  let runningContainer: StartedTestContainer | undefined

  const container = new GenericContainer('node')
    .withWorkingDir('/opt/app')
    .withEnvironment(environment)
    .withBindMounts([
      {
        source: path,
        target: '/opt/app/',
      },
    ])
    .withExposedPorts({
      container: port,
      host: port,
    })
    .withCommand(args)
    .withLogConsumer((stream) => {
      stream.on('data', (line) => {
        console.log(line)
      })
      stream.on('err', (line) => {
        console.error(line)
      })
      stream.on('end', () => {
        console.log(`Container closed: ${path} ${args}`)
      })
    })
    .withWaitStrategy(Wait.forListeningPorts())

  return {
    start: async () => {
      runningContainer = await container.start()
      console.log(`Checking port: ${port}`)
      if (GLOBAL_EXPOSED_PORTS.has(port)) {
        console.log(`Port already exposed: ${port}`)
        return
      }
      await TestContainers.exposeHostPorts(port)
      GLOBAL_EXPOSED_PORTS.add(port)
      console.log(`Port exposed: ${port}`)
    },
    stop: async () => {
      if (runningContainer !== undefined) {
        await runningContainer.stop()
        console.log(`Container stopped: ${path} ${args}`)
      }
    },
  }
}
