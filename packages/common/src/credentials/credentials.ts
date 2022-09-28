import { Ed25519Signature2020 } from '@digitalcredentials/ed25519-signature-2020'
import vcjs from '@digitalcredentials/vc'
import axios from 'axios'

import { securityLoader } from '@xrengine/common/src/documentLoader'

import { VerifiablePresentation } from '../interfaces/Web5'
import multiLogger from '../logger'

// import { serverHost } from '../serverHost'

const logger = multiLogger.child({ component: 'client-core:credentials' })

const documentLoader = securityLoader().build()

export const vpRequestQuery: any = {
  web: {
    VerifiablePresentation: {
      query: [
        {
          type: 'QueryByExample',
          credentialQuery: [
            {
              example: {
                '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/xr/v1'],
                type: 'XRCredential'
              }
            }
          ]
        }
      ]
    }
  }
}

const vcTemplates = {
  EnteredVolumeEvent: {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      // The object below is a temporary (in-line) context, used for an example
      // Once we settle on what our VC content is (what types we want to issue, etc)
      // We'll fold them all into the 'https://w3id.org/xr/v1' context
      {
        etherealEvent: 'https://w3id.org/xr/v1#etherealEvent',
        EnteredVolumeEvent: 'https://w3id.org/xr/v1#EnteredVolumeEvent',
        CheckpointEvent: 'https://w3id.org/xr/v1#CheckpointEvent',
        checkpointId: 'https://w3id.org/xr/v1#checkpointId'
      }
    ],
    type: ['VerifiableCredential', 'XRCredential'],
    // issuer is set by the server
    credentialSubject: {
      id: '<user did goes here>',
      etherealEvent: [
        {
          type: ['EnteredVolumeEvent', 'CheckpointEvent'],
          checkpointId: '12345'
        }
      ]
    }
  }
}

export async function verifyCredential(credential) {
  const suite = new Ed25519Signature2020()
  return vcjs.verifyCredential({
    credential,
    suite,
    documentLoader
  })
}

/**
 * Makes a request to the server to issue a credential for a given event name and user.
 * @param eventName {string} - Name of event (to look up the VC template).
 * @param [subjectId] {string} - User's DID
 */
export async function requestVcForEvent(eventName, subjectId?): Promise<VerifiablePresentation> {
  // Example VC that denotes that a user has entered a door 3d volume
  const unsignedCredential = vcTemplates[eventName]
  unsignedCredential.credentialSubject.id = subjectId || 'did:example:user:1234'

  // const url = new URL('/api/credentials/request', serverHost)
  // let signedVc
  // try {
  //   ;({ data: signedVc } = await axios.post(url.toString(), { credential: unsignedCredential }))
  // } catch (err) {
  //   logger.error(err, 'Error requesting credentials issuance')
  // }

  // Wrap the VC in an unsigned Verifiable Presentation
  return {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiablePresentation'],
    verifiableCredential: [unsignedCredential]
  }
}
