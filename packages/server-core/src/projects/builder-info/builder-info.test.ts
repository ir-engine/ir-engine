import { destroyEngine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { builderInfoPath } from '@etherealengine/engine/src/schemas/projects/builder-info.schema'
import assert from 'assert'
import { Application } from '../../../declarations'
import { createFeathersKoaApp } from '../../createApp'
import { getEnginePackageJson } from '../project/project-helper'

describe('builder-info.test', () => {
  let app: Application

  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()
  })

  after(async () => {
    await destroyEngine()
  })

  it('should get the builder info', async () => {
    const builderInfo = await app.service(builderInfoPath).get()
    assert.equal(builderInfo.engineVersion, getEnginePackageJson().version)
  })
})
