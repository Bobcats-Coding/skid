import type { Runner } from '@bobcats-coding/skid/test/type'

import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import type { StartedNetwork } from 'testcontainers'
import { Wait } from 'testcontainers'

export type PostgresRunnerConfig = {
  port: number
  environment?: Record<string, string>
  network?: StartedNetwork
}

export const postgresRunner = ({
  port,
  environment = {},
  network,
}: PostgresRunnerConfig): Runner => {
  let runningContainer: StartedPostgreSqlContainer | undefined

  const container = new PostgreSqlContainer()
    .withEnvironment(environment)
    .withExposedPorts({
      container: port,
      host: port,
    })
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
    .withWaitStrategy(Wait.forListeningPorts().withStartupTimeout(300_000))

  if (network !== undefined) {
    container.withNetwork(network).withNetworkAliases('postgres')
  }

  return {
    start: async () => {
      runningContainer = await container.start()
    },
    stop: async () => {
      if (runningContainer !== undefined) {
        await runningContainer.stop()
        console.log('Container stopped')
      }
    },
  }
}
