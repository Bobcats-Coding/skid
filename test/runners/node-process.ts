import type { Runner } from '@bobcats-coding/skid/test/type'

import type { StartedTestContainer } from 'testcontainers'
import { GenericContainer, TestContainers, Wait } from 'testcontainers'

export type NodeProcessRunnerConfig = {
  path: string
  args: string[]
  port: number
  environment?: Record<string, string>
}

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
        console.log('Container closed')
      })
    })
    .withWaitStrategy(Wait.forListeningPorts())

  return {
    start: async () => {
      runningContainer = await container.start()
      await TestContainers.exposeHostPorts(port)
    },
    stop: async () => {
      if (runningContainer !== undefined) {
        await runningContainer.stop()
      }
    },
  }
}
