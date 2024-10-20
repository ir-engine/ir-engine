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

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  projectPublishDataValidator,
  projectPublishPatchValidator,
  projectPublishQueryValidator,
  ProjectPublishType
} from '@ir-engine/common/src/schemas/projects/project-publish.schema'
import { disallow } from 'feathers-hooks-common'

import { BadRequest } from '@feathersjs/errors'
import { fileBrowserPath } from '@ir-engine/common/src/schemas/media/file-browser.schema'
import { invalidationPath } from '@ir-engine/common/src/schemas/media/invalidation.schema'
import { staticResourcePath, StaticResourceType } from '@ir-engine/common/src/schemas/media/static-resource.schema'
import { ProjectData, projectPath } from '@ir-engine/common/src/schemas/projects/project.schema'
import { locationPath, LocationType } from '@ir-engine/common/src/schemas/social/location.schema'
import { getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import { HookContext } from '../../../declarations'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import { projectDataResolver } from '../project/project.resolvers'
import { startProjectPublish } from './project-publish-helper'
import { ProjectPublishService } from './project-publish.class'
import {
  projectPublishDataResolver,
  projectPublishExternalResolver,
  projectPublishPatchResolver,
  projectPublishQueryResolver,
  projectPublishResolver
} from './project-publish.resolvers'

const sceneRelativePathIdentifier = '__$project$__'

/**
 * Updates project references in JSON data
 * @param data
 * @param oldProject
 * @param newProject
 * @returns
 */
const updateProjectReferences = (data: any, oldProject: string, newProject: string) => {
  for (const [key, val] of Object.entries(data)) {
    if (val && typeof val === 'object') {
      data[key] = updateProjectReferences(val, oldProject, newProject)
    }
    if (typeof val === 'string') {
      if (val.startsWith(sceneRelativePathIdentifier + '/' + oldProject)) {
        data[key] = data[key].replace(
          sceneRelativePathIdentifier + '/' + oldProject,
          sceneRelativePathIdentifier + '/' + newProject
        )
        console.log('Updated project reference:', val, 'to', data[key])
      }
    }
  }
  return data
}

/**
 * Remove account
 * @param context
 */
const publishProject = async (context: HookContext) => {
  await startProjectPublish(
    context.app,
    context.data.projectId,
    context.result.id,
    context.params.user.id || '',
    context.data.updatedAt,
    context.data.locations,
    false
  )
}

/**
 * Populates project in context
 * @param context
 * @returns
 */
const populateProjectInContext = async (context: HookContext<ProjectPublishService>) => {
  if (!context.data || !(context.method === 'create')) {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  if (Array.isArray(context.data)) throw new BadRequest('Batch create is not supported')

  const project = await context.app.service(projectPath).get(context.data.projectId)

  if (!project) throw new BadRequest('Project not found.')

  context.project = project
}

/**
 * Gets project id from permission and sets it in query
 * @param context
 * @returns
 */
const verifyAssetsOnly = (context: HookContext<ProjectPublishService>) => {
  if (!context.project.assetsOnly) throw new BadRequest('Only assets-only projects can be published.')
  return true
}

/**
 * Copy files from original project to published project in storage provider
 * @param context
 * @returns
 */
const copyPublishedFiles = async (context: HookContext<ProjectPublishService>) => {
  if (!context.data || !(context.method === 'create')) {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  if (Array.isArray(context.data)) throw new BadRequest('Batch create is not supported')

  const oldProject = context.project.name.split('/')[1]
  const oldPath = `projects/${context.project.name.split('/')[0]}/`

  await context.app.service(fileBrowserPath).update(null, {
    oldProject: oldProject,
    newProject: `${oldProject}-${context.data.updatedAt}`,
    oldName: `${oldProject}/`,
    newName: `${oldProject}-${context.data.updatedAt}/`,
    oldPath,
    newPath: oldPath,
    isCopy: true
  })
}

/**
 * Update project files to have new published project reference
 * @param context
 * @returns
 */
const updateProjectFiles = async (context: HookContext<ProjectPublishService>) => {
  if (!context.data || !(context.method === 'create')) {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  if (Array.isArray(context.data)) throw new BadRequest('Batch create is not supported')

  const storageProvider = getStorageProvider()

  const scenesToInvalidate = [] as string[]

  const publishProjectName = `${context.project.name}-${context.data.updatedAt}`

  const scenes = (await context.app.service(staticResourcePath).find({
    query: {
      project: publishProjectName,
      type: 'scene'
    },
    paginate: false
  })) as any as StaticResourceType[]

  for (const scene of scenes) {
    try {
      console.log('Updating project reference in scene:', scene.key)
      const sceneKey = scene.key
      const directory = sceneKey.split('/').slice(0, -1).join('/')
      const fileName = sceneKey.split('/').slice(-1).join('')
      if (!(await storageProvider.doesExist(fileName, directory))) continue
      const sceneData = await storageProvider.getObject(sceneKey)
      const sceneJSON = JSON.parse(sceneData.Body.toString())
      updateProjectReferences(sceneJSON, context.project.name, publishProjectName)
      await storageProvider.putObject(
        {
          Body: Buffer.from(JSON.stringify(sceneJSON)),
          ContentType: sceneData.ContentType,
          Key: scene.key
        },
        { isDirectory: false }
      )
      scenesToInvalidate.push(scene.key)
    } catch (e) {
      console.warn('Error updating project reference in scene:', scene.key, e)
    }

    try {
      // migrate thumbnail
      const thumbnailKey = scene.thumbnailKey
      if (!thumbnailKey) continue

      if (thumbnailKey.startsWith('projects/' + context.project.name)) {
        const newThumbnailKey = thumbnailKey.replace(
          'projects/' + context.project.name,
          'projects/' + publishProjectName
        )

        await context.app
          .service(staticResourcePath)
          .patch(null, { thumbnailKey: newThumbnailKey }, { query: { key: scene.key } })
        console.log('Updated thumbnail reference:', thumbnailKey, 'to', newThumbnailKey)
      }
    } catch (e) {
      console.warn('Error updating project reference in thumbnail:', scene.key, e)
    }
  }

  await context.app.service(invalidationPath).create(scenesToInvalidate.map((path) => ({ path })))
}

/**
 * Creates a copy of the project with the new published project name
 * @param context
 * @returns
 */
const createProjectCopy = async (context: HookContext<ProjectPublishService>) => {
  if (!context.data || !(context.method === 'create')) {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  if (Array.isArray(context.data)) throw new BadRequest('Batch create is not supported')

  const result: ProjectPublishType = context.result as ProjectPublishType

  const copyProjectData: ProjectData = {
    ...context.project,
    updatedBy: context.params?.user?.id || null,
    name: `${context.project.name}-${result.updatedAt}`,
    projectPublishId: result.id,
    isPublishedVersion: true,
    createdAt: await getDateTimeSql(),
    updatedAt: await getDateTimeSql()
  }

  delete copyProjectData.id
  delete copyProjectData.projectPermissions
  delete copyProjectData.settings

  const resolvedData = await projectDataResolver.resolve(copyProjectData, context)

  await context.app.service(projectPath)._create(resolvedData)
}

const createLocations = async (context: HookContext<ProjectPublishService>) => {
  if (!context.data || !(context.method === 'create')) {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  if (Array.isArray(context.data)) throw new BadRequest('Batch create is not supported')

  const data: LocationType[] = context['actualData'].locations

  if (!data) return

  const scenes = (await context.app.service(staticResourcePath).find({
    query: {
      project: `${context.project.name}-${context.data.updatedAt}`,
      type: 'scene'
    },
    paginate: false
  })) as any as StaticResourceType[]

  data.map((location) => {
    location.sceneId = scenes.find((scene) => scene.key === location.sceneId)!.id
  })

  await context.app.service(locationPath).create(data)
}

/**
 * Updates the original project to reference the new published project
 * @param context
 * @returns
 */
const updateProjectEntry = async (context: HookContext<ProjectPublishService>) => {
  if (!context.data || !(context.method === 'create')) {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  if (Array.isArray(context.data)) throw new BadRequest('Batch create is not supported')

  const result: ProjectPublishType = context.result as ProjectPublishType

  await context.app.service(projectPath).patch(context.project.id, { projectPublishId: result.id })
}

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(projectPublishExternalResolver),
      schemaHooks.resolveResult(projectPublishResolver)
    ]
  },

  before: {
    all: [
      schemaHooks.validateQuery(projectPublishQueryValidator),
      schemaHooks.resolveQuery(projectPublishQueryResolver)
    ],
    find: [],
    get: [],
    create: [
      schemaHooks.validateData(projectPublishDataValidator),
      schemaHooks.resolveData(projectPublishDataResolver)
      // populateProjectInContext,
      // iff(verifyAssetsOnly, copyPublishedFiles, updateProjectFiles),
      // persistData,
      // discard('locations')
    ],
    update: [disallow()],
    patch: [
      schemaHooks.validateData(projectPublishPatchValidator),
      schemaHooks.resolveData(projectPublishPatchResolver)
    ],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [publishProject], //createProjectCopy, createLocations, updateProjectEntry],
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
