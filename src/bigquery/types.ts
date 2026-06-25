export type BigQueryConfig = {
  projectId?: string
}

export type BigQueryQueryOptions = {
  location?: string
}

export type BigQueryLoadTableOptions = {
  truncate?: boolean
}

export type BigQueryClient = {
  query: <T = Record<string, unknown>>(
    sql: string,
    params?: Record<string, unknown>,
    options?: BigQueryQueryOptions,
  ) => Promise<T[]>
  loadTable: (
    dataset: string,
    table: string,
    rows: Array<Record<string, unknown>>,
    options?: BigQueryLoadTableOptions,
  ) => Promise<void>
}
