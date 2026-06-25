import type { MigrationDirection, MigratorConfig } from './types'

import { promises as fs } from 'fs'
import {
  type Kysely,
  type Migrator as KyselyMigrator,
  type Migration,
  type MigrationProvider,
  type MigrationResultSet,
  type Migrator,
  NO_MIGRATIONS,
} from 'kysely'
import { fileURLToPath } from 'node:url'
import * as path from 'path'

const createInMemoryMigrationsProvider = (relativePath: string): MigrationProvider => ({
  async getMigrations(): Promise<Record<string, Migration>> {
    const dirname = fileURLToPath(new URL('.', import.meta.url))
    const resolvedPath = path.resolve('dist', dirname, relativePath)
    const files = await fs.readdir(resolvedPath)
    return Object.fromEntries(
      await Promise.all(
        files.map(async (fileName) => {
          const importPath = path.join(relativePath, fileName).replaceAll('\\', '/')
          const migration = (await import(importPath)).default as Migration
          const migrationKey = fileName.substring(0, fileName.lastIndexOf('.'))
          return [migrationKey, migration]
        }),
      ),
    )
  },
})

// This is a hack to make sure that migrations are have unique executedAt values
let date = 0

export const createInMemoryMigrator = ({
  datasource,
  migrationsFolder,
}: MigratorConfig): KyselyMigrator => {
  const provider = createInMemoryMigrationsProvider(migrationsFolder)

  const doneMigrations: Array<{ name: string; executedAt: Date }> = []

  const getMigrations = async (): Promise<MigrationListItem[]> => {
    const allMigrations = await provider.getMigrations()
    return Object.entries(allMigrations)
      .map(([name, migration]) => ({ ...migration, name }))
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }),
      )
  }

  const runMigration = async (
    migration: MigrationListItem,
    direction: MigrationDirection,
    isSkip: boolean,
  ): Promise<MigrationStatus> => {
    let error
    if (isSkip) {
      return {
        migrationName: migration.name,
        error,
        direction,
        isSkip,
      }
    }
    try {
      if (direction === 'Up') {
        await migration.up(datasource)
        doneMigrations.push({
          name: migration.name,
          executedAt: new Date(new Date().getMilliseconds() + date++),
        })
      } else if (direction === 'Down') {
        await migration.down?.(datasource)
        doneMigrations.pop()
      }
    } catch (e) {
      error = e
    }
    return {
      migrationName: migration.name,
      error,
      direction,
      isSkip,
    }
  }

  const runAll = async (
    tasks: Array<() => Promise<MigrationStatus>>,
  ): Promise<MigrationStatus[]> => {
    const statuses = []
    for (const task of tasks) {
      statuses.push(await task())
    }
    return statuses
  }

  const statusToResult = (statuses: MigrationStatus[]): MigrationResultSet => {
    return {
      error: statuses.find((status) => status.error !== undefined)?.error,
      results: statuses.map((status) => ({
        migrationName: status.migrationName,
        status: status.isSkip ? 'NotExecuted' : status.error !== undefined ? 'Error' : 'Success',
        direction: status.direction,
      })),
    }
  }

  const migrator: Migrator = {
    migrateToLatest: async () => {
      const migrations = await getMigrations()
      const statuses = await runAll(
        migrations.map((migration) => async () => await runMigration(migration, 'Up', false)),
      )
      return statusToResult(statuses)
    },
    migrateUp: async () => {
      const migrations = await getMigrations()
      const nextMigration = migrations[doneMigrations.length]
      if (nextMigration === undefined) {
        return {
          error: undefined,
          results: [],
        }
      }
      const statuses = await runAll(
        [nextMigration].map((migration) => async () => await runMigration(migration, 'Up', false)),
      )
      return statusToResult(statuses)
    },
    migrateDown: async () => {
      const migrations = await getMigrations()
      const lastMigration = migrations[doneMigrations.length - 1]
      if (lastMigration === undefined) {
        return {
          error: undefined,
          results: [],
        }
      }
      const statuses = await Promise.all(
        [lastMigration].map(async (migration) => await runMigration(migration, 'Down', false)),
      )
      return statusToResult(statuses)
    },
    migrateTo: async (migrationName: string) => {
      const migrations = await getMigrations()
      const isNullMigration = migrationName === (NO_MIGRATIONS as unknown as string)
      const migration = migrations.find((m) => m.name === migrationName)
      if (migration === undefined && !isNullMigration) {
        throw new Error(`Migration ${migrationName} not found`)
      }
      const currentIndex = doneMigrations.length
      const targetIndex = migrations.findIndex((m) => m.name === migrationName)
      const direction = currentIndex < targetIndex ? ('Up' as const) : ('Down' as const)
      const migrationsToRun =
        direction === 'Up'
          ? migrations.slice(currentIndex, targetIndex + 1)
          : migrations.slice(targetIndex + 1, currentIndex).reverse()
      const migrationStepsToRun = migrationsToRun.map((m) => ({
        migration: m,
        direction,
        isSkip: false,
      }))
      const restMigrations = migrations.filter((m) => !migrationsToRun.includes(m))
      const restMigrationSteps = restMigrations.map((m) => ({
        migration: m,
        direction,
        isSkip: true,
      }))
      const migrationSteps = [...migrationStepsToRun, ...restMigrationSteps]
      const statuses = await Promise.all(
        migrationSteps.map(
          async ({ migration, direction, isSkip }) =>
            await runMigration(migration, direction, isSkip),
        ),
      )
      return statusToResult(
        statuses.sort((a, b) =>
          a.migrationName.localeCompare(b.migrationName, undefined, {
            numeric: true,
            sensitivity: 'base',
          }),
        ),
      )
    },
    getMigrations: async () => {
      const migrations = await getMigrations()
      return migrations.map((migration) => {
        const doneMigration = doneMigrations.find((m) => m.name === migration.name)
        return {
          name: migration.name,
          ...(doneMigration !== undefined ? { executedAt: doneMigration.executedAt } : {}),
          migration: {
            up: async (db: Kysely<any>) => {
              await migration.up(db)
            },
            down: async (db: Kysely<any>) => await migration.down?.(db),
          },
        }
      })
    },
  } as unknown as Migrator
  return migrator
}

type MigrationListItem = Migration & {
  name: string
}

type MigrationStatus = {
  migrationName: string
  direction: MigrationDirection
  error: unknown | undefined
  isSkip: boolean
}
