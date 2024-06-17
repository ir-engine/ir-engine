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
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

import { assetPath } from '@etherealengine/common/src/schema.type.module'
import { projectPath, ProjectType } from '@etherealengine/common/src/schemas/projects/project.schema'
import { destroyEngine } from '@etherealengine/ecs/src/Engine'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import { createFeathersKoaApp } from '../../createApp'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import { getProjectManifest } from '../../projects/project/project-helper'

const projectResolvePath = path.resolve(appRootPath.path, 'packages/projects')
const fsProjectSyncEnabled = config.fsProjectSyncEnabled

describe('asset.test', () => {
  let app: Application
  let projects = [] as ProjectType[]
  const params = { isInternal: true }

  before(async () => {
    config.fsProjectSyncEnabled = true
    app = createFeathersKoaApp()
    await app.setup()
  })

  after(async () => {
    console.log('removing test projects', projects)
    await Promise.all(projects.map(project => app
        .service(projectPath)
        .remove(project.id, { ...params })))
    console.log('Removed test projects')
    await destroyEngine()
    console.log('destroyed engine')
    config.fsProjectSyncEnabled = fsProjectSyncEnabled
  })

  it('should add a new asset from default but not populate to manifest', async () => {
    const projectName = `test-scene-project-${uuidv4()}`
    const project = await app.service(projectPath).create({ name: projectName })
    projects.push(project)
    const storageProvider = getStorageProvider()
    const directory = `projects/${projectName}/public/scenes`

    const addedSceneData = await app.service(assetPath).create({
      project: projectName,
      sourceURL: 'projects/default-project/public/scenes/default.gltf',
      assetURL: directory + '/New-Scene.gltf'
    })
    assert.equal(addedSceneData.assetURL, directory + '/New-Scene.gltf')
    assert.equal(addedSceneData.projectId, project.id)
    assert(await storageProvider.doesExist('New-Scene.gltf', directory))
    assert(fs.existsSync(path.resolve(projectResolvePath, directory, 'New-Scene.gltf')))
    const manifest = getProjectManifest(projectName)
    assert(!manifest.scenes?.includes('public/scenes/New-Scene.gltf'))
  })

  it('should add a new asset from default with increment', async () => {
    const projectName = `test-scene-project-${uuidv4()}`
    const project = await app.service(projectPath).create({ name: projectName })
    projects.push(project)
    const storageProvider = getStorageProvider()
    const directory = `projects/${projectName}/public/scenes`

    const addedSceneData = await app.service(assetPath).create({
      project: projectName,
      isScene: true,
      sourceURL: 'projects/default-project/public/scenes/default.gltf',
      assetURL: directory + '/New-Scene.gltf'
    })
    assert.equal(addedSceneData.assetURL, directory + '/New-Scene.gltf')
    assert.equal(addedSceneData.projectId, project.id)
    assert(await storageProvider.doesExist('New-Scene.gltf', directory))
    assert(fs.existsSync(path.resolve(projectResolvePath, directory, 'New-Scene.gltf')))
    const manifest = getProjectManifest(projectName)
    assert(manifest.scenes!.includes('public/scenes/New-Scene.gltf'))

    const secondAddedSceneData = await app.service(assetPath).create({
      project: projectName,
      isScene: true,
      sourceURL: 'projects/default-project/public/scenes/default.gltf',
      assetURL: directory + '/New-Scene.gltf'
    })
    assert.equal(secondAddedSceneData.assetURL, directory + '/New-Scene-1.gltf')
    assert.equal(addedSceneData.projectId, project.id)
    assert(await storageProvider.doesExist('New-Scene-1.gltf', directory))

    assert(fs.existsSync(path.resolve(projectResolvePath, directory, 'New-Scene.gltf')))
    assert(fs.existsSync(path.resolve(projectResolvePath, directory, 'New-Scene-1.gltf')))
    const manifest2 = getProjectManifest(projectName)
    assert(manifest2.scenes!.includes('public/scenes/New-Scene.gltf'))
    assert(manifest2.scenes!.includes('public/scenes/New-Scene-1.gltf'))
  })

  it('should query assets by projectName', async () => {
    const projectName = `test-scene-project-${uuidv4()}`
    const project = await app.service(projectPath).create({ name: projectName })
    projects.push(project)
    const directory = `projects/${projectName}/public/scenes`

    const asset = await app.service(assetPath).create({
      project: projectName,
      isScene: true,
      sourceURL: 'projects/default-project/public/scenes/default.gltf',
      assetURL: directory + '/New-Scene.gltf'
    })

    const queryResult = await app.service(assetPath).find({ query: { project: projectName } })
    assert.equal(queryResult.data.length, 1)
    assert.equal(queryResult.data[0].projectId, project.id)
    assert.equal(queryResult.data[0].id, asset.id)
    assert.equal(queryResult.data[0].assetURL, directory + '/New-Scene.gltf')
  })

  it('should update asset name', async () => {
    const projectName = `test-scene-project-${uuidv4()}`
    const project = await app.service(projectPath).create({ name: projectName })
    projects.push(project)
    const directory = `projects/${projectName}/public/scenes`

    const asset = await app.service(assetPath).create({
      project: projectName,
      isScene: true,
      sourceURL: 'projects/default-project/public/scenes/default.gltf',
      assetURL: directory + '/New-Scene.gltf'
    })

    const queryResult = await app.service(assetPath).find({ query: { project: projectName } })
    const data = queryResult.data[0]
    const updatedData = await app
      .service(assetPath)
      .patch(data.id, { assetURL: directory + '/Updated-Scene.gltf', project: projectName }, params)
    assert.equal(updatedData.assetURL, directory + '/Updated-Scene.gltf')
    const storageProvider = getStorageProvider()
    assert(storageProvider.doesExist('Updated-Scene.gltf', directory))
    assert(!fs.existsSync(path.resolve(projectResolvePath, directory + '/New-Scene.gltf')))
    assert(fs.existsSync(path.resolve(projectResolvePath, directory + '/Updated-Scene.gltf')))
    const manifest = getProjectManifest(projectName)
    assert(!manifest.scenes!.includes('public/scenes/New-Scene.gltf'))
    assert(manifest.scenes!.includes('public/scenes/Updated-Scene.gltf'))
  })

  it('should remove asset', async () => {
    const projectName = `test-scene-project-${uuidv4()}`
    const project = await app.service(projectPath).create({ name: projectName })
    projects.push(project)
    const directory = `projects/${projectName}/public/scenes`

    await app.service(assetPath).create({
      project: projectName,
      isScene: true,
      sourceURL: 'projects/default-project/public/scenes/default.gltf',
      assetURL: directory + '/New-Scene.gltf'
    })

    const queryResult = await app.service(assetPath).find({ query: { project: projectName } })
    const data = queryResult.data[0]
    await app.service(assetPath).remove(data.id, params)
    assert.rejects(async () => await app.service(assetPath).get(data.id, params))
    const storageProvider = getStorageProvider()
    assert(!(await storageProvider.doesExist('Updated-Scene.gltf', 'projects/' + projectName)))
    assert(!fs.existsSync(path.resolve(projectResolvePath, directory + '/New-Scene.gltf')))
    const manifest = getProjectManifest(projectName)
    assert(!manifest.scenes!.includes('public/scenes/New-Scene.gltf'))
  })
})
