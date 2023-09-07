/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import appRootPath from 'app-root-path'
import assert from 'assert'
import _ from 'lodash'
import path from 'path'

import { destroyEngine } from '@etherealengine/engine/src/ecs/classes/Engine'
import defaultSceneSeed from '@etherealengine/projects/default-project/default.scene.json'

import { parseStorageProviderURLs } from '@etherealengine/engine/src/common/functions/parseSceneJSON'
import { projectPath } from '@etherealengine/engine/src/schemas/projects/project.schema'
import { Application } from '../../../declarations'
import { createFeathersKoaApp } from '../../createApp'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import { deleteFolderRecursive } from '../../util/fsHelperFunctions'
import { copyDefaultProject, uploadLocalProjectToProvider } from '../project/project.class'

const defaultProjectName = 'default-project'
const defaultSceneName = 'default'

const newProjectName = 'SceneTest_test_project_name'
const newSceneName = 'SceneTest_test_scene_name'
const newestSceneName = 'SceneTest_test_scene_rename'

const params = { isInternal: true } as any

describe('scene.test', () => {
  let app: Application
  let parsedData

  before(async () => {
    const projectDir = path.resolve(appRootPath.path, `packages/projects/projects/${newProjectName}/`)
    deleteFolderRecursive(projectDir)
    app = createFeathersKoaApp()
    await app.setup()
    copyDefaultProject()
    await uploadLocalProjectToProvider(app, defaultProjectName)
    parsedData = Object.assign({}, parseStorageProviderURLs(_.cloneDeep(defaultSceneSeed)))
  })
  after(() => {
    return destroyEngine()
  })

  describe("'scene-data' service", () => {
    describe('get', () => {
      it('should get default test scene', async function () {
        const { data } = await app.service('scene-data').get(
          {
            projectName: defaultProjectName,
            metadataOnly: false
          },
          params
        )
        console.log('scene-data data', data)
        assert.deepStrictEqual(parsedData, data.find((entry) => entry.name === defaultSceneName)!.scene)
      })
    })

    describe('find', () => {
      it('should get all scenes for a project scenes', async function () {
        const { data } = await app.service('scene-data').find({
          ...params
        })
        assert.deepStrictEqual(parsedData, data.find((entry) => entry.name === defaultSceneName)!.scene)
        assert(data.length > 0)
        data.forEach((scene) => {
          assert(typeof scene.name === 'string')
          assert(typeof scene.project === 'string')
          assert(typeof scene.thumbnailUrl === 'string')
          assert(typeof scene.scene === 'object')
        })
      })

      it('should get all scenes for a project scenes with metadata only', async function () {
        const { data } = await app.service('scene-data').find({
          ...params,
          metadataOnly: true
        })
        assert(data.length > 0)
        data.forEach((scene) => {
          assert(typeof scene.name === 'string')
          assert(typeof scene.project === 'string')
          assert(typeof scene.thumbnailUrl === 'string')
          assert(typeof scene.scene === 'undefined')
        })
      })
    })
  })

  describe("'scene' service", () => {
    before(async () => {
      await app.service(projectPath).create(
        {
          name: newProjectName
        },
        params
      )
    })

    after(async () => {
      const { data } = await app.service(projectPath).find({ ...params, query: { name: newProjectName } })
      await app.service(projectPath).remove(data[0].id, params)
    })

    describe('get', () => {
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
        assert(entities.length)
      })
    })

    describe('update', () => {
      it('should add new scene', async function () {
        await app.service('scene').update(
          newProjectName,
          {
            sceneName: newSceneName,
            sceneData: parsedData
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

        // For some reason, parsedData was reverting to un-replaced URLs.
        // This just
        const storageProvider = getStorageProvider()
        parsedData = Object.assign({}, parseStorageProviderURLs(_.cloneDeep(defaultSceneSeed)))

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
    })

    describe('patch', () => {
      it('should rename scene', async function () {
        await app
          .service('scene')
          .patch(
            null,
            { newSceneName: newestSceneName, oldSceneName: newSceneName, projectName: newProjectName },
            params
          )
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
    })

    describe('remove', () => {
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
    })
  })
})
