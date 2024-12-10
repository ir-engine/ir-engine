/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/
import { BadRequest, Forbidden, NotFound } from '@feathersjs/errors'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { discardQuery, iff, iffElse, isProvider } from 'feathers-hooks-common'

import { StaticResourceType, staticResourcePath } from '@ir-engine/common/src/schemas/media/static-resource.schema'

import { projectHistoryPath, projectPath } from '@ir-engine/common/src/schema.type.module'
import { isEmpty } from 'lodash'
import { HookContext } from '../../../declarations'
import logger from '../../ServerLogger'
import allowNullQuery from '../../hooks/allow-null-query'
import checkScope from '../../hooks/check-scope'
import enableClientPagination from '../../hooks/enable-client-pagination'
import isAction from '../../hooks/is-action'
import resolveProjectId from '../../hooks/resolve-project-id'
import resolveProjectsByPermission from '../../hooks/resolve-projects-by-permission'
import setLoggedinUserInBody from '../../hooks/set-loggedin-user-in-body'
import verifyProjectPermission from '../../hooks/verify-project-permission'
import verifyScope from '../../hooks/verify-scope'
import { getStorageProvider } from '../storageprovider/storageprovider'
import { createStaticResourceHash } from '../upload-asset/upload-asset.service'
import { patchSingleProjectResourcesJson, removeProjectResourcesJson } from './static-resource-helper'
import { StaticResourceService } from './static-resource.class'
import {
  staticResourceDataResolver,
  staticResourcePatchResolver,
  staticResourceResolver
} from './static-resource.resolvers'

const ensureProject = async (context: HookContext<StaticResourceService>) => {
  if (!context.data || !(context.method === 'create' || context.method === 'update')) {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  const data = Array.isArray(context.data) ? context.data : [context.data]

  for (const item of data)
    if (item.key?.startsWith('projects/') && !item.project)
      throw new BadRequest('Project is required for project resources')
}

/**
 * Ensure static-resource with the specified id exists and user is creator of the resource
 * @param context
 * @returns
 */
const ensureResource = async (context: HookContext<StaticResourceService>) => {
  const resource = await context.app.service(staticResourcePath).get(context.id!)

  if (!resource.userId) {
    if (context.params?.provider) await verifyScope('admin', 'admin')(context as any)
  } else if (context.params?.provider && resource.userId !== context.params?.user?.id)
    throw new Forbidden('You are not the creator of this resource')

  if (resource.key) {
    const storageProvider = getStorageProvider()
    await storageProvider.deleteResources([resource.key])
  }
}

const createHashIfNeeded = async (context: HookContext<StaticResourceService>) => {
  if (!context.data || !(context.method === 'create' || context.method === 'update')) {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  if (Array.isArray(context.data)) throw new BadRequest('Batch create is not supported')

  const data = context.data

  if (!data.key) throw new BadRequest('key is required')

  if (!data.hash) {
    const storageProvider = getStorageProvider()
    const [_, directory, file] = /(.*)\/([^\\\/]+$)/.exec(data.key)!
    if (!(await storageProvider.doesExist(file, directory))) throw new BadRequest('File could not be found')
    const result = await storageProvider.getObject(data.key)
    const hash = createStaticResourceHash(result.Body)
    context.data.hash = hash
  }
}

const updateName = async (context: HookContext<StaticResourceService>) => {
  if (!context.data || !(context.method === 'create' || context.method === 'update' || context.method === 'patch')) {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  if (Array.isArray(context.data)) throw new BadRequest('Batch create is not supported')

  let id = context.id
  const data = context.data

  if (!data.key) {
    return
  }

  if (data.name) {
    return
  }

  let shouldUpdateName = false
  if (context.method === 'create') {
    shouldUpdateName = true
  } else {
    if (!id) {
      return
    }
    const existingResource = await context.app.service(staticResourcePath).get(id, {
      query: {
        $select: ['key', 'name']
      }
    })

    const [existing_, existingDirectory, existingFile] = /(.*)\/([^\\\/]+$)/.exec(existingResource.key)!
    if (!existingResource.name || existingResource.name === existingFile) {
      shouldUpdateName = true
    }
  }

  if (shouldUpdateName) {
    const [_, directory, file] = /(.*)\/([^\\\/]+$)/.exec(data.key)!
    context.data.name = file
  }
}

const updateResourcesJson = async (context: HookContext<StaticResourceService>) => {
  if (!context.method || !(context.method === 'create' || context.method === 'update' || context.method === 'patch'))
    throw new BadRequest('[updateResourcesJson] Only create, update, patch methods are supported')

  if (!context.result) throw new BadRequest('[updateResourcesJson] Result not found')

  const ignoreResourcesJson = context.params?.ignoreResourcesJson
  if (ignoreResourcesJson) return

  const results =
    'data' in context.result ? context.result.data : Array.isArray(context.result) ? context.result : [context.result]

  for (const result of results) {
    await patchSingleProjectResourcesJson(context.app, result.id)
  }
}

const removeResourcesJson = async (context: HookContext<StaticResourceService>) => {
  if (!context.method || context.method !== 'remove')
    throw new BadRequest('[removeResourcesJson] Only remove method is supported')

  if (!context.result) throw new BadRequest('[removeResourcesJson] Result not found')

  const ignoreResourcesJson = context.params?.ignoreResourcesJson
  if (ignoreResourcesJson) return

  const results =
    'data' in context.result ? context.result.data : Array.isArray(context.result) ? context.result : [context.result]

  for (const result of results) {
    await removeProjectResourcesJson(context.app, result)
  }
}

/**
 * Gets the name of the project to which the resource belongs
 * @param context
 * @returns
 */
const getProjectName = async (context: HookContext<StaticResourceService>) => {
  if (!context.id) {
    throw new BadRequest('Static Resource id missing in the request')
  }
  const resource = await context.app.service(staticResourcePath).get(context.id)
  if (!resource) {
    throw new NotFound('resource not found.')
  }
  context.params.query = {
    ...context.params.query,
    project: resource.project
  }
  return context
}

const hasProjectField = (context: HookContext<StaticResourceService>) => {
  return context.params.query?.project != undefined
}

const isKeyPublic = (context: HookContext<StaticResourceService>) => {
  if (context.method !== 'get') throw new BadRequest('isKeyPublic hook only works for get method')
  const result = context.result as StaticResourceType

  if (!result.project) return

  const projectRelativeKey = result.key.replace(`projects/${result.project}/`, '')
  if (!projectRelativeKey.startsWith('public/') && !projectRelativeKey.startsWith('assets/'))
    throw new Forbidden('Cannot access this resource')

  return context
}

const deleteOldThumbnail = async (context: HookContext<StaticResourceService>) => {
  const data = context.data
  const id = context.id
  if (!data || !id) return context
  const resources = Array.isArray(data) ? data : [data]
  for (const resource of resources) {
    if (!resource.thumbnailKey) continue
    const existingResource = await context.app.service(staticResourcePath).get(id, {
      query: {
        $select: ['thumbnailKey']
      }
    })
    if (!existingResource.thumbnailKey || existingResource.thumbnailKey === resource.thumbnailKey) continue
    const resourcesWithOldThumbnail = await context.app.service(staticResourcePath).find({
      query: {
        thumbnailKey: existingResource.thumbnailKey,
        type: { $ne: 'thumbnail' },
        $select: ['id']
      }
    })
    if (resourcesWithOldThumbnail.data.length > 1) {
      logger.warn('Thumbnail is still in use, not deleting')
      continue
    }
    const oldThumbnail = await context.app.service(staticResourcePath).find({
      query: {
        key: existingResource.thumbnailKey,
        $select: ['id']
      }
    })
    if (oldThumbnail.data.length) {
      const oldThumbnailResource = oldThumbnail.data[0]
      await context.app.service(staticResourcePath).remove(oldThumbnailResource.id)
    } else {
      logger.warn('Old thumbnail resource not found')
    }
  }
  return context
}

const resolveThumbnailURL = async (context: HookContext<StaticResourceService>) => {
  if (!context.result) return context
  const data = context.result
  const dataArr = data ? (Array.isArray(data) ? data : 'data' in data ? data.data : [data]) : []

  context.hashedThumbnailResults = {}

  const thumbkeyToIndex = new Map<string, string[]>()
  const storageProvider = getStorageProvider()

  for (const resource of dataArr) {
    /** Thumbnail resources should resolve themselves for their thumbnail fields */
    if (resource.type === 'thumbnail') {
      resource.thumbnailKey = resource.key
      const thumbnailURL = storageProvider.getCachedURL(resource.key, context.params.isInternal)
      const thumbnailURLWithHash = thumbnailURL + '?hash=' + resource.hash.slice(0, 6)
      context.hashedThumbnailResults[resource.id] = thumbnailURLWithHash
    } else {
      if (resource.thumbnailKey) {
        if (!thumbkeyToIndex.has(resource.thumbnailKey)) thumbkeyToIndex.set(resource.thumbnailKey, [])
        thumbkeyToIndex.get(resource.thumbnailKey)?.push(resource.id)
      }
    }
  }

  if (!thumbkeyToIndex.size) return context

  const thumbnailResources = await context.app.service(staticResourcePath).find({
    query: {
      type: 'thumbnail',
      key: {
        $in: [...thumbkeyToIndex.keys()]
      }
    },
    paginate: false
  })

  for (const thumbnailResource of thumbnailResources) {
    const thumbnailURL = storageProvider.getCachedURL(thumbnailResource.key, context.params.isInternal)
    const thumbnailURLWithHash = thumbnailURL + '?hash=' + thumbnailResource.hash.slice(0, 6)
    const ids = thumbkeyToIndex.get(thumbnailResource.key)

    if (!ids) continue
    for (const id of ids) context.hashedThumbnailResults[id] = thumbnailURLWithHash
  }

  return context
}

/**
 * Returns the corresponding action string based on the resource type and action type.
 *
 * @param {string} resourceType - The type of the resource.
 * @param {ActionType} actionType - The type of action being performed.
 * @returns {string} - The action string corresponding to the given resource and action types.
 *
 */
const getActionType = (resourceType: string, actionType: 'delete' | 'patch'): string => {
  const actionsMap = {
    scene: {
      delete: 'SCENE_REMOVED',
      patch: 'SCENE_MODIFIED'
    },
    default: {
      delete: 'RESOURCE_REMOVED',
      patch: 'RESOURCE_MODIFIED'
    }
  }

  return actionsMap[resourceType]?.[actionType] || actionsMap.default[actionType]
}

const addLog = async (context: HookContext<StaticResourceService>, actionType: 'delete' | 'patch') => {
  try {
    const resource = context.result as StaticResourceType

    const project = await context.app.service(projectPath).find({
      query: {
        name: resource.project,
        $limit: 1
      }
    })

    if (isEmpty(project.data)) {
      throw new Error('Project not found')
    }

    const projectId = project.data[0].id

    const action: any = getActionType(resource.type, actionType)

    await context.app.service(projectHistoryPath).create({
      projectId: projectId,
      userId: context.params.user?.id || null,
      action,
      actionIdentifier: resource.id,
      actionIdentifierType: 'static-resource',
      actionDetail: JSON.stringify({
        url: resource.key
      })
    })
  } catch (error) {
    console.error(`Error in adding ${actionType} log:`, error)
  }
}

export default {
  around: {
    all: [schemaHooks.resolveResult(staticResourceResolver)]
  },

  before: {
    all: [],
    find: [
      iff(
        isProvider('external'),
        iffElse(
          (ctx: HookContext) => isAction('admin')(ctx) && checkScope('static_resource', 'read')(ctx),
          [],
          [
            verifyScope('editor', 'write'),
            iffElse(
              hasProjectField,
              [resolveProjectId(), verifyProjectPermission(['owner', 'editor', 'reviewer'])],
              [resolveProjectsByPermission()]
            ) as any
          ]
        )
      ),
      enableClientPagination() /** @todo we should either constrain this only for when type='scene' or remove it in favour of comprehensive front end pagination */,
      allowNullQuery('thumbnailKey'),
      discardQuery('action', 'projectId')
    ],
    get: [],
    create: [
      ensureProject,
      iff(
        isProvider('external'),
        iffElse(
          checkScope('static_resource', 'write'),
          [],
          [verifyScope('editor', 'write'), resolveProjectId(), verifyProjectPermission(['owner', 'editor'])]
        )
      ),
      setLoggedinUserInBody('userId'),
      // schemaHooks.validateData(staticResourceDataValidator),
      discardQuery('projectId'),
      schemaHooks.resolveData(staticResourceDataResolver),
      createHashIfNeeded,
      updateName
    ],
    update: [
      ensureProject,
      iff(
        isProvider('external'),
        iffElse(
          checkScope('static_resource', 'write'),
          [],
          [verifyScope('editor', 'write'), resolveProjectId(), verifyProjectPermission(['owner', 'editor'])]
        )
      ),
      setLoggedinUserInBody('userId'),
      // schemaHooks.validateData(staticResourceDataValidator),
      discardQuery('projectId'),
      schemaHooks.resolveData(staticResourceDataResolver),
      createHashIfNeeded,
      updateName
    ],
    patch: [
      iff(
        isProvider('external'),
        iffElse(
          checkScope('static_resource', 'write'),
          [],
          [verifyScope('editor', 'write'), resolveProjectId(), verifyProjectPermission(['owner', 'editor'])]
        )
      ),
      deleteOldThumbnail,
      // schemaHooks.validateData(staticResourcePatchValidator),
      discardQuery('projectId'),
      schemaHooks.resolveData(staticResourcePatchResolver),
      updateName
    ],
    remove: [
      iff(
        isProvider('external'),
        iffElse(
          checkScope('static_resource', 'write'),
          [],
          [
            verifyScope('editor', 'write'),
            getProjectName,
            resolveProjectId(),
            verifyProjectPermission(['owner', 'editor'])
          ]
        )
      ),
      discardQuery('projectId'),
      ensureResource
    ]
  },

  after: {
    all: [],
    find: [resolveThumbnailURL],
    get: [
      resolveThumbnailURL,
      iff(
        isProvider('external'),
        iffElse(
          (ctx: HookContext) => checkScope('static_resource', 'read')(ctx) || verifyScope('editor', 'write')(ctx),
          [],
          [isKeyPublic]
        )
      )
    ],
    create: [updateResourcesJson],
    update: [updateResourcesJson],
    patch: [updateResourcesJson, (context) => addLog(context, 'patch')],
    remove: [removeResourcesJson, (context) => addLog(context, 'delete')]
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
