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

import { ProjectType, projectPath } from '@etherealengine/engine/src/schemas/projects/project.schema'
import { SceneID, SceneType, scenePath } from '@etherealengine/engine/src/schemas/projects/scene.schema'
import { Application, Paginated } from '@feathersjs/feathers'
import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'
import { v4 as generateUUID } from 'uuid'
import logger from '../ServerLogger'
import { getStorageProvider } from '../media/storageprovider/storageprovider'
import { toDateTimeSql } from './datetime-sql'
import { getContentType } from './fileUtils'

const uploadSceneData = async (sceneName: string, projectName: string) => {
  try {
    const sceneLocalPath = path.resolve(
      appRootPath.path,
      'packages/projects/projects',
      projectName,
      `${sceneName}.scene.json`
    )
    if (!fs.existsSync(sceneLocalPath)) {
      return ''
    }
    const fileData = fs.readFileSync(sceneLocalPath)
    const contentType = getContentType(sceneLocalPath)
    const key = `scenes/${sceneName}/${sceneName}.scene.json`
    const storageProvider = getStorageProvider()
    await storageProvider.putObject({
      Body: fileData,
      Key: key,
      ContentType: contentType
    })
    await storageProvider.createInvalidation([key])
    return key
  } catch (e) {
    logger.error(e)
  }
}

const uploadThumbnailData = async (sceneName: string, projectName: string) => {
  try {
    let thumbnailExt = `${sceneName}.thumbnail.ktx2`
    let thumbnailLocalPath = path.resolve(appRootPath.path, 'packages/projects/projects', projectName, thumbnailExt)

    if (!fs.existsSync(thumbnailLocalPath)) {
      thumbnailExt = `${sceneName}.thumbnail.jpeg`
      thumbnailLocalPath = path.resolve(appRootPath.path, 'packages/projects/projects', projectName, thumbnailExt)
      if (!fs.existsSync(thumbnailLocalPath)) {
        return ''
      }
    }
    const fileData = fs.readFileSync(thumbnailLocalPath)
    const contentType = getContentType(thumbnailLocalPath)
    const key = `scenes/${sceneName}/${thumbnailExt}`
    const storageProvider = getStorageProvider()
    await storageProvider.putObject({
      Body: fileData,
      Key: key,
      ContentType: contentType
    })
    await storageProvider.createInvalidation([key])
    return key
  } catch (e) {
    logger.error(e)
  }
}

const uploadEnvMapData = async (sceneName: string, projectName: string) => {
  try {
    let envMapExt = `${sceneName}.envmap.ktx2`
    let envMapLocalPath = path.resolve(appRootPath.path, 'packages/projects/projects', projectName, envMapExt)
    if (!fs.existsSync(envMapLocalPath)) {
      envMapExt = `${sceneName}.envmap.png`
      envMapLocalPath = path.resolve(appRootPath.path, 'packages/projects/projects', projectName, envMapExt)
      if (!fs.existsSync(envMapLocalPath)) {
        return ''
      }
    }

    const fileData = fs.readFileSync(envMapLocalPath)
    const contentType = getContentType(envMapLocalPath)
    const key = `scenes/${sceneName}/${envMapExt}`
    const storageProvider = getStorageProvider()
    await storageProvider.putObject({
      Body: fileData,
      Key: key,
      ContentType: contentType
    })
    await storageProvider.createInvalidation([key])
    return key
  } catch (e) {
    logger.error(e)
  }
}

export const uploadLocalSceneData = async (app: Application, sceneName: string, projectName: string) => {
  const projectResult = (await app
    .service(projectPath)
    .find({ query: { name: projectName, $limit: 1 } })) as Paginated<ProjectType>

  if (!projectResult || projectResult.data.length === 0) {
    throw new Error(`Project ${projectName} not found`)
  }

  const scene = (await app
    .service(scenePath)
    .find({ query: { name: sceneName, projectId: projectResult.data[0].id, $limit: 1 } })) as Paginated<SceneType>

  let sceneId = !scene || scene.data.length === 0 ? ('' as SceneID) : scene.data[0].id

  if (!scene || scene.data.length === 0) {
    const newScenePath = await uploadSceneData(sceneName, projectName)
    const newThumbnailPath = await uploadThumbnailData(sceneName, projectName)
    const newEnvMapPath = await uploadEnvMapData(sceneName, projectName)

    sceneId = (
      await app.service(scenePath).create({
        name: sceneName,
        projectId: projectResult.data[0].id,
        scenePath: newScenePath,
        thumbnailPath: newThumbnailPath,
        envMapPath: newEnvMapPath,
        id: generateUUID() as SceneID,
        createdAt: toDateTimeSql(new Date()),
        updatedAt: toDateTimeSql(new Date())
      })
    ).id
  }

  return sceneId
}
