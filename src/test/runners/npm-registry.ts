import type { Runner } from '../type.ts'
import type { StartedNetwork, StartedTestContainer } from 'testcontainers'
import { GenericContainer, Wait } from 'testcontainers'

export type NpmRegistryRunnerConfig = {
  port: number
  environment?: Record<string, string>
  network?: StartedNetwork
  alias?: string
}

export const npmRegistryRunner = ({
  port,
  environment = {},
  network,
  alias,
}: NpmRegistryRunnerConfig): Runner => {
  let runningContainer: StartedTestContainer | undefined

  const container = new GenericContainer('verdaccio/verdaccio')
    .withExposedPorts({
      container: port,
      host: port,
    })
    .withEnvironment(environment)
    .withLogConsumer((stream) => {
      stream.on('data', (line) => {
        console.log(line)
      })
      stream.on('err', (line) => {
        console.error(line)
      })
      stream.on('end', () => {
        console.log('Verdaccio container closed')
      })
    })
    .withWaitStrategy(Wait.forListeningPorts().withStartupTimeout(300_000))

  if (alias !== undefined) {
    container.withName(alias)
  }

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
        console.log(`Verdaccio container stopped: ${alias ?? 'npm-registry'}`)
      }
    },
  }
}
