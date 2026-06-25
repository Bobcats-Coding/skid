import type { Datasource } from '../types'

export type MigrationScripts = {
  up: (db: Datasource<any>) => Promise<void>
  down: (db: Datasource<any>) => Promise<void>
}

export type MigratorConfig = {
  datasource: Datasource<any>
  migrationsFolder: string
}

export type Migrator = {
  migrateUpStep: () => Promise<MigrationResultList>
  migrateDownStep: () => Promise<MigrationResultList>
  migrateTo: (migrationName: string) => Promise<MigrationResultList>
  migrateToLatest: () => Promise<MigrationResultList>
  migrateToEmpty: () => Promise<MigrationResultList>
  getMigrations: () => Promise<MigrationDetails[]>
}

export type MigrationDetails = {
  name: string
  executedAt: Date | undefined
}

export type MigrationDirection = 'Up' | 'Down'

export type MigrationResult = {
  migrationName: string
  status: 'Success' | 'Error' | 'NotExecuted'
  direction: MigrationDirection
}

export type MigrationResultList = {
  error: Error | undefined
  results: MigrationResult[]
}

export type IgnoreForTests = {
  <T>(action: () => Promise<T>): Promise<T | undefined>
  <T>(action: () => Promise<T>, fallbackValue: T): Promise<T>
}
