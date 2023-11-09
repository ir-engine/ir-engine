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

import { discardQuery, iff, isProvider } from 'feathers-hooks-common'

import { ProjectType, projectPath } from '@etherealengine/engine/src/schemas/projects/project.schema'
import {
  sceneDataValidator,
  scenePatchValidator,
  sceneQueryValidator
} from '@etherealengine/engine/src/schemas/projects/scene.schema'
import { BadRequest } from '@feathersjs/errors'
import { Paginated } from '@feathersjs/feathers'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { HookContext } from '../../../declarations'
import logger from '../../ServerLogger'
import projectPermissionAuthenticate from '../../hooks/project-permission-authenticate'
import setResponseStatusCode from '../../hooks/set-response-status-code'
import verifyScope from '../../hooks/verify-scope'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import { SceneService } from './scene.class'
import { sceneDataResolver, scenePatchResolver, sceneQueryResolver } from './scene.resolvers'
const sceneAssetFiles = ['.scene.json', '.thumbnail.ktx2', '.envmap.ktx2']

const replaceProjectName = async (context: HookContext<SceneService>) => {
  if (context.params && context.params.query && context.params.query.projectName) {
    const project = (await context.app
      .service(projectPath)
      .find({ query: { name: context.params.query.projectName, $limit: 1 } })) as Paginated<ProjectType>
    if (!project || project.data.length === 0) {
      throw new BadRequest(`Project ${context.params.query.projectName} not found`)
    }
    context.params.query.projectId = project.data[0].id
    delete context.params.query.projectName
  }
}

const deleteSceneResources = async (context: HookContext<SceneService>) => {
  const storageProviderName = context.params?.query?.storageProvider
  const storageProvider = getStorageProvider(storageProviderName)

  const scene = await context.service._get(context.id!)
  const sceneName = scene.name
  const projectId = context.params.query?.projectId?.toString() ?? scene.projectId

  const project = await context.app.service(projectPath).get(projectId!)

  const scenePath = `projects/${project.name}/${sceneName}.scene.json`
  const thumbnailPath = `projects/${project.name}/${sceneName}.thumbnail.ktx2`
  const envMapPath = `projects/${project.name}/${sceneName}.envmap.ktx2`

  await storageProvider.deleteResources([scenePath, thumbnailPath, envMapPath])

  try {
    await storageProvider.createInvalidation([scenePath, thumbnailPath, envMapPath])
  } catch (e) {
    logger.error(e)
    logger.info(sceneAssetFiles)
  }
  delete context.params.query?.storageProvider
  delete context.params.query.projectName
}

export default {
  before: {
    all: [() => schemaHooks.validateQuery(sceneQueryValidator), schemaHooks.resolveQuery(sceneQueryResolver)],
    find: [
      replaceProjectName,
      discardQuery('metadataOnly'),
      discardQuery('storageProvider'),
      discardQuery('name'),
      discardQuery('internal')
    ],
    get: [],
    create: [
      () => schemaHooks.validateData(sceneDataValidator),
      schemaHooks.resolveData(sceneDataResolver),
      iff(isProvider('external'), verifyScope('editor', 'write'), projectPermissionAuthenticate(false))
    ],
    update: [iff(isProvider('external'), verifyScope('editor', 'write'), projectPermissionAuthenticate(false))],
    patch: [
      () => schemaHooks.validateData(scenePatchValidator),
      schemaHooks.resolveData(scenePatchResolver),
      iff(isProvider('external'), verifyScope('editor', 'write'), projectPermissionAuthenticate(false))
    ],
    remove: [
      iff(isProvider('external'), verifyScope('editor', 'write'), projectPermissionAuthenticate(false)),
      deleteSceneResources
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
} as any
