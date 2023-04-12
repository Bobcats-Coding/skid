import { createTestEnvironment } from './test-environment'
import type { Interactor } from './test-environment'

import { EMPTY } from 'rxjs'

test('create test environment', async () => {
  let isStarted = false
  const testInteractorCreator = (): Interactor<number> => ({
    start: async () => {
      isStarted = true
    },
    stop: async () => {
      isStarted = false
    },
    startContext: async () => {
      return {
        context: 1,
        reportEntry$: EMPTY,
      }
    },
    stopContext: async (_: number) => {},
    onFailure: async (_: number, __: string) => {
      return {
        entry: 'test',
        type: 'text/plain',
      }
    },
  })
  const testEnvironment = createTestEnvironment({
    interactors: {
      testInteractor: testInteractorCreator,
    },
    runners: {},
  })
  await testEnvironment.onBeforeAll()
  expect(isStarted).toBe(true)
})
