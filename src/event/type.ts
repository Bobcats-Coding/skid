export type EventBrokerBackend = {
  on: (event: string, handler: (args: any) => void) => void
  dispatch: (event: string, args: any) => void
}

export type EventBroker<T extends Record<string, any>> = {
  on: <K extends keyof T>(event: K, handler: (args: T[K]) => void) => void
  dispatch: <K extends keyof T>(event: keyof T, args: T[K]) => void
}
