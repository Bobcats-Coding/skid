import { type BigQueryClient } from './types'

export const createFakeBigQueryClient = (
  rows: Array<Record<string, unknown>> = [],
): BigQueryClient & {
  loadTableCalls: Array<{
    dataset: string
    table: string
    rows: Array<Record<string, unknown>>
    truncate: boolean
  }>
} => {
  const loadTableCalls: Array<{
    dataset: string
    table: string
    rows: Array<Record<string, unknown>>
    truncate: boolean
  }> = []

  return {
    async query<T = Record<string, unknown>>(): Promise<T[]> {
      return rows as T[]
    },
    async loadTable(
      dataset: string,
      table: string,
      tableRows: Array<Record<string, unknown>>,
      options,
    ): Promise<void> {
      loadTableCalls.push({
        dataset,
        table,
        rows: tableRows,
        truncate: options?.truncate !== false,
      })
    },
    loadTableCalls,
  }
}
