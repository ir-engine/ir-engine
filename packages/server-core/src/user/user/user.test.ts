import assert from 'assert'
import { v1 } from 'uuid'

import { createApp } from '../../../../server/src/app'
import { Application } from '../../../declarations'

let users: any = []

describe('user service', () => {
  let app: Application
  before(async () => {
    app = createApp()
    await app.setup()
  })

  it('registered the service', async () => {
    const service = await app.service('user')
    assert.ok(service, 'Registered the service')
  })

  it('should create a user with guest role', async () => {
    const name = `Test #${Math.random()}`
    const avatarId = 'CyberbotGreen'
    const userRole = 'guest'

    const item = await app.service('user').create({
      name,
      avatarId,
      userRole
    })
    users.push(item)

    assert.equal(item.name, name)
    assert.equal(item.avatarId, avatarId)
    assert.equal(item.userRole, userRole)
    assert.ok(item.id)
  })

  it('should create a user with user role', async () => {
    const name = `Test #${Math.random()}`
    const avatarId = 'CyberbotGreen'
    const userRole = 'user'

    const item = await app.service('user').create({
      name,
      avatarId,
      userRole
    })
    users.push(item)

    assert.equal(item.name, name)
    assert.equal(item.avatarId, avatarId)
    assert.equal(item.userRole, userRole)
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
        }
      )
      const { name } = await app.service('user').get(user.id)
      assert.equal(newName, name)
    }
  })

  it('should remove users', async () => {
    for (const user of users) {
      const item = await app.service('user').remove(user.id)
      assert.ok(item, 'user item is removed')
    }
  })
})
