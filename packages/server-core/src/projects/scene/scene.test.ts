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

import { parseStorageProviderURLs } from '@etherealengine/engine/src/common/functions/parseSceneJSON'
import { destroyEngine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { ProjectType, projectPath } from '@etherealengine/engine/src/schemas/projects/project.schema'
import { sceneDataPath } from '@etherealengine/engine/src/schemas/projects/scene-data.schema'
import { sceneUploadPath } from '@etherealengine/engine/src/schemas/projects/scene-upload.schema'
import { SceneID, SceneJsonType, scenePath } from '@etherealengine/engine/src/schemas/projects/scene.schema'
import defaultSceneSeed from '@etherealengine/projects/default-project/default.scene.json'
import assert from 'assert'
import { v1 } from 'uuid'
import { Application } from '../../../declarations'
import { createFeathersKoaApp } from '../../createApp'

describe('scene.test', () => {
  let app: Application
  let projectName: string
  let projectId: string
  let sceneId: SceneID
  let sceneName: string
  let sceneData: SceneJsonType
  let parsedSceneData: Record<string, unknown>
  const params = { isInternal: true }

  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()
  })

  before(async () => {
    projectName = `test-scene-project-${v1()}`
    sceneName = `test-scene-name-${v1()}`
    sceneData = structuredClone(defaultSceneSeed) as unknown as SceneJsonType
    parsedSceneData = parseStorageProviderURLs(structuredClone(defaultSceneSeed))
    projectId = (await app.service(projectPath).create({ name: projectName })).id
    const scene = await app
      .service(sceneUploadPath)
      .create({ projectId: projectId, name: sceneName, sceneData, projectName }, { files: [], ...params })
    sceneId = scene.id
  })

  after(async () => {
    const foundProjects = (await app
      .service(projectPath)
      .find({ query: { name: projectName }, paginate: false })) as ProjectType[]
    await app.service(projectPath).remove(foundProjects[0].id, { ...params })
    await destroyEngine()
  })

  // describe('"scene" service', () => {
  //   it('should create scene entry in table', async () => {
  //     const sceneResult = await app
  //       .service(scenePath)
  //       .create({ projectId, name: sceneName, scenePath: 'scene', thumbnailPath: 'thumbnail', envMapPath: 'envmap' })
  //     sceneId = sceneResult.id
  //     assert.equal(sceneResult.name, sceneName)
  //     assert.equal(sceneResult.projectId, projectId)
  //     assert.equal(sceneResult.scenePath, 'scene')
  //     assert.equal(sceneResult.thumbnailPath, 'thumbnail')
  //     assert.equal(sceneResult.envMapPath, 'envmap')
  //   })
  // })

  describe('"scene-data" service', () => {
    it('should get scene data', async () => {
      const data = await app.service(sceneDataPath).get(sceneId)
      assert.equal(data.name, sceneName)
      assert.equal(data.project, projectName)
      assert.deepStrictEqual(data.scene, parsedSceneData)
    })

    it('should add a new scene', async () => {
      const sceneName2 = `test-apartment-scene-${v1()}`
      const addedScene = await app.service(sceneDataPath).update(null, { name: sceneName2, projectName, sceneData })
      sceneId = addedScene.id
      const addedSceneData = await app.service(sceneDataPath).get(sceneId)
      assert.equal(addedSceneData.name, sceneName2)
      assert.equal(addedSceneData.project, projectName)
      assert.deepStrictEqual(addedSceneData.scene, parsedSceneData)
    })

    it('should save or update an existing scene', async () => {
      const newSceneData = structuredClone(defaultSceneSeed) as unknown as SceneJsonType
      const updatedVersion = Math.floor(Math.random() * 100)
      newSceneData.version = updatedVersion
      const newParsedSceneData = parseStorageProviderURLs(structuredClone(newSceneData))

      const updatedScene = await app
        .service(sceneDataPath)
        .update(null, { name: sceneName, projectName, sceneData: newSceneData })

      const updatedSceneData = await app.service(sceneDataPath).get(updatedScene.id)
      assert.equal(updatedSceneData.scene.version, updatedVersion)
      assert.equal(updatedSceneData.name, sceneName)
      assert.equal(updatedSceneData.project, projectName)
      assert.deepStrictEqual(updatedSceneData.scene, newParsedSceneData)
    })

    it('should remove the scene', async () => {
      await app.service(scenePath).remove(sceneId)
      assert.rejects(async () => {
        await app.service(scenePath).get(sceneId)
      })
    })
  })
})
