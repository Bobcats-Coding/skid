import { test, expect } from 'vitest'
import { validateVersionArgument } from './index'

test('validates version keywords', () => {
  expect(validateVersionArgument('patch')).toBe(true)
  expect(validateVersionArgument('minor')).toBe(true)
  expect(validateVersionArgument('major')).toBe(true)
})

test('validates basic semver versions', () => {
  expect(validateVersionArgument('1.0.0')).toBe(true)
  expect(validateVersionArgument('0.1.0')).toBe(true)
  expect(validateVersionArgument('1.1.1')).toBe(true)
  expect(validateVersionArgument('10.20.30')).toBe(true)
})

test('validates semver versions with pre-release identifiers', () => {
  expect(validateVersionArgument('1.0.0-alpha')).toBe(true)
  expect(validateVersionArgument('1.0.0-alpha.1')).toBe(true)
  expect(validateVersionArgument('1.0.0-0.3.7')).toBe(true)
  expect(validateVersionArgument('1.0.0-beta.11')).toBe(true)
  expect(validateVersionArgument('1.0.0-rc.1')).toBe(true)
})

test('validates semver versions with build metadata', () => {
  expect(validateVersionArgument('1.0.0+001')).toBe(true)
  expect(validateVersionArgument('1.0.0+20130313144700')).toBe(true)
  expect(validateVersionArgument('1.0.0+exp.sha.5114f85')).toBe(true)
})

test('validates semver versions with both pre-release and build metadata', () => {
  expect(validateVersionArgument('1.0.0-alpha+001')).toBe(true)
  expect(validateVersionArgument('1.0.0-beta.1+exp.sha.5114f85')).toBe(true)
})

test('rejects invalid versions', () => {
  expect(validateVersionArgument('1.0')).toBe(false)
  expect(validateVersionArgument('1.0.0.0')).toBe(false)
  expect(validateVersionArgument('1.0.a')).toBe(false)
  expect(validateVersionArgument('invalid')).toBe(false)
  expect(validateVersionArgument('1.0.0+')).toBe(false)
  expect(validateVersionArgument('1.0.0-')).toBe(false)
  expect(validateVersionArgument('+001')).toBe(false)
  expect(validateVersionArgument('1.0.0-alpha..1')).toBe(false)
})
