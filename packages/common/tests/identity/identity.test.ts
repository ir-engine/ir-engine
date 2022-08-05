import assert from 'assert'

import { generateDid } from '../../src/identity'

const CREDENTIAL_SIGNING_SECRET_KEY_SEED = 'z1AZK4h5w5YZkKYEgqtcFfvSbWQ3tZ3ZFgmLsXMZsTVoeK7'

describe('identity', () => {
  it('generates a did', async () => {
    const { didDocument, keyPairs, methodFor } = await generateDid(CREDENTIAL_SIGNING_SECRET_KEY_SEED)
    assert.equal(didDocument.id, 'did:key:z6Mkfeco2NSEPeFV3DkjNSabaCza1EoS3CmqLb1eJ5BriiaR')

    const keyId = didDocument.assertionMethod![0]
    const keyPair = keyPairs.get(keyId) as any
    assert.equal(keyPair.type, 'Ed25519VerificationKey2020')
    assert.equal(keyPair.controller, 'did:key:z6Mkfeco2NSEPeFV3DkjNSabaCza1EoS3CmqLb1eJ5BriiaR')

    const signingKey = methodFor({ purpose: 'assertionMethod' }) as any
    assert.equal(
      signingKey.privateKeyMultibase,
      'zrv1WyGTYHqjHHHD8FuYbnMBsReXBXTbrqZrpfTHNFpeCKS1MDcGUodNfBmihrCiSwY7fxPnsGjCoVZ3e9pGLYHWREM'
    )
  })
})
