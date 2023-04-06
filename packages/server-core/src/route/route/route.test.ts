import appRootPath from 'app-root-path'
import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { v4 as uuid } from 'uuid'

import { destroyEngine } from '@etherealengine/engine/src/ecs/classes/Engine'

import { Application } from '../../../declarations'
import { createFeathersExpressApp } from '../../createApp'
import { deleteFolderRecursive } from '../../util/fsHelperFunctions'

const params = { isInternal: true } as any

const cleanup = async (app: Application, projectName: string) => {
  const projectDir = path.resolve(appRootPath.path, `packages/projects/projects/${projectName}/`)
  deleteFolderRecursive(projectDir)
  try {
    await app.service('project').Model.destroy({ where: { name: projectName } })
  } catch (e) {}
}

const updateXREngineConfigForTest = (newProject: string) => {
  const testXREngineConfig = `
  import type { ProjectConfigInterface } from '@etherealengine/projects/ProjectConfigInterface'

  const config: ProjectConfigInterface = {
    onEvent: undefined,
    thumbnail: '/static/etherealengine.png',
    routes: {
      test: {
        component: () => import('@etherealengine/client/src/pages/index'),
      },
      "${newProject}": {
        component: () => import('@etherealengine/client/src/pages/index'),
      }
    },
    services: undefined,
    databaseSeed: undefined
  }
  
  export default config
  `

  const projectsRootFolder = path.join(appRootPath.path, 'packages/projects/projects/')
  const projectLocalDirectory = path.resolve(projectsRootFolder, newProject)
  const xrEngineConfigFilePath = path.resolve(projectLocalDirectory, 'xrengine.config.ts')

  fs.rmSync(xrEngineConfigFilePath)
  fs.writeFileSync(xrEngineConfigFilePath, testXREngineConfig)
}

describe('route.test', () => {
  let app: Application
  let newProject: string

  before(async () => {
    app = createFeathersExpressApp()
    await app.setup()
  })

  after(async () => {
    await destroyEngine()
    await cleanup(app, newProject)
  })

  it('should find the installed project routes', async () => {
    newProject = `test-project-${uuid()}`
    await app.service('project').create({ name: newProject }, params)
    updateXREngineConfigForTest(newProject)

    const installedRoutes = await app.service('routes-installed').find()
    const route = installedRoutes.data.find((route) => route.project === newProject)

    assert.ok(route)
    assert.equal(route.project, newProject)
  })

  it('should not be activated by default (the installed project)', async () => {
    const route = await app.service('route').find({ query: { project: newProject } })
    assert.equal(route.total, 0)
  })

  it('should activate a route', async () => {
    const activateResult = await app
      .service('route-activate')
      .create({ project: newProject, route: newProject, activate: true }, params)
    const fetchResult = await app.service('route').find({ query: { project: newProject } })
    const route = fetchResult.data.find((d) => d.project === newProject)

    assert.ok(activateResult)
    assert.equal(fetchResult.total, 1)

    assert.equal(route?.project, newProject)
    assert.equal(route?.route, newProject)
  })

  it('should deactivate a route', async () => {
    await app.service('route-activate').create({ project: newProject, route: newProject, activate: false }, params)

    const route = await app.service('route').find({ query: { project: newProject } })
    assert.equal(route.total, 0)
  })
})
