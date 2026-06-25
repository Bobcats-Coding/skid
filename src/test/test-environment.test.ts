import { createTestEnvironment } from './test-environment'
import type { Interactor, Runner } from './type'

import { of } from 'rxjs'
import { expect, test } from 'vitest'

test('onBeforeAll hook starts the runners', async () => {
  const { state: state1, creator: creator1 } = setupFakeRunner()
  const { state: state2, creator: creator2 } = setupFakeRunner()
  const testEnvironment = createTestEnvironment({
    service1: { type: 'runner', creator: creator1, hook: 'before-all' },
    service2: { type: 'runner', creator: creator2, hook: 'before-all' },
  })
  await testEnvironment.onBeforeAll()
  expect(state1.isStarted).toBe(true)
  expect(state2.isStarted).toBe(true)
})

test('onBeforeAll hook starts the interactors', async () => {
  const { state: state1, creator: creator1 } = setupFakeInteractor({ context: 1 })
  const { state: state2, creator: creator2 } = setupFakeInteractor({ context: 2 })
  const testEnvironment = createTestEnvironment({
    service1: { type: 'interactor', creator: creator1, hook: 'before-all' },
    service2: { type: 'interactor', creator: creator2, hook: 'before-all' },
  })
  await testEnvironment.onBeforeAll()
  expect(state1.isStarted).toBe(true)
  expect(state2.isStarted).toBe(true)
})

test('onAfterAll hook stops the runners', async () => {
  const { state: state1, creator: creator1 } = setupFakeRunner()
  const { state: state2, creator: creator2 } = setupFakeRunner()
  const testEnvironment = createTestEnvironment({
    service1: { type: 'runner', creator: creator1, hook: 'before-all' },
    service2: { type: 'runner', creator: creator2, hook: 'before-all' },
  })
  await testEnvironment.onBeforeAll()
  await testEnvironment.onAfterAll()
  expect(state1.isStarted).toBe(false)
  expect(state2.isStarted).toBe(false)
})

test('onAfterAll hook stops the interactors', async () => {
  const { state: state1, creator: creator1 } = setupFakeInteractor({ context: 1 })
  const { state: state2, creator: creator2 } = setupFakeInteractor({ context: 2 })
  const testEnvironment = createTestEnvironment({
    service1: { type: 'interactor', creator: creator1, hook: 'before-all' },
    service2: { type: 'interactor', creator: creator2, hook: 'before-all' },
  })
  await testEnvironment.onBeforeAll()
  await testEnvironment.onAfterAll()
  expect(state1.isStarted).toBe(false)
  expect(state2.isStarted).toBe(false)
})

test('onBefore hook starts the contexts', async () => {
  const { state: state1, creator: creator1 } = setupFakeInteractor({ context: 1 })
  const { state: state2, creator: creator2 } = setupFakeInteractor({ context: 2 })
  const testEnvironment = createTestEnvironment({
    service1: { type: 'interactor', creator: creator1, hook: 'before-all' },
    service2: { type: 'interactor', creator: creator2, hook: 'before-all' },
  })
  await testEnvironment.onBeforeAll()
  const world = testEnvironment.createWorld()
  await testEnvironment.onBefore(world)
  expect(state1.isContextStarted).toBe(true)
  expect(state2.isContextStarted).toBe(true)
  expect(world.get('service1')).toBe(1)
  expect(world.get('service2')).toBe(2)
})

test('world keys should be typesafe', async () => {
  const { creator: creator1 } = setupFakeInteractor<1>({ context: 1 })
  const { creator: creator2 } = setupFakeInteractor<2>({ context: 2 })
  const testEnvironment = createTestEnvironment({
    service1: { type: 'interactor', creator: creator1, hook: 'before-all' },
    service2: { type: 'interactor', creator: creator2, hook: 'before-all' },
  })
  await testEnvironment.onBeforeAll()
  const world = testEnvironment.createWorld()
  await testEnvironment.onBefore(world)
  // @ts-expect-error service3 is not in the configuration
  expect(() => world.get('service3')).toThrow()
  const a: 1 = world.get('service1')
  expect(a).toBe(1)
})

test('onBefore hook starts the "before" services', async () => {
  const { state: state1, creator: creator1 } = setupFakeInteractor({ context: 1 })
  const { state: state2, creator: creator2 } = setupFakeInteractor({ context: 2 })
  const testEnvironment = createTestEnvironment({
    service1: { type: 'interactor', creator: creator1, hook: 'before' },
    service2: { type: 'interactor', creator: creator2, hook: 'before-all' },
  })
  const world = testEnvironment.createWorld()
  await testEnvironment.onBefore(world)
  expect(state1.isStarted).toBe(true)
  expect(state2.isStarted).toBe(false)
})

test('onBeforeAll hook only starts the "before-all" services', async () => {
  const { state: state1, creator: creator1 } = setupFakeInteractor({ context: 1 })
  const { state: state2, creator: creator2 } = setupFakeInteractor({ context: 2 })
  const testEnvironment = createTestEnvironment({
    service1: { type: 'interactor', creator: creator1, hook: 'before' },
    service2: { type: 'interactor', creator: creator2, hook: 'before-all' },
  })
  await testEnvironment.onBeforeAll()
  expect(state1.isStarted).toBe(false)
  expect(state2.isStarted).toBe(true)
})

test('onAfter hook stops the "before" services', async () => {
  const { state: state1, creator: creator1 } = setupFakeInteractor({ context: 1 })
  const { state: state2, creator: creator2 } = setupFakeRunner()
  const { state: state3, creator: creator3 } = setupFakeInteractor({ context: 2 })
  const testEnvironment = createTestEnvironment({
    service1: { type: 'interactor', creator: creator1, hook: 'before' },
    service2: { type: 'runner', creator: creator2, hook: 'before' },
    service3: { type: 'interactor', creator: creator3, hook: 'before-all' },
  })
  await testEnvironment.onBeforeAll()
  const world = testEnvironment.createWorld()
  await testEnvironment.onBefore(world)
  await testEnvironment.onAfter(world)
  expect(state1.isStarted).toBe(false)
  expect(state2.isStarted).toBe(false)
  expect(state3.isStarted).toBe(true)
})

test('onAfterAll hook only stops the "before-all" services', async () => {
  const { state: state1, creator: creator1 } = setupFakeInteractor({ context: 1 })
  const { state: state2, creator: creator2 } = setupFakeRunner()
  const { state: state3, creator: creator3 } = setupFakeInteractor({ context: 2 })
  const { state: state4, creator: creator4 } = setupFakeRunner()
  const testEnvironment = createTestEnvironment({
    service1: { type: 'interactor', creator: creator1, hook: 'before' },
    service2: { type: 'runner', creator: creator2, hook: 'before' },
    service3: { type: 'interactor', creator: creator3, hook: 'before-all' },
    service4: { type: 'runner', creator: creator4, hook: 'before-all' },
  })
  await testEnvironment.onBeforeAll()
  const world = testEnvironment.createWorld()
  await testEnvironment.onBefore(world)
  await testEnvironment.onAfterAll()
  expect(state1.isStarted).toBe(true)
  expect(state2.isStarted).toBe(true)
  expect(state3.isStarted).toBe(false)
  expect(state4.isStarted).toBe(false)
})

test('start service from the world', async () => {
  const { state: state1, creator: creator1 } = setupFakeInteractor({ context: 1 })
  const { state: state2, creator: creator2 } = setupFakeRunner()
  const { state: state3, creator: creator3 } = setupFakeInteractor({ context: 3 })
  const testEnvironment = createTestEnvironment({
    service1: { type: 'interactor', creator: creator1 },
    service2: { type: 'runner', creator: creator2 },
    service3: { type: 'interactor', creator: creator3, hook: 'before-all' },
  })
  const world = testEnvironment.createWorld()
  expect(state1.isStarted).toBe(false)
  expect(state2.isStarted).toBe(false)
  expect(state3.isStarted).toBe(false)
  await world.start('service1')
  await world.start('service2')
  expect(state1.isStarted).toBe(true)
  expect(state2.isStarted).toBe(true)
  expect(state3.isStarted).toBe(false)
})

test('world should be able to get the started service', async () => {
  const { state: state1, creator: creator1 } = setupFakeInteractor({ context: 1 })
  const { state: state2, creator: creator2 } = setupFakeInteractor({ context: 2 })
  const testEnvironment = createTestEnvironment({
    service1: { type: 'interactor', creator: creator1 },
    service2: { type: 'interactor', creator: creator2, hook: 'before-all' },
  })
  const world = testEnvironment.createWorld()
  expect(state1.isStarted).toBe(false)
  expect(state2.isStarted).toBe(false)
  await world.start('service1')
  const context = world.get('service1')
  expect(context).toBe(1)
})

test('world should be able to pass params when starts a service', async () => {
  const { state: state1, creator: creator1 } = setupFakeInteractor({ context: 1 })
  const { state: state2, creator: creator2 } = setupFakeRunner()
  const testEnvironment = createTestEnvironment({
    service1: { type: 'interactor', creator: creator1 },
    service2: { type: 'runner', creator: creator2 },
  })
  const world = testEnvironment.createWorld()
  await world.start('service1', 2)
  await world.start('service2', 3)
  expect(state1.startArg).toBe(2)
  expect(state2.startArg).toBe(3)
})

test('should not start non hook services', async () => {
  const { state: state1, creator: creator1 } = setupFakeInteractor({ context: 1 })
  const { state: state2, creator: creator2 } = setupFakeRunner()
  const testEnvironment = createTestEnvironment({
    service1: { type: 'interactor', creator: creator1 },
    service2: { type: 'runner', creator: creator2 },
  })
  const world = testEnvironment.createWorld()
  await testEnvironment.onBeforeAll()
  await testEnvironment.onBefore(world)
  expect(state1.isStarted).toBe(false)
  expect(state2.isStarted).toBe(false)
})

test('onAfter stops services started from the world', async () => {
  const { state: state1, creator: creator1 } = setupFakeInteractor({ context: 1 })
  const { state: state2, creator: creator2 } = setupFakeRunner()
  const { state: state3, creator: creator3 } = setupFakeInteractor({ context: 2 })
  const testEnvironment = createTestEnvironment({
    service1: { type: 'interactor', creator: creator1 },
    service2: { type: 'runner', creator: creator2 },
    service3: { type: 'interactor', creator: creator3, hook: 'before-all' },
  })
  const world = testEnvironment.createWorld()
  await testEnvironment.onBefore(world)
  await world.start('service1')
  await world.start('service2')
  await testEnvironment.onAfter(world)
  expect(state1.isStarted).toBe(false)
  expect(state2.isStarted).toBe(false)
  expect(state3.isStarted).toBe(false)
})

test('start should be type-safe', async () => {
  const { creator: creator1 } = setupFakeInteractor({ context: 1 })
  const { creator: creator2 } = setupFakeInteractor({ context: 2 })
  const testEnvironment = createTestEnvironment({
    service1: { type: 'interactor', creator: creator1 },
    service2: { type: 'interactor', creator: creator2, hook: 'before-all' },
  })
  const world = testEnvironment.createWorld()
  await expect(async () => {
    // @ts-expect-error service3 is not in the configuration
    await world.start('service3')
  }).rejects.toThrow('Service "service3" is not in the configuration')
})

test('start is typesafe', async () => {
  const { creator: creator1 } = setupFakeInteractor({ context: 1 })
  const { creator: creator2 } = setupFakeInteractor({ context: 2 })
  const testEnvironment = createTestEnvironment({
    service1: { type: 'interactor', creator: creator1 },
    service2: { type: 'interactor', creator: creator2, hook: 'before-all' },
  })
  const world = testEnvironment.createWorld()
  await expect(async () => {
    // @ts-expect-error service3 is not in the configuration
    await world.start('service3')
  }).rejects.toThrow('Service "service3" is not in the configuration')
})

test('start context shows its log entries', async () => {
  const { creator: creator1 } = setupFakeInteractor({ context: 1 })
  const { creator: creator2 } = setupFakeRunner()
  const testEnvironment = createTestEnvironment({
    service1: { type: 'interactor', creator: creator1, hook: 'before' },
    service2: { type: 'runner', creator: creator2, hook: 'before' },
  })
  const world = testEnvironment.createWorld()
  const entries$ = await testEnvironment.onBefore(world)
  const messages = new Set<string | Buffer>()
  entries$.subscribe(({ entry }) => {
    messages.add(entry)
  })
  expect(messages).toEqual(new Set(['service1: Coming from context start']))
})

test('onBeforeAll should log the started services', async () => {
  const { creator: creator1 } = setupFakeInteractor({ context: 1 })
  const { creator: creator2 } = setupFakeRunner()
  const testEnvironment = createTestEnvironment({
    service1: { type: 'interactor', creator: creator1, hook: 'before-all' },
    service2: { type: 'runner', creator: creator2, hook: 'before-all' },
  })
  const entries$ = await testEnvironment.onBeforeAll()
  const messages = new Set<string | Buffer>()
  entries$.subscribe(({ entry }) => {
    messages.add(entry)
  })
  expect(messages).toEqual(
    new Set(['service1: Started in before-all', 'service2: Started in before-all']),
  )
})

test('onAfterAll should log the stopped services', async () => {
  const { creator: creator1 } = setupFakeInteractor({ context: 1 })
  const { creator: creator2 } = setupFakeRunner()
  const testEnvironment = createTestEnvironment({
    service1: { type: 'interactor', creator: creator1, hook: 'before-all' },
    service2: { type: 'runner', creator: creator2, hook: 'before-all' },
  })
  await testEnvironment.onBeforeAll()
  const entries$ = await testEnvironment.onAfterAll()
  const messages = new Set<string | Buffer>()
  entries$.subscribe(({ entry }) => {
    messages.add(entry)
  })
  expect(messages).toEqual(
    new Set(['service1: Stopped in after-all', 'service2: Stopped in after-all']),
  )
})

test('onAfter should log the stopped services', async () => {
  const { creator: creator1 } = setupFakeInteractor({ context: 1 })
  const { creator: creator2 } = setupFakeRunner()
  const testEnvironment = createTestEnvironment({
    service1: { type: 'interactor', creator: creator1, hook: 'before' },
    service2: { type: 'runner', creator: creator2, hook: 'before' },
  })
  const world = testEnvironment.createWorld()
  await testEnvironment.onBefore(world)
  const entries$ = await testEnvironment.onAfter(world)
  const messages = new Set<string | Buffer>()
  entries$.subscribe(({ entry }) => {
    messages.add(entry)
  })
  expect(messages).toEqual(new Set(['service1: Stopped in after', 'service2: Stopped in after']))
})

test('it should handle an async creator', async () => {
  const { creator: creator1, state: state1 } = setupFakeAsyncRunner()
  const { creator: creator2, state: state2 } = setupFakeAsyncInteractor({ context: 1 })
  const testEnvironment = createTestEnvironment({
    service1: { type: 'runner', creator: creator1 },
    service2: { type: 'interactor', creator: creator2 },
  })
  const world = testEnvironment.createWorld()
  await world.start('service1')
  await world.start('service2')
  expect(state1.isStarted).toBe(true)
  expect(state2.isStarted).toBe(true)
})

test('it should handle an async creator', async () => {
  const { creator: creator1, state: state1 } = setupFakeAsyncRunner()
  const { creator: creator2, state: state2 } = setupFakeAsyncInteractor({ context: 1 })
  const testEnvironment = createTestEnvironment({
    service1: { type: 'runner', creator: creator1, hook: 'before-all' },
    service2: { type: 'interactor', creator: creator2, hook: 'before-all' },
  })
  await testEnvironment.onBeforeAll()
  expect(state1.isStarted).toBe(true)
  expect(state2.isStarted).toBe(true)
})

type InteractorState = {
  isStarted: boolean
  isContextStarted: boolean
  startArg: number | undefined
}

const setupFakeInteractor = <T = number>({
  context,
  isContextStarted,
}: {
  context: T
  isContextStarted?: boolean
}): {
  state: InteractorState
  creator: (arg?: number) => Interactor<T>
} => {
  const state: InteractorState = {
    isStarted: false,
    isContextStarted: isContextStarted ?? false,
    startArg: undefined,
  }
  const creator = (arg?: number): Interactor<T> => ({
    start: async () => {
      state.isStarted = true
      state.startArg = arg
    },
    stop: async () => {
      state.isStarted = false
    },
    startContext: async () => {
      state.isContextStarted = true
      return {
        context,
        reportEntry$: of({
          entry: 'Coming from context start',
          type: 'text/plain',
        }),
      }
    },
    stopContext: async (_: T) => {
      state.isContextStarted = false
    },
    onFailure: async (context: T, name: string) => {
      return {
        entry: `Failure in context ${String(context)} for test ${name}`,
        type: 'text/plain',
      }
    },
  })
  return {
    state,
    creator,
  }
}

const setupFakeAsyncInteractor = <T = number>({
  context,
  isContextStarted,
}: {
  context: T
  isContextStarted?: boolean
}): {
  state: InteractorState
  creator: (arg?: number) => Promise<Interactor<T>>
} => {
  const state: InteractorState = {
    isStarted: false,
    isContextStarted: isContextStarted ?? false,
    startArg: undefined,
  }
  const creator = async (arg?: number): Promise<Interactor<T>> => ({
    start: async () => {
      state.isStarted = true
      state.startArg = arg
    },
    stop: async () => {
      state.isStarted = false
    },
    startContext: async () => {
      state.isContextStarted = true
      return {
        context,
        reportEntry$: of({
          entry: 'Coming from context start',
          type: 'text/plain',
        }),
      }
    },
    stopContext: async (_: T) => {
      state.isContextStarted = false
    },
    onFailure: async (context: T, name: string) => {
      return {
        entry: `Failure in context ${String(context)} for test ${name}`,
        type: 'text/plain',
      }
    },
  })
  return {
    state,
    creator,
  }
}

type RunnerState = {
  isStarted: boolean
  startArg: number | undefined
}

const setupFakeRunner = (): {
  state: RunnerState
  creator: (arg?: number) => Runner
} => {
  const state: RunnerState = {
    isStarted: false,
    startArg: undefined,
  }
  const creator = (arg?: number): Runner => ({
    start: async () => {
      state.isStarted = true
      state.startArg = arg
    },
    stop: async () => {
      state.isStarted = false
    },
  })
  return {
    state,
    creator,
  }
}

const setupFakeAsyncRunner = (): {
  state: RunnerState
  creator: (arg?: number) => Promise<Runner>
} => {
  const state: RunnerState = {
    isStarted: false,
    startArg: undefined,
  }
  const creator = async (arg?: number): Promise<Runner> => ({
    start: async () => {
      state.isStarted = true
      state.startArg = arg
    },
    stop: async () => {
      state.isStarted = false
    },
  })
  return {
    state,
    creator,
  }
}
