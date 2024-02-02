import type { ReadableRawKeyValueStore } from '../type'

export const createImportMetaEnvVarRawKeyValueStore = (): ReadableRawKeyValueStore<
  string | undefined
> => {
  return {
    get: (key) => {
      // @ts-expect-error - We have to use commonjs module type because cucumberjs doesn't support esm
      return import.meta.env[key]
    },
  }
}
