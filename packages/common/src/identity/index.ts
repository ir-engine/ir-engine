import { decodeSecretKeySeed } from '@digitalcredentials/bnid'
import * as didKey from '@digitalcredentials/did-method-key'
import vcjs from '@digitalcredentials/vc'

import { securityLoader } from '../documentLoader'

const DEFAULT_LOADER = securityLoader().build()

// Used to generate did:key from secret seed
const didKeyDriver = didKey.driver()

export interface IKeyPairDescription {
  id: string
  type: string
  controller: string
  publicKeyMultibase: string
  privateKeyMultibase?: string
}

interface IDidDocument {
  '@context': string | string[]
  id: string
  verificationMethod?: IKeyPairDescription | IKeyPairDescription[]
  authentication?: string | string[] | IKeyPairDescription | IKeyPairDescription[]
  assertionMethod?: string | string[] | IKeyPairDescription | IKeyPairDescription[]
  capabilityDelegation?: string | string[] | IKeyPairDescription | IKeyPairDescription[]
  capabilityInvocation?: string | string[] | IKeyPairDescription | IKeyPairDescription[]
  keyAgreement?: string | string[] | IKeyPairDescription | IKeyPairDescription[]
  service: any | any[]
}

interface IDidDocumentGenerateResult {
  didDocument: IDidDocument
  keyPairs: Map<string, object>
  methodFor: (options: object) => object
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
): Promise<IDidDocumentGenerateResult> {
  const didSeedBytes = decodeSeed(secretKeySeed)
  switch (didMethod) {
    case 'key':
      return didKeyDriver.generate({ seed: didSeedBytes }) as IDidDocumentGenerateResult
    default:
      throw new TypeError(`Unrecognized DID method "${didMethod}".`)
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
function decodeSeed(secretKeySeed: string): Uint8Array {
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
