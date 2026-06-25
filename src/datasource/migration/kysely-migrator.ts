import { type MigratorConfig } from './types'

import { promises as fs } from 'fs'
import { Migrator as KyselyMigrator, type Migration, type MigrationProvider } from 'kysely'
import path from 'path'
import { pathToFileURL } from 'url'

const isRunningUnderViteNode = (): boolean =>
  process.env['VITE_NODE_SERVER_LOAD'] !== undefined ||
  process.argv.some((arg) => arg.includes('vite-node'))

const createCrossPlatformMigrationProvider = (migrationFolder: string): MigrationProvider => ({
  async getMigrations(): Promise<Record<string, Migration>> {
    const files = await fs.readdir(migrationFolder)
    const migrations: Record<string, Migration> = {}

    for (const fileName of files) {
      if (!fileName.endsWith('.js') && !fileName.endsWith('.mjs')) {
        continue
      }
      const filePath = path.join(migrationFolder, fileName)
      const importPath = isRunningUnderViteNode()
        ? filePath.replace(/\\/g, '/')
        : pathToFileURL(filePath).href
      const migrationModule = await import(importPath)
      const migration = migrationModule.default ?? migrationModule
      const migrationKey = fileName.substring(0, fileName.lastIndexOf('.'))
      migrations[migrationKey] = migration
    }

    return migrations
  },
})

export const createKyselyMigrator = ({
  datasource,
  migrationsFolder,
}: MigratorConfig): KyselyMigrator =>
  new KyselyMigrator({
    db: datasource,
    provider: createCrossPlatformMigrationProvider(migrationsFolder),
  })
