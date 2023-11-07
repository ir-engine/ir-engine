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

import { HookContext, Paginated } from '@feathersjs/feathers/lib'
import assert from 'assert'

import { destroyEngine } from '@etherealengine/engine/src/ecs/classes/Engine'

import { scopePath } from '@etherealengine/engine/src/schemas/scope/scope.schema'
import { AvatarID } from '@etherealengine/engine/src/schemas/user/avatar.schema'
import { userApiKeyPath, UserApiKeyType } from '@etherealengine/engine/src/schemas/user/user-api-key.schema'
import { UserName, userPath, UserType } from '@etherealengine/engine/src/schemas/user/user.schema'
import { Forbidden } from '@feathersjs/errors'
import { Application } from '../../declarations'
import { createFeathersKoaApp } from '../createApp'
import verifyScope from './verify-scope'

const mockUserHookContext = (user: UserType, app: Application) => {
  return {
    app,
    params: {
      user
    }
  } as unknown as HookContext<Application>
}

describe('verify-scope', () => {
  let app: Application
  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()
  })

  after(() => {
    return destroyEngine()
  })

  it('should fail if user does not have scope', async () => {
    const name = `Test #${Math.random()}` as UserName
    const isGuest = true

    let user = await app.service(userPath).create({
      name,
      isGuest,
      avatarId: '' as AvatarID,
      inviteCode: '',
      scopes: []
    })

    user = await app.service(userPath).get(user.id, { user })

    const user1ApiKeys = (await app.service(userApiKeyPath).find({
      query: {
        userId: user.id
      }
    })) as Paginated<UserApiKeyType>

    user.apiKey = user1ApiKeys.data.length > 0 ? user1ApiKeys.data[0] : user.apiKey

    const verifyLocationReadScope = verifyScope('location', 'read')
    const hookContext = mockUserHookContext(user, app)

    assert.rejects(() => verifyLocationReadScope(hookContext), Forbidden)

    // cleanup
    await app.service(userPath).remove(user.id!)
  })

  it('should verify guest has scope', async () => {
    const name = `Test #${Math.random()}` as UserName
    const isGuest = true

    let user = await app.service(userPath).create({
      name,
      isGuest,
      avatarId: '' as AvatarID,
      inviteCode: '',
      scopes: []
    })

    await app.service(scopePath).create({
      type: 'location:read',
      userId: user.id
    })

    user = await app.service(userPath).get(user.id, { user })

    const verifyLocationReadScope = verifyScope('location', 'read')
    const hookContext = mockUserHookContext(user, app)

    assert.doesNotThrow(() => verifyLocationReadScope(hookContext))

    // cleanup
    await app.service(userPath).remove(user.id!)
  })

  it('should verify user has scope', async () => {
    const name = `Test #${Math.random()}` as UserName
    const isGuest = false

    let user = await app.service(userPath).create({
      name,
      isGuest,
      avatarId: '' as AvatarID,
      inviteCode: '',
      scopes: []
    })

    await app.service(scopePath).create({
      type: 'location:read',
      userId: user.id
    })

    user = await app.service(userPath).get(user.id, { user })

    const user1ApiKeys = (await app.service(userApiKeyPath).find({
      query: {
        userId: user.id
      }
    })) as Paginated<UserApiKeyType>

    user.apiKey = user1ApiKeys.data.length > 0 ? user1ApiKeys.data[0] : user.apiKey

    const verifyLocationReadScope = verifyScope('location', 'read')
    const hookContext = mockUserHookContext(user, app)

    assert.doesNotThrow(() => verifyLocationReadScope(hookContext))

    // cleanup
    await app.service(userPath).remove(user.id!)
  })

  it('should verify admin', async () => {
    const name = `Test #${Math.random()}` as UserName
    const isGuest = false

    let user = await app.service(userPath).create({
      name,
      isGuest,
      avatarId: '' as AvatarID,
      inviteCode: '',
      scopes: []
    })

    await app.service(scopePath).create({
      type: 'location:read',
      userId: user.id
    })

    await app.service(scopePath).create({
      type: 'admin:admin',
      userId: user.id
    })

    user = await app.service(userPath).get(user.id, { user })

    const user1ApiKeys = (await app.service(userApiKeyPath).find({
      query: {
        userId: user.id
      }
    })) as Paginated<UserApiKeyType>

    user.apiKey = user1ApiKeys.data.length > 0 ? user1ApiKeys.data[0] : user.apiKey

    const verifyLocationReadScope = verifyScope('location', 'read')
    const hookContext = mockUserHookContext(user, app)

    assert.doesNotThrow(() => verifyLocationReadScope(hookContext))

    // cleanup
    await app.service(userPath).remove(user.id!)
  })

  it('should verify if isInternal', () => {
    const verifyLocationReadScope = verifyScope('location', 'read')
    const hookContext = mockUserHookContext(null!, app)
    hookContext.params.isInternal = true

    assert.doesNotThrow(() => verifyLocationReadScope(hookContext))
  })
})
