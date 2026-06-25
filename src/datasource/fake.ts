import { type Migrator } from './migration'
import { createInMemoryMigrator } from './migration/inmemory-migrator'
import { createMigrator } from './migration/service'
import { createInMemoryPostgresConnectionBuilder } from './postgres/fake'
import { createDatasource } from './service'
import type { ConnectionBuilder, Datasource, Generated } from './types'

import path from 'node:path'

export const createFakeDbConnectionBuilder = (): {
  connectionBuilder: ConnectionBuilder
  queries: string[]
} => {
  const queries: string[] = []
  const connectionBuilder: ConnectionBuilder = <Schema>() => {
    return {
      selectFrom: (table: string) => queries.push(table),
    } as unknown as Datasource<Schema>
  }

  return {
    connectionBuilder,
    queries,
  }
}

export const createTestMigratedDatasource = async <SCHEMA, CONTEXT>({
  dbFixture,
  migrationsFolder,
  datasource,
}: TestMigratedDatasourceArgs<SCHEMA, CONTEXT>): Promise<
  TestDatasourceWithContext<SCHEMA, CONTEXT>
> => {
  const db =
    datasource === undefined
      ? await createTestDatasourceAndMigrator<SCHEMA>({
          migrationsFolder,
        })
      : await createTestDatasourceAndMigrator({
          migrationsFolder,
          datasource,
        })
  const { error, results } = await db.migrator.migrateToLatest()
  if (error !== undefined) {
    console.error(results)
    throw new Error('Failed to migrate', {
      cause: error,
    })
  }
  const context = await dbFixture(db.datasource)
  return {
    ...db,
    context,
  }
}

export const createTestDatasourceAndMigrator = async <SCHEMA>({
  migrationsFolder,
  datasource,
}: TestDatasourceAndMigratorArgs<SCHEMA>): Promise<TestDatasourceAndMigrator<SCHEMA>> => {
  const datasourceToUse = datasource ?? createTestDatasource<SCHEMA>()
  const inmemoryMigrator = createInMemoryMigrator({
    datasource: datasourceToUse,
    migrationsFolder,
  })
  const migrator = createMigrator(inmemoryMigrator)
  return {
    datasource: datasourceToUse,
    migrator,
    [Symbol.asyncDispose]: async () => {
      await datasourceToUse.destroy()
    },
  }
}

export const createTestDatasource = <SCHEMA>(): Datasource<SCHEMA> => {
  return createDatasource<SCHEMA>(createInMemoryPostgresConnectionBuilder())
}

export const createTestDatasourceAndMigratorWithTestMigrations = async (): Promise<
  TestDatasourceAndMigrator<TestSchema>
> => {
  return await createTestDatasourceAndMigrator<TestSchema>({
    migrationsFolder: testMigrationsFolder,
  })
}

export const createTestDatasourceAndMigratorWithTestErrorMigrations = async (): Promise<
  TestDatasourceAndMigrator<TestSchema>
> => {
  return await createTestDatasourceAndMigrator<TestSchema>({
    migrationsFolder: testErrorMigrationsFolder,
  })
}

export type DbFixture<SCHEMA, CONTEXT = undefined> = (
  datasource: Datasource<SCHEMA>,
) => Promise<CONTEXT>

export type TestDatasourceAndMigrator<SCHEMA> = {
  datasource: Datasource<SCHEMA>
  migrator: Migrator
  [Symbol.asyncDispose]: () => Promise<void>
}

export type TestDatasourceWithContext<SCHEMA, CONTEXT> = TestDatasourceAndMigrator<SCHEMA> & {
  context: CONTEXT
}

export type TestDatasourceAndMigratorArgs<SCHEMA> = {
  migrationsFolder: string
  datasource?: Datasource<SCHEMA>
}

export type TestMigratedDatasourceArgs<SCHEMA, CONTEXT> = TestDatasourceAndMigratorArgs<SCHEMA> & {
  dbFixture: DbFixture<SCHEMA, CONTEXT>
}

export type TestSchema = {
  table1: {
    id: Generated<string>
    name: string
  }
}

export const testMigrationsFolder = path.join(__dirname, './test-migrations')

export const testErrorMigrationsFolder = path.join(__dirname, './test-migrations-with-error')
