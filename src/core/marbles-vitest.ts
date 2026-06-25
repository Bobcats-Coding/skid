import type { Observable } from 'rxjs'
import { _cases, type NamedCase, type UnnamedCase } from 'rxjs-marbles/cases'
import { type Configuration, defaults } from 'rxjs-marbles/configuration'
import { type Context } from 'rxjs-marbles/context'
import { Expect } from 'rxjs-marbles/expect'
import { configure as _configure, type MarblesFunction } from 'rxjs-marbles/marbles'
import type { ExpectHelpers, TestObservableLike } from 'rxjs-marbles/types'
import { describe, expect } from 'vitest'

export type CasesFunction = {
  <T extends UnnamedCase>(
    name: string,
    func: (context: Context, _case: T) => void,
    cases: Record<string, T>,
  ): void
  <T extends NamedCase>(name: string, func: (context: Context, _case: T) => void, cases: T[]): void
}

export function configure(configuration: Configuration): {
  cases: CasesFunction
  marbles: MarblesFunction
} {
  const { marbles } = _configure({
    ...defaults(),
    assertDeepEqual: (a, e) => {
      expect(a).toStrictEqual(e)
    },
    frameworkMatcher: true,
    ...configuration,
  })

  function cases<T extends UnnamedCase>(
    name: string,
    func: (context: Context, _case: T) => void,
    cases: Record<string, T>,
  ): void
  function cases<T extends NamedCase>(
    name: string,
    func: (context: Context, _case: T) => void,
    cases: T[],
  ): void
  function cases(name: string, func: any, cases: any): void {
    describe(name, () => {
      _cases(
        (c) => {
          const t = c?.only !== undefined ? test.only : c?.skip === undefined ? test.skip : test
          if (func.length > 2) {
            t(
              c.name,
              marbles((m: any, second: any, ...rest: any[]) => func(m, c, second, ...rest)),
            )
          } else {
            t(
              c.name,
              marbles((m, ...rest: any[]) => func(m, c, ...rest)),
            )
          }
        },
        cases as Record<string, NamedCase>,
      )
    })
  }

  return { cases, marbles }
}

const { marbles } = configure({})

type Marbles = typeof marbles
type MarblesRunner = Parameters<Marbles>[0]
type MarblesParam = Parameters<MarblesRunner>[0]
type Runner = (m: MarblesExtensions, ...args: any[]) => ReturnType<MarblesRunner>
type MarbleFunctions = Record<string, () => void>

type MarblesExtensions = {
  coldCall: (marble: string, functions: MarbleFunctions) => void
  coldBoolean: (marble: string) => TestObservableLike<boolean>
  expect: <T = any>(actual: Observable<T>, subscription?: string) => ExtendedExpect<T>
} & MarblesParam

class ExtendedExpect<T> extends Expect<T> {
  constructor(
    readonly actual_: Observable<T>,
    readonly helpers_: ExpectHelpers,
    readonly subscription_?: string,
  ) {
    super(actual_, helpers_, subscription_)
  }

  toBeObservableBoolean(marble: string): void {
    this.toBeObservable(marble, MARBLES_BOOLEAN as unknown as Record<string, T>)
  }
}

export const coreMarbles =
  (runner: Runner): (() => void) =>
  (...args: any[]) =>
    marbles((m) => {
      const coldCall = (marble: string, functions: MarbleFunctions): void => {
        const marbleDefinition = Object.fromEntries(Object.keys(functions).map((key) => [key, key]))
        m.cold(marble, marbleDefinition).subscribe((key) => {
          functions[key]?.()
        })
      }
      const coldBoolean = (marble: string): TestObservableLike<boolean> =>
        m.cold(marble, MARBLES_BOOLEAN)

      // This function and the ExtendedExpect depends on internals of the `rxjs-marbles` library
      // potentially not future proof
      const expect = <T = any>(actual: Observable<T>, subscription?: string): ExtendedExpect<T> => {
        const { helpers_ } = m as any
        return new ExtendedExpect(actual, helpers_ as ExpectHelpers, subscription)
      }

      // The methods on `m` (the RunContext) are on the prototype, so we have to bind the original
      // ones to be able to use destructuring
      return runner(
        {
          get autoFlush() {
            return m.autoFlush
          },
          coldCall,
          coldBoolean,
          expect,
          equal: m.equal.bind(m),
          cold: m.cold.bind(m),
          bind: m.bind.bind(m),
          configure: m.configure.bind(m),
          flush: m.flush.bind(m),
          has: m.has.bind(m),
          hot: m.hot.bind(m),
          reframe: m.reframe.bind(m),
          scheduler: m.scheduler,
          teardown: m.teardown.bind(m),
          time: m.time.bind(m),
        },
        ...(args as Parameters<Runner>),
      )
    })()

export const MARBLES_BOOLEAN = {
  t: true,
  f: false,
}
