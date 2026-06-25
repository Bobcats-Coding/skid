import { type QwikAppIdentity } from './identity'

import { createContextId } from '@builder.io/qwik'

export const IdentityContext = createContextId<{ identity: QwikAppIdentity }>('identity')
