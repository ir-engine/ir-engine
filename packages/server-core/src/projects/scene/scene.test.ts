import appRootPath from 'app-root-path'
import assert from 'assert'
import _ from 'lodash'
import path from 'path'

import defaultSceneSeed from '@xrengine/projects/default-project/default.scene.json'

import { Application } from '../../../declarations'
import { createFeathersExpressApp } from '../../createApp'
import { useStorageProvider } from '../../media/storageprovider/storageprovider'
import { deleteFolderRecursive } from '../../util/fsHelperFunctions'
import { parseSceneDataCacheURLs } from './scene-parser'

const storageProvider = useStorageProvider()
const parsedData = parseSceneDataCacheURLs(_.cloneDeep(defaultSceneSeed) as any, storageProvider.cacheDomain)

const defaultProjectName = 'default-project'
const defaultSceneName = 'default'
const newProjectName = 'test_project_name'
const newSceneName = 'test_scene_name'
const newestSceneName = 'test_scene_rename'

const params = { isInternal: true }

describe('scene.test', () => {
  let app: Application
  before(() => {
    app = createFeathersExpressApp()
  })

  // wait for initial project loading to occur in CI/CD
  before(async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000))
  })

  it('should have default test scene', async function () {
    const { data } = await app.service('scenes').get(
      {
        projectName: defaultProjectName,
        metadataOnly: false,
        internal: true
      },
      params
    )
    assert.deepStrictEqual(parsedData, data.find((entry) => entry.name === defaultSceneName)!.scene)
  })

  it('should get default scene data', async function () {
    const { data } = await app.service('scene').get(
      {
        projectName: defaultProjectName,
        sceneName: defaultSceneName,
        metadataOnly: false
      },
      params
    )
    const entities = Object.values(data.scene!.entities)
    assert.strictEqual(entities.length, 8)
  })

  it('should add new project', async function () {
    await app.service('project').create(
      {
        name: newProjectName
      },
      params
    )
    const { data } = await app.service('project').get(newProjectName, params)
    assert.strictEqual(data.name, newProjectName)
  })

  it('should add new scene', async function () {
    await app.service('scene').update(
      newProjectName,
      {
        sceneName: newSceneName
      },
      params
    )
    const { data } = await app.service('scene').get(
      {
        projectName: newProjectName,
        sceneName: newSceneName,
        metadataOnly: false
      },
      params
    )
    assert.strictEqual(data.name, newSceneName)
    assert.deepStrictEqual(data.scene, parsedData)
  })

  it('should save scene', async function () {
    await app.service('scene').update(
      newProjectName,
      {
        sceneData: _.cloneDeep(parsedData),
        sceneName: newSceneName
      },
      params
    )
    const { data } = await app.service('scene').get(
      {
        projectName: newProjectName,
        sceneName: newSceneName,
        metadataOnly: false
      },
      params
    )
    assert.deepStrictEqual(data.name, newSceneName)
    assert.deepStrictEqual(data.scene, parsedData)
  })

  it('should rename scene', async function () {
    await app
      .service('scene')
      .patch(null, { newSceneName: newestSceneName, oldSceneName: newSceneName, projectName: newProjectName }, params)
    const { data } = await app.service('scene').get(
      {
        projectName: newProjectName,
        sceneName: newestSceneName,
        metadataOnly: false
      },
      params
    )
    assert.strictEqual(data.name, newestSceneName)
  })

  it('should remove scene', async function () {
    await app.service('scene').remove(
      {
        projectName: newProjectName,
        sceneName: newSceneName
      },
      params
    )
    assert.rejects(async () => {
      await app.service('scene').get(
        {
          projectName: newProjectName,
          sceneName: newSceneName,
          metadataOnly: true
        },
        params
      )
    })
  })

  it('should remove project', async function () {
    const { data } = await app.service('project').get(newProjectName, params)
    await app.service('project').remove(data.id, params)
    const project = await app.service('project').get(newProjectName, params)
    assert.strictEqual(project, null)
  })

  after(() => {
    const projectDir = path.resolve(appRootPath.path, `packages/projects/projects/${newProjectName}/`)
    deleteFolderRecursive(projectDir)
  })
})
