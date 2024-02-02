import type { WriteableRawKeyValueStore } from '../type'

export const createMemoryDeepRawKeyValueStore: () => WriteableRawKeyValueStore = () => {
  const store: Record<string, any> = {}

  const get = (store: Record<string, any>, path: string): any => {
    // The first cannot be undefined
    const [first, ...restPath] = path.split('.') as [string, ...string[]]
    if (!(first in store)) {
      throw new Error('Not set value')
    }
    if (restPath.length > 0) {
      return get(store[first] as Record<string, any>, restPath.join('.'))
    }
    return store[first]
  }

  const set = (store: Record<string, any>, path: string, value: any, pathAcc?: string): void => {
    // The first cannot be undefined
    const [first, ...restPath] = path.split('.') as [string, ...string[]]
    const pathSoFar = pathAcc !== undefined ? `${pathAcc}.${first}` : first
    if (restPath.length > 0) {
      if (!(store[first] instanceof Object)) {
        throw new Error(`Value under path: "${pathSoFar}" is not an object`)
      }
      set(store[first] as Record<string, any>, restPath.join('.'), value, pathSoFar)
    } else {
      store[first] = value
    }
  }

  return {
    get: (path) => {
      try {
        return get(store, path)
      } catch (e) {
        throw new Error(`Path: "${path}" is not set`)
      }
    },
    set: (path, value) => {
      set(store, path, value)
    },
  }
}
