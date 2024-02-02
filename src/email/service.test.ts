import { addErrorMethodsToFake } from '../core/fake'
import { type EmailAddress } from './email-address'
import { createFakeEmailBackend } from './fake'
import { createSender } from './service'

test('it should create a new sender using a fake backend', async () => {
  const { received, backend } = createFakeEmailBackend()
  const emailSender = createSender(backend)
  await emailSender.send(TEST_EMAIL)
  expect(received).toEqual([TEST_EMAIL])
})

test('it should reject if the backend rejects', async () => {
  const error = new Error('Fake Backend Failed')
  const { backend } = createFakeEmailBackend()
  const failingBackend = addErrorMethodsToFake(() => backend)({
    send: { type: 'async', error },
  })
  const emailSender = createSender(failingBackend)
  let message
  let cause
  try {
    await emailSender.send(TEST_EMAIL)
  } catch (e: any) {
    message = e.message
    cause = e.cause
  }
  expect(message).toBe('Email sending backend failed')
  expect(cause).toBe(error)
})

const TEST_EMAIL = {
  to: 'to@example.org' as EmailAddress,
  from: 'from@example.org' as EmailAddress,
  subject: 'subject',
  body: 'body',
  isHtml: false,
}
