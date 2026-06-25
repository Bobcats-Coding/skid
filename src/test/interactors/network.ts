import { type Interactor } from '../type'

import { EMPTY } from 'rxjs'
import { Network, type StartedNetwork } from 'testcontainers'

export const networkInteractor = (): Interactor<{ network: StartedNetwork }> => {
  const network = new Network()

  let startedNetwork: StartedNetwork | undefined

  return {
    start: async () => {
      startedNetwork = await network.start()
    },
    stop: async () => {
      if (startedNetwork !== undefined) {
        await startedNetwork.stop()
      }
    },
    startContext: async () => {
      if (startedNetwork === undefined) {
        throw new Error('Network not started')
      }
      return {
        context: {
          network: startedNetwork,
        },
        reportEntry$: EMPTY,
      }
    },
    stopContext: async () => {},
    onFailure: async () => {
      return {
        entry: 'Network failed to start',
        type: 'text/plain',
      }
    },
  }
}
