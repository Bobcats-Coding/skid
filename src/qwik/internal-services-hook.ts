import { type GetValueByKey, type PartialBesides, type RecordToEntries } from '../core/type'

import {
  type Application,
  type ApplicationRunReturn,
  type ApplicationTypeConfig,
} from '@bobcats-coding/skid/core/application'

export type LoadInternalServicesByName<APPLICATION extends RequiredApplicationConfig> = <
  SERVICE_NAME extends keyof APPLICATION['internalServices'] & string,
>(
  identity: APPLICATION['identity'],
  serviceName: SERVICE_NAME,
) => GetValueByKey<RecordToEntries<APPLICATION['internalServices']>, SERVICE_NAME>

export type LoadInternalServices<APPLICATION extends RequiredApplicationConfig> = {
  <SERVICE_NAME extends keyof APPLICATION['internalServices'] & string>(
    identity: APPLICATION['identity'],
    serviceName: SERVICE_NAME,
  ): GetValueByKey<RecordToEntries<APPLICATION['internalServices']>, SERVICE_NAME>
  (key: APPLICATION['identity']): APPLICATION['internalServices']
}

export type InternalServicesTools<APPLICATION extends RequiredApplicationConfig> = {
  loadInternalServices: LoadInternalServices<APPLICATION>
  setServerInternalServices: (
    services: APPLICATION['internalServices'],
    exportState?: () => APPLICATION['exportState'],
  ) => void
  exportInternalServicesState: (identity: APPLICATION['identity']) => APPLICATION['exportState']
  importInternalServicesState: (
    identity: APPLICATION['identity'],
    state: APPLICATION['exportState'],
  ) => void
}

export const createInternalServicesHook = <const APPLICATION extends RequiredApplicationConfig>(
  application: () => Application<APPLICATION>,
  identityTransform: (i: APPLICATION['identity']) => APPLICATION['identity'] = (i) => i,
): InternalServicesTools<APPLICATION> => {
  let storedCurrentServices: APPLICATION['internalServices'] | undefined
  let storedExportState: (() => APPLICATION['exportState']) | undefined
  let storedImportState: ((state: APPLICATION['exportState']) => void) | undefined

  const loadFromApp = (identity: APPLICATION['identity']): void => {
    const runApp = (): ApplicationRunReturn<APPLICATION> => {
      try {
        return application().run(identityTransform(identity))
      } catch (e) {
        throw new Error(`Internal services are not set for "${identity as string}"`, { cause: e })
      }
    }
    if (storedCurrentServices === undefined) {
      const appReturn = runApp()
      storedCurrentServices = appReturn.internalServices
      storedExportState = appReturn.exportState
      storedImportState = appReturn.importState
    }
  }

  const loadInternalServices: LoadInternalServices<APPLICATION> = ((
    identity: APPLICATION['identity'],
    serviceName?: keyof APPLICATION['internalServices'],
  ) => {
    const getServicesOrService = (
      services: APPLICATION['internalServices'],
      serviceName: keyof APPLICATION['internalServices'] | undefined,
    ):
      | APPLICATION['internalServices']
      | APPLICATION['internalServices'][keyof APPLICATION['internalServices']] =>
      serviceName !== undefined ? services[serviceName] : services
    loadFromApp(identity)
    if (storedCurrentServices === undefined) {
      throw new Error('Could not load internalServices')
    }
    return getServicesOrService(storedCurrentServices, serviceName)
  }) as LoadInternalServices<APPLICATION>

  const setServerInternalServices = (
    services: APPLICATION['internalServices'],
    exportState: APPLICATION['exportState'],
  ): void => {
    storedCurrentServices = services
    storedExportState = exportState
  }

  const exportInternalServicesState = (
    identity: APPLICATION['identity'],
  ): APPLICATION['exportState'] => {
    loadFromApp(identity)
    if (storedExportState === undefined) {
      throw new Error('Export state is not defined')
    }
    return storedExportState()
  }

  const importInternalServicesState = (
    identity: APPLICATION['identity'],
    state: APPLICATION['exportState'],
  ): void => {
    loadFromApp(identity)
    if (storedImportState === undefined) {
      throw new Error('Import state is not defined')
    }
    storedImportState(state)
  }

  return {
    loadInternalServices,
    exportInternalServicesState,
    setServerInternalServices,
    importInternalServicesState,
  }
}

export type RequiredApplicationConfig = PartialBesides<
  ApplicationTypeConfig,
  'internalServices' | 'exportState' | 'identity'
>
