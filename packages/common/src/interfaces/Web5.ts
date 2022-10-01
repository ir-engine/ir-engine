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
