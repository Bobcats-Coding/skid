import type { Runner } from '@bobcats-coding/skid/test/type'

import type { StartedNetwork, StartedTestContainer } from 'testcontainers'
import { GenericContainer, Wait } from 'testcontainers'

export type NodeProcessRunnerConfig = {
  path: string
  args: string[]
  port: number
  environment?: Record<string, string>
  network?: StartedNetwork
}

export const nodeProcessRunner = ({
  path,
  args,
  port,
  environment = {},
  network,
}: NodeProcessRunnerConfig): Runner => {
  let runningContainer: StartedTestContainer | undefined

  const container = new GenericContainer('node:22-bullseye')
    .withWorkingDir('/opt/app')
    .withEnvironment(environment)
    .withCopyDirectoriesToContainer([
      {
        source: path,
        target: '/opt/app/',
      },
    ])
    .withExposedPorts({
      container: port,
      host: port,
    })
    .withEntrypoint(args)
    .withLogConsumer((stream) => {
      stream.on('data', (line) => {
        console.log(line)
      })
      stream.on('err', (line) => {
        console.error(line)
      })
      stream.on('end', () => {
        console.log(`Container closed: ${path} ${args.join(' ')}}`)
      })
    })
    .withWaitStrategy(Wait.forListeningPorts().withStartupTimeout(300_000))

  if (network !== undefined) {
    container.withNetwork(network)
  }

  return {
    start: async () => {
      runningContainer = await container.start()
    },
    stop: async () => {
      if (runningContainer !== undefined) {
        await runningContainer.stop()
        console.log(`Container stopped: ${path} ${args.join(' ')}}`)
      }
    },
  }
}
