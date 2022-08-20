import { HookContext } from '@feathersjs/feathers/lib'
import assert from 'assert'

import { UserInterface } from '@xrengine/common/src/interfaces/User'

import { Application } from '../../declarations'
import { createFeathersExpressApp } from '../createApp'
import { UnauthorizedException } from '../util/exceptions/exception'
import verifyScope from './verify-scope'

const mockUserHookContext = (user: UserInterface, app: Application) => {
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
    const avatarName = `CyberbotGreen #${Math.random()}`
    const isGuest = true

    const avatar = await app.service('avatar').create({
      name: avatarName
    })
    let user = (await app.service('user').create({
      name,
      avatarId: avatar.id,
      isGuest
    })) as UserInterface

    user = await app.service('user').get(user.id)

    const verifyLocationReadScope = verifyScope('location', 'read')
    const hookContext = mockUserHookContext(user, app)

    assert.rejects(() => verifyLocationReadScope(hookContext), UnauthorizedException)

    // cleanup
    await app.service('user').remove(user.id!)
  })

  it('should verify guest has scope', async () => {
    const name = `Test #${Math.random()}`
    const avatarName = `CyberbotGreen #${Math.random()}`
    const isGuest = true

    const avatar = await app.service('avatar').create({
      name: avatarName
    })

    let user = (await app.service('user').create({
      name,
      avatarId: avatar.id,
      isGuest
    })) as UserInterface

    await app.service('scope').create({
      type: 'location:read',
      userId: user.id
    })

    user = await app.service('user').get(user.id)

    const verifyLocationReadScope = verifyScope('location', 'read')
    const hookContext = mockUserHookContext(user, app)

    assert.doesNotThrow(() => verifyLocationReadScope(hookContext))

    // cleanup
    await app.service('user').remove(user.id!)
  })

  it('should verify user has scope', async () => {
    const name = `Test #${Math.random()}`
    const avatarName = `CyberbotGreen #${Math.random()}`
    const isGuest = false

    const avatar = await app.service('avatar').create({
      name: avatarName
    })

    let user = (await app.service('user').create({
      name,
      avatarId: avatar.id,
      isGuest
    })) as UserInterface

    await app.service('scope').create({
      type: 'location:read',
      userId: user.id
    })

    user = await app.service('user').get(user.id)

    const verifyLocationReadScope = verifyScope('location', 'read')
    const hookContext = mockUserHookContext(user, app)

    assert.doesNotThrow(() => verifyLocationReadScope(hookContext))

    // cleanup
    await app.service('user').remove(user.id!)
  })

  it('should verify admin', async () => {
    const name = `Test #${Math.random()}`
    const avatarName = `CyberbotGreen #${Math.random()}`
    const isGuest = false

    const avatar = await app.service('avatar').create({
      name: avatarName
    })

    let user = (await app.service('user').create({
      name,
      avatarId: avatar.id,
      isGuest
    })) as UserInterface

    await app.service('scope').create({
      type: 'location:read',
      userId: user.id
    })

    await app.service('scope').create({
      type: 'admin:admin',
      userId: user.id
    })

    user = await app.service('user').get(user.id)

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
