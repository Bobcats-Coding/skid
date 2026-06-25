import { createFakeDbConnectionBuilder } from './fake'
import { createDatasource } from './service'

import { expect, test } from 'vitest'

const TEST_TABLE = 'table-name'

type TEST_SCHEMA = {
  [TEST_TABLE]: unknown
}

test('it should create a new datasource using a fake builder', async () => {
  const { connectionBuilder, queries } = createFakeDbConnectionBuilder()
  const datasource = createDatasource<TEST_SCHEMA>(connectionBuilder)
  datasource.selectFrom(TEST_TABLE)
  expect(queries).toEqual([TEST_TABLE])
})
