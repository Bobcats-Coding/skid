import type { ConnectionBuilder } from '../types'

import { randomUUID } from 'crypto'
import type { Kysely } from 'kysely'
import { CamelCasePlugin } from 'kysely'
import { DataType, newDb } from 'pg-mem'

export const createInMemoryPostgresConnectionBuilder = (): ConnectionBuilder => {
  const mem = newDb()
  const catalog = mem.getSchema('pg_catalog')

  catalog.registerOperator({
    operator: '!~',
    left: DataType.text,
    right: DataType.text,
    returns: DataType.bool,
    implementation: (a, b) => {
      const re = new RegExp(String(b))
      return re.test(String(a))
    },
  })

  catalog.registerOperator({
    operator: '*',
    left: DataType.integer,
    right: DataType.interval,
    returns: DataType.interval,
    implementation: (left, right) => {
      const minutes = right.minutes * left
      return {
        years: right.years,
        months: right.months,
        days: right.days,
        hours: right.hours ?? 0 + Math.floor(minutes / 60),
        minutes: minutes % 60,
        seconds: right.seconds,
        milliseconds: right.milliseconds,
      }
    },
  })

  mem.public.registerFunction({
    name: 'gen_random_uuid',
    implementation: () => randomUUID(),
  })

  return <Schema>() =>
    mem.adapters.createKysely(undefined, {
      plugins: [new CamelCasePlugin()],
    }) as Kysely<Schema>
}
