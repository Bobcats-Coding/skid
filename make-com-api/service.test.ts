import { createScenarioService } from './service'
import { FAKE_SCENARIO, scenarioApiClient } from './stub'
import type { Scenario } from './types'

import { coreMarbles } from '@bobcats-coding/skid/core/marbles'

import type { Observable } from 'rxjs'
import { filter, map } from 'rxjs/operators'

const scenarioService = createScenarioService(scenarioApiClient)

test(
  'get all scenarios',
  coreMarbles(({ expect }) => {
    const scenarios$ = scenarioService
      .getAllScenarios({ organizationId: '1', accessToken: '12345' })
      .pipe(filter((s): s is [Scenario, ...Scenario[]] => s.length > 0))
    const name$ = scenarios$.pipe(map(([{ name }]) => name))
    expect(name$).toBeObservable('-(n|)', { n: FAKE_SCENARIO.name })
    const id$ = scenarios$.pipe(map(([{ id }]) => id))
    expect(id$).toBeObservable('-(i|)', { i: FAKE_SCENARIO.id })
  }),
)

test(
  'get a single scenario by id',
  coreMarbles(({ expect }) => {
    const scenario$ = scenarioService.getScenarioById({
      scenarioId: 1,
      accessToken: '12345',
    }) as Observable<Scenario>
    const name$ = scenario$.pipe(map(({ name }) => name))
    expect(name$).toBeObservable('-(n|)', { n: FAKE_SCENARIO.name })
    const id$ = scenario$.pipe(map(({ id }) => id))
    expect(id$).toBeObservable('-(i|)', { i: FAKE_SCENARIO.id })
  }),
)

test(
  'start a scenario by id',
  coreMarbles(({ expect }) => {
    const scenario$ = scenarioService.startScenario({
      scenarioId: 1,
      accessToken: '12345',
    }) as Observable<Scenario>
    const islinked$ = scenario$.pipe(map(({ islinked }) => islinked))
    expect(islinked$).toBeObservable('-(i|)', { i: true })
    const id$ = scenario$.pipe(map(({ id }) => id))
    expect(id$).toBeObservable('-(i|)', { i: FAKE_SCENARIO.id })
  }),
)

test(
  'stop a scenario by id',
  coreMarbles(({ expect }) => {
    const scenario$ = scenarioService.stopScenario({
      scenarioId: 1,
      accessToken: '12345',
    }) as Observable<Scenario>
    const islinked$ = scenario$.pipe(map(({ islinked }) => islinked))
    expect(islinked$).toBeObservable('-(i|)', { i: false })
    const id$ = scenario$.pipe(map(({ id }) => id))
    expect(id$).toBeObservable('-(i|)', { i: FAKE_SCENARIO.id })
  }),
)
