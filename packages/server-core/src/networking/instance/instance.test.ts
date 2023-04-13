import { Paginated } from '@feathersjs/feathers'
import assert from 'assert'
import { v1 } from 'uuid'

import { Instance } from '@etherealengine/common/src/interfaces/Instance'
import { Location } from '@etherealengine/common/src/interfaces/Location'
import { destroyEngine } from '@etherealengine/engine/src/ecs/classes/Engine'

import { Application } from '../../../declarations'
import { createFeathersExpressApp } from '../../createApp'

const params = { isInternal: true } as any

describe('instance.test', () => {
  let app: Application

  before(async () => {
    app = createFeathersExpressApp()
    await app.setup()
  })

  after(() => {
    return destroyEngine()
  })

  let testLocation: Location
  let testInstance: Instance

  before(async () => {
    const name = `Test Location ${v1()}`
    const sceneId = `test-scene-${v1()}`

    const location_settings = await app.service('location-settings').create({})

    testLocation = await app.service('location').create(
      {
        name,
        sceneId,
        location_settings
      },
      params
    )
  })

  it('should create an instance', async () => {
    const instance = (await app.service('instance').create({ locationId: testLocation.id })) as Instance

    assert.ok(instance)
    assert.equal(instance.locationId, testLocation.id)
    assert.equal(instance.currentUsers, 0)
    assert.equal(instance.ended, false)

    testInstance = instance
  })

  it('should get that instance', async () => {
    const instance = await app.service('instance').get(testInstance.id)

    assert.ok(instance)
    assert.ok(instance.roomCode)
    assert.equal(instance.id, testInstance.id)
  })

  it('should find instances for admin', async () => {
    const instances = (await app.service('instance').find({
      action: 'admin'
    } as any)) as Paginated<Instance>

    assert.equal(instances.total, 1)
    assert.equal(instances.data[0].id, testInstance.id)
  })

  it('should find active instances', async () => {
    const activeInstances = await app
      .service('instances-active')
      .find({ query: { sceneId: testLocation.sceneId }, ...params })

    assert.equal(activeInstances.length, 1)
    assert.equal(activeInstances[0].id, testInstance.id)
    assert.equal(activeInstances[0].currentUsers, 0)
    assert.equal(activeInstances[0].location, testLocation.id)
  })
})
