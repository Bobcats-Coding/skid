import { type GetValueByKey, type RecordToEntries } from '../core/type'
import { IdentityContext } from './identity-context'
import {
  type InternalServicesTools,
  type LoadInternalServices,
  type LoadInternalServicesByName,
  type RequiredApplicationConfig,
} from './internal-services-hook'

import {
  type QRL,
  type Signal,
  useContext,
  useContextProvider,
  useSignal,
  useTask$,
  useVisibleTask$,
} from '@builder.io/qwik'
import { type Observable } from 'rxjs'

export type QwikHooks<APPLICATION extends RequiredApplicationConfig> = {
  useInitApp: (identity: APPLICATION['identity']) => void
  useObservableInternalService: <T, KEY extends keyof APPLICATION['internalServices'] & string>(
    serviceName: KEY,
    get: (
      service: GetValueByKey<RecordToEntries<APPLICATION['internalServices']>, KEY>,
    ) => Promise<Observable<T>>,
    startingValue: T,
  ) => Signal<T>
}

export const createQwikHooks = <APPLICATION extends RequiredApplicationConfig>({
  exportInternalServicesState,
  importInternalServicesState,
  loadInternalServices,
}: {
  exportInternalServicesState: QRL<
    InternalServicesTools<APPLICATION>['exportInternalServicesState']
  >
  importInternalServicesState: QRL<
    InternalServicesTools<APPLICATION>['importInternalServicesState']
  >
  loadInternalServices: QRL<
    LoadInternalServices<APPLICATION> | LoadInternalServicesByName<APPLICATION>
  >
}): QwikHooks<APPLICATION> => {
  const useInitApp = (identity: APPLICATION['identity']): void => {
    useContextProvider(IdentityContext, { identity })
    const appState = exportInternalServicesState(identity)
    useVisibleTask$(
      async () => {
        await importInternalServicesState(identity, await appState)
      },
      { strategy: 'document-ready' },
    )
  }

  const useObservableInternalService = <T, KEY extends keyof APPLICATION['internalServices']>(
    serviceName: KEY & string,
    get: (
      service: GetValueByKey<RecordToEntries<APPLICATION['internalServices']>, KEY & string>,
    ) => Promise<Observable<T>>,
    startingValue: T,
  ): Signal<T> => {
    const { identity } = useContext(IdentityContext)
    const signal = useSignal<T>(startingValue)
    const hydrate = useSignal<boolean>(false)
    useTask$(async ({ cleanup, track }) => {
      track(() => hydrate.value)
      const service: APPLICATION['internalServices'][keyof APPLICATION['internalServices']] =
        await loadInternalServices(identity, serviceName)
      const observable = await get(service)
      const subscription = observable.subscribe((value) => {
        signal.value = value
      })
      cleanup(() => {
        subscription.unsubscribe()
      })
    })
    useVisibleTask$(() => {
      hydrate.value = true
    })
    return signal
  }

  return { useInitApp, useObservableInternalService }
}
