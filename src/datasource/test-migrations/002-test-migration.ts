import { createMigration } from '@bobcats-coding/skid/datasource'

export default createMigration({
  up: async (db) => {
    await db.insertInto('table1').values({ id: 1, name: 'test1' }).execute()
  },
  down: async (db) => {
    await db.deleteFrom('table1').where('id', '=', 1).execute()
  },
})
