import type { CoreEvent, CoreReducer, CoreReducersObject, CoreStore, StateReadable } from './store'
import { StringLiteral } from './type'
import { makeObjectFromStringLiteral } from './util'

import { createCoreStore } from '@bobcats-coding/skid/core/store'

import { throwError, timer } from 'rxjs'
import type { Observable } from 'rxjs'
import { map, mergeMap } from 'rxjs/operators'

export type TestAppStoreState<STATE, STATE_KEY> = {
  [K in StringLiteral<STATE_KEY>]: STATE
}

export const STORE_INIT = {
  type: 'init',
  payload: undefined,
}

export type StoreTools<
  STATE,
  EVENT extends CoreEvent,
  STATE_KEY,
  BASE_STATE,
  APP_STORE_STATE = TestAppStoreState<STATE, STATE_KEY>,
> = {
  getStateReadable: (in$: Observable<Partial<STATE>>) => StateReadable<APP_STORE_STATE>
  createAppStore: () => {
    store: CoreStore<APP_STORE_STATE & BASE_STATE, EVENT>
    sliceState$: Observable<STATE>
  }
}

type GetReducerObjectState<STATE> = STATE extends CoreReducersObject<infer S, any> ? S : STATE
type GetReducerState<STATE> = STATE extends CoreReducer<infer S, any> ? S : STATE
type GetReducerEvent<EVENT> = EVENT extends CoreReducer<any, infer E> ? E : EVENT
type CreateStoreToolsArgs<NAMESPACE> = {
  namespace: StringLiteral<NAMESPACE>
  reducer: CoreReducer<any, any>
  baseStore?: CoreReducersObject<any, any>
}

export const createStoreTools = <NAMESPACE>({
  namespace,
  reducer,
  baseStore = {},
}: CreateStoreToolsArgs<NAMESPACE>): StoreTools<
  GetReducerState<typeof reducer>,
  GetReducerEvent<typeof reducer>,
  NAMESPACE,
  GetReducerObjectState<typeof baseStore>
> => {
  type BaseState = GetReducerObjectState<typeof baseStore>
  type State = GetReducerState<typeof reducer>
  type Event = GetReducerEvent<typeof reducer>
  type AppStoreState = TestAppStoreState<State, NAMESPACE>
  return {
    getStateReadable: (in$: Observable<Partial<State>>): StateReadable<AppStoreState> => ({
      // We are faking a whole state so needs to force casting is needed
      state$: in$.pipe(map((x) => ({ [namespace]: x }) as unknown as AppStoreState)),
    }),
    createAppStore: () => {
      const store = createCoreStore<AppStoreState & BaseState, Event>({
        ...baseStore,
        ...makeObjectFromStringLiteral(namespace, reducer),
      })
      return {
        store,
        sliceState$: store.state$.pipe(map((state) => state[namespace])),
      }
    },
  }
}

type MethodTypes = 'sync' | 'async' | 'observable'

export type FakeConfigs<FAKE extends Object> = {
  [KEY in keyof Partial<FAKE>]: FakeConfig
}

type FakeConfig = { type: MethodTypes; error: Error }

type FakeWithThrowingMethods<FAKE extends Object, FAKE_CONFIGS extends FakeConfigs<FAKE>> = {
  [KEY in keyof FAKE]: KEY extends keyof FAKE_CONFIGS
    ? FAKE[KEY] extends (...args: any[]) => Observable<any>
      ? ThrowingObservable
      : FAKE[KEY] extends (...args: any[]) => Promise<any>
      ? ThrowingAsync
      : FAKE[KEY] extends (...args: any[]) => any
      ? ThrowingSync
      : FAKE[KEY]
    : FAKE[KEY]
}

type ThrowingMethods<FAKE extends Object> = {
  [KEY in keyof FakeConfigs<FAKE>]: FAKE[KEY] extends (...args: any[]) => Observable<any>
    ? ThrowingObservable
    : FAKE[KEY] extends (...args: any[]) => Promise<any>
    ? ThrowingAsync
    : FAKE[KEY] extends (...args: any[]) => any
    ? ThrowingSync
    : FAKE[KEY]
}

type ThrowingSync = (...args: any[]) => never
type ThrowingAsync = (...args: any[]) => Promise<never>
type ThrowingObservable = (...args: any[]) => Observable<never>

export const addErrorMethodsToFake =
  <T extends Object>(originalFake: (...args: any[]) => T) =>
  (
    configs: FakeConfigs<T> = {} as FakeConfigs<T>,
    ...restArgs: any[]
  ): FakeWithThrowingMethods<T, typeof configs> => {
    const fake = originalFake(...restArgs)
    const throwingMethods = generateThrowingMethods<T>(configs)
    // It is a valid cast to more specific tpye
    // eslint-disable-next-line
    return {
      ...fake,
      ...throwingMethods,
    } as FakeWithThrowingMethods<T, typeof configs>
  }

const THROWING_METOD_GENERATORS = {
  sync: (error: Error) => () => {
    throw error
  },
  async: (error: Error) => async () => {
    throw error
  },
  observable: (error: Error) => () => timer(1).pipe(mergeMap(() => throwError(() => error))),
}

const generateThrowingMethods = <FAKE extends Object>(
  configs: FakeConfigs<FAKE>,
): ThrowingMethods<FAKE> => {
  const entries: Array<[string, FakeConfig]> = Object.entries(configs)
  const throwingMethods = entries.map(([method, { error, type }]) => [
    method,
    THROWING_METOD_GENERATORS[type](error),
  ])
  return Object.fromEntries(throwingMethods)
}
