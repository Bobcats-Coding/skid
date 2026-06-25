import { coreMarbles } from '@bobcats-coding/skid/core/marbles'

import { Subject } from 'rxjs'
import { test } from 'vitest'

test(
  'it should run a single function',
  coreMarbles(({ expect, coldCall }) => {
    const s = new Subject()
    coldCall('-cc', {
      c: () => {
        s.next('c')
      },
    })
    expect(s).toBeObservable('-cc', { c: 'c' })
  }),
)

test(
  'it should run multiple functions',
  coreMarbles(({ expect, coldCall }) => {
    const s = new Subject()
    coldCall('-cd', {
      c: () => {
        s.next('c')
      },
      d: () => {
        s.next('d')
      },
    })
    expect(s).toBeObservable('-cd', { c: 'c', d: 'd' })
  }),
)

test(
  'it should create a boolean marble',
  coreMarbles(({ expect, coldBoolean }) => {
    expect(coldBoolean('tf')).toBeObservable('tf', { t: true, f: false })
  }),
)

test(
  'it should assert a boolean marble',
  coreMarbles(({ expect, cold }) => {
    expect(cold('tf', { t: true, f: false })).toBeObservableBoolean('tf')
  }),
)

test.each([
  ['tf', 'tf'],
  ['ft', 'ft'],
])(
  'it should work with each',
  coreMarbles(({ expect, coldBoolean }, a: string, b: string) => {
    expect(coldBoolean(a)).toBeObservableBoolean(b)
  }),
)
