import { decodeSecretKeySeed } from '@digitalcredentials/bnid'
import * as didKey from '@digitalcredentials/did-method-key'
import { Ed25519Signature2020 } from '@digitalcredentials/ed25519-signature-2020'
import vcjs from '@digitalcredentials/vc'

import { securityLoader } from '../documentLoader'

const DEFAULT_LOADER = securityLoader().build()

// Used to generate did:key from secret seed
const didKeyDriver = didKey.driver()

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

interface DidDocumentGenerateResult {
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

/**
 * Deterministically generates a DID Document and its corresponding public/private
 * key pairs from a provided secret key seed.
 *
 * @param secretKeySeed {string} - A multibase-encoded string, encoding a byte
 *   array from which a key can be deterministically generated.
 * @param didMethod {string} - A DID Method id, e.g. 'key' for 'did:key', etc.
 * @param [url] {string} - Placeholder, used for did:web type DIDs.
 */
export async function generateDid(
  secretKeySeed: string,
  didMethod: string = 'key',
  url?: string
): Promise<DidDocumentGenerateResult> {
  const didSeedBytes = decodeSeed(secretKeySeed)
  switch (didMethod) {
    case 'key':
      return didKeyDriver.generate({ seed: didSeedBytes }) as DidDocumentGenerateResult
    default:
      throw new TypeError(`Unrecognized DID method "${didMethod}".`)
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
    type: ['VerifiableCredential'],
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

/**
 * Makes a request to the server to issue a credential for a given event name and user.
 * @param eventName {string} - Name of event (to look up the VC template).
 * @param [subjectId] {string} - User's DID
 */
export async function requestVcForEvent(eventName, subjectId?): Promise<VerifiablePresentation> {
  // Typically, this would be loaded directly from an env var (or other secret mgmt mechanism)
  // And used to bootstrap a client into a hardware KMS (Key Management System)
  // In this example, the secret seed is provided directly (obviously, don't do this)
  const CREDENTIAL_SIGNING_SECRET_KEY_SEED = 'z1AZK4h5w5YZkKYEgqtcFfvSbWQ3tZ3ZFgmLsXMZsTVoeK7'

  // Generate a DID Document and corresponding key pairs from the seed
  const { didDocument, methodFor } = await generateDid(CREDENTIAL_SIGNING_SECRET_KEY_SEED)

  // 'methodFor' serves as a wrapper/getter method for public/private key pairs
  // that were generated as a result of DID Doc creation.
  // It's a way to fetch keys not by ID (since that's quite opaque/random) but
  // by their usage purpose -- assertionMethod (for signing VCs), authentication (for DID Auth),
  // keyAgreement (for encrypting), etc.
  const key = methodFor({ purpose: 'assertionMethod' }) as KeyPairDescription

  // This would typically be the Ethereal Engine's own DID, generated and cached at
  // startup from a secret.
  const issuer = didDocument.id

  const suite = new Ed25519Signature2020({ key })

  // Example VC that denotes that a user has entered a door / 3d volume
  const unsignedCredential = vcTemplates[eventName]
  unsignedCredential.issuer = issuer
  unsignedCredential.credentialSubject.id = subjectId || 'did:example:user:1234'

  const signedVc = await issueCredential(unsignedCredential, suite)

  // Wrap the VC in an unsigned Verifiable Presentation
  return {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: 'VerifiablePresentation',
    verifiableCredential: [signedVc]
  }
}

/**
 * Issues (signs) and returns an unsigned credential that is passed in.
 *
 * @param unsignedCredential {object} - An unsigned Verifiable Credential object.
 * @param cryptoSuite {LinkedDataSignature} - A Linked Data Integrity crypto suite
 *   containing a signer function (a local public/private key pair, or a handle on
 *   a remote KMS key).
 * @param [documentLoader] {function} - Required for any JSON-LD operations, the
 *   loader fetches @contexts securely, provides key object descriptions, etc.
 */
export async function issueCredential(unsignedCredential: any, cryptoSuite: any, documentLoader: any = DEFAULT_LOADER) {
  return vcjs.issue({ credential: unsignedCredential, suite: cryptoSuite, documentLoader })
}

/**
 * Decodes a secret key seed (typically passed in via ENV vars or other secret
 * management mechanisms) and turns it into a byte array, suitable for using
 * as a key seed for cryptographic generate() functions.
 *
 * @param secretKeySeed {string} - A multibase-encoded string, encoding a byte
 *   array from which a key can be deterministically generated.
 */
export function decodeSeed(secretKeySeed: string): Uint8Array {
  let secretKeySeedBytes: Uint8Array
  if (secretKeySeed.startsWith('z')) {
    // A multibase-decoded key seed, such as that generated via @digitalcredentials/did-cli
    secretKeySeedBytes = decodeSecretKeySeed({ secretKeySeed })
  } else if (secretKeySeed.length >= 32) {
    secretKeySeedBytes = new TextEncoder().encode(secretKeySeed).slice(0, 32)
  } else {
    throw TypeError('"secretKeySeed" must be at least 32 bytes, preferably multibase-encoded.')
  }

  return secretKeySeedBytes
}
