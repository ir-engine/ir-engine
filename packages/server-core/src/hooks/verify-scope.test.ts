import { HookContext } from '@feathersjs/feathers/lib'
import assert from 'assert'

import { Application } from '../../declarations'
import { createFeathersExpressApp } from '../createApp'
import { UserDataType } from '../user/user/user.class'
import { UnauthorizedException } from '../util/exceptions/exception'
import verifyScope from './verify-scope'

const mockUserHookContext = (user: UserDataType, app: Application) => {
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
    app = createFeathersExpressApp()
    await app.setup()
  })

  it('should fail if user does not have scope', async () => {
    const name = `Test #${Math.random()}`
    const avatarId = 'CyberbotGreen #${Math.random()}'
    const userRole = 'guest'

    const user = (await app.service('user').create({
      name,
      avatarId,
      userRole
    })) as UserDataType

    const verifyLocationReadScope = verifyScope('location', 'read')
    const hookContext = mockUserHookContext(user, app)

    assert.rejects(() => verifyLocationReadScope(hookContext), UnauthorizedException)

    // cleanup
    await app.service('user').remove(user.id!)
  })

  it('should verify guest has scope', async () => {
    const name = `Test #${Math.random()}`
    const avatarId = 'CyberbotGreen #${Math.random()}'
    const userRole = 'guest'

    const user = (await app.service('user').create({
      name,
      avatarId,
      userRole
    })) as UserDataType

    await app.service('scope').create({
      type: 'location:read',
      userId: user.id
    })

    const verifyLocationReadScope = verifyScope('location', 'read')
    const hookContext = mockUserHookContext(user, app)

    assert.doesNotThrow(() => verifyLocationReadScope(hookContext))

    // cleanup
    await app.service('user').remove(user.id!)
  })

  it('should verify user has scope', async () => {
    const name = `Test #${Math.random()}`
    const avatarId = 'CyberbotGreen #${Math.random()}'
    const userRole = 'user'

    const user = (await app.service('user').create({
      name,
      avatarId,
      userRole
    })) as UserDataType

    await app.service('scope').create({
      type: 'location:read',
      userId: user.id
    })

    const verifyLocationReadScope = verifyScope('location', 'read')
    const hookContext = mockUserHookContext(user, app)

    assert.doesNotThrow(() => verifyLocationReadScope(hookContext))

    // cleanup
    await app.service('user').remove(user.id!)
  })

  it('should verify admin', async () => {
    const name = `Test #${Math.random()}`
    const avatarId = 'CyberbotGreen #${Math.random()}'
    const userRole = 'admin'

    const user = (await app.service('user').create({
      name,
      avatarId,
      userRole
    })) as UserDataType

    const verifyLocationReadScope = verifyScope('location', 'read')
    const hookContext = mockUserHookContext(user, app)

    assert.doesNotThrow(() => verifyLocationReadScope(hookContext))

    // cleanup
    await app.service('user').remove(user.id!)
  })

  it('should verify if isInternal', () => {
    const verifyLocationReadScope = verifyScope('location', 'read')
    const hookContext = mockUserHookContext(null!, app)
    hookContext.params.isInternal = true

    assert.doesNotThrow(() => verifyLocationReadScope(hookContext))
  })
})
