import type { IgnoreForTests, MigrationScripts } from './types'

export const createMigration = ({ up, down }: MigrationScripts): any => {
  return { up, down }
}

export const ignoreForTests: IgnoreForTests = async (action, fallbackValue = undefined) => {
  return process.env['TEST'] !== 'true' ? await action() : fallbackValue
}
