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

import { Application } from '../../../declarations'

import { cleanStorageProviderURLs } from '@etherealengine/engine/src/common/functions/parseSceneJSON'
import { ProjectType, projectPath } from '@etherealengine/engine/src/schemas/projects/project.schema'
import {
  SceneCreateData,
  SceneDataPatch,
  SceneDataQuery,
  SceneDataType
} from '@etherealengine/engine/src/schemas/projects/scene-data.schema'
import { SceneID, SceneJsonType, SceneType, scenePath } from '@etherealengine/engine/src/schemas/projects/scene.schema'
import defaultSceneSeed from '@etherealengine/projects/default-project/default.scene.json'
import { Id, NullableId, Paginated, Params, ServiceInterface } from '@feathersjs/feathers'
import { v4 } from 'uuid'
import logger from '../../ServerLogger'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import { getSceneData } from '../scene/scene-helper'

const sceneAssetFiles = ['.scene.json', '.thumbnail.ktx2', '.envmap.ktx2']
const NEW_SCENE_NAME = 'New-Scene'

export interface SceneDataParams extends Params, SceneDataQuery {
  paginate?: false
}

export class SceneDataService
  implements
    ServiceInterface<SceneDataType | Paginated<SceneDataType>, SceneCreateData, SceneDataParams, SceneDataPatch>
{
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async get(id: Id, params?: SceneDataParams) {
    return getSceneData(
      this.app,
      id as SceneID,
      params?.query?.metadataOnly,
      params?.query?.internal,
      params?.query?.storageProvider
    )
  }

  async find(params?: SceneDataParams) {
    const paginate = params?.paginate === false || params?.query?.paginate === false ? false : undefined
    delete params?.paginate
    delete params?.query?.paginate

    if (params && params.query && params.query.projectName) {
      const projectResult = (await this.app
        .service(projectPath)
        .find({ ...params, query: { name: params.query.projectName, $limit: 1 } })) as Paginated<ProjectType>
      if (projectResult.data.length === 0) throw new Error(`No project named ${params.query.projectName} exists`)
      params.query.projectId = projectResult.data[0].id
      delete params.query.projectName
    }

    const sceneParams = params

    const scenesResult = (await this.app.service(scenePath).find({ ...params, paginate: false })) as any as SceneType[]

    const scenes: SceneDataType[] = []
    for (const scene of scenesResult) {
      const sceneData = await getSceneData(
        this.app,
        scene.id as SceneID,
        sceneParams?.query?.metadataOnly,
        sceneParams?.query?.internal,
        sceneParams!.query!.storageProvider
      )
      scenes.push(sceneData)
    }

    for (const [index, _] of scenes.entries()) {
      scenes[index].thumbnailUrl += `?${Date.now()}`
    }

    return paginate === false ? scenes : { total: scenes.length, limit: 0, skip: 0, data: scenes }
  }

  async create(data: SceneCreateData, params?: SceneDataParams) {
    const { projectName } = data

    let projectResult: Paginated<ProjectType> | undefined
    if (projectName) {
      logger.info('[scene.create]: ' + projectName)
      projectResult = (await this.app
        .service(projectPath)
        .find({ ...params, query: { name: projectName, $limit: 1 } })) as Paginated<ProjectType>
      if (projectResult.data.length === 0) throw new Error(`No project named ${projectName} exists`)
    }

    const storageProviderName = data.storageProvider

    const storageProvider = getStorageProvider(storageProviderName)
    let newSceneName = NEW_SCENE_NAME
    const sceneRoutePath = `scenes/${newSceneName}/`

    let counter = 1

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (counter > 1) newSceneName = NEW_SCENE_NAME + '-' + counter
      if (!(await storageProvider.doesExist(`${newSceneName}.scene.json`, sceneRoutePath))) break

      counter++
    }

    await Promise.all(
      sceneAssetFiles.map((ext) =>
        storageProvider.moveObject(
          `default${ext}`,
          `${newSceneName}${ext}`,
          `projects/default-project`,
          sceneRoutePath,
          true
        )
      )
    )
    try {
      await storageProvider.createInvalidation(
        sceneAssetFiles.map((asset) => `scenes/${newSceneName}/${newSceneName}${asset}`)
      )
    } catch (e) {
      logger.error(e)
      logger.info(sceneAssetFiles)
    }

    const scene = await this.app.service(scenePath).create({
      id: (await v4()) as SceneID,
      scenePath: `scenes/${newSceneName}/${newSceneName}.scene.json`,
      envMapPath: `scenes/${newSceneName}/${newSceneName}.envmap.ktx2`,
      thumbnailPath: `scenes/${newSceneName}/${newSceneName}.thumbnail.ktx2`,
      name: newSceneName,
      projectId: projectResult ? projectResult.data[0].id : undefined
    })

    return { id: scene.id, name: scene.name, scene: {}, thumbnailUrl: '', project: projectName } as SceneDataType
  }

  async patch(id: NullableId, data: SceneDataPatch, params?: SceneDataParams) {
    const { newSceneName, oldSceneName, projectName, storageProvider } = data

    const storageProviderObj = getStorageProvider(storageProvider)
    let projectResult: Paginated<ProjectType> | undefined
    if (projectName) {
      projectResult = (await this.app
        .service(projectPath)
        .find({ ...params, query: { name: projectName, $limit: 1 } })) as Paginated<ProjectType>
      if (projectResult.data.length === 0) throw new Error(`No project named ${projectName} exists`)
    }

    const sceneRoutePath = `scenes/${oldSceneName}/`
    const newSceneRoutePath = `scenes/${newSceneName}/`

    for (const ext of sceneAssetFiles) {
      const oldSceneJsonName = `${oldSceneName}${ext}`
      const newSceneJsonName = `${newSceneName}${ext}`

      if (await storageProviderObj.doesExist(oldSceneJsonName, sceneRoutePath)) {
        await storageProviderObj.moveObject(oldSceneJsonName, newSceneJsonName, sceneRoutePath, newSceneRoutePath)
        try {
          await storageProviderObj.createInvalidation([
            sceneRoutePath + oldSceneJsonName,
            newSceneRoutePath + newSceneJsonName
          ])
        } catch (e) {
          logger.error(e)
          logger.info(sceneRoutePath + oldSceneJsonName, newSceneRoutePath + newSceneJsonName)
        }
      }
    }

    const scene = (await this.app.service(scenePath).patch(id, {
      name: newSceneName,
      scenePath: `scenes/${newSceneName}/${newSceneName}.scene.json`,
      envMapPath: `scenes/${newSceneName}/${newSceneName}.envmap.ktx2`,
      thumbnailPath: `scenes/${newSceneName}/${newSceneName}.thumbnail.ktx2`,
      projectId: projectResult ? projectResult.data[0].id : undefined
    })) as SceneType

    return { id: scene.id, name: scene.name, scene: {}, thumbnailUrl: '', project: projectName } as SceneDataType
  }

  async update(id: NullableId, data: SceneCreateData, params?: SceneDataParams) {
    const { name, sceneData, thumbnailBuffer, storageProvider, projectName } = data
    let parsedSceneData = sceneData
    if (sceneData && typeof sceneData === 'string') parsedSceneData = JSON.parse(sceneData)

    let projectResult: Paginated<ProjectType> | undefined

    if (projectName) {
      projectResult = (await this.app
        .service(projectPath)
        .find({ ...params, query: { name: projectName, $limit: 1 } })) as Paginated<ProjectType>
      if (projectResult.data.length === 0) throw new Error(`No project named ${projectName} exists`)
    }
    logger.info('[scene.update]: ', data)

    const storageProviderObj = getStorageProvider(storageProvider)
    const newSceneJsonPath = `scenes/${name}/${name}.scene.json`
    await storageProviderObj.putObject({
      Key: newSceneJsonPath,
      Body: Buffer.from(
        JSON.stringify(cleanStorageProviderURLs(parsedSceneData ?? (defaultSceneSeed as unknown as SceneJsonType)))
      ),
      ContentType: 'application/json'
    })

    if (thumbnailBuffer && Buffer.isBuffer(thumbnailBuffer)) {
      const sceneThumbnailPath = `scenes/${name}/${name}.thumbnail.ktx2`
      await storageProviderObj.putObject({
        Key: sceneThumbnailPath,
        Body: thumbnailBuffer as Buffer,
        ContentType: 'image/ktx2'
      })
    }

    try {
      await storageProviderObj.createInvalidation(sceneAssetFiles.map((asset) => `scenes/${name}/${name}${asset}`))
    } catch (e) {
      logger.error(e)
      logger.info(sceneAssetFiles)
    }

    const sceneExists = (await this.app
      .service(scenePath)
      .find({ query: { projectId: projectResult?.data[0].id, name, $limit: 1 } })) as Paginated<SceneType>
    let scene: SceneType
    if (sceneExists && sceneExists.data.length > 0) {
      scene = await this.app.service(scenePath).patch(sceneExists.data[0].id, {
        scenePath: newSceneJsonPath,
        envMapPath: `scenes/${name}/${name}.envmap.ktx2`,
        thumbnailPath: `scenes/${name}/${name}.thumbnail.ktx2`,
        name: name
      })
    } else {
      scene = await this.app.service(scenePath).create({
        id: (await v4()) as SceneID,
        scenePath: newSceneJsonPath,
        envMapPath: `scenes/${name}/${name}.envmap.ktx2`,
        thumbnailPath: `scenes/${name}/${name}.thumbnail.ktx2`,
        name: name,
        projectId: projectResult ? projectResult.data[0].id : undefined
      })
    }

    return { id: scene.id, name: scene.name, scene: {}, thumbnailUrl: '', project: projectName } as SceneDataType
  }
  catch(err) {
    logger.error(err)
    throw err
  }
}
