import type { ConnectionBuilder, Datasource } from './types'

export const createDatasource = <Schema>(
  dbConnectionBuilder: ConnectionBuilder,
): Datasource<Schema> => {
  return dbConnectionBuilder<Schema>()
}
