import type { EventBrokerBackend } from './type'

export const createFakeEventBrokerBackend = (): {
  subscriptions: Array<[string, CallableFunction]>
  dispatchedEvents: Array<[string, any]>
  backend: EventBrokerBackend
} => {
  const subscriptions: Array<[string, CallableFunction]> = []
  const dispatchedEvents: Array<[string, any]> = []
  const backend: EventBrokerBackend = {
    on: (event, handler) => {
      subscriptions.push([event, handler])
    },
    dispatch: (eventName, args) => {
      dispatchedEvents.push([eventName, args])
    },
  }

  return {
    subscriptions,
    dispatchedEvents,
    backend,
  }
}
