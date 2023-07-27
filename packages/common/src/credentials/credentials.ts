/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

// import { Ed25519Signature2020 } from '@digitalcredentials/ed25519-signature-2020'
// import vcjs from '@digitalcredentials/vc'
// import axios from 'axios'

// import { securityLoader } from '@etherealengine/common/src/documentLoader'

// import { VerifiablePresentation } from '../interfaces/Web5'
// import multiLogger from '../logger'

// import { serverHost } from '../serverHost'

// const logger = multiLogger.child({ component: 'client-core:credentials' })

// const documentLoader = securityLoader().build()

// export const vpRequestQuery: any = {
//   web: {
//     VerifiablePresentation: {
//       query: [
//         {
//           type: 'QueryByExample',
//           credentialQuery: [
//             {
//               example: {
//                 '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/xr/v1'],
//                 type: 'XRCredential'
//               }
//             }
//           ]
//         }
//       ]
//     }
//   }
// }

// const vcTemplates = {
//   EnteredVolumeEvent: {
//     '@context': [
//       'https://www.w3.org/2018/credentials/v1',
//       // The object below is a temporary (in-line) context, used for an example
//       // Once we settle on what our VC content is (what types we want to issue, etc)
//       // We'll fold them all into the 'https://w3id.org/xr/v1' context
//       {
//         etherealEvent: 'https://w3id.org/xr/v1#etherealEvent',
//         EnteredVolumeEvent: 'https://w3id.org/xr/v1#EnteredVolumeEvent',
//         CheckpointEvent: 'https://w3id.org/xr/v1#CheckpointEvent',
//         checkpointId: 'https://w3id.org/xr/v1#checkpointId'
//       }
//     ],
//     type: ['VerifiableCredential', 'XRCredential'],
//     // issuer is set by the server
//     credentialSubject: {
//       id: '<user did goes here>',
//       etherealEvent: [
//         {
//           type: ['EnteredVolumeEvent', 'CheckpointEvent'],
//           checkpointId: '12345'
//         }
//       ]
//     }
//   }
// }

// export async function verifyCredential(credential) {
//   const suite = new Ed25519Signature2020()
//   return vcjs.verifyCredential({
//     credential,
//     suite,
//     documentLoader
//   })
// }

/**
 * Makes a request to the server to issue a credential for a given event name and user.
 * @param eventName {string} - Name of event (to look up the VC template).
 * @param [subjectId] {string} - User's DID
 */
// export async function requestVcForEvent(eventName, subjectId?): Promise<VerifiablePresentation> {
//   // Example VC that denotes that a user has entered a door 3d volume
//   const unsignedCredential = vcTemplates[eventName]
//   unsignedCredential.credentialSubject.id = subjectId || 'did:example:user:1234'
//
//   // const url = new URL('/api/credentials/request', serverHost)
//   // let signedVc
//   // try {
//   //   ;({ data: signedVc } = await axios.post(url.toString(), { credential: unsignedCredential }))
//   // } catch (err) {
//   //   logger.error(err, 'Error requesting credentials issuance')
//   // }
//
//   // Wrap the VC in an unsigned Verifiable Presentation
//   return {
//     '@context': ['https://www.w3.org/2018/credentials/v1'],
//     type: ['VerifiablePresentation'],
//     verifiableCredential: [unsignedCredential]
//   }
// }
export {}
