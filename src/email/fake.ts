import type { Email, EmailBackend } from './service'

export const createFakeEmailBackend = (): { backend: EmailBackend; received: Email[] } => {
  const received: Email[] = []
  const backend: EmailBackend = {
    send: async (email) => {
      received.push(email)
    },
  }

  return {
    received,
    backend,
  }
}
