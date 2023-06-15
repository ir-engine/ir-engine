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

/**
 * Web5 (Verifiable Credentials, Decentralized Identifiers, Decentralized Web Nodes, etc) related interfaces.
 */
interface LinkedDataIntegrityObject {
  '@context': string | any[]
  id?: string
  type: string | string[]
  proof?: any
}

export interface KeyPairDescription extends LinkedDataIntegrityObject {
  controller: string
  publicKeyMultibase: string
  privateKeyMultibase?: string
}

interface DidDocument extends LinkedDataIntegrityObject {
  controller?: string
  verificationMethod?: KeyPairDescription | KeyPairDescription[]
  authentication?: string | string[] | KeyPairDescription | KeyPairDescription[]
  assertionMethod?: string | string[] | KeyPairDescription | KeyPairDescription[]
  capabilityDelegation?: string | string[] | KeyPairDescription | KeyPairDescription[]
  capabilityInvocation?: string | string[] | KeyPairDescription | KeyPairDescription[]
  keyAgreement?: string | string[] | KeyPairDescription | KeyPairDescription[]
  service: any | any[]
}

export interface DidDocumentGenerateResult {
  didDocument: DidDocument
  keyPairs: Map<string, object>
  methodFor: (options: object) => object
}

export interface VerifiablePresentation extends LinkedDataIntegrityObject {
  holder?: string
  verifiableCredential: any | any[]
}

export type IssuerURI = string
export type IssuerObject = {
  readonly id: IssuerURI
  readonly type?: string
  readonly name?: string
  readonly url?: string
  readonly image?: string
}
export type Issuer = IssuerURI | IssuerObject

export interface VerifiableCredential extends LinkedDataIntegrityObject {
  issuer: Issuer
  credentialSubject: any
  issuanceDate?: Date
  expirationDate: Date
  credentialStatus?: any
  credentialRefresh?: any
}
