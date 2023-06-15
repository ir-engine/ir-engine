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

import assert from 'assert'
import { v1 } from 'uuid'

import { IdentityProviderInterface } from '@etherealengine/common/src/dbmodels/IdentityProvider'
import { destroyEngine } from '@etherealengine/engine/src/ecs/classes/Engine'

import { Application } from '../../../declarations'
import { createFeathersKoaApp } from '../../createApp'

let userId: string

describe('identity-provider service', () => {
  let app: Application
  let providers: IdentityProviderInterface[] = []

  before(async () => {
    app = createFeathersKoaApp()
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
