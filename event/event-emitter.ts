import EventEmitter from 'events';
import type { EventBrokerBackend } from './type';

export const createEventEmitterBackend = (): EventBrokerBackend => {
  const target = new EventEmitter();
  return {
    dispatch: (event, args) => {
      target.emit(event, args);
    },
    on: (event, handler) => {
      target.addListener(event, handler);
    }
  }
}