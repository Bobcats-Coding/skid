import { createMigration } from '@bobcats-coding/skid/datasource'

export default createMigration({
  up: async (db) => {
    await db.schema
      .createTable('table1')
      .addColumn('id', 'serial', (col) => col.primaryKey())
      .addColumn('name', 'varchar', (col) => col.notNull())
      .execute()
  },
  down: async (db) => {
    await db.schema.dropTable('table1').execute()
  },
})
