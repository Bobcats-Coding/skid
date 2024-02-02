import type { ReadableRawKeyValueStore } from '../type'

export const createImportMetaEnvVarRawKeyValueStore = (): ReadableRawKeyValueStore<
  string | undefined
> => {
  return {
    get: (key) => {
      // eslint-disable-next-line
      // @ts-ignore - import.meta is not in the types because cucumber needs commonjs
      return import.meta.env[key]
    },
  }
}
