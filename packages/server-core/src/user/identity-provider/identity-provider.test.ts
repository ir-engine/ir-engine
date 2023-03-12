import assert from 'assert'
import { v1 } from 'uuid'

import { destroyEngine } from '@etherealengine/engine/src/ecs/classes/Engine'

import { Application } from '../../../declarations'
import { createFeathersExpressApp } from '../../createApp'

let userId: string

describe('identity-provider service', () => {
  let app: Application
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
  })

  it('should remove identity providers', async () => {
    const item = await app.service('identity-provider').remove(null, {
      query: {
        userId
      }
    })

    assert.ok(item, 'Identity provider item is removed')
  })

  it('should not be able to remove the only identity provider', async () => {
    const type = 'guest'
    const token = v1()

    const item = await app.service('identity-provider').create(
      {
        type,
        token
      },
      {}
    )

    userId = item.userId

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
})
