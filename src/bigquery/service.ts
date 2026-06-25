import {
  type BigQueryClient,
  type BigQueryConfig,
  type BigQueryLoadTableOptions,
  type BigQueryQueryOptions,
} from './types'

import { BigQuery } from '@google-cloud/bigquery'

const formatBigQueryError = (error: unknown): string => {
  if (!(error instanceof Error)) {
    const serialized = JSON.stringify(error)
    return serialized ?? String(error)
  }

  const typedError = error as Error & {
    code?: unknown
    errors?: Array<Record<string, unknown>>
    response?: { data?: unknown }
  }

  const parts: string[] = []
  if (typedError.message.trim().length > 0) {
    parts.push(typedError.message)
  }
  if (typedError.code !== undefined) {
    parts.push(`code=${String(typedError.code)}`)
  }
  if (typedError.errors !== undefined && typedError.errors.length > 0) {
    parts.push(`errors=${JSON.stringify(typedError.errors)}`)
  }
  if (typedError.response?.data !== undefined) {
    parts.push(`response=${JSON.stringify(typedError.response.data)}`)
  }

  if (parts.length === 0) {
    const details = JSON.stringify(error, Object.getOwnPropertyNames(error))
    return details.length > 2 ? details : typedError.name
  }

  return parts.join(' | ')
}

export const createBigQueryClient = (config?: BigQueryConfig): BigQueryClient => {
  const bigquery = new BigQuery(
    config?.projectId !== undefined ? { projectId: config.projectId } : undefined,
  )

  return {
    async query<T = Record<string, unknown>>(
      sql: string,
      params?: Record<string, unknown>,
      options?: BigQueryQueryOptions,
    ): Promise<T[]> {
      const jobOptions: {
        query: string
        params?: Record<string, unknown>
        location?: string
      } = { query: sql }
      if (params !== undefined) {
        jobOptions.params = params
      }
      if (options?.location !== undefined) {
        jobOptions.location = options.location
      }
      const [job] = await bigquery.createQueryJob(jobOptions)
      const [rows] = await job.getQueryResults()
      return rows as T[]
    },
    async loadTable(
      dataset: string,
      table: string,
      rows: Array<Record<string, unknown>>,
      options?: BigQueryLoadTableOptions,
    ): Promise<void> {
      if (rows.length === 0) {
        return
      }
      try {
        if (options?.truncate !== false) {
          await bigquery.query(`TRUNCATE TABLE \`${dataset}.${table}\``)
        }
      } catch (error) {
        const details = formatBigQueryError(error)
        throw new Error(`BigQuery truncate failed for ${dataset}.${table}: ${details}`)
      }

      const INSERT_BATCH_SIZE = 500
      for (let i = 0; i < rows.length; i += INSERT_BATCH_SIZE) {
        const batch = rows.slice(i, i + INSERT_BATCH_SIZE)
        try {
          await bigquery.dataset(dataset).table(table).insert(batch)
        } catch (error) {
          const details = formatBigQueryError(error)
          throw new Error(
            `BigQuery insert failed for ${dataset}.${table} rows=${batch.length} offset=${i}: ${details}`,
          )
        }
      }
    },
  }
}
