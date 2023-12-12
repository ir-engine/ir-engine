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
import defaultSceneSeed from '@etherealengine/projects/default-project/default.scene.json'

import { cleanStorageProviderURLs } from '@etherealengine/engine/src/common/functions/parseSceneJSON'
import { ProjectType, projectPath } from '@etherealengine/engine/src/schemas/projects/project.schema'
import {
  SceneCreateData,
  SceneDataType,
  SceneID,
  SceneJsonType,
  SceneMetadataCreate,
  ScenePatch,
  SceneQuery,
  SceneUpdate,
  scenePath
} from '@etherealengine/engine/src/schemas/projects/scene.schema'
import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import { ProjectParams } from '../project/project.class'
import { getSceneData } from './scene-helper'
const NEW_SCENE_NAME = 'New-Scene'

const SCENE_ASSET_FILES = ['.scene.json', '.thumbnail.ktx2', '.envmap.ktx2']

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

  async getSceneFiles(directory: string, storageProviderName?: string) {
    const storageProvider = getStorageProvider(storageProviderName)
    const fileResults = await storageProvider.listObjects(directory, false)
    return fileResults.Contents.map((dirent) => dirent.Key).filter((name) => name.endsWith('.scene.json')) as SceneID[]
  }

  async find(params?: SceneParams) {
    const paginate = params?.paginate === false || params?.query?.paginate === false ? false : undefined
    delete params?.paginate
    delete params?.query?.paginate

    let projectParams: ProjectParams = { paginate: false }

    const projectName = params?.query?.project?.toString()

    if (projectName) {
      projectParams = { ...projectParams, query: { name: projectName } }
    }

    const storageProviderName = params?.query?.storageProviderName?.toString()

    const scenes: SceneDataType[] = []

    const projects = (await this.app.service(projectPath).find(projectParams)) as ProjectType[]

    for (const project of projects) {
      const sceneJsonPath = `projects/${project.name}/`

      const files = await this.getSceneFiles(sceneJsonPath, storageProviderName)
      const sceneData = await Promise.all(
        files.map(async (sceneID) =>
          this.app.service(scenePath).get('', {
            ...params,
            query: {
              ...params?.query,
              sceneKey: sceneID,
              metadataOnly: params?.query?.metadataOnly,
              internal: params?.query?.internal
            }
          })
        )
      )
      scenes.push(...sceneData)
    }

    if (projects.length === 0 && params?.query?.directory) {
      const sceneJsonPath = params?.query?.directory?.toString()
      const files = await this.getSceneFiles(sceneJsonPath, storageProviderName)
      const sceneData = await Promise.all(
        files.map(async (sceneID) =>
          this.app.service(scenePath).get('', {
            ...params,
            query: {
              ...params?.query,
              storageProviderName,
              sceneKey: sceneID,
              metadataOnly: true,
              internal: true
            }
          })
        )
      )
      scenes.push(...sceneData)
    }

    // for (const [index, _] of scenes.entries()) {
    //   scenes[index].thumbnailUrl += `?${Date.now()}`
    // }

    return paginate === false ? scenes : { total: scenes.length, limit: 0, skip: 0, data: scenes }
  }

  async get(id: NullableId, params?: SceneParams) {
    const metadataOnly = params?.query?.metadataOnly
    const internal = params?.query?.internal
    const storageProviderName = params?.query?.storageProviderName
    const sceneKey = params?.query?.sceneKey!

    if (!sceneKey) throw new Error('No sceneKey provided')

    const sceneData = await getSceneData(sceneKey, metadataOnly, internal, storageProviderName)

    return sceneData as SceneDataType
  }

  async create(data: SceneCreateData, params?: Params) {
    const { project } = data
    logger.info('[scene.create]: ' + project)
    const storageProviderName = data.storageProvider

    const storageProvider = getStorageProvider(storageProviderName)

    const directory = data.directory!
    const localDirectory = data.localDirectory!

    let newSceneName = NEW_SCENE_NAME
    let counter = 1

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (counter > 1) newSceneName = NEW_SCENE_NAME + '-' + counter
      if (!(await storageProvider.doesExist(`${newSceneName}.scene.json`, directory))) break

      counter++
    }

    await Promise.all(
      SCENE_ASSET_FILES.map((ext) =>
        storageProvider.moveObject(
          `default${ext}`,
          `${newSceneName}${ext}`,
          `projects/default-project`,
          directory,
          true
        )
      )
    )
    try {
      await storageProvider.createInvalidation(SCENE_ASSET_FILES.map((asset) => `${directory}${newSceneName}${asset}`))
    } catch (e) {
      logger.error(e)
      logger.info(SCENE_ASSET_FILES)
    }

    if (isDev) {
      const projectPathLocal = path.resolve(appRootPath.path, localDirectory)
      const defaultProjectPath = path.resolve(appRootPath.path, 'packages/projects/projects/default-project/')
      for (const ext of SCENE_ASSET_FILES) {
        fs.copyFileSync(
          path.resolve(path.join(defaultProjectPath, 'default') + ext),
          path.resolve(path.join(projectPathLocal, newSceneName) + ext)
        )
      }
    }

    const scenePath = `${directory}${newSceneName}.scene.json`

    return { project: project!, name: newSceneName, scenePath } as SceneMetadataCreate
  }

  async patch(id: NullableId, data: ScenePatch, params?: Params) {
    const { newSceneName, oldSceneName, storageProviderName } = data

    const storageProvider = getStorageProvider(storageProviderName)

    const directory = data.directory!
    const localDirectory = data.localDirectory!

    for (const ext of SCENE_ASSET_FILES) {
      const oldSceneJsonName = `${oldSceneName}${ext}`
      const newSceneJsonName = `${newSceneName}${ext}`

      if (await storageProvider.doesExist(oldSceneJsonName, directory)) {
        await storageProvider.moveObject(oldSceneJsonName, newSceneJsonName, directory, directory)
        try {
          await storageProvider.createInvalidation([directory + oldSceneJsonName, directory + newSceneJsonName])
        } catch (e) {
          logger.error(e)
          logger.info(directory + oldSceneJsonName, directory + newSceneJsonName)
        }
      }
    }

    if (isDev) {
      for (const ext of SCENE_ASSET_FILES) {
        const oldSceneJsonPath = path.resolve(appRootPath.path, `${localDirectory}${oldSceneName}${ext}`)
        if (fs.existsSync(oldSceneJsonPath)) {
          const newSceneJsonPath = path.resolve(appRootPath.path, `${localDirectory}${newSceneName}${ext}`)
          fs.renameSync(oldSceneJsonPath, newSceneJsonPath)
        }
      }
    }

    return
  }

  async update(id: NullableId, data: SceneCreateData, params?: Params) {
    try {
      const { name, sceneData, thumbnailBuffer, storageProviderName } = data
      let parsedSceneData = sceneData
      if (sceneData && typeof sceneData === 'string') parsedSceneData = JSON.parse(sceneData)

      logger.info('[scene.update]: ', data)

      const storageProvider = getStorageProvider(storageProviderName)

      const directory = data.directory!
      const localDirectory = data.localDirectory!

      const newSceneJsonPath = `${directory}${name}.scene.json`
      await storageProvider.putObject({
        Key: newSceneJsonPath,
        Body: Buffer.from(
          JSON.stringify(cleanStorageProviderURLs(parsedSceneData ?? (defaultSceneSeed as unknown as SceneJsonType)))
        ),
        ContentType: 'application/json'
      })

      if (thumbnailBuffer && Buffer.isBuffer(thumbnailBuffer)) {
        const sceneThumbnailPath = `${directory}${name}.thumbnail.ktx2`
        await storageProvider.putObject({
          Key: sceneThumbnailPath,
          Body: thumbnailBuffer as Buffer,
          ContentType: 'image/ktx2'
        })
      }

      try {
        await storageProvider.createInvalidation(SCENE_ASSET_FILES.map((asset) => `${directory}${name}${asset}`))
      } catch (e) {
        logger.error(e)
        logger.info(SCENE_ASSET_FILES)
      }

      if (isDev) {
        const newSceneJsonPathLocal = path.resolve(appRootPath.path, `${localDirectory}${name}.scene.json`)

        fs.writeFileSync(
          path.resolve(newSceneJsonPathLocal),
          JSON.stringify(
            cleanStorageProviderURLs(parsedSceneData ?? (defaultSceneSeed as unknown as SceneJsonType)),
            null,
            2
          )
        )

        if (thumbnailBuffer && Buffer.isBuffer(thumbnailBuffer)) {
          const sceneThumbnailPath = path.resolve(appRootPath.path, `${localDirectory}${name}.thumbnail.ktx2`)
          fs.writeFileSync(path.resolve(sceneThumbnailPath), thumbnailBuffer as Buffer)
        }
      }

      const a = data.directory!.split('/')[1]

      // return scene id for update hooks
      return { id: `${data.directory!.split('/')[1]}/${name}` }
    } catch (err) {
      logger.error(err)
      throw err
    }
  }

  async remove(id: NullableId, params?: SceneParams) {
    const sceneName = params?.query?.name
    const storageProviderName = params?.query?.storageProviderName
    const storageProvider = getStorageProvider(storageProviderName)

    const directory = params!.query!.directory!.toString()!
    const localDirectory = params!.query!.localDirectory!.toString()!

    for (const ext of SCENE_ASSET_FILES) {
      const assetFilePath = path.resolve(appRootPath.path, `${localDirectory}/${sceneName}${ext}`)
      if (fs.existsSync(assetFilePath)) {
        fs.rmSync(path.resolve(assetFilePath))
      }
    }

    await storageProvider.deleteResources(SCENE_ASSET_FILES.map((ext) => `${directory}${sceneName}${ext}`))

    try {
      await storageProvider.createInvalidation(SCENE_ASSET_FILES.map((asset) => `${directory}${sceneName}${asset}`))
    } catch (e) {
      logger.error(e)
      logger.info(SCENE_ASSET_FILES)
    }
  }
}
