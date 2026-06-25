import type { MigrationDetails, MigrationResultList, Migrator } from './types'

import {
  type Migrator as KyselyMigrator,
  type MigrationInfo,
  type MigrationResultSet,
  NO_MIGRATIONS,
} from 'kysely'

export const createMigrator = (migrator: KyselyMigrator): Migrator => ({
  migrateToLatest: async () => {
    return kyselyResultSetToResultList(await migrator.migrateToLatest())
  },
  migrateToEmpty: async () => {
    return kyselyResultSetToResultList(await migrator.migrateTo(NO_MIGRATIONS))
  },
  migrateTo: async (migrationName: string) => {
    return kyselyResultSetToResultList(await migrator.migrateTo(migrationName))
  },
  migrateUpStep: async () => {
    return kyselyResultSetToResultList(await migrator.migrateUp())
  },
  migrateDownStep: async () => {
    return kyselyResultSetToResultList(await migrator.migrateDown())
  },
  getMigrations: async () => {
    return (await migrator.getMigrations()).map(kyselyMigrationInfoToDetails)
  },
})

const kyselyErrorToError = (error: unknown): Error | undefined => {
  if (error === undefined) {
    return undefined
  }
  if (error instanceof Error) {
    return error
  }
  return new Error(JSON.stringify(error))
}

const kyselyResultSetToResultList = ({
  error,
  results,
}: MigrationResultSet): MigrationResultList => {
  return {
    error: kyselyErrorToError(error),
    results: results ?? [],
  }
}

const kyselyMigrationInfoToDetails = ({ name, executedAt }: MigrationInfo): MigrationDetails => {
  return {
    name,
    executedAt,
  }
}
