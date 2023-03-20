import assert from 'assert'
import { v1 } from 'uuid'

import { destroyEngine } from '@etherealengine/engine/src/ecs/classes/Engine'

import { Application } from '../../../declarations'
import { createFeathersExpressApp } from '../../createApp'

const params = { isInternal: true } as any

describe('location.test', () => {
  let app: Application

  before(async () => {
    app = createFeathersExpressApp()
    await app.setup()
  })

  after(() => {
    return destroyEngine()
  })

  it('should create a new location', async () => {
    const name = `Test Location Name ${v1()}`
    const item = await app.service('location').create(
      {
        name
      },
      params
    )

    assert.ok(item)
    assert.equal(item.name, name)
  })
})
