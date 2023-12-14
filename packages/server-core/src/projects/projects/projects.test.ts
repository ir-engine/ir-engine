import { destroyEngine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { projectsPath } from '@etherealengine/engine/src/schemas/projects/projects.schema'
import assert from 'assert'
import { Application } from '../../../declarations'
import { createFeathersKoaApp } from '../../createApp'

describe('projects.test', () => {
  let app: Application

  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()
  })

  after(async () => {
    await destroyEngine()
  })

  it('should find the projects', async () => {
    const foundProjects = await app.service(projectsPath).find()
    assert.notEqual(
      foundProjects.findIndex((project) => project === 'default-project'),
      -1
    )
  })
})
