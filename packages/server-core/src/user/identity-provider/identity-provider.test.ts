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

import '../../patchEngineNode'

import { IdentityProviderType, identityProviderPath } from '@ir-engine/common/src/schemas/user/identity-provider.schema'
import { UserID, userPath } from '@ir-engine/common/src/schemas/user/user.schema'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'
import assert from 'assert'
import { v4 as uuidv4 } from 'uuid'
import { afterAll, beforeAll, describe, it } from 'vitest'

import { Application } from '../../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'
import { createAdmin, createUserApiKey } from '../../test-utils/user-test-utils'

describe('identity-provider.test', () => {
  let userId: UserID
  let accessToken: string
  let app: Application
  let providers: IdentityProviderType[] = []
  const testEmail = 'test@testdomain.com'

  beforeAll(async () => {
    app = await createFeathersKoaApp()
    await app.setup()
  })

  afterAll(async () => {
    await tearDownAPI()
    destroyEngine()
  })

  it('should create an identity provider for guest', async () => {
    const type = 'guest'
    const token = uuidv4()

    const createdIdentityProvider = await app.service(identityProviderPath).create({
      type,
      token,
      userId: '' as UserID
    })

    providers.push(createdIdentityProvider)

    userId = createdIdentityProvider.userId
    accessToken = createdIdentityProvider.accessToken as string

    assert.equal(createdIdentityProvider.type, type)
    assert.equal(createdIdentityProvider.token, token)
    assert.ok(createdIdentityProvider.accessToken)
  })

  it('should create an identity provider for email', async () => {
    const type = 'email'
    const token = uuidv4()

    const createdIdentityProvider = await app.service(identityProviderPath).create(
      {
        type,
        token,
        userId
      },
      {
        authentication: {
          accessToken
        }
      }
    )

    providers.push(createdIdentityProvider)

    assert.equal(createdIdentityProvider.type, type)
    assert.equal(createdIdentityProvider.token, token)
    assert.ok(createdIdentityProvider.accessToken)
    assert.equal(createdIdentityProvider.userId, userId)
  })

  it('should create an identity provider for password', async () => {
    const type = 'password'
    const token = uuidv4()

    const createdIdentityProvider = await app.service(identityProviderPath).create(
      {
        type,
        token,
        userId
      },
      {
        authentication: {
          accessToken
        }
      }
    )

    providers.push(createdIdentityProvider)

    assert.equal(createdIdentityProvider.type, type)
    assert.equal(createdIdentityProvider.token, token)
    assert.ok(createdIdentityProvider.accessToken)
    assert.equal(createdIdentityProvider.userId, userId)
  })

  it('should find identity providers', async () => {
    const foundIdentityProviders = await app.service(identityProviderPath).find({
      query: {
        userId
      },
      isInternal: true
    })

    assert.ok(foundIdentityProviders)
    assert.equal(foundIdentityProviders.total, providers.length)
  })

  it('should remove an identity provider by id', async () => {
    await app.service(identityProviderPath).remove(providers[0].id)

    const foundIdentityProviders = await app.service(identityProviderPath).find({
      query: {
        id: providers[0].id
      }
    })

    assert.equal(foundIdentityProviders.total, 0)
  })

  it('should not be able to remove identity providers by user id', async () => {
    await assert.rejects(
      async () =>
        await app.service(identityProviderPath).remove(null, {
          query: {
            userId
          },
          provider: 'rest',
          headers: {
            authorization: `Bearer ${accessToken}`
          },
          authentication: {
            strategy: 'jwt',
            accessToken: accessToken
          }
        }),
      {
        name: 'MethodNotAllowed'
      }
    )
  })

  it('should be able to remove the only identity provider as a guest', async () => {
    const type = 'guest'
    const token = uuidv4()

    const foundIdentityProvider = await app.service(identityProviderPath).create(
      {
        type,
        token,
        userId: '' as UserID
      },
      {}
    )

    assert.ok(() => app.service(identityProviderPath).remove(foundIdentityProvider.id))
  })

  it('should not be able to remove the only non-guest identity provider as a user', async () => {
    const type = 'github'
    const token = uuidv4()

    const foundIdentityProvider = await app.service(identityProviderPath).create(
      {
        type,
        token,
        userId: '' as UserID
      },
      {}
    )

    await app.service(userPath)._patch(foundIdentityProvider.userId, {
      isGuest: false
    })

    await assert.rejects(
      async () =>
        await app.service(identityProviderPath).remove(foundIdentityProvider.id, {
          provider: 'rest',
          headers: {
            authorization: `Bearer ${foundIdentityProvider.accessToken}`
          },
          authentication: {
            strategy: 'jwt',
            accessToken: foundIdentityProvider.accessToken
          }
        }),
      {
        name: 'MethodNotAllowed'
      }
    )
  })

  it('should not be able to make an identity provider on a user with no authentication', async () => {
    const type = 'guest'
    const token = uuidv4()

    await assert.rejects(
      async () =>
        await app.service(identityProviderPath).create({
          type,
          token,
          userId
        }),
      {
        name: 'BadRequest'
      }
    )
  })

  it('should not be able to make an identity provider on a different user than the authenticated user', async () => {
    const type = 'guest'
    const token = uuidv4()

    const foundIdentityProvider = await app.service(identityProviderPath).create(
      {
        type,
        token,
        userId: '' as UserID
      },
      {}
    )

    await assert.rejects(
      async () =>
        await app.service(identityProviderPath).create(
          {
            type,
            token,
            userId
          },
          {
            provider: 'rest',
            headers: {
              authorization: `Bearer ${foundIdentityProvider.accessToken}`
            },
            authentication: {
              strategy: 'jwt',
              accessToken: foundIdentityProvider.accessToken
            }
          }
        ),
      {
        name: 'BadRequest',
        message: 'Cannot make identity-providers on other users'
      }
    )
  })

  it('should not be able to make a guest identity provider on an existing user', async () => {
    const type = 'guest'
    const token = uuidv4()
    let userId2

    const foundIdentityProvider = await app.service(identityProviderPath).create(
      {
        type,
        token,
        userId: '' as UserID
      },
      {}
    )

    userId2 = foundIdentityProvider.userId

    await assert.rejects(
      async () =>
        await app.service(identityProviderPath).create(
          {
            type,
            token,
            userId: userId2
          },
          {
            provider: 'rest',
            headers: {
              authorization: `Bearer ${foundIdentityProvider.accessToken}`
            },
            authentication: {
              strategy: 'jwt',
              accessToken: foundIdentityProvider.accessToken
            }
          }
        ),
      {
        name: 'BadRequest',
        message: 'Cannot create a guest identity-provider on an existing user'
      }
    )
  })

  it('should find identity provider with exact email match', async () => {
    const appUser = await createAdmin(app)
    const adminUserApiKey = await createUserApiKey(app, appUser)
    const adminIdentityProvider = await app.service(identityProviderPath).create(
      {
        type: 'email',
        token: uuidv4(),
        userId: appUser.id,
        email: testEmail
      },
      {
        provider: 'external',
        headers: {
          authorization: `Bearer ${adminUserApiKey.token}`
        }
      }
    )
    const result = await app.service(identityProviderPath).find({
      user: appUser,
      provider: 'external',
      headers: {
        authorization: `Bearer ${adminUserApiKey.token}`
      },
      query: {
        email: testEmail
      },
      paginate: false
    })

    assert.equal(result.length, 1)
    assert.equal(result[0].id, adminIdentityProvider.id)
    assert.equal(result[0].userId, adminIdentityProvider.userId)
  })

  it('should not not return any identity provider using $like', async () => {
    const appUser = await createAdmin(app)
    const adminUserApiKey = await createUserApiKey(app, appUser)

    const result = await app.service(identityProviderPath).find({
      user: appUser,
      provider: 'external',
      headers: {
        authorization: `Bearer ${adminUserApiKey.token}`
      },
      query: {
        email: {
          $like: '%@testdomain.com%'
        }
      },
      paginate: false
    })

    assert.equal(result.length, 0)
  })

  it('should not return any identity provider using $notlike', async () => {
    const appUser = await createAdmin(app)
    const adminUserApiKey = await createUserApiKey(app, appUser)

    const result = await app.service(identityProviderPath).find({
      user: appUser,
      provider: 'external',
      headers: {
        authorization: `Bearer ${adminUserApiKey.token}`
      },
      query: {
        email: {
          $notlike: '%@domain.com%'
        }
      },
      paginate: false
    })

    assert.equal(result.length, 0)
  })
})
