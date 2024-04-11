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
  AssetQuery,
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
const checkIfProjectExists = async (context: HookContext<AssetService>, project: string) => {
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
const checkAssetProjectExists = async (context: HookContext<AssetService>) => {
  const { project } = context.params.query as AssetQuery
  if (project) {
    checkIfProjectExists(context, project.toString())
  }
}

/**
 * Removes scene in local storage
 * @param context Hook context
 * @returns
 */
const removeAssetLocally = async (context: HookContext<AssetService>) => {
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
 * Sets directory in query
 * @param context Hook context
 * @returns
 */
const getDirectoryFromQuery = async (context: HookContext<AssetService>) => {
  if (!context.params.query!.directory) {
    checkIfProjectExists(context, context.params.query!.project!.toString())
    context.params.query!.directory = `projects/${context.params.query!.project}/`
    context.params.query!.localDirectory = `packages/projects/projects/${context.params.query!.project}/`
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
    delete context.data.project
  }
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

export default createSkippableHooks(
  {
    around: {
      all: [schemaHooks.resolveExternal(assetExternalResolver), schemaHooks.resolveResult(assetResolver)]
    },
    before: {
      all: [() => schemaHooks.validateQuery(assetQueryValidator), schemaHooks.resolveQuery(assetQueryResolver)],
      find: [enableClientPagination(), resolveProjectIdForAssetQuery],
      get: [checkAssetProjectExists],
      create: [
        iff(isProvider('external'), verifyScope('editor', 'write'), projectPermissionAuthenticate(false)),
        () => schemaHooks.validateData(assetDataValidator),
        schemaHooks.resolveData(assetDataResolver),
        resolveProjectIdForAssetData
      ],
      update: [
        iff(isProvider('external'), verifyScope('editor', 'write'), projectPermissionAuthenticate(false)),
        () => schemaHooks.validateData(assetDataValidator),
        schemaHooks.resolveData(assetDataResolver),
        resolveProjectIdForAssetData
      ],
      patch: [
        iff(isProvider('external'), verifyScope('editor', 'write'), projectPermissionAuthenticate(false)),
        () => schemaHooks.validateData(assetDataValidator),
        schemaHooks.resolveData(assetDataResolver),
        resolveProjectIdForAssetData
      ],
      remove: [
        iff(isProvider('external'), verifyScope('editor', 'write'), projectPermissionAuthenticate(false)),
        getDirectoryFromQuery,
        removeAssetLocally
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
