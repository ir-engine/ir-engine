import assert from 'assert'
import { v1 } from 'uuid'

import { IdentityProviderInterface } from '@etherealengine/common/src/dbmodels/IdentityProvider'
import { destroyEngine } from '@etherealengine/engine/src/ecs/classes/Engine'

import { Application } from '../../../declarations'
import { createFeathersExpressApp } from '../../createApp'

let userId: string

describe('identity-provider service', () => {
  let app: Application
  let providers: IdentityProviderInterface[] = []

  before(async () => {
    app = createFeathersExpressApp()
    await app.setup()
  })

  after(() => {
    return destroyEngine()
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

    userId = item.userId

    assert.equal(item.type, type)
    assert.equal(item.token, token)
    assert.ok(item.userId)
  })

  it('should create an identity provider for email', async () => {
    const type = 'email'
    const token = `${v1()}@etherealengine.io`

    const item = await app.service('identity-provider').create(
      {
        type,
        token,
        userId
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
    const token = `${v1()}@etherealengine.io`
    const password = 'test@123'

    const item = await app.service('identity-provider').create(
      {
        type,
        token,
        password,
        userId
      },
      {}
    )

    providers.push(item)

    assert.equal(item.type, type)
    assert.equal(item.token, token)
    assert.ok(item.userId)
  })

  it('should find identity providers', async () => {
    const item = await app.service('identity-provider').find({
      query: {
        userId
      }
    })

    assert.ok(item, 'Identity provider item is found')
    assert.equal((item as any).total, providers.length)
  })

  it('should remove an identity provider by id', async () => {
    await app.service('identity-provider').remove(providers[0].id)

    const item = await app.service('identity-provider').find({
      query: {
        id: providers[0].id
      }
    })

    assert.equal((item as any).total, 0)
  })

  it('should not be able to remove identity providers by user id', async () => {
    assert.rejects(
      () =>
        app.service('identity-provider').remove(null, {
          query: {
            userId
          }
        }),
      {
        name: 'MethodNotAllowed'
      }
    )
  })

  it('should be able to remove the only identity provider as a guest', async () => {
    const type = 'guest'
    const token = v1()

    const item = await app.service('identity-provider').create(
      {
        type,
        token
      },
      {}
    )

    assert.ok(() => app.service('identity-provider').remove(item.id))
  })

  it('should not be able to remove the only identity provider as a user', async () => {
    const type = 'user'
    const token = v1()

    const item = await app.service('identity-provider').create(
      {
        type,
        token
      },
      {}
    )

    assert.rejects(() => app.service('identity-provider').remove(item.id), {
      name: 'MethodNotAllowed'
    })
  })
})
