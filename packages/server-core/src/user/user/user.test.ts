import assert from 'assert'
import { v1 } from 'uuid'
import app from '../../../../server/src/app'

let users: any = []

describe('user service', () => {
  before(async () => {})

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
    users.forEach(async (user) => {
      const item = await app.service('user').find({
        query: {
          id: user.id
        }
      })

      assert.ok(item, 'user item is found')
    })
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
      }
    })

    assert.ok(item, 'user items is found')
  })

  it('should patch users', async () => {
    const partyId = v1()
    users.forEach(async (user) => {
      await app.service('user').patch(user.id, {
        instanceId: partyId
      })
    })
  })

  it('should remove users', async () => {
    users.forEach(async (user) => {
      const item = await app.service('user').remove(null, {
        query: {
          id: user.id
        }
      })
      assert.ok(item, 'user item is removed')
    })
  })
})
