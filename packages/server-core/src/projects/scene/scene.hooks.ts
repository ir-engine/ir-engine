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
  SceneID,
  ScenePatch,
  SceneQuery,
  sceneDataValidator,
  sceneQueryValidator
} from '@etherealengine/common/src/schemas/projects/scene.schema'
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

import { LocationType, locationPath } from '@etherealengine/common/src/schemas/social/location.schema'
import enableClientPagination from '../../hooks/enable-client-pagination'
import { SceneService } from './scene.class'
import { sceneDataResolver, sceneExternalResolver, sceneQueryResolver, sceneResolver } from './scene.resolvers'

const DEFAULT_DIRECTORY = 'packages/projects/default-project'
const NEW_SCENE_NAME = 'New-Scene'
const SCENE_ASSET_FILES = ['.scene.json', '.thumbnail.jpg', '.envmap.ktx2']

export const getSceneFiles = async (directory: string, storageProviderName?: string) => {
  const storageProvider = getStorageProvider(storageProviderName)
  const fileResults = await storageProvider.listObjects(directory, false)
  return fileResults.Contents.map((dirent) => dirent.Key).filter((name) => name.endsWith('.scene.json')) as SceneID[]
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
const checkSceneProjectExists = async (context: HookContext<SceneService>) => {
  const { project } = context.params.query as SceneQuery
  if (project) {
    checkIfProjectExists(context, project.toString())
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

const resolveProjectIdForSceneData = async (context: HookContext<SceneService>) => {
  if (Array.isArray(context.data)) throw new BadRequest('Array is not supported')

  console.log(context.data)
  if (context.data && context.data.project) {
    console.log(context.data)
    const projectResult = (await context.app
      .service(projectPath)
      .find({ query: { name: context.data.project, $limit: 1 } })) as Paginated<ProjectType>
    if (projectResult.data.length === 0) throw new Error(`No project named ${context.data.project} exists`)
    context.data.projectId = projectResult.data[0].id
    delete context.data.project
    console.log(context.data)
  }
}

const resolveProjectIdForSceneQuery = async (context: HookContext<SceneService>) => {
  if (Array.isArray(context.params.query)) throw new BadRequest('Array is not supported')

  console.log(context.params.query)
  if (context.params.query && context.params.query.project) {
    console.log(context.params.query)
    const projectResult = (await context.app
      .service(projectPath)
      .find({ query: { name: context.params.query.project, $limit: 1 } })) as Paginated<ProjectType>
    if (projectResult.data.length === 0) throw new Error(`No project named ${context.params.query.project} exists`)
    context.params.query.projectId = projectResult.data[0].id
    delete context.params.query.project
    console.log(context.params.query)
  }
}

export default createSkippableHooks(
  {
    around: {
      all: [schemaHooks.resolveExternal(sceneExternalResolver), schemaHooks.resolveResult(sceneResolver)]
    },
    before: {
      all: [() => schemaHooks.validateQuery(sceneQueryValidator), schemaHooks.resolveQuery(sceneQueryResolver)],
      find: [enableClientPagination(), resolveProjectIdForSceneQuery],
      get: [checkSceneProjectExists],
      create: [
        iff(isProvider('external'), verifyScope('editor', 'write'), projectPermissionAuthenticate(false)),
        () => schemaHooks.validateData(sceneDataValidator),
        schemaHooks.resolveData(sceneDataResolver),
        resolveProjectIdForSceneData
      ],
      update: [
        iff(isProvider('external'), verifyScope('editor', 'write'), projectPermissionAuthenticate(false)),
        () => schemaHooks.validateData(sceneDataValidator),
        schemaHooks.resolveData(sceneDataResolver)
      ],
      patch: [
        iff(isProvider('external'), verifyScope('editor', 'write'), projectPermissionAuthenticate(false)),
        () => schemaHooks.validateData(sceneDataValidator),
        schemaHooks.resolveData(sceneDataResolver),
        updateLocations
      ],
      remove: [
        iff(isProvider('external'), verifyScope('editor', 'write'), projectPermissionAuthenticate(false)),
        getDirectoryFromQuery,
        removeSceneLocally
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
