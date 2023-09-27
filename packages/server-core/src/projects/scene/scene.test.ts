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

import { SceneJson } from '@etherealengine/common/src/interfaces/SceneInterface'
import { parseStorageProviderURLs } from '@etherealengine/engine/src/common/functions/parseSceneJSON'
import { destroyEngine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { ProjectType, projectPath } from '@etherealengine/engine/src/schemas/projects/project.schema'
import defaultSceneSeed from '@etherealengine/projects/default-project/default.scene.json'
import assert from 'assert'
import { v1 } from 'uuid'
import { Application } from '../../../declarations'
import { createFeathersKoaApp } from '../../createApp'

describe('scene.test', () => {
  let app: Application
  let projectName: string
  let sceneName: string
  let sceneData: Record<string, unknown>
  let parsedSceneData: Record<string, unknown>
  const params = { isInternal: true }

  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()
  })

  before(async () => {
    projectName = `test-scene-project-${v1()}`
    sceneName = `test-scene-name-${v1()}`
    sceneData = structuredClone(defaultSceneSeed)
    parsedSceneData = parseStorageProviderURLs(structuredClone(defaultSceneSeed))
    await app.service(projectPath).create({ name: projectName })
    await app.service('scene/upload').create({ projectName, sceneName, sceneData }, { files: [] })
  })

  after(async () => {
    const foundProjects = (await app
      .service(projectPath)
      .find({ query: { name: projectName }, paginate: false })) as ProjectType[]
    await app.service(projectPath).remove(foundProjects[0].id, { ...params })
    await destroyEngine()
  })

  describe('"scene-data" service', () => {
    it('should get the scene data', async () => {
      const { data } = await app.service('scene-data').get({ projectName, metadataOnly: false })
      assert.deepStrictEqual(parsedSceneData, data.find((scene) => scene.name === sceneName)!.scene)
    })

    it('should find the scene data', async () => {
      const { data } = await app.service('scene-data').find({ metadataOnly: false })
      assert.deepStrictEqual(parsedSceneData, data.find((entry) => entry.name === sceneName)!.scene)
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

  describe('"scene" service', () => {
    it('should get scene data', async () => {
      const { data } = await app.service('scene').get({ projectName, sceneName, metadataOnly: false })
      assert.equal(data.name, sceneName)
      assert.equal(data.project, projectName)
      assert.deepStrictEqual(data.scene, parsedSceneData)
      // const util = require('util')
      // console.log(util.inspect(parsedSceneData, { showHidden: false, depth: null, colors: true }))
    })

    it('should add a new scene', async () => {
      const sceneName = `test-apartment-scene-${v1()}`
      await app.service('scene').update(projectName, { sceneName, sceneData } as any)

      const { data: addedSceneData } = await app.service('scene').get({ projectName, sceneName, metadataOnly: false })
      assert.equal(addedSceneData.name, sceneName)
      assert.equal(addedSceneData.project, projectName)
      assert.deepStrictEqual(addedSceneData.scene, parsedSceneData)
    })

    it('should save or update an existing scene', async () => {
      const newSceneData = structuredClone(defaultSceneSeed) as unknown as SceneJson
      const updatedVersion = Math.floor(Math.random() * 100)
      newSceneData.version = updatedVersion
      const newParsedSceneData = parseStorageProviderURLs(structuredClone(newSceneData))

      await app.service('scene').update(projectName, { sceneName, sceneData: newSceneData })

      const { data: updatedSceneData } = await app.service('scene').get({ projectName, sceneName, metadataOnly: false })
      assert.equal(updatedSceneData.scene.version, updatedVersion)
      assert.equal(updatedSceneData.name, sceneName)
      assert.equal(updatedSceneData.project, projectName)
      assert.deepStrictEqual(updatedSceneData.scene, newParsedSceneData)
    })

    it('should remove the scene', async () => {
      await app.service('scene').remove({ projectName, sceneName })
      assert.rejects(async () => {
        await app.service('scene').get({ projectName, sceneName, metadataOnly: false })
      })
    })
  })
})
