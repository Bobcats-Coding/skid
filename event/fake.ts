import type { EventBrokerBackend } from './type'

export const createFakeEventBrokerBackend = (): {
  subscriptions: Array<[string, CallableFunction]>
  dispatchedEvents: Array<[string, any]>
  invokeHandlers: (eventName: string, args: any) => void,
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

  const invokeHandlers = (eventName: string, args: any): void => {
    subscriptions
      .filter(([event]) => event === eventName)
      .forEach(([_, handler]) => {
        handler(args)
      })
  }

  return {
    subscriptions,
    dispatchedEvents,
    invokeHandlers,
    backend,
  }
}
