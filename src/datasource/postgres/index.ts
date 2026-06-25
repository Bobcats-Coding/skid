import type { ConnectionBuilder } from '../types'

import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely'
import pg from 'pg'

// Configure pg to parse numeric values as numbers instead of strings
pg.types.setTypeParser(pg.types.builtins.NUMERIC, (val) => Number(val))

type ConnectionConfig = {
  user: string
  database: string
  password?: string | undefined
  host?: string | undefined
  port?: number | undefined
  maxPoolSize?: number | undefined
  ssl?: boolean | undefined
}

export const createPostgresConnectionBuilder = (config: ConnectionConfig): ConnectionBuilder => {
  const dialect = new PostgresDialect({
    pool: new pg.Pool({
      user: config.user,
      password: config.password,
      ssl: config.ssl === true,
      database: config.database,
      host: config.host,
      port: config.port,
      max: config.maxPoolSize,
    }),
  })

  return <Schema>() =>
    new Kysely<Schema>({
      dialect,
      plugins: [new CamelCasePlugin()],
    })
}
