import { parseUrl, stringifyUrl } from './url'
import type { Url } from './url'

import { expect, test } from 'vitest'

test('stringify full url', () => {
  expect(
    stringifyUrl({
      protocol: 'https',
      hostname: 'localhost',
      pathname: '/path',
      port: 8080,
      search: {
        a: '1',
        b: '2',
      },
      hash: 'hash',
    }),
  ).toBe('https://localhost:8080/path?a=1&b=2#hash')
})

test('stringify partial url', () => {
  expect(
    stringifyUrl({
      protocol: 'https',
      hostname: 'localhost',
    }),
  ).toBe('https://localhost/')
})

test('parse full url', () => {
  expect(parseUrl('https://localhost:8080/path?a=1&b=2#hash')).toEqual({
    protocol: 'https',
    hostname: 'localhost',
    pathname: '/path',
    port: 8080,
    search: {
      a: '1',
      b: '2',
    },
    hash: 'hash',
  })
})

test('parse full url', () => {
  expect(parseUrl('https://localhost/')).toEqual({
    protocol: 'https',
    hostname: 'localhost',
    pathname: '/',
    port: 80,
    search: {},
    hash: '',
  })
})

test('Url type', () => {
  const url: Url = 'https://host:8080/path/subpath/?a=1&b=2#hash'
  expect(url).toBe(url)
})
