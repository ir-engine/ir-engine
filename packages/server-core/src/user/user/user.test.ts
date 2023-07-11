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

import { UserInterface } from '@etherealengine/common/src/interfaces/User'
import { destroyEngine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { avatarPath } from '@etherealengine/engine/src/schemas/user/avatar.schema'

import { Application } from '../../../declarations'
import { createFeathersKoaApp } from '../../createApp'

let users: any = []

describe('user service', () => {
  let app: Application
  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()
  })
  after(() => {
    return destroyEngine()
  })

  it('registered the service', async () => {
    const service = await app.service('user')
    assert.ok(service, 'Registered the service')
  })

  it('should create a user with guest role', async () => {
    const name = `Test #${Math.random()}`
    const avatarName = 'CyberbotGreen'
    const isGuest = true

    const avatar = await app.service(avatarPath).create({
      name: avatarName
    })

    const item = (await app.service('user').create({
      name,
      avatarId: avatar.id,
      isGuest
    })) as UserInterface
    users.push(item)

    assert.equal(item.name, name)
    assert.equal(item.avatarId, avatar.id)
    assert.equal(item.isGuest, isGuest)
    assert.ok(item.id)
  })

  it('should create a user with user role', async () => {
    const name = `Test #${Math.random()}`
    const avatarName = 'CyberbotGreen'
    const isGuest = false

    const avatar = await app.service(avatarPath).create({
      name: avatarName
    })

    const item = (await app.service('user').create({
      name,
      avatarId: avatar.id,
      isGuest
    })) as UserInterface
    users.push(item)

    assert.equal(item.name, name)
    assert.equal(item.avatarId, avatar.id)
    assert.equal(item.isGuest, isGuest)
    assert.ok(item.id)
  })

  it('should find users', async () => {
    for (const user of users) {
      const item = await app.service('user').find({
        query: {
          id: user.id
        },
        isInternal: true
      })

      assert.ok(item, 'user item is found')
    }
  })

  it('should find users by action invite-code-lookup', async () => {
    const item = await app.service('user').find({
      query: {
        action: 'invite-code-lookup'
      },
      isInternal: true
    })

    assert.ok(item, 'user items is found')
  })

  it('should patch users', async () => {
    for (const user of users) {
      const newName = v1()
      await app.service('user').patch(
        user.id,
        {
          name: newName
        },
        {
          isInternal: true
        } as any
      )
      const { name } = await app.service('user').get(user.id)
      assert.equal(newName, name)
    }
  })

  it('should patch a user with a query without affecting users not part of that query', async () => {
    const newName = v1()
    const user1 = users[0]
    const user2 = users[1]
    await app.service('user').patch(
      null,
      {
        name: newName
      },
      {
        query: {
          id: user1.id
        }
      }
    )
    const updatedUser1 = await app.service('user').get(user1.id)
    const updatedUser2 = await app.service('user').get(user2.id)
    assert.equal(newName, updatedUser1.name)
    assert.notEqual(newName, updatedUser2.name)
  })

  it('should remove users', async () => {
    for (const user of users) {
      const item = await app.service('user').remove(user.id)
      assert.ok(item, 'user item is removed')
    }
  })
})
