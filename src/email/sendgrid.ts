import type { EmailBackend } from './service'

import sendgridMail from '@sendgrid/mail'

export const createSendGridBackend = (apiKey: string): EmailBackend => {
  sendgridMail.setApiKey(apiKey)
  return {
    send: async ({ to, from, subject, body, isHtml }) => {
      const sendGridMessage = {
        to,
        from,
        subject,
        ...(isHtml ? { html: body } : { text: body }),
      }
      await sendgridMail.send(sendGridMessage)
    },
  }
}
