import type { CoreEffectFunction } from './effect'
import { ObjectWithStringLiteralKey } from './type'

import { configureStore, createSlice } from '@reduxjs/toolkit'
import type { SliceCaseReducers } from '@reduxjs/toolkit'
import { Observable, Subject } from 'rxjs'
import { mergeAll } from 'rxjs/operators'

export type CoreStore<ALL_STATE, ALL_EVENT extends CoreEvent> = {} & StateReadable<ALL_STATE> &
  EventReceiver<ALL_EVENT> &
  EffectRegistry<ALL_STATE, ALL_EVENT>

export type StateReadable<ALL_STATE> = {
  state$: Observable<ALL_STATE>
}

export type EventReceiver<ALL_EVENT extends CoreEvent> = {
  send: (event: ALL_EVENT) => void
}

export type EffectRegistry<ALL_STATE, ALL_EVENT extends CoreEvent> = {
  registerEffect: (effect: CoreEffectFunction<ALL_STATE, ALL_EVENT>) => void
}

export type CoreReducer<STATE, EVENT extends CoreEvent = CoreEvent> = (
  state: STATE | undefined,
  event: EVENT,
) => STATE

export type CoreReducersObject<ALL_STATE, ALL_EVENT extends CoreEvent> = {
  [KEY in keyof ALL_STATE]: CoreReducer<ALL_STATE[KEY], ALL_EVENT>
}

export type CoreEvent<TYPE extends string = any, PAYLOAD = any> = {
  type: TYPE
  payload: PAYLOAD
}

export type NamespacedState<SLICE extends CoreStoreSlice> = SLICE extends CoreStoreSlice<
  infer STATE,
  any,
  infer NAMESPACE
>
  ? ObjectWithStringLiteralKey<NAMESPACE, STATE>
  : never

export type NamespacedStoreEvent<
  NAMESPACE extends string,
  SUB_TYPE extends string,
  PAYLOAD = undefined,
> = CoreEvent<`${NAMESPACE}/${SUB_TYPE}`, PAYLOAD>

export type CoreCaseReducer<STATE, EVENT extends CoreEvent = CoreEvent> = (
  state: STATE,
  event: EVENT,
) => STATE

export type CoreCaseReducersObject<STATE> = Record<string, CoreCaseReducer<STATE, CoreEvent>>

export type CoreStoreConfig<
  STATE,
  CASE_REDUCERS extends CoreCaseReducersObject<STATE>,
  NAMESPACE extends string = string,
> = {
  name: NAMESPACE
  initialState: STATE
  reducers: CASE_REDUCERS
}

export type StoreEventCreator<EVENT extends CoreEvent> = EVENT extends {
  type: infer TYPE extends string
  payload: infer PAYLOAD
}
  ? PAYLOAD extends undefined
    ? () => EVENT
    : (payload: PAYLOAD) => CoreEvent<TYPE, PAYLOAD>
  : never

export type StoreEventCreators<
  STATE,
  CASE_REDUCERS extends CoreCaseReducersObject<STATE>,
> = CASE_REDUCERS extends Record<infer K extends string, CoreCaseReducer<STATE, CoreEvent>>
  ? {
      [KEY in K as `create${Capitalize<KEY>}`]: CASE_REDUCERS[KEY] extends (
        state: any,
        event: infer EVENT extends CoreEvent,
      ) => any
        ? StoreEventCreator<EVENT>
        : StoreEventCreator<CoreEvent>
    }
  : never

export type CoreStoreSlice<
  STATE = any,
  CASE_REDUCERS extends CoreCaseReducersObject<STATE> = CoreCaseReducersObject<STATE>,
  NAMESPACE extends string = string,
> = {
  name: NAMESPACE
  reducer: CoreReducer<STATE>
  eventCreators: StoreEventCreators<STATE, CASE_REDUCERS>
} & CoreStateMapper<STATE, NAMESPACE>

type CoreStateMapper<STATE, NAMESPACE extends string> = {
  [KEY in keyof ObjectWithStringLiteralKey<NAMESPACE, STATE> as `stateTo${Capitalize<KEY>}`]: (
    ALL_STATE: ObjectWithStringLiteralKey<NAMESPACE, STATE>,
  ) => STATE
}

export type StoreError = {
  message: string
  stack: string
}

export const createCoreStore = <STATE, EVENT extends CoreEvent>(
  reducer: CoreReducersObject<STATE, EVENT>,
): CoreStore<STATE, EVENT> => {
  const store = configureStore({ reducer })
  const event$ = new Subject<EVENT>()
  const event$$ = new Subject<Observable<EVENT>>()
  const eventAfterEffects$ = new Subject<EVENT>()
  event$$.pipe(mergeAll()).subscribe((event) => {
    store.dispatch(event)
    eventAfterEffects$.next(event)
  })
  event$$.next(event$)
  const state$: Observable<STATE> = new Observable((subscriber) => {
    subscriber.next(store.getState())
    store.subscribe(() => {
      subscriber.next(store.getState())
    })
  })
  const send = (action: EVENT): void => {
    event$.next(action)
  }
  const registerEffect = (effect: CoreEffectFunction<STATE, EVENT>): void => {
    event$$.next(effect(eventAfterEffects$, state$))
  }
  return {
    state$,
    send,
    registerEffect,
  }
}

export const createCoreStoreSlice = <
  STATE,
  CASE_REDUCERS extends CoreCaseReducersObject<STATE>,
  NAMESPACE extends string = string,
>(
  config: CoreStoreConfig<STATE, CASE_REDUCERS, NAMESPACE>,
): CoreStoreSlice<STATE, CASE_REDUCERS, NAMESPACE> => {
  const { name, reducer, actions } = createSlice({
    name: config.name,
    initialState: config.initialState,
    reducers: config.reducers as SliceCaseReducers<STATE>,
  })
  const actionEntries = Object.entries(actions)
  const eventCreators = Object.fromEntries(
    actionEntries.map(([name, creator]) => [`create${capitalize(name)}`, creator]),
  )
  const mapperName: `stateTo${Capitalize<NAMESPACE>}` = `stateTo${capitalize(name)}`
  // The literal type does not work without casting
  const stateMapper: CoreStateMapper<STATE, NAMESPACE> = {
    [mapperName]: ({ [name]: state }: ObjectWithStringLiteralKey<NAMESPACE, STATE>): STATE => state,
  } as unknown as CoreStateMapper<STATE, NAMESPACE>
  return {
    name,
    reducer: reducer as CoreReducer<STATE, CoreEvent>,
    // We don't want to reproduce the "immer" types that are used in redux-toolkit so we just
    // force cast the event creators
    eventCreators: eventCreators as unknown as StoreEventCreators<STATE, CASE_REDUCERS>,
    ...stateMapper,
  }
}

const capitalize = <T extends string>(input: T): Capitalize<T> =>
  `${input.charAt(0).toUpperCase()}${input.slice(1)}` as Capitalize<T>

export const toStoreError = ({ message, stack = '' }: Error): StoreError => ({
  message,
  stack,
})

export const createStoreError = (message: string): StoreError => toStoreError(new Error(message))

export const identityReducer = <STATE, EVENT>(state: STATE, _: EVENT): STATE => state
