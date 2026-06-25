import type { TestEnvironmentWorld } from './world.ts'
import type { ServiceConfig } from './type.ts'
import { createTestEnvironment } from './test-environment.ts'

import { setDefaultTimeout, setWorldConstructor, Status, World, After, AfterAll, Before, BeforeAll, Given as CucumberGiven, When as CucumberWhen, Then as CucumberThen } from '@cucumber/cucumber'
import { type ITestCaseHookParameter } from '@cucumber/cucumber'

type CucumberTestEnvironment<SERVICES extends Record<string, ServiceConfig>> = {
  Given: (step: string, callback: (world: TestEnvironmentWorld<SERVICES>) => Promise<void>) => void
  When: (step: string, callback: (world: TestEnvironmentWorld<SERVICES>) => Promise<void>) => void
  Then: (step: string, callback: (world: TestEnvironmentWorld<SERVICES>) => Promise<void>) => void
}

export const createCucumberTestEnvironment = <SERVICES extends Record<string, ServiceConfig>>(services: SERVICES, options: {
  timeout?: number
} = {}): CucumberTestEnvironment<SERVICES> => {
  setDefaultTimeout(options.timeout ?? 60 * 1000)
  const testEnvironment = createTestEnvironment(services)

  class TestEnvironmentWorld extends World {
    debug = false
    testEnvironmentWorld = testEnvironment.createWorld()
  }

  setWorldConstructor(TestEnvironmentWorld)

  BeforeAll(async function () {
    const entry$ = await testEnvironment.onBeforeAll()
    entry$.subscribe(({ entry, type }) => {
      console.log(entry, type)
    })
  })

  Before({ tags: '@ignore' }, async function () {
    return 'skipped'
  })

  Before({ tags: '@debug' }, async function (this: TestEnvironmentWorld) {
    this.debug = true
  })

  Before(async function (this: TestEnvironmentWorld) {
    const entry$ = await testEnvironment.onBefore(this.testEnvironmentWorld)
    entry$.subscribe(({ entry, type }) => {
      this.attach(entry as string, type as string)
    })
  })

  After(async function (this: TestEnvironmentWorld, { result, pickle }: ITestCaseHookParameter) {
    if (result?.status !== Status.PASSED) {
      const testName = pickle.name.replace(/\W/g, '-')
      const entries = await testEnvironment.onFailure(this.testEnvironmentWorld, testName)
      for (const { entry, type } of entries) {
        this.attach(entry as string, type as string)
      }
    }
    this.attach(`Status: ${result?.status ?? ''}. Duration:${result?.duration?.seconds ?? ''}s`)
    const entry$ = await testEnvironment.onAfter(this.testEnvironmentWorld)
    entry$.subscribe(({ entry, type }) => {
      this.attach(entry as string, type as string)
    })
  })

  AfterAll(async function () {
    const entry$ = await testEnvironment.onAfterAll()
    entry$.subscribe(({ entry, type }) => {
      console.log(entry, type)
    })
  })

  return {
    Given: (step, callback) => CucumberGiven(step, async function (this: TestEnvironmentWorld) {
      await callback(this.testEnvironmentWorld)
      }),
    When: (step, callback) => CucumberWhen(step, async function (this: TestEnvironmentWorld) {
      await callback(this.testEnvironmentWorld)
    }),
    Then: (step, callback) => CucumberThen(step, async function (this: TestEnvironmentWorld) {
      await callback(this.testEnvironmentWorld)
    }),
  }
}

