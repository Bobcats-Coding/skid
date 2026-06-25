import {
  createTestDatasourceAndMigrator,
  createTestDatasourceAndMigratorWithTestMigrations,
  createTestMigratedDatasource,
  type DbFixture,
  testMigrationsFolder,
  type TestSchema,
} from './fake'
import { createInMemoryPostgresConnectionBuilder } from './postgres/fake'
import { createDatasource } from './service'

import { describe, expect, it, vi } from 'vitest'

describe('createTestDatasource', () => {
  it('should create a test datasource', async () => {
    await using db = await createTestMigratedDatasource({ dbFixture, migrationsFolder })
    const table1 = await db.datasource.selectFrom('table1').selectAll().execute()
    expect(table1).toEqual([
      { id: 1, name: 'test1' },
      { id: 2, name: 'test2' },
      { id: 3, name: 'test3' },
    ])
  })

  it('should destroy the datasource', async () => {
    const destroy = vi.fn()
    /* eslint-disable no-lone-blocks */
    {
      await using db = await createTestMigratedDatasource({ dbFixture, migrationsFolder })
      db.datasource.destroy = destroy
    }
    /* eslint-enable no-lone-blocks */
    expect(destroy).toHaveBeenCalled()
  })

  it('should create any context', async () => {
    await using db = await createTestMigratedDatasource({
      dbFixture: dbFixtureWithContext,
      migrationsFolder,
    })
    const table1 = await db.datasource.selectFrom('table1').selectAll().execute()
    expect(table1).toEqual([
      { id: 1, name: 'test1' },
      { id: 2, name: 'test2' },
      { id: 3, name: 'test3' },
    ])
    expect(db.context).toEqual({ value: 3 })
  })

  it('should work with provided datasource', async () => {
    const datasource = createDatasource<TestSchema>(createInMemoryPostgresConnectionBuilder())
    await createTestMigratedDatasource({ dbFixture, migrationsFolder, datasource })
    const table1 = await datasource.selectFrom('table1').selectAll().execute()
    expect(table1).toEqual([
      { id: 1, name: 'test1' },
      { id: 2, name: 'test2' },
      { id: 3, name: 'test3' },
    ])
  })

  it('should provide the migrator', async () => {
    await using db = await createTestMigratedDatasource({ dbFixture, migrationsFolder })
    await db.migrator.migrateDownStep()
    const table1 = await db.datasource.selectFrom('table1').selectAll().execute()
    expect(table1).toEqual([
      { id: 1, name: 'test1' },
      { id: 3, name: 'test3' },
    ])
  })
})

describe('migrator', () => {
  it('should not run migrations', async () => {
    await using db = await createTestDatasourceAndMigrator<TestSchema>({ migrationsFolder })
    await expect(
      async () => await db.datasource.selectFrom('table1').selectAll().execute(),
    ).rejects.toThrow()
  })

  it('should destroy the datasource', async () => {
    const destroy = vi.fn()
    /* eslint-disable no-lone-blocks */
    {
      await using db = await createTestDatasourceAndMigrator({ migrationsFolder })
      db.datasource.destroy = destroy
    }
    /* eslint-enable no-lone-blocks */
    expect(destroy).toHaveBeenCalled()
  })

  it('should work with provided datasource', async () => {
    const datasource = createDatasource<TestSchema>(createInMemoryPostgresConnectionBuilder())
    await using db = await createTestDatasourceAndMigrator({ migrationsFolder, datasource })
    await db.migrator.migrateToLatest()
    const table1 = await datasource.selectFrom('table1').selectAll().execute()
    expect(table1).toEqual([
      { id: 1, name: 'test1' },
      { id: 2, name: 'test2' },
    ])
  })

  it('should migrate to latest', async () => {
    await using db = await createTestDatasourceAndMigrator<TestSchema>({ migrationsFolder })
    await db.migrator.migrateToLatest()
    const table1 = await db.datasource.selectFrom('table1').selectAll().execute()
    expect(table1).toEqual([
      { id: 1, name: 'test1' },
      { id: 2, name: 'test2' },
    ])
  })

  it('should migrate up step', async () => {
    await using db = await createTestDatasourceAndMigrator<TestSchema>({ migrationsFolder })
    await db.migrator.migrateUpStep()
    const table1 = await db.datasource.selectFrom('table1').selectAll().execute()
    expect(table1).toEqual([])
  })

  it('should migrate down step', async () => {
    await using db = await createTestDatasourceAndMigrator<TestSchema>({ migrationsFolder })
    await db.migrator.migrateToLatest()
    await db.migrator.migrateDownStep()
    const table1 = await db.datasource.selectFrom('table1').selectAll().execute()
    expect(table1).toEqual([{ id: 1, name: 'test1' }])
  })

  it('should get migrations', async () => {
    await using db = await createTestDatasourceAndMigrator<TestSchema>({ migrationsFolder })
    const migrations = await db.migrator.getMigrations()
    expect(migrations).toEqual([
      { name: '001-test-migration', executedAt: undefined },
      { name: '002-test-migration', executedAt: undefined },
      { name: '003-test-migration', executedAt: undefined },
    ])
  })

  it('should migrate to a specific migration (up)', async () => {
    await using db = await createTestDatasourceAndMigrator<TestSchema>({ migrationsFolder })
    const { results } = await db.migrator.migrateTo('002-test-migration')
    const table1 = await db.datasource.selectFrom('table1').selectAll().execute()
    expect(table1).toEqual([{ id: 1, name: 'test1' }])
    expect(results).toEqual([
      { migrationName: '001-test-migration', status: 'Success', direction: 'Up' },
      { migrationName: '002-test-migration', status: 'Success', direction: 'Up' },
      { migrationName: '003-test-migration', status: 'NotExecuted', direction: 'Up' },
    ])
  })

  it('should migrate to a specific migration (down)', async () => {
    await using db = await createTestDatasourceAndMigrator<TestSchema>({ migrationsFolder })
    await db.migrator.migrateToLatest()
    const { results } = await db.migrator.migrateTo('001-test-migration')
    const table1 = await db.datasource.selectFrom('table1').selectAll().execute()
    expect(table1).toEqual([])
    expect(results).toEqual([
      { migrationName: '001-test-migration', status: 'NotExecuted', direction: 'Down' },
      { migrationName: '002-test-migration', status: 'Success', direction: 'Down' },
      { migrationName: '003-test-migration', status: 'Success', direction: 'Down' },
    ])
  })

  it('should migrate to a specific migration (down from middle)', async () => {
    await using db = await createTestDatasourceAndMigrator<TestSchema>({ migrationsFolder })
    await db.migrator.migrateTo('002-test-migration')
    const { results } = await db.migrator.migrateTo('001-test-migration')
    const table1 = await db.datasource.selectFrom('table1').selectAll().execute()
    expect(table1).toEqual([])
    expect(results).toEqual([
      { migrationName: '001-test-migration', status: 'NotExecuted', direction: 'Down' },
      { migrationName: '002-test-migration', status: 'Success', direction: 'Down' },
      { migrationName: '003-test-migration', status: 'NotExecuted', direction: 'Down' },
    ])
  })

  it('should migrate to empty', async () => {
    await using db = await createTestDatasourceAndMigrator<TestSchema>({ migrationsFolder })
    await db.migrator.migrateToEmpty()
    await expect(
      async () => await db.datasource.selectFrom('table1').selectAll().execute(),
    ).rejects.toThrow()
  })

  it('should migrate to latest', async () => {
    await using db = await createTestDatasourceAndMigratorWithTestMigrations()
    await db.migrator.migrateToLatest()
    const table1 = await db.datasource.selectFrom('table1').selectAll().execute()
    expect(table1).toEqual([
      { id: 1, name: 'test1' },
      { id: 2, name: 'test2' },
    ])
  })
})

const dbFixture: DbFixture<TestSchema> = async (datasource) => {
  await datasource.insertInto('table1').values({ id: '3', name: 'test3' }).execute()
}

const dbFixtureWithContext: DbFixture<TestSchema, { value: number }> = async (datasource) => {
  await datasource.insertInto('table1').values({ id: '3', name: 'test3' }).execute()
  return { value: 3 }
}

const migrationsFolder = testMigrationsFolder
