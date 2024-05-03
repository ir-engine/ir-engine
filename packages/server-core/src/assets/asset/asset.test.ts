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

import { isDev } from '@etherealengine/common/src/config'
import { assetPath } from '@etherealengine/common/src/schema.type.module'
import { ProjectType, projectPath } from '@etherealengine/common/src/schemas/projects/project.schema'
import { destroyEngine } from '@etherealengine/ecs/src/Engine'
import assert from 'assert'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { Application } from '../../../declarations'
import { createFeathersKoaApp } from '../../createApp'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'

describe('asset.test', () => {
  let app: Application
  let projectName: string
  let project: ProjectType
  const params = { isInternal: true }

  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()
  })

  before(async () => {
    projectName = `test-scene-project-${uuidv4()}`
    project = await app.service(projectPath).create({ name: projectName })
  })

  after(async () => {
    const foundProjects = (await app
      .service(projectPath)
      .find({ query: { name: projectName }, paginate: false })) as ProjectType[]
    await app.service(projectPath).remove(foundProjects[0].id, { ...params })
    await destroyEngine()
  })

  describe('"scene" service', () => {
    it('should add a new scene from default with increment', async () => {
      const storageProvider = getStorageProvider()

      const addedSceneData = await app.service(assetPath).create({ project: projectName })
      assert.equal(addedSceneData.assetURL, 'projects/' + projectName + '/New-Scene.gltf')
      assert.equal(addedSceneData.projectId, project.id)
      assert(storageProvider.doesExist('New-Scene.gltf', 'projects/' + projectName))

      const secondAddedSceneData = await app.service(assetPath).create({ project: projectName })
      assert.equal(secondAddedSceneData.assetURL, 'projects/' + projectName + '/New-Scene-1.gltf')
      assert.equal(addedSceneData.projectId, project.id)
      assert(storageProvider.doesExist('New-Scene-1.gltf', 'projects/' + projectName))

      if (isDev) {
        assert(fs.existsSync('projects/' + projectName + '/New-Scene.gltf'))
      }
    })

    it('should query assets by projectName', async () => {
      const queryResult = await app.service(assetPath).find({ query: { project: projectName } })
      assert.equal(queryResult.data.length, 2)
      const data = queryResult.data[0]
      assert.equal(data.projectId, project.id)
    })

    it('should update scene name', async () => {
      const queryResult = await app.service(assetPath).find({ query: { project: projectName } })
      const data = queryResult.data[0]
      const updatedData = await app.service(assetPath).patch(data.id, { name: 'Updated-Scene' }, params)
      assert.equal(updatedData.assetURL, 'projects/' + projectName + '/Updated-Scene.gltf')
      const storageProvider = getStorageProvider()
      assert(storageProvider.doesExist('Updated-Scene.gltf', 'projects/' + projectName))
      if (isDev) {
        assert(!fs.existsSync('projects/' + projectName + '/New-Scene.gltf'))
        assert(fs.existsSync('projects/' + projectName + '/Updated-Scene.gltf'))
      }
    })

    it('should remove scene', async () => {
      const queryResult = await app.service(assetPath).find({ query: { project: projectName } })
      const data = queryResult.data[0]
      await app.service(assetPath).remove(data.id, params)
      assert.rejects(async () => await app.service(assetPath).get(data.id, params))
      const storageProvider = getStorageProvider()
      assert(!(await storageProvider.doesExist('Updated-Scene.gltf', 'projects/' + projectName)))
      if (isDev) {
        assert(!fs.existsSync('projects/' + projectName + '/Updated-Scene.gltf'))
      }
    })
  })
})
