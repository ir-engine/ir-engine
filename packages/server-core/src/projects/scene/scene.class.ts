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

import { NullableId, Paginated, Params, ServiceInterface } from '@feathersjs/feathers'
import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'

import { isDev } from '@etherealengine/common/src/config'
import { SceneJson } from '@etherealengine/common/src/interfaces/SceneInterface'
import defaultSceneSeed from '@etherealengine/projects/default-project/default.scene.json'

import { cleanStorageProviderURLs } from '@etherealengine/engine/src/common/functions/parseSceneJSON'
import { ProjectType, projectPath } from '@etherealengine/engine/src/schemas/projects/project.schema'
import { sceneDataPath } from '@etherealengine/engine/src/schemas/projects/scene-data.schema'
import {
  SceneCreateData,
  SceneDataType,
  SceneMetadataCreate,
  ScenePatch,
  SceneQuery,
  SceneUpdate
} from '@etherealengine/engine/src/schemas/projects/scene.schema'
import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import { cleanString } from '../../util/cleanString'
import { downloadAssetsFromScene, getSceneData } from './scene-helper'
const NEW_SCENE_NAME = 'New-Scene'

const sceneAssetFiles = ['.scene.json', '.thumbnail.ktx2', '.envmap.ktx2']

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SceneParams extends Params<SceneQuery> {
  paginate?: false
}

export class SceneService
  implements
    ServiceInterface<
      SceneDataType | Paginated<SceneDataType> | SceneMetadataCreate | SceneUpdate | void,
      SceneCreateData,
      SceneParams,
      ScenePatch
    >
{
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async find(params?: SceneParams) {
    const paginate = params?.paginate === false || params?.query?.paginate === false ? false : undefined
    delete params?.paginate
    delete params?.query?.paginate

    const projects = (await this.app.service(projectPath).find({ paginate: false })) as ProjectType[]

    const scenes: SceneDataType[] = []
    for (const project of projects) {
      const { data } = await this.app.service(sceneDataPath).get(null, {
        ...params,
        query: { ...params?.query, projectName: project.name, metadataOnly: true, internal: true }
      })
      scenes.push(
        ...data.map((d) => {
          d.project = project.name
          return d
        })
      )
    }

    for (const [index, _] of scenes.entries()) {
      scenes[index].thumbnailUrl += `?${Date.now()}`
    }

    return paginate === false ? scenes : { total: scenes.length, limit: 0, skip: 0, data: scenes }
  }

  async get(id: NullableId, params?: SceneParams) {
    const projectName = params?.query?.project?.toString()
    const metadataOnly = params?.query?.metadataOnly
    const sceneName = params?.query?.name?.toString()
    const project = (await this.app
      .service(projectPath)
      ._find({ ...params, query: { name: projectName!, $limit: 1 } })) as Paginated<ProjectType>
    if (project.data.length === 0) throw new Error(`No project named ${projectName!} exists`)

    const sceneData = await getSceneData(projectName!, sceneName!, metadataOnly, params!.provider == null)

    return sceneData as SceneDataType
  }

  async create(data: SceneCreateData, params?: Params) {
    const { project } = data
    logger.info('[scene.create]: ' + project)
    const storageProviderName = data.storageProvider

    const storageProvider = getStorageProvider(storageProviderName)

    const projectResult = (await this.app
      .service(projectPath)
      ._find({ ...params, query: { name: project, $limit: 1 } })) as Paginated<ProjectType>
    if (projectResult.data.length === 0) throw new Error(`No project named ${project} exists`)

    const projectRoutePath = `projects/${project}/`

    let newSceneName = NEW_SCENE_NAME
    let counter = 1

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (counter > 1) newSceneName = NEW_SCENE_NAME + '-' + counter
      if (!(await storageProvider.doesExist(`${newSceneName}.scene.json`, projectRoutePath))) break

      counter++
    }

    await Promise.all(
      sceneAssetFiles.map((ext) =>
        storageProvider.moveObject(
          `default${ext}`,
          `${newSceneName}${ext}`,
          `projects/default-project`,
          projectRoutePath,
          true
        )
      )
    )
    try {
      await storageProvider.createInvalidation(
        sceneAssetFiles.map((asset) => `projects/${project}/${newSceneName}${asset}`)
      )
    } catch (e) {
      logger.error(e)
      logger.info(sceneAssetFiles)
    }

    if (isDev) {
      const projectPathLocal = path.resolve(appRootPath.path, 'packages/projects/projects/' + project) + '/'
      for (const ext of sceneAssetFiles) {
        fs.copyFileSync(
          path.resolve(appRootPath.path, `packages/projects/default-project/default${ext}`),
          path.resolve(projectPathLocal + newSceneName + ext)
        )
      }
    }

    return { project: project!, name: newSceneName } as SceneMetadataCreate
  }

  async patch(id: NullableId, data: ScenePatch, params?: Params) {
    const { newSceneName, oldSceneName, project, storageProviderName } = data

    const storageProvider = getStorageProvider(storageProviderName)

    const projectResult = (await this.app
      .service(projectPath)
      ._find({ ...params, query: { name: project, $limit: 1 } })) as Paginated<ProjectType>
    if (projectResult.data.length === 0) throw new Error(`No project named ${project} exists`)

    const projectRoutePath = `projects/${project}/`

    for (const ext of sceneAssetFiles) {
      const oldSceneJsonName = `${oldSceneName}${ext}`
      const newSceneJsonName = `${newSceneName}${ext}`

      if (await storageProvider.doesExist(oldSceneJsonName, projectRoutePath)) {
        await storageProvider.moveObject(oldSceneJsonName, newSceneJsonName, projectRoutePath, projectRoutePath)
        try {
          await storageProvider.createInvalidation([
            projectRoutePath + oldSceneJsonName,
            projectRoutePath + newSceneJsonName
          ])
        } catch (e) {
          logger.error(e)
          logger.info(projectRoutePath + oldSceneJsonName, projectRoutePath + newSceneJsonName)
        }
      }
    }

    if (isDev) {
      for (const ext of sceneAssetFiles) {
        const oldSceneJsonPath = path.resolve(
          appRootPath.path,
          `packages/projects/projects/${project}/${oldSceneName}${ext}`
        )
        if (fs.existsSync(oldSceneJsonPath)) {
          const newSceneJsonPath = path.resolve(
            appRootPath.path,
            `packages/projects/projects/${project}/${newSceneName}${ext}`
          )
          fs.renameSync(oldSceneJsonPath, newSceneJsonPath)
        }
      }
    }

    return
  }

  async update(id: NullableId, data: SceneCreateData, params?: Params) {
    try {
      const { name, sceneData, thumbnailBuffer, storageProviderName, project } = data
      let parsedSceneData = sceneData
      if (sceneData && typeof sceneData === 'string') parsedSceneData = JSON.parse(sceneData)

      logger.info('[scene.update]: ', project, data)

      const storageProvider = getStorageProvider(storageProviderName)

      const projectResult = (await this.app
        .service(projectPath)
        .find({ ...params, query: { name: project }, paginate: false })) as ProjectType[]
      if (projectResult.length === 0) throw new Error(`No project named ${project} exists`)

      await downloadAssetsFromScene(this.app, project!, parsedSceneData!)

      const newSceneJsonPath = `projects/${project}/${name}.scene.json`
      await storageProvider.putObject({
        Key: newSceneJsonPath,
        Body: Buffer.from(
          JSON.stringify(cleanStorageProviderURLs(parsedSceneData ?? (defaultSceneSeed as unknown as SceneJson)))
        ),
        ContentType: 'application/json'
      })

      if (thumbnailBuffer && Buffer.isBuffer(thumbnailBuffer)) {
        const sceneThumbnailPath = `projects/${project}/${name}.thumbnail.ktx2`
        await storageProvider.putObject({
          Key: sceneThumbnailPath,
          Body: thumbnailBuffer as Buffer,
          ContentType: 'image/ktx2'
        })
      }

      try {
        await storageProvider.createInvalidation(sceneAssetFiles.map((asset) => `projects/${project}/${name}${asset}`))
      } catch (e) {
        logger.error(e)
        logger.info(sceneAssetFiles)
      }

      if (isDev) {
        const newSceneJsonPathLocal = path.resolve(
          appRootPath.path,
          `packages/projects/projects/${project}/${name}.scene.json`
        )

        fs.writeFileSync(
          path.resolve(newSceneJsonPathLocal),
          JSON.stringify(
            cleanStorageProviderURLs(parsedSceneData ?? (defaultSceneSeed as unknown as SceneJson)),
            null,
            2
          )
        )

        if (thumbnailBuffer && Buffer.isBuffer(thumbnailBuffer)) {
          const sceneThumbnailPath = path.resolve(
            appRootPath.path,
            `packages/projects/projects/${project}/${name}.thumbnail.ktx2`
          )
          fs.writeFileSync(path.resolve(sceneThumbnailPath), thumbnailBuffer as Buffer)
        }
      }

      // return scene id for update hooks
      return { id: `${project}/${name}` }
    } catch (err) {
      logger.error(err)
      throw err
    }
  }

  async remove(id: NullableId, params?: SceneParams) {
    const projectName = params?.query?.project
    const sceneName = params?.query?.name
    const storageProviderName = params?.query?.storageProviderName
    const storageProvider = getStorageProvider(storageProviderName)

    const name = cleanString(sceneName!.toString())

    const project = (await this.app
      .service(projectPath)
      .find({ ...params, query: { name: projectName }, paginate: false })) as ProjectType[]
    if (project.length === 0) throw new Error(`No project named ${projectName} exists`)

    for (const ext of sceneAssetFiles) {
      const assetFilePath = path.resolve(appRootPath.path, `packages/projects/projects/${projectName}/${name}${ext}`)
      if (fs.existsSync(assetFilePath)) {
        fs.rmSync(path.resolve(assetFilePath))
      }
    }

    await storageProvider.deleteResources(sceneAssetFiles.map((ext) => `projects/${projectName}/${name}${ext}`))

    try {
      await storageProvider.createInvalidation(
        sceneAssetFiles.map((asset) => `projects/${projectName}/${sceneName}${asset}`)
      )
    } catch (e) {
      logger.error(e)
      logger.info(sceneAssetFiles)
    }
  }
}
