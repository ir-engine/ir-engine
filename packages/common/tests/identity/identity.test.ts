import { expect } from 'chai'

import { generateDid } from '../../src/identity'

const CREDENTIAL_SIGNING_SECRET_KEY_SEED = 'z1AZK4h5w5YZkKYEgqtcFfvSbWQ3tZ3ZFgmLsXMZsTVoeK7'

describe.only('identity', () => {
  it('generates a did', async () => {
    const { didDocument, keyPairs, methodFor } = await generateDid(CREDENTIAL_SIGNING_SECRET_KEY_SEED)
    expect(didDocument.id).to.equal('did:key:z6Mkfeco2NSEPeFV3DkjNSabaCza1EoS3CmqLb1eJ5BriiaR')

    const keyId = didDocument.assertionMethod![0]
    const keyPair = keyPairs.get(keyId) as any
    expect(keyPair).to.have.property('type', 'Ed25519VerificationKey2020')
    expect(keyPair).to.have.property('controller', 'did:key:z6Mkfeco2NSEPeFV3DkjNSabaCza1EoS3CmqLb1eJ5BriiaR')

    const signingKey = methodFor({ purpose: 'assertionMethod' })
    expect(signingKey).to.have.property(
      'privateKeyMultibase',
      'zrv1WyGTYHqjHHHD8FuYbnMBsReXBXTbrqZrpfTHNFpeCKS1MDcGUodNfBmihrCiSwY7fxPnsGjCoVZ3e9pGLYHWREM'
    )
  })
})
