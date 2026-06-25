import type { Kysely } from 'kysely'

export type { Generated, JSONColumnType } from 'kysely'

export type Datasource<Schema> = Kysely<Schema>

export type ConnectionBuilder = <Schema>() => Datasource<Schema>
