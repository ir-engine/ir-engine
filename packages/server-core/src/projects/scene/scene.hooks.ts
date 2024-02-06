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

import { ProjectType, projectPath } from '@etherealengine/common/src/schemas/projects/project.schema'
import {
  SceneCreateData,
  SceneDataType,
  SceneID,
  SceneJsonType,
  ScenePatch,
  SceneQuery,
  SceneUpdate
} from '@etherealengine/common/src/schemas/projects/scene.schema'
import defaultSceneSeed from '@etherealengine/projects/default-project/default.scene.json'
import { BadRequest } from '@feathersjs/errors'
import { Paginated } from '@feathersjs/feathers'
import appRootPath from 'app-root-path'
import { iff, isProvider } from 'feathers-hooks-common'
import fs from 'fs'
import path from 'path'
import { HookContext } from '../../../declarations'
import logger from '../../ServerLogger'
import { createSkippableHooks } from '../../hooks/createSkippableHooks'
import projectPermissionAuthenticate from '../../hooks/project-permission-authenticate'
import setResponseStatusCode from '../../hooks/set-response-status-code'
import verifyScope from '../../hooks/verify-scope'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import { getSceneData } from './scene-helper'

import { isDev } from '@etherealengine/common/src/config'
import { LocationType, locationPath } from '@etherealengine/common/src/schemas/social/location.schema'
import { cleanStorageProviderURLs } from '@etherealengine/spatial/src/common/functions/parseSceneJSON'
import enableClientPagination from '../../hooks/enable-client-pagination'
import { ProjectParams } from '../project/project.class'
import { SceneService } from './scene.class'

const DEFAULT_DIRECTORY = 'packages/projects/default-project'
const NEW_SCENE_NAME = 'New-Scene'
const SCENE_ASSET_FILES = ['.scene.json', '.thumbnail.jpg', '.envmap.ktx2']

export const getSceneFiles = async (directory: string, storageProviderName?: string) => {
  const storageProvider = getStorageProvider(storageProviderName)
  const fileResults = await storageProvider.listObjects(directory, false)
  return fileResults.Contents.map((dirent) => dirent.Key).filter((name) => name.endsWith('.scene.json')) as SceneID[]
}

/**
 * Finds Scene
 * @param context Hook context
 * @returns
 */
const findScene = async (context: HookContext<SceneService>) => {
  if (context.method !== 'find') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  let projectParams: ProjectParams = { paginate: false }

  const projectName = context.params?.query?.project?.toString()

  if (projectName) {
    projectParams = { ...projectParams, query: { name: projectName } }
  }

  const storageProviderName = context.params?.query?.storageProviderName?.toString()

  const scenes: SceneDataType[] = []

  const projects = (await context.app.service(projectPath).find(projectParams)) as ProjectType[]

  for (const project of projects) {
    const sceneJsonPath = `projects/${project.name}/`

    const files = await getSceneFiles(sceneJsonPath, storageProviderName)
    const sceneData = (await Promise.all(
      files.map(async (sceneID) =>
        context.service.get('', {
          ...context.params,
          query: {
            ...context.params?.query,
            sceneKey: sceneID,
            metadataOnly: context.params?.query?.metadataOnly,
            internal: context.params?.query?.internal
          }
        })
      )
    )) as SceneDataType[]
    scenes.push(...sceneData)
  }

  // for (const [index, _] of scenes.entries()) {
  //   scenes[index].thumbnailUrl += `?${Date.now()}`
  // }

  context.result =
    context.params.paginate === false ? scenes : { total: scenes.length, limit: 0, skip: 0, data: scenes }
}

/**
 * Checks if project in query exists
 * @param context Hook context
 * @returns
 */
const checkIfProjectExists = async (context: HookContext<SceneService>, project: string) => {
  const projectResult = (await context.app
    .service(projectPath)
    .find({ query: { name: project, $limit: 1 } })) as Paginated<ProjectType>
  if (projectResult.data.length === 0) throw new Error(`No project named ${project} exists`)
}

/**
 * Sets scene key in query
 * @param context Hook context
 * @returns
 */
const setSceneKey = async (context: HookContext<SceneService>) => {
  const { project, name, sceneKey } = context.params.query as SceneQuery
  if (!sceneKey) {
    if (project) {
      checkIfProjectExists(context, project.toString())
    }

    context.params.query = { ...context.params.query, sceneKey: `projects/${project}/${name}.scene.json` as SceneID }
  }
}

/**
 * Gets scene data
 * @param context Hook context
 * @returns
 */
const getScene = async (context: HookContext<SceneService>) => {
  const metadataOnly = context.params?.query?.metadataOnly
  const internal = context.params?.query?.internal
  const storageProviderName = context.params?.query?.storageProviderName
  const sceneKey = context.params?.query?.sceneKey

  if (!sceneKey) throw new Error('No sceneKey provided')

  const sceneData = await getSceneData(sceneKey, metadataOnly, internal, storageProviderName)

  context.result = sceneData as SceneDataType
}

/**
 * Ensures new scene name is unique
 * @param context Hook context
 * @returns
 */
const ensureUniqueName = async (context: HookContext<SceneService>) => {
  if (!context.data || context.method !== 'create') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  const data: SceneCreateData = context.data
  logger.info('[scene.create]: ' + data.project)
  context.newSceneName = NEW_SCENE_NAME
  const storageProviderName = data.storageProvider
  context.storageProvider = getStorageProvider(storageProviderName)
  let counter = 1

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (counter > 1) context.newSceneName = NEW_SCENE_NAME + '-' + counter
    const sceneNameExists = await context.storageProvider.doesExist(
      `${context.newSceneName}.scene.json`,
      data.directory
    )
    if (!sceneNameExists) break

    counter++
  }
}

/**
 * Creates new scene in storage provider
 * @param context Hook context
 * @returns
 */
const createSceneInStorageProvider = async (context: HookContext<SceneService>) => {
  if (!context.data || context.method !== 'create') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  const data: SceneCreateData = context.data

  await Promise.all(
    SCENE_ASSET_FILES.map((ext) =>
      context.storageProvider.moveObject(
        `default${ext}`,
        `${context.newSceneName}${ext}`,
        `projects/default-project`,
        data.directory,
        true
      )
    )
  )
  try {
    await context.storageProvider.createInvalidation(
      SCENE_ASSET_FILES.map((asset) => `${data.directory}${context.newSceneName}${asset}`)
    )
  } catch (e) {
    logger.error(e)
    logger.info(SCENE_ASSET_FILES)
  }
}

/**
 * Creates new scene in local storage
 * @param context Hook context
 * @returns
 */
const createSceneLocally = async (context: HookContext<SceneService>) => {
  if (!context.data || context.method !== 'create') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  const data: SceneCreateData = context.data

  if (isDev) {
    const projectPathLocal = path.resolve(appRootPath.path, data.localDirectory!)
    for (const ext of SCENE_ASSET_FILES) {
      fs.copyFileSync(
        path.resolve(appRootPath.path, `${DEFAULT_DIRECTORY}/default${ext}`),
        path.resolve(projectPathLocal + '/' + context.newSceneName + ext)
      )
    }
  }
}

/**
 * Sets scene create result
 * @param context Hook context
 * @returns
 */
const setSceneCreateResult = async (context: HookContext<SceneService>) => {
  if (!context.data || context.method !== 'create') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  const data: SceneCreateData = context.data

  const scenePath = `${data.directory}${context.newSceneName}.scene.json` as SceneID

  context.result = { project: data.project!, name: context.newSceneName, scenePath }
}

/**
 * Renames scene in storage provider
 * @param context Hook context
 * @returns
 */
const renameSceneInStorageProvider = async (context: HookContext<SceneService>) => {
  if (!context.data || context.method !== 'patch') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  const { newSceneName, oldSceneName, storageProviderName, directory } = context.data as ScenePatch

  const storageProvider = getStorageProvider(storageProviderName)

  for (const ext of SCENE_ASSET_FILES) {
    const oldSceneJsonName = `${oldSceneName}${ext}`
    const newSceneJsonName = `${newSceneName}${ext}`

    if (await storageProvider.doesExist(oldSceneJsonName, directory!)) {
      await storageProvider.moveObject(oldSceneJsonName, newSceneJsonName, directory!, directory!)
      try {
        await storageProvider.createInvalidation([directory + oldSceneJsonName, directory + newSceneJsonName])
      } catch (e) {
        logger.error(e)
        logger.info(directory + oldSceneJsonName, directory + newSceneJsonName)
      }
    }
  }
}

/**
 * Renames scene in local stoprage
 * @param context Hook context
 * @returns
 */
const renameSceneLocally = async (context: HookContext<SceneService>) => {
  if (!context.data || context.method !== 'patch') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  const { newSceneName, oldSceneName, localDirectory } = context.data as ScenePatch

  if (isDev) {
    for (const ext of SCENE_ASSET_FILES) {
      const oldSceneJsonPath = path.resolve(appRootPath.path, `${localDirectory}${oldSceneName}${ext}`)
      if (fs.existsSync(oldSceneJsonPath)) {
        const newSceneJsonPath = path.resolve(appRootPath.path, `${localDirectory}${newSceneName}${ext}`)
        fs.renameSync(oldSceneJsonPath, newSceneJsonPath)
      }
    }
  }
}

/**
 * Updates scene id in locations
 * @param context Hook context
 * @returns
 */
const updateLocations = async (context: HookContext<SceneService>) => {
  if (!context.data || context.method !== 'patch') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  const { newSceneName, oldSceneName, directory } = context.data as ScenePatch

  const locations = (await context.app.service(locationPath).find({
    query: { sceneId: { $like: `${directory}${oldSceneName}.scene.json` as SceneID } }
  })) as any as LocationType[]

  if (locations.length > 0) {
    await Promise.all(
      locations.map(async (location) => {
        await context.app
          .service(locationPath)
          .patch(location.id, { sceneId: `${directory}${newSceneName}.scene.json` as SceneID })
      })
    )
  }
  context.result = null
}

/**
 * Ensures scene data is parsed
 * @param context Hook context
 * @returns
 */
const ensureParsedSceneData = async (context: HookContext<SceneService>) => {
  if (!context.data || context.method !== 'update') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  logger.info('[scene.update]: ', context.data)

  const { sceneData } = context.data as SceneCreateData
  context.parsedSceneData = sceneData
  if (sceneData && typeof sceneData === 'string') context.parsedSceneData = JSON.parse(sceneData)
}

/**
 * Saves scene in storage provider
 * @param context Hook context
 * @returns
 */
const saveSceneInStorageProvider = async (context: HookContext<SceneService>) => {
  if (!context.data || context.method !== 'update') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }
  const { name, thumbnailBuffer, storageProviderName, directory } = context.data as SceneCreateData
  const storageProvider = getStorageProvider(storageProviderName)

  const newSceneJsonPath = `${directory}${name}.scene.json`
  await storageProvider.putObject({
    Key: newSceneJsonPath,
    Body: Buffer.from(
      JSON.stringify(
        cleanStorageProviderURLs(context.parsedSceneData ?? (defaultSceneSeed as unknown as SceneJsonType))
      )
    ),
    ContentType: 'application/json'
  })

  if (thumbnailBuffer && Buffer.isBuffer(thumbnailBuffer)) {
    const sceneThumbnailPath = `${directory}${name}.thumbnail.jpg`
    await storageProvider.putObject({
      Key: sceneThumbnailPath,
      Body: thumbnailBuffer as Buffer,
      ContentType: 'image/jpeg'
    })
  }

  try {
    await storageProvider.createInvalidation(SCENE_ASSET_FILES.map((asset) => `${directory}${name}${asset}`))
  } catch (e) {
    logger.error(e)
    logger.info(SCENE_ASSET_FILES)
  }
}

/**
 * Saves scene in local storage
 * @param context Hook context
 * @returns
 */
const saveSceneLocally = async (context: HookContext<SceneService>) => {
  if (!context.data || context.method !== 'update') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  const { name, thumbnailBuffer, localDirectory } = context.data as SceneCreateData

  if (isDev) {
    const newSceneJsonPathLocal = path.resolve(appRootPath.path, `${localDirectory}${name}.scene.json`)

    fs.writeFileSync(
      path.resolve(newSceneJsonPathLocal),
      JSON.stringify(
        cleanStorageProviderURLs(context.parsedSceneData ?? (defaultSceneSeed as unknown as SceneJsonType)),
        null,
        2
      )
    )

    if (thumbnailBuffer && Buffer.isBuffer(thumbnailBuffer)) {
      const sceneThumbnailPath = path.resolve(appRootPath.path, `${localDirectory}${name}.thumbnail.jpg`)
      fs.writeFileSync(path.resolve(sceneThumbnailPath), thumbnailBuffer as Buffer)
    }
  }
}

/**
 * Sets scene save result
 * @param context Hook context
 * @returns
 */
const setSceneSaveResult = async (context: HookContext<SceneService>) => {
  if (!context.data || context.method !== 'update') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  const { name, directory } = context.data as SceneCreateData

  // return scene id for update hooks
  context.result = { id: `${directory!.split('/')[1]}/${name}` } as SceneUpdate
}

/**
 * Removes scene in local storage
 * @param context Hook context
 * @returns
 */
const removeSceneLocally = async (context: HookContext<SceneService>) => {
  if (context.method !== 'remove') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  const sceneName = context.params?.query?.name
  const localDirectory = context.params!.query!.localDirectory!.toString()!

  for (const ext of SCENE_ASSET_FILES) {
    const assetFilePath = path.resolve(appRootPath.path, `${localDirectory}/${sceneName}${ext}`)
    if (fs.existsSync(assetFilePath)) {
      fs.rmSync(path.resolve(assetFilePath))
    }
  }
}

/**
 * Removes scene in storage provider
 * @param context Hook context
 * @returns
 */
const removeSceneInStorageProvider = async (context: HookContext<SceneService>) => {
  if (context.method !== 'remove') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  const storageProviderName = context.params?.query?.storageProviderName
  const storageProvider = getStorageProvider(storageProviderName)
  const directory = context.params!.query!.directory!.toString()!
  const sceneName = context.params?.query?.name

  await storageProvider.deleteResources(SCENE_ASSET_FILES.map((ext) => `${directory}${sceneName}${ext}`))

  try {
    await storageProvider.createInvalidation(SCENE_ASSET_FILES.map((asset) => `${directory}${sceneName}${asset}`))
  } catch (e) {
    logger.error(e)
    logger.info(SCENE_ASSET_FILES)
  }

  context.result = null
}

// /**
//  * Sets directory in data
//  * @param context Hook context
//  * @returns
//  */
// const getDirectoryFromData = async (context: HookContext<SceneService>) => {
//   if (!context.data) {
//     throw new BadRequest(`${context.path} service data is empty`)
//   }
//   const data: SceneCreateData = context.data

//   if (!data.directory) {
//       checkIfProjectExists(context, item.project!)
//       data.directory = `projects/${item.project}/`
//       data.localDirectory = `packages/projects/projects/${item.project}/`
//     context.data = data
//   }
// }

/**
 * Sets directory in data of patch
 * @param context Hook context
 * @returns
 */
const getDirectoryFromData = async (context: HookContext<SceneService>) => {
  const data = context.data as ScenePatch | SceneCreateData
  if (!data.directory) {
    checkIfProjectExists(context, data.project!)
    data.directory = `projects/${data.project}/`
    data.localDirectory = `packages/projects/projects/${data.project}/`
  }

  context.data = data
}

/**
 * Sets directory in query
 * @param context Hook context
 * @returns
 */
const getDirectoryFromQuery = async (context: HookContext<SceneService>) => {
  if (!context.params.query!.directory) {
    checkIfProjectExists(context, context.params.query!.project!.toString())
    context.params.query!.directory = `projects/${context.params.query!.project}/`
    context.params.query!.localDirectory = `packages/projects/projects/${context.params.query!.project}/`
  }
}

export default createSkippableHooks(
  {
    before: {
      all: [],
      find: [enableClientPagination(), findScene],
      get: [setSceneKey, getScene],
      create: [
        iff(isProvider('external'), verifyScope('editor', 'write'), projectPermissionAuthenticate(false)),
        getDirectoryFromData,
        ensureUniqueName,
        createSceneInStorageProvider,
        createSceneLocally,
        setSceneCreateResult
      ],
      update: [
        iff(isProvider('external'), verifyScope('editor', 'write'), projectPermissionAuthenticate(false)),
        getDirectoryFromData,
        ensureParsedSceneData,
        saveSceneInStorageProvider,
        saveSceneLocally,
        setSceneSaveResult
      ],
      patch: [
        iff(isProvider('external'), verifyScope('editor', 'write'), projectPermissionAuthenticate(false)),
        getDirectoryFromData,
        renameSceneInStorageProvider,
        renameSceneLocally,
        updateLocations
      ],
      remove: [
        iff(isProvider('external'), verifyScope('editor', 'write'), projectPermissionAuthenticate(false)),
        getDirectoryFromQuery,
        removeSceneLocally,
        removeSceneInStorageProvider
      ]
    },

    after: {
      all: [],
      find: [],
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
  },
  ['find']
)
