import type { EventBroker, EventBrokerBackend } from './type'

export const createBroker = <T extends Record<string, any>>(brokerBackend: EventBrokerBackend): EventBroker<T> => {
  return {
    dispatch: (event, args) => {
      // @TODO remove string conversion
      brokerBackend.dispatch(String(event), args)
    },
    on: (event, handler) => {
      // @TODO remove string conversion
      brokerBackend.on(String(event), handler)
    }
  }
}