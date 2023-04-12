import { addErrorMethodsToFake } from './fake'

import type { Observable } from 'rxjs'
import { of } from 'rxjs'
import { marbles } from 'rxjs-marbles/jest'

type Original1 = {
  method: () => number
}

type Original2 = {
  method2: () => number
} & Original1

type Original1Async = {
  method: () => Promise<number>
}

type Original1Observable = {
  method: () => Observable<number>
}

test('Create the original if args are empty', () => {
  const originalFake = (): Original1 => ({ method: () => 1 })
  const fakeCreator = addErrorMethodsToFake(originalFake)
  const fake = fakeCreator()
  expect(fake.method).not.toThrow()
})

test('Create sync throwing function', () => {
  const originalFake = (): Original1 => ({ method: () => 1 })
  const fakeCreator = addErrorMethodsToFake(originalFake)
  const error = new Error('test error')
  const fake = fakeCreator({ method: { type: 'sync', error } })
  expect(fake.method).toThrow(error)
})

test('Create multiple sync throwing function', () => {
  const originalFake = (): Original2 => ({ method: () => 1, method2: () => 2 })
  const fakeCreator = addErrorMethodsToFake(originalFake)
  const error = new Error('test error')
  const error2 = new Error('test error2')
  const fake = fakeCreator({
    method: { type: 'sync', error },
    method2: { type: 'sync', error: error2 },
  })
  expect(fake.method).toThrow(error)
  expect(fake.method2).toThrow(error2)
})

test('Create async throwing function', async () => {
  const originalFake = (): Original1Async => ({ method: async () => 1 })
  const fakeCreator = addErrorMethodsToFake(originalFake)
  const error = new Error('test error')
  const fake = fakeCreator({ method: { type: 'async', error } })
  await expect(fake.method).rejects.toEqual(error)
})

test(
  'Create observable throwing function',
  marbles((m) => {
    const originalFake = (): Original1Observable => ({ method: () => of(1) })
    const fakeCreator = addErrorMethodsToFake(originalFake)
    const error = new Error('test error')
    const fake = fakeCreator({ method: { type: 'observable', error } })
    m.expect(fake.method()).toBeObservable('-#', {}, error)
  }),
)

test('Forwarding constructor paramters', () => {
  const originalFake = (num1: number, num2: number): Original2 => ({
    method: () => num1,
    method2: () => num2,
  })
  const fakeCreator = addErrorMethodsToFake(originalFake)
  const fake = fakeCreator({}, 1, 2)
  expect(fake.method()).toBe(1)
  expect(fake.method2()).toBe(2)
})
