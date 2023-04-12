export type UrlConfig = {
  protocol: string
  hostname: string
  pathname?: string
  port?: number
  search?: UrlSearchConfig | undefined
  hash?: string
}

export type UrlSearchConfig = Record<string, number | string | boolean>

const DEFAULT_PORT = 80

export const stringifyUrl = (config: UrlConfig): string => {
  const { protocol, hostname, search = {}, ...rest } = config
  const url = new URL(`${protocol}://${hostname}`)
  let key: keyof Omit<UrlConfig, 'search' | 'protocol' | 'hostname'>
  for (key in rest) {
    url[key] = String(rest[key])
  }
  for (const [k, v] of Object.entries(search)) {
    url.searchParams.append(k, String(v))
  }
  return url.toString()
}

export const parseUrl = (url: `${string}://${string}`): UrlConfig => {
  const { protocol, hostname, pathname, port, searchParams, hash } = new URL(url)
  return {
    protocol: protocol.at(-1) === ':' ? protocol.slice(0, -1) : protocol,
    hostname,
    pathname,
    port: port?.length > 0 ? Number(port) : DEFAULT_PORT,
    hash: hash[0] === '#' ? hash.slice(1) : hash,
    search: Object.fromEntries(searchParams.entries()),
  }
}

export type Split<
  STRING,
  CHARACTER extends string,
> = STRING extends `${infer S1}${CHARACTER}${infer S2}` ? [S1, S2] : never

export type Url = string
