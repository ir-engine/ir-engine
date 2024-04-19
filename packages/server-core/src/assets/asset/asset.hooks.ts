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

import {
  AssetPatch,
  assetDataValidator,
  assetQueryValidator
} from '@etherealengine/common/src/schemas/assets/asset.schema'
import { ProjectType, projectPath } from '@etherealengine/common/src/schemas/projects/project.schema'
import { BadRequest } from '@feathersjs/errors'
import { Paginated } from '@feathersjs/feathers'
import { hooks as schemaHooks } from '@feathersjs/schema'
import appRootPath from 'app-root-path'
import { iff, isProvider } from 'feathers-hooks-common'
import fs from 'fs'
import path from 'path'
import { HookContext } from '../../../declarations'
import { createSkippableHooks } from '../../hooks/createSkippableHooks'
import projectPermissionAuthenticate from '../../hooks/project-permission-authenticate'
import setResponseStatusCode from '../../hooks/set-response-status-code'
import verifyScope from '../../hooks/verify-scope'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'

import { isDev } from '@etherealengine/common/src/config'
import { assetPath, invalidationPath } from '@etherealengine/common/src/schema.type.module'
import logger from '../../ServerLogger'
import enableClientPagination from '../../hooks/enable-client-pagination'
import { AssetService } from './asset.class'
import { assetDataResolver, assetExternalResolver, assetQueryResolver, assetResolver } from './asset.resolvers'

const DEFAULT_DIRECTORY = 'packages/projects/default-project'
const NEW_SCENE_NAME = 'New-Scene'
const SCENE_ASSET_FILES = ['.scene.json', '.thumbnail.jpg', '.envmap.ktx2']

export const getSceneFiles = async (directory: string, storageProviderName?: string) => {
  const storageProvider = getStorageProvider(storageProviderName)
  const fileResults = await storageProvider.listObjects(directory, false)
  return fileResults.Contents.map((dirent) => dirent.Key).filter((name) => name.endsWith('.scene.json'))
}

/**
 * Checks if project in query exists
 * @param context Hook context
 * @returns
 */
const checkIfProjectExists = async (context: HookContext<AssetService>, projectId: string) => {
  const projectResult = await context.app.service(projectPath).get(projectId)
  if (!projectResult) throw new Error(`No project ${projectId} exists`)
}

/**
 * Removes scene in local storage
 * @param context Hook context
 * @returns
 */
const removeAssetFiles = async (context: HookContext<AssetService>) => {
  if (context.method !== 'remove') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  const asset = await context.app.service(assetPath).get(context.id!)

  checkIfProjectExists(context, asset.projectId!)

  const storageProvider = getStorageProvider()
  const assetURL = asset.assetURL

  const projectPathLocal = path.resolve(appRootPath.path, 'packages/projects')

  if (assetURL.endsWith('.scene.json')) {
    for (const ext of SCENE_ASSET_FILES) {
      console.log(assetURL, ext, projectPathLocal)
      if (isDev) {
        const assetFilePath = path.resolve(projectPathLocal, assetURL.replace('.scene.json', '') + ext)
        if (fs.existsSync(assetFilePath)) {
          fs.rmSync(path.resolve(assetFilePath))
        }
      } else {
        await context.app.service(invalidationPath).create([{ path: assetURL }])
      }
      await storageProvider.deleteResources([assetURL])
    }
  } else {
    if (isDev) {
      const assetFilePath = path.resolve(projectPathLocal, assetURL)
      if (fs.existsSync(assetFilePath)) {
        fs.rmSync(path.resolve(assetFilePath))
      }
    } else {
      await context.app.service(invalidationPath).create([{ path: assetURL }])
    }
    await storageProvider.deleteResources([assetURL])
  }
}

const resolveProjectIdForAssetData = async (context: HookContext<AssetService>) => {
  if (Array.isArray(context.data)) throw new BadRequest('Array is not supported')

  if (context.data && context.data.project) {
    const projectResult = (await context.app
      .service(projectPath)
      .find({ query: { name: context.data.project, $limit: 1 } })) as Paginated<ProjectType>
    if (projectResult.data.length === 0) throw new Error(`No project named ${context.data.project} exists`)
    context.data.projectId = projectResult.data[0].id
  }
}

const removeProjectForAssetData = async (context: HookContext<AssetService>) => {
  if (Array.isArray(context.data)) throw new BadRequest('Array is not supported')
  if (!context.data) return
  delete context.data.project
}

const removeNameField = async (context: HookContext<AssetService>) => {
  if (Array.isArray(context.data)) throw new BadRequest('Array is not supported')
  if (!context.data) return
  delete context.data.name
}

const resolveProjectIdForAssetQuery = async (context: HookContext<AssetService>) => {
  if (Array.isArray(context.params.query)) throw new BadRequest('Array is not supported')

  if (context.params.query && context.params.query.project) {
    const projectResult = (await context.app
      .service(projectPath)
      .find({ query: { name: context.params.query.project, $limit: 1 } })) as Paginated<ProjectType>
    if (projectResult.data.length === 0) throw new Error(`No project named ${context.params.query.project} exists`)
    context.params.query.projectId = projectResult.data[0].id
    delete context.params.query.project
  }
}

/**
 * Ensures new scene name is unique
 * @param context Hook context
 * @returns
 */
const ensureUniqueName = async (context: HookContext<AssetService>) => {
  if (!context.data || context.method !== 'create') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  if (Array.isArray(context.data)) throw new BadRequest('Array is not supported')

  if (!context.data.project) throw new BadRequest('Project is required')

  const data = context.data
  const name = context.data.name ?? NEW_SCENE_NAME
  context.data.name = name
  const storageProvider = getStorageProvider()
  let counter = 0

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (counter > 0) context.data.name = name + '-' + counter
    const sceneNameExists = await storageProvider.doesExist(
      `${context.data.name}.scene.json`,
      'projects/' + data.project
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
const createSceneInStorageProvider = async (context: HookContext<AssetService>) => {
  if (!context.data || context.method !== 'create') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  if (Array.isArray(context.data)) throw new BadRequest('Array is not supported')

  const data = context.data

  // ignore if we are seeding data
  if (data.assetURL) return

  const storageProvider = getStorageProvider()

  await Promise.all(
    SCENE_ASSET_FILES.map((ext) =>
      storageProvider.moveObject(
        `default${ext}`,
        `${data.name}${ext}`,
        `projects/default-project`,
        `projects/` + data.project,
        true
      )
    )
  )
  try {
    if (!isDev)
      await context.app.service(invalidationPath).create(
        SCENE_ASSET_FILES.map((file) => {
          return { path: `${data.project}${data.name}${file}` }
        })
      )
  } catch (e) {
    logger.error(e)
    logger.info(SCENE_ASSET_FILES)
  }

  if (!data.thumbnailURL) data.thumbnailURL = `projects/${data.project}/${data.name}.thumbnail.jpg`
}

/**
 * Creates new scene in local storage
 * @param context Hook context
 * @returns
 */
const createSceneLocally = async (context: HookContext<AssetService>) => {
  if (!context.data || context.method !== 'create') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  if (Array.isArray(context.data)) throw new BadRequest('Array is not supported')

  const data = context.data

  // ignore if we are seeding data
  if (data.assetURL) return

  if (isDev) {
    const projectPathLocal = path.resolve(appRootPath.path, 'packages/projects/projects', data.project!)
    for (const ext of SCENE_ASSET_FILES) {
      fs.copyFileSync(
        path.resolve(appRootPath.path, `${DEFAULT_DIRECTORY}/default${ext}`),
        path.resolve(projectPathLocal + '/' + data.name + ext)
      )
    }
  }

  data.assetURL = `projects/${data.project}/${data.name}.scene.json`
}

const renameAsset = async (context: HookContext<AssetService>) => {
  if (!context.data || !(context.method === 'patch' || context.method === 'update')) {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  const asset = await context.app.service(assetPath).get(context.id!)

  const data = context.data! as AssetPatch
  if (!asset.assetURL.endsWith('.scene.json')) return

  const storageProvider = getStorageProvider()
  const newName = data.name
  const oldName = asset.assetURL!.split('/').pop()!.replace('.scene.json', '')

  if (newName && newName !== oldName) {
    const oldPath = asset.assetURL
    const newPath = asset.assetURL.replace(oldName, newName)

    const projectPathLocal = path.resolve(appRootPath.path, 'packages/projects')
    for (const ext of SCENE_ASSET_FILES) {
      const oldFile = path.resolve(projectPathLocal, oldPath.replace('.scene.json', '') + ext)
      const newFile = path.resolve(projectPathLocal, newPath.replace('.scene.json', '') + ext)

      if (isDev) fs.renameSync(oldFile, newFile)
      else await context.app.service(invalidationPath).create([{ path: oldPath }, { path: newPath }])

      await storageProvider.moveObject(
        oldPath.split('/').pop()!,
        newPath.split('/').pop()!,
        path.resolve(projectPathLocal + '/' + oldPath.split('/').slice(0, -1).join('/')),
        path.resolve(projectPathLocal + '/' + oldPath.split('/').slice(0, -1).join('/')),
        true
      )
    }

    data.assetURL = newPath
    data.thumbnailURL = newPath.replace('.scene.json', '.thumbnail.jpg')
  }
}

export default createSkippableHooks(
  {
    around: {
      all: [schemaHooks.resolveExternal(assetExternalResolver), schemaHooks.resolveResult(assetResolver)]
    },
    before: {
      all: [() => schemaHooks.validateQuery(assetQueryValidator), schemaHooks.resolveQuery(assetQueryResolver)],
      find: [enableClientPagination(), resolveProjectIdForAssetQuery],
      get: [],
      create: [
        iff(isProvider('external'), verifyScope('editor', 'write'), projectPermissionAuthenticate(false)),
        () => schemaHooks.validateData(assetDataValidator),
        schemaHooks.resolveData(assetDataResolver),
        resolveProjectIdForAssetData,
        ensureUniqueName,
        createSceneInStorageProvider,
        createSceneLocally,
        removeNameField,
        removeProjectForAssetData
      ],
      update: [
        iff(isProvider('external'), verifyScope('editor', 'write'), projectPermissionAuthenticate(false)),
        () => schemaHooks.validateData(assetDataValidator),
        schemaHooks.resolveData(assetDataResolver),
        resolveProjectIdForAssetData,
        renameAsset,
        removeNameField,
        removeProjectForAssetData
      ],
      patch: [
        iff(isProvider('external'), verifyScope('editor', 'write'), projectPermissionAuthenticate(false)),
        () => schemaHooks.validateData(assetDataValidator),
        schemaHooks.resolveData(assetDataResolver),
        resolveProjectIdForAssetData,
        renameAsset,
        removeNameField,
        removeProjectForAssetData
      ],
      remove: [
        iff(isProvider('external'), verifyScope('editor', 'write'), projectPermissionAuthenticate(false)),
        removeAssetFiles
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
