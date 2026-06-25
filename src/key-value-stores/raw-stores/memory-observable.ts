import { type WriteableRawKeyValueStore } from '../type'

import { BehaviorSubject } from 'rxjs'

export type BehaviorSubjectStore<T> = WriteableRawKeyValueStore<T> & {
  $state: ReturnType<BehaviorSubject<Map<string, T>>['asObservable']>
}

export const createMemoryObservableRawKeyValueStore = <T = unknown>(): BehaviorSubjectStore<T> => {
  const store = new Map<string, T>()
  const subject = new BehaviorSubject<Map<string, T>>(new Map())

  return {
    get: (key: string) => store.get(key),
    set: (key: string, value: T) => {
      store.set(key, value)
      subject.next(new Map(store))
    },
    $state: subject.asObservable(),
  }
}
