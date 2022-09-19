import { NotificationService } from '@xrengine/client-core/src/common/services/NotificationService'
import { requestVcForEvent, vpRequestQuery } from '@xrengine/common/src/credentials/credentials'
import { CallbackComponent, setCallback } from '@xrengine/engine/src/scene/components/CallbackComponent'
import { createActionQueue, dispatchAction, getState } from '@xrengine/hyperflux'

import { isClient } from '../common/functions/isClient'
import { Engine } from '../ecs/classes/Engine'
import { addComponent, defineQuery, getComponent } from '../ecs/functions/ComponentFunctions'
import { NameComponent } from '../scene/components/NameComponent'
import { CredentialAction } from './CredentialAction'
import { CredentialState } from './CredentialState'

function updateCredentialState(action: typeof CredentialAction.verificationResult.matches._TYPE) {
  console.log('in updateCredentialState')
  if (action.$from !== Engine.instance.currentWorld.worldNetwork.hostId) return
  const credential = action.credential
  const credentialState = getState(CredentialState)
  if (action.verified) {
    // dispatch success notification
    console.log('Verification successful!')
    NotificationService.dispatchNotify('Verification successful!', { variant: 'success' })
  } else {
    // dispatch error notification
    console.log('Verification fail!')
    NotificationService.dispatchNotify('Verification failed!', { variant: 'error' })
  }
  if (!credentialState[action.userId].value) credentialState[action.userId].set({ all: [] })
  credentialState[action.userId].all.merge(credential)
}

export const CredentialSystem = () => {
  const didVerifyCredentialActions = createActionQueue(CredentialAction.verificationResult.matches)
  const nameQuery = defineQuery([NameComponent])

  return () => {
    for (const entity of nameQuery.enter()) {
      const name = getComponent(entity, NameComponent).name
      if (name === 'Door' || name === 'VCKey Trigger Volume') {
        setCallback(entity, 'receiveVC', async () => {
          // Give the user a credential
          if (isClient) {
            const signedVp = await requestVcForEvent('EnteredVolumeEvent')
            console.log('Issued VC:', JSON.stringify(signedVp, null, 2))

            const webCredentialType = 'VerifiablePresentation'
            // @ts-ignore
            const webCredentialWrapper = new window.WebCredential(webCredentialType, signedVp, {
              recommendedHandlerOrigins: ['https://uniwallet.cloud']
            })

            const storeResult = await navigator.credentials.store(webCredentialWrapper)
            console.log('Stored credential result:', JSON.stringify(storeResult, null, 2))
          }
        })
        setCallback(entity, 'activate', async () => {
          console.log('IN ACTIVATE')
          // request credential
          if (isClient) {
            const vpResult = (await navigator.credentials.get(vpRequestQuery)) as any
            console.log(JSON.stringify(vpResult, null, 2))
            // send the vc to the server side for verification
            dispatchAction(
              CredentialAction.requestVerify({ credential: vpResult?.data?.presentation.verifiableCredential[0] })
            )
          }
        })
      }
    }
    for (const action of didVerifyCredentialActions()) updateCredentialState(action)
  }
}
