import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { VerifiableCredential } from '@xrengine/common/src/interfaces/Web5'
import { defineState } from '@xrengine/hyperflux'

export const CredentialState = defineState({
  name: 'CredentialState',
  initial: {} as {
    [userId: UserId]: {
      all: VerifiableCredential[]
      // TODO: index by type
      // ethereal_engine_event: number[],
    }
  }
})
