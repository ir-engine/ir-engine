import assert from 'assert'
import { v1 } from 'uuid'

import { destroyEngine } from '@etherealengine/engine/src/ecs/classes/Engine'

import { Application } from '../../../declarations'
import { createFeathersKoaApp } from '../../createApp'

const params = { isInternal: true } as any

describe('location.test', () => {
  let app: Application
  const locations: any[] = []

  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()
  })

  after(() => {
    return destroyEngine()
  })

  it('should create a new location', async () => {
    const name = `Test Location ${v1()}`

    const location_settings = await app.service('location-settings').create({})

    const item = await app.service('location').create(
      {
        name,
        location_settings
      },
      params
    )

    assert.ok(item)
    assert.equal(item.name, name)
    locations.push(item)
  })

  it('should get the new location', async () => {
    const item = await app.service('location').get(locations[0].id)

    assert.ok(item)
    assert.equal(item.name, locations[0].name)
    assert.equal(item.slugifiedName, locations[0].slugifiedName)
    assert.equal(item.isLobby, locations[0].isLobby)
  })

  it('should be able to update the location', async () => {
    const newName = `Update Test Location ${v1()}`
    const location_settings = await app.service('location-settings').create({})
    const item = await app
      .service('location')
      .patch(locations[0].id, { ...locations[0], name: newName, location_settings })

    assert.ok(item)
    assert.equal(item.name, newName)

    locations[0].name = newName
  })

  it('should not be able to make lobby if not admin', () => {
    assert.rejects(() => app.service('location').patch(locations[0].id, { isLobby: true }))
  })

  it('should be able to delete the location', async () => {
    await app.service('location').remove(locations[0].id)

    const item = await app.service('location').find({ query: { id: locations[0].id } })

    assert.equal((item as any).total, 0)
  })
})
