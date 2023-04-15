import assert from 'assert'
import { v1 } from 'uuid'

import { UserInterface } from '@etherealengine/common/src/interfaces/User'
import { destroyEngine } from '@etherealengine/engine/src/ecs/classes/Engine'

import { Application } from '../../../declarations'
import { createFeathersExpressApp } from '../../createApp'

describe('user-kick.test', () => {
  let app: Application
  before(async () => {
    app = createFeathersExpressApp()
    await app.setup()
  })

  after(() => {
    return destroyEngine()
  })

  let user: UserInterface

  before(async () => {
    const name = `Test #${v1()}`
    const avatarName = 'CyberbotGreen'
    const isGuest = false

    const avatar = await app.service('avatar').create({
      name: avatarName
    })

    user = (await app.service('user').create({
      name,
      avatarId: avatar.id,
      isGuest
    })) as UserInterface
  })

  it('should create a new user-kick', async () => {
    const item = await app.service('user-kick').create({ duration: '1000' })

    console.log('item was', item)

    assert.ok(true)
  })
})
