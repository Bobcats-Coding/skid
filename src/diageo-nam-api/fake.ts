import type { DiageoNamService } from './types'

import { of } from 'rxjs'

export const createFakeDiageoNamService = (): DiageoNamService => ({
  submitInbound: (payload) => {
    // Mirror the payload that would be POSTed when real creds are available,
    // so local dev can see exactly what the integration would send.
    console.info(
      '[DiageoNAM][fake] Would POST to /inbound/sfmc:\n' + JSON.stringify(payload, null, 2),
    )
    return of({
      status: 'success' as const,
      messageId: 'fake-diageo-message-id',
      raw: { status: 'success', messageId: 'fake-diageo-message-id' },
    })
  },
})
