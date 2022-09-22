import assert from 'assert'
import { v1 } from 'uuid'

import { UserInterface } from '@xrengine/common/src/interfaces/User'

import { Application } from '../../../declarations'
import { createFeathersExpressApp } from '../../createApp'

let users: any = []

describe('user service', () => {
  let app: Application
  before(async () => {
    app = createFeathersExpressApp()
    await app.setup()
  })

  it('registered the service', async () => {
    const service = await app.service('user')
    assert.ok(service, 'Registered the service')
  })

  it('should create a user with guest role', async () => {
    const name = `Test #${Math.random()}`
    const avatarName = 'CyberbotGreen'
    const isGuest = true

    const avatar = await app.service('avatar').create({
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

    const avatar = await app.service('avatar').create({
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

  it('should find users by action layer-users', async () => {
    const item = await app.service('user').find({
      query: {
        action: 'layer-users'
      }
    })

    assert.ok(item, 'user items is found')
  })

  it('should find users by action channel-users', async () => {
    const item = await app.service('user').find({
      query: {
        action: 'channel-users'
      }
    })

    assert.ok(item, 'user items is found')
  })

  // it('should find users by action search', async () => {
  //   const item = await app.service('user').find({
  //     query: {
  //       action: 'search',
  //       data: 'Test'
  //     },
  //   })

  //   assert.ok(item, 'user items is found')
  // })

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
