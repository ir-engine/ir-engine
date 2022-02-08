import assert from 'assert'
import { v1 } from 'uuid'
import app from '../../../../server/src/app'

let providers: any = []

describe('identity-provider service', () => {
  before(async () => {
    await app.setup()
  })

  it('registered the service', async () => {
    const service = await app.service('identity-provider')
    assert.ok(service, 'Registered the service')
  })

  it('should create an identity provider for guest', async () => {
    const type = 'guest'
    const token = v1()

    const item = await app.service('identity-provider').create(
      {
        type,
        token
      },
      {}
    )
    providers.push(item)

    assert.equal(item.type, type)
    assert.equal(item.token, token)
    assert.ok(item.userId)
  })

  it('should create an identity provider for email', async () => {
    const type = 'email'
    const token = `${v1()}@xrengine.io`

    const item = await app.service('identity-provider').create(
      {
        type,
        token
      },
      {}
    )
    providers.push(item)

    assert.equal(item.type, type)
    assert.equal(item.token, token)
    assert.ok(item.userId)
  })

  it('should create an identity provider for password', async () => {
    const type = 'password'
    const token = `${v1()}@xrengine.io`
    const password = 'test@123'

    const item = await app.service('identity-provider').create(
      {
        type,
        token,
        password
      },
      {}
    )
    providers.push(item)

    assert.equal(item.type, type)
    assert.equal(item.token, token)
    assert.ok(item.userId)
  })

  it('should find identity providers', async () => {
    providers.forEach(async (provider) => {
      const item = await app.service('identity-provider').find({
        query: {
          userId: provider.userId
        }
      })

      assert.ok(item, 'Identity provider item is found')
    })
  })

  it('should remove identity providers', async () => {
    providers.forEach(async (provider) => {
      const item = await app.service('identity-provider').remove(null, {
        query: {
          userId: provider.userId
        }
      })
      assert.ok(item, 'Identity provider item is removed')
    })
  })
})
