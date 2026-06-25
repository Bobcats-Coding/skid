import { createMigration } from '@bobcats-coding/skid/datasource'

export default createMigration({
  up: async (db) => {
    await db.insertInto('table1').values({ id: 2, name: 'test2' }).execute()
  },
  down: async (db) => {
    await db.deleteFrom('table1').where('id', '=', 2).execute()
  },
})
