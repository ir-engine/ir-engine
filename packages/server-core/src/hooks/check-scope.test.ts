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

import '../patchEngineNode'

import { HookContext } from '@feathersjs/feathers/lib'
import assert from 'assert'
import { afterAll, beforeAll, describe, it } from 'vitest'

import { scopePath, ScopeType } from '@ir-engine/common/src/schemas/scope/scope.schema'
import { InviteCode, UserName, userPath, UserType } from '@ir-engine/common/src/schemas/user/user.schema'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'

import { Application } from '../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../createApp'
import checkScope from './check-scope'

const mockUserHookContext = (user: UserType, app: Application) => {
  return {
    app,
    params: {
      user
    }
  } as unknown as HookContext<Application>
}

describe('check-scope', () => {
  let app: Application
  beforeAll(async () => {
    app = await createFeathersKoaApp()
    await app.setup()
  })

  afterAll(async () => {
    await tearDownAPI()
    destroyEngine()
  })

  it('should return false if user does not have scope', async () => {
    const name = `Test #${Math.random()}` as UserName
    const isGuest = true

    let user = await app.service(userPath).create({
      name,
      isGuest,
      inviteCode: '' as InviteCode
    })

    user = await app.service(userPath).get(user.id, { user })

    const checkLocationReadScope = checkScope('location', 'read')
    const hookContext = mockUserHookContext(user, app)

    const hasScope = await checkLocationReadScope(hookContext)
    assert.equal(hasScope, false)

    // cleanup
    await app.service(userPath).remove(user.id!)
  })

  it('should return true if guest has scope', async () => {
    const name = `Test #${Math.random()}` as UserName
    const isGuest = true

    let user = await app.service(userPath).create({
      name,
      isGuest,
      inviteCode: '' as InviteCode
    })

    await app.service(scopePath).create({
      type: 'location:read' as ScopeType,
      userId: user.id
    })

    user = await app.service(userPath).get(user.id, { user })

    const checkLocationReadScope = checkScope('location', 'read')
    const hookContext = mockUserHookContext(user, app)

    const hasScope = await checkLocationReadScope(hookContext)
    assert.equal(hasScope, true)

    // cleanup
    await app.service(userPath).remove(user.id!)
  })

  it('should return true if user has scope', async () => {
    const name = `Test #${Math.random()}` as UserName
    const isGuest = false

    let user = await app.service(userPath).create({
      name,
      isGuest,
      inviteCode: '' as InviteCode
    })

    await app.service(scopePath).create({
      type: 'location:read' as ScopeType,
      userId: user.id
    })

    user = await app.service(userPath).get(user.id, { user })

    const checkLocationReadScope = checkScope('location', 'read')
    const hookContext = mockUserHookContext(user, app)

    const hasScope = await checkLocationReadScope(hookContext)
    assert.equal(hasScope, true)

    // cleanup
    await app.service(userPath).remove(user.id!)
  })

  it('should return true if admin', async () => {
    const name = `Test #${Math.random()}` as UserName
    const isGuest = false

    let user = await app.service(userPath).create({
      name,
      isGuest,
      inviteCode: '' as InviteCode
    })

    await app.service(scopePath).create({
      type: 'location:read' as ScopeType,
      userId: user.id
    })

    await app.service(scopePath).create({
      type: 'admin:admin' as ScopeType,
      userId: user.id
    })

    user = await app.service(userPath).get(user.id, { user })

    const checkLocationReadScope = checkScope('location', 'read')
    const hookContext = mockUserHookContext(user, app)

    const hasScope = await checkLocationReadScope(hookContext)
    assert.equal(hasScope, true)

    // cleanup
    await app.service(userPath).remove(user.id!)
  })

  it('should return true if isInternal', async () => {
    const checkLocationReadScope = checkScope('location', 'read')
    const hookContext = mockUserHookContext(null!, app)
    hookContext.params.isInternal = true

    const hasScope = await checkLocationReadScope(hookContext)
    assert.equal(hasScope, true)
  })
})
