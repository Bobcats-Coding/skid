import { createFakeEventBrokerBackend } from './fake'
import { createBroker } from './service'

const TEST_EVENT = 'test-event'
const TEST_ARGS = {
  param1: 'test-arg',
}

describe('Event Service', () => {
  describe('Dispatch event', () => {
    it('should use the provided backend', () => {
      const { dispatchedEvents, backend } = createFakeEventBrokerBackend()
      const eventBroker = createBroker(backend)
      eventBroker.dispatch(TEST_EVENT, TEST_ARGS)
      expect(dispatchedEvents[0]).toEqual([TEST_EVENT, TEST_ARGS])
    })
  })

  describe('Consume events', () => {
    it('should use the provided backend', () => {
      const fakeCallback = (): void => undefined
      const { backend, subscriptions } = createFakeEventBrokerBackend()
      const eventBroker = createBroker(backend)

      eventBroker.on(TEST_EVENT, fakeCallback)

      expect(subscriptions[0]).toEqual([TEST_EVENT, fakeCallback])
    })
  })
})
