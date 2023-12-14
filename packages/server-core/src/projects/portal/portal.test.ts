import { destroyEngine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { PortalType, portalPath } from '@etherealengine/engine/src/schemas/projects/portal.schema'
import assert from 'assert'
import { Application } from '../../../declarations'
import { createFeathersKoaApp } from '../../createApp'

describe('portal.test', () => {
  let app: Application

  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()
  })

  after(async () => {
    await destroyEngine()
  })

  let apartmentPortal: PortalType

  it('should find the portals', async () => {
    const foundPortals = (await app.service(portalPath).find()) as { data: PortalType[]; total: number }

    apartmentPortal = foundPortals.data.find((portal) => portal.sceneName === 'apartment')!

    assert.ok(foundPortals.total > 0)
    assert.ok(apartmentPortal)
  })

  it('should get the portal', async () => {
    const foundApartmentPortal = await app
      .service(portalPath)
      .get(apartmentPortal.portalEntityId, { query: { locationName: 'apartment' } })
    assert.equal(foundApartmentPortal.portalEntityId, apartmentPortal.portalEntityId)
    assert.equal(foundApartmentPortal.previewImageURL, apartmentPortal.previewImageURL)
    assert.equal(foundApartmentPortal.sceneName, apartmentPortal.sceneName)
  })
})
