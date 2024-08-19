/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

// If this gets re-implemented, need to add the @digitalCredentials packages back to package.json dependencies
// import { CachedResolver } from '@digitalcredentials/did-io'
// import * as didKey from '@digitalcredentials/did-method-key'
// import { Ed25519VerificationKey2020 } from '@digitalcredentials/ed25519-verification-key-2020'
// import { X25519KeyAgreementKey2020 } from '@digitalcredentials/x25519-key-agreement-key-2020'
// import * as didWeb from '@interop/did-web-resolver'
// import cred from 'credentials-context'
// import { CryptoLD } from 'crypto-ld'
// import didContext from 'did-context'
// import ed25519 from 'ed25519-signature-2020-context'
// import { JsonLdDocumentLoader } from 'jsonld-document-loader'
// import x25519 from 'x25519-key-agreement-2020-context'
//
// const cryptoLd = new CryptoLD()
// cryptoLd.use(Ed25519VerificationKey2020)
// cryptoLd.use(X25519KeyAgreementKey2020)
// const didWebDriver = didWeb.driver({ cryptoLd })
//
// const {
//   contexts: credentialsContext,
//   constants: { CREDENTIALS_CONTEXT_V1_URL }
// } = cred
// const didKeyDriver = didKey.driver()
// const resolver = new CachedResolver()
// resolver.use(didKeyDriver)
// resolver.use(didWebDriver)
//
// /**
//  * Because none of the credential libraries are typed, we need to use implicit
//  * any here for the return type.
//  */
// /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
// export function securityLoader() {
//   const loader = new JsonLdDocumentLoader()
//
//   loader.addStatic(ed25519.constants.CONTEXT_URL, ed25519.contexts.get(ed25519.constants.CONTEXT_URL))
//
//   loader.addStatic(x25519.constants.CONTEXT_URL, x25519.contexts.get(x25519.constants.CONTEXT_URL))
//
//   loader.addStatic(didContext.constants.DID_CONTEXT_URL, didContext.contexts.get(didContext.constants.DID_CONTEXT_URL))
//
//   loader.addStatic(CREDENTIALS_CONTEXT_V1_URL, credentialsContext.get(CREDENTIALS_CONTEXT_V1_URL))
//
//   loader.setDidResolver(resolver)
//
//   return loader
// }

export {}
