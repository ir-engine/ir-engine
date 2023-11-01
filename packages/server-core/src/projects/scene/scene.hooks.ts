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

import { iff, isProvider } from 'feathers-hooks-common'

import { cleanStorageProviderURLs } from '@etherealengine/engine/src/common/functions/parseSceneJSON'
import {
  SceneCreateData,
  SceneDataType,
  SceneID,
  SceneJsonType,
  SceneType
} from '@etherealengine/engine/src/schemas/projects/scene.schema'
import defaultSceneSeed from '@etherealengine/projects/default-project/default.scene.json'
import { BadRequest } from '@feathersjs/errors'
import { v4 } from 'uuid'
import { HookContext } from '../../../declarations'
import logger from '../../ServerLogger'
import projectPermissionAuthenticate from '../../hooks/project-permission-authenticate'
import setResponseStatusCode from '../../hooks/set-response-status-code'
import verifyScope from '../../hooks/verify-scope'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import { getSceneData } from './scene-helper'
import { SceneService } from './scene.class'

const NEW_SCENE_NAME = 'New-Scene'
const sceneAssetFiles = ['.scene.json', '.thumbnail.ktx2', '.envmap.ktx2']

/**
 * Ensure recording with the specified id exists
 * @param context
 * @returns
 */
const persistPaginate = async (context: HookContext<SceneService>) => {
  context.paginate = context.params?.paginate === false || context.params?.query?.paginate === false ? false : undefined
  delete context.params?.paginate
  delete context.params?.query?.paginate
}

const addSceneData = async (context: HookContext<SceneService>) => {
  const result = (Array.isArray(context.result) ? context.result : [context.result]) as SceneType[]
  const scenes: SceneDataType[] = []
  for (const scene of result) {
    const sceneData = await getSceneData(
      context.app,
      scene.id as SceneID,
      true,
      true,
      context.params!.query!.storageProvider
    )
    scenes.push(sceneData)
  }

  for (const [index, _] of scenes.entries()) {
    scenes[index].thumbnailUrl += `?${Date.now()}`
  }

  return context.paginate === false ? scenes : { total: scenes.length, limit: 0, skip: 0, data: scenes }
}

const getSceneDataById = async (context: HookContext<SceneService>) => {
  const sceneData = await getSceneData(
    context.app,
    context.id as SceneID,
    context.params!.query!.metadataOnly,
    context.params!.query!.internal,
    context.params!.query!.storageProvider
  )

  context.result = sceneData as SceneDataType
}

const ensureSceneDoesnotExist = async (context: HookContext<SceneService>) => {
  if (!context.data || context.method !== 'create') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  const data: SceneCreateData[] = Array.isArray(context.data) ? context.data : [context.data]

  context.newSceneName = []
  for (const item of data) {
    logger.info('[scene.create]: ' + item.name)
    const storageProvider = getStorageProvider(item.storageProvider)
    const sceneRoutePath = `scenes/${item.name}/`
    let newSceneName = NEW_SCENE_NAME
    let counter = 1

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (counter > 1) newSceneName = NEW_SCENE_NAME + '-' + counter
      if (!(await storageProvider.doesExist(`${newSceneName}.scene.json`, sceneRoutePath))) break

      counter++
    }
    context.newSceneName.push(newSceneName)
  }
}

const createNewSceneFiles = async (context: HookContext<SceneService>) => {
  if (!context.data || context.method !== 'create') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  const data: SceneCreateData[] = Array.isArray(context.data) ? context.data : [context.data]

  for (const [index, item] of data.entries()) {
    const storageProvider = getStorageProvider(item.storageProvider)
    const sceneRoutePath = `scenes/${item.name}/`
    await Promise.all(
      sceneAssetFiles.map((ext) =>
        storageProvider.moveObject(
          `default${ext}`,
          `${context.newSceneName[index]}${ext}`,
          `projects/default-project`,
          sceneRoutePath,
          true
        )
      )
    )
    try {
      await storageProvider.createInvalidation(
        sceneAssetFiles.map((asset) => `scenes/${item.name}/${context.newSceneName[index]}${asset}`)
      )
    } catch (e) {
      logger.error(e)
      logger.info(sceneAssetFiles)
    }
  }
}

const setCreateData = async (context: HookContext<SceneService>) => {
  if (!context.data || context.method !== 'create') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  const data: SceneCreateData[] = Array.isArray(context.data) ? context.data : [context.data]

  const createData: SceneCreateData[] = []

  for (const [index, item] of data.entries()) {
    const itemScene = {} as SceneCreateData
    itemScene.id = v4() as SceneID
    itemScene.scenePath = `scenes/${item.name}/${context.newSceneName[index]}.scene.json`
    itemScene.envMapPath = `scenes/${item.name}/${context.newSceneName[index]}.envmap.ktx2`
    itemScene.thumbnailPath = `scenes/${item.name}/${context.newSceneName[index]}.thumbnail.ktx2`
    if (item.projectId) itemScene.projectId = item.projectId
    createData.push(itemScene)
  }
  context.data = createData.length === 1 ? createData[0] : createData
}

const renameScene = async (context: HookContext<SceneService>) => {
  if (context.params.query) {
    const oldSceneName = context.params.query.oldSceneName?.toString()
    const storageProviderName = context.params.query.storageProvider?.toString()
    const newSceneName = context.params.query.newSceneName?.toString()

    const storageProvider = getStorageProvider(storageProviderName)

    const sceneRoutePath = `scenes/${oldSceneName}/`

    for (const ext of sceneAssetFiles) {
      const oldSceneJsonName = `${oldSceneName}${ext}`
      const newSceneJsonName = `${newSceneName}${ext}`

      if (await storageProvider.doesExist(oldSceneJsonName, sceneRoutePath)) {
        await storageProvider.moveObject(oldSceneJsonName, newSceneJsonName, sceneRoutePath, sceneRoutePath)
        try {
          await storageProvider.createInvalidation([
            sceneRoutePath + oldSceneJsonName,
            sceneRoutePath + newSceneJsonName
          ])
        } catch (e) {
          logger.error(e)
          logger.info(sceneRoutePath + oldSceneJsonName, sceneRoutePath + newSceneJsonName)
        }
      }
    }
    delete context.params.query
  }
}

const uploadSceneToStorage = async (context: HookContext<SceneService>) => {
  const data = context.data as SceneCreateData
  try {
    const { name, sceneData, thumbnailBuffer } = data
    let parsedSceneData = sceneData
    if (sceneData && typeof sceneData === 'string') parsedSceneData = JSON.parse(sceneData)

    logger.info('[scene.update]: ', name, data)

    const storageProvider = getStorageProvider(data.storageProvider)

    const newSceneJsonPath = `scenes/${name}/${name}.scene.json`
    await storageProvider.putObject({
      Key: newSceneJsonPath,
      Body: Buffer.from(
        JSON.stringify(cleanStorageProviderURLs(parsedSceneData ?? (defaultSceneSeed as unknown as SceneJsonType)))
      ),
      ContentType: 'application/json'
    })

    if (thumbnailBuffer && Buffer.isBuffer(thumbnailBuffer)) {
      const sceneThumbnailPath = `scenes/${name}/${name}.thumbnail.ktx2`
      await storageProvider.putObject({
        Key: sceneThumbnailPath,
        Body: thumbnailBuffer as Buffer,
        ContentType: 'image/ktx2'
      })
    }

    try {
      await storageProvider.createInvalidation(sceneAssetFiles.map((asset) => `scenes/${name}/${name}${asset}`))
    } catch (e) {
      logger.error(e)
      logger.info(sceneAssetFiles)
    }
  } catch (err) {
    logger.error(err)
    throw err
  }
}

const getScene = async (context: HookContext<SceneService>) => {
  context.result = await context.service._get(context.id as SceneID)
}

const deleteSceneResources = async (context: HookContext<SceneService>) => {
  const sceneName = context.params?.query?.name
  const storageProviderName = context.params?.query?.storageProvider
  const storageProvider = getStorageProvider(storageProviderName)
  const scenePath = `scenes/${sceneName}/${sceneName}.scene.json`
  const thumbnailPath = `scenes/${sceneName}/${sceneName}.thumbnail.ktx2`
  const envMapPath = `scenes/${sceneName}/${sceneName}.envmap.ktx2`

  await storageProvider.deleteResources([scenePath, thumbnailPath, envMapPath])

  try {
    await storageProvider.createInvalidation([scenePath, thumbnailPath, envMapPath])
  } catch (e) {
    logger.error(e)
    logger.info(sceneAssetFiles)
  }
  delete context.params.query?.storageProvider
}

export default {
  before: {
    all: [],
    find: [persistPaginate],
    get: [getSceneDataById],
    create: [
      iff(isProvider('external'), verifyScope('editor', 'write') as any, projectPermissionAuthenticate(false)),
      ensureSceneDoesnotExist,
      createNewSceneFiles,
      setCreateData
    ],
    update: [
      iff(isProvider('external'), verifyScope('editor', 'write') as any, projectPermissionAuthenticate(false)),
      uploadSceneToStorage,
      getScene
    ],
    patch: [
      iff(isProvider('external'), verifyScope('editor', 'write') as any, projectPermissionAuthenticate(false)),
      renameScene
    ],
    remove: [
      iff(isProvider('external'), verifyScope('editor', 'write') as any, projectPermissionAuthenticate(false)),
      deleteSceneResources
    ]
  },

  after: {
    all: [],
    find: [addSceneData],
    get: [],
    create: [
      // Editor is expecting 200, while feather is sending 201 for creation
      setResponseStatusCode(200)
    ],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any
