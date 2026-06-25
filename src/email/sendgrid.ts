import type { EmailBackend } from './types'

import sendgridMail from '@sendgrid/mail'
import { from, map, of } from 'rxjs'

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
    requestVerification: ({ to, code }) => {
      return from(
        sendgridMail
          .send({
            to,
            from: 'verify@bars.com',
            templateId: 'd-fb3d09ea9def4d979a32531a1599e371',
            dynamicTemplateData: {
              verificationCode: code,
            },
          })
          .catch((error) => {
            console.error(error)
            return of(undefined)
          }),
      ).pipe(map(() => undefined))
    },
    verify: ({ code, attempt }) => {
      return of({
        status: attempt === code ? 'approved' : 'failed',
      }).pipe(
        map((result) => ({
          status: result.status === 'approved' ? 'verified' : 'failed',
        })),
      )
    },
  }
}
