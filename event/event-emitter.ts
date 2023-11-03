import type { EventBrokerBackend } from './type'

import EventEmitter from 'events'

export const createEventEmitterBackend = (): EventBrokerBackend => {
  const target = new EventEmitter()
  return {
    dispatch: (event, args) => {
      target.emit(event, args)
    },
    on: (event, handler) => {
      target.addListener(event, handler)
    },
  }
}
