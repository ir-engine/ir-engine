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

import { BadRequest } from '@feathersjs/errors'
import { Paginated } from '@feathersjs/feathers'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { iff, isProvider } from 'feathers-hooks-common'

import { ManifestJson } from '@etherealengine/common/src/interfaces/ManifestJson'
import { assetPath, fileBrowserPath } from '@etherealengine/common/src/schema.type.module'
import { AssetPatch, AssetType } from '@etherealengine/common/src/schemas/assets/asset.schema'
import { ProjectType, projectPath } from '@etherealengine/common/src/schemas/projects/project.schema'

import { HookContext } from '../../../declarations'
import config from '../../appconfig'
import { createSkippableHooks } from '../../hooks/createSkippableHooks'
import enableClientPagination from '../../hooks/enable-client-pagination'
import projectPermissionAuthenticate from '../../hooks/project-permission-authenticate'
import setResponseStatusCode from '../../hooks/set-response-status-code'
import verifyScope from '../../hooks/verify-scope'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import { AssetService } from './asset.class'
import { assetDataResolver, assetExternalResolver, assetResolver } from './asset.resolvers'

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
 * Removes asset and resource files
 * @param context Hook context
 * @returns
 */
const removeAssetFiles = async (context: HookContext<AssetService>) => {
  if (context.method !== 'remove') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  const asset = await context.app.service(assetPath).get(context.id!)

  checkIfProjectExists(context, asset.projectId!)

  const assetURL = asset.assetURL
  const thumbnailURL = asset.thumbnailURL

  if (!config.fsProjectSyncEnabled && assetURL.startsWith('projects/default-project'))
    throw new BadRequest("You cannot delete assets or scenes in project 'default-project'")

  const resourceKeys = thumbnailURL ? [assetURL, thumbnailURL] : [assetURL]

  await Promise.all(resourceKeys.map((key) => context.app.service(fileBrowserPath).remove(key)))

  // update manifest if necessary
  const manifestKey = `projects/${asset.projectName}/manifest.json`
  if (!(await context.app.service(fileBrowserPath).get(manifestKey))) return // no manifest file to update

  const projectManifestResponse = await getStorageProvider().getObject(manifestKey)
  const projectManifest = JSON.parse(projectManifestResponse.Body.toString('utf-8')) as ManifestJson
  if (!projectManifest.scenes?.length) return // no scenes to update

  const projectRelativeAssetURL = asset.assetURL.replace(`projects/${asset.projectName}/`, '')
  const sceneIndex = projectManifest.scenes.findIndex((scene) => scene === projectRelativeAssetURL)
  if (sceneIndex === -1) return // scene not found in manifest

  projectManifest.scenes.splice(sceneIndex, 1)

  await context.app.service(fileBrowserPath).patch(null, {
    fileName: 'manifest.json',
    path: `projects/${asset.projectName}`,
    body: Buffer.from(JSON.stringify(projectManifest, null, 2)),
    contentType: 'application/json'
  })
}

const resolveProjectIdForAssetData = async (context: HookContext<AssetService>) => {
  if (Array.isArray(context.data)) throw new BadRequest('Array is not supported')

  if (context.data && context.data.project) {
    const projectResult = (await context.app.service(projectPath).find({
      query: { name: context.data.project, $limit: 1 },
      isInternal: context.params.isInternal
    })) as Paginated<ProjectType>
    if (projectResult.data.length === 0) throw new Error(`No project named ${context.data.project} exists`)
    context.data.projectId = projectResult.data[0].id
  }
}

export const removeFieldsForAssetData = async (context: HookContext<AssetService>) => {
  if (Array.isArray(context.data)) throw new BadRequest('Array is not supported')
  if (!context.data) return
  delete context.data.project
  delete context.data.isScene
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
 * Ensures given assetURL name is unique by appending a number to it
 * @param context Hook context
 * @returns
 */
export const ensureUniqueName = async (context: HookContext<AssetService>) => {
  if (!context.data) {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  if (Array.isArray(context.data)) throw new BadRequest('Array is not supported')

  if (!context.data.project) throw new BadRequest('project is required')
  if (!context.data.assetURL) throw new BadRequest('assetURL is required')

  const assetURL = context.data.assetURL
  const fileName = assetURL.split('/').pop()!

  const cleanedFileNameWithoutExtension = fileName.split('.').slice(0, -1).join('.')
  const fileExtension = fileName.split('/').pop()!.split('.').pop()
  const fileDirectory = assetURL!.split('/').slice(0, -1).join('/') + '/'
  let counter = 0
  let name = cleanedFileNameWithoutExtension + '.' + fileExtension

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (counter > 0) name = cleanedFileNameWithoutExtension + '-' + counter + '.' + fileExtension
    const sceneNameExists = await context.app.service(assetPath).find({ query: { assetURL: fileDirectory + name } })
    if (sceneNameExists.total === 0) break
    counter++
  }

  context.data.assetURL = fileDirectory + name
}

/**
 * Creates new asset from template file
 * @param context Hook context
 * @returns
 */
export const createSceneFiles = async (context: HookContext<AssetService>) => {
  if (!context.data || context.method !== 'create') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  if (Array.isArray(context.data)) throw new BadRequest('Array is not supported')

  const data = context.data

  // when seeding, no sourceURL is given, and the asset file exists, we just want to add the table entry
  if (!data.sourceURL) {
    const fileExists = await context.app.service(fileBrowserPath).get(data.assetURL!)
    if (fileExists) return
  }
  const sourceAsset = (
    await context.app.service(assetPath).find({
      query: {
        assetURL: data.sourceURL
      }
    })
  ).data[0] as AssetType | undefined
  if (!sourceAsset) throw new Error(`No asset with assetURL ${data.sourceURL} exists`)

  // we no longer need the sourceURL
  delete context.data.sourceURL

  const sourceAssetName = sourceAsset.assetURL.split('/').pop()!
  const sourceAssetDirectory = sourceAsset.assetURL.split('/').slice(0, -1).join('/') + '/'

  const targetAssetName = data.assetURL!.split('/').pop()!
  const targetDirectory = data.assetURL!.split('/').slice(0, -1).join('/') + '/'

  await context.app.service(fileBrowserPath).update(null, {
    oldName: sourceAssetName,
    newName: targetAssetName,
    oldPath: sourceAssetDirectory,
    newPath: targetDirectory,
    isCopy: true
  })

  if (!data.thumbnailURL)
    data.thumbnailURL = `${targetDirectory}${targetAssetName.split('.').slice(0, -1).join('.')}.thumbnail.jpg`

  if (sourceAsset.thumbnailURL) {
    const sourceThumbnailName = sourceAsset.thumbnailURL.split('/').pop()!
    const sourceThumbnailDirectory = sourceAsset.thumbnailURL.split('/').slice(0, -1).join('/') + '/'

    const targetThumbnailName = data.thumbnailURL.split('/').pop()!
    const targetThumbnailDirectory = data.thumbnailURL.split('/').slice(0, -1).join('/') + '/'

    await context.app.service(fileBrowserPath).update(null, {
      oldName: sourceThumbnailName,
      newName: targetThumbnailName,
      oldPath: sourceThumbnailDirectory,
      newPath: targetThumbnailDirectory,
      isCopy: true
    })
  }
}

export const updateManifestCreate = async (context: HookContext<AssetService>) => {
  if (!context.data || context.method !== 'create') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  if (Array.isArray(context.data)) throw new BadRequest('Array is not supported')

  const data = context.data

  if (!data.isScene) return

  // update manifest if necessary
  const manifestKey = `projects/${data.project}/manifest.json`
  if (!(await context.app.service(fileBrowserPath).get(manifestKey))) return // no manifest file to update

  const projectManifestResponse = await getStorageProvider().getObject(manifestKey)
  const projectManifest = JSON.parse(projectManifestResponse.Body.toString('utf-8')) as ManifestJson

  if (!projectManifest.scenes) projectManifest.scenes = []
  projectManifest.scenes.push(data.assetURL!.replace(`projects/${data.project}/`, ''))

  await context.app.service(fileBrowserPath).patch(null, {
    fileName: 'manifest.json',
    path: `projects/${data.project}`,
    body: Buffer.from(JSON.stringify(projectManifest, null, 2)),
    contentType: 'application/json'
  })
}

export const renameAsset = async (context: HookContext<AssetService>) => {
  if (!context.data || !(context.method === 'patch' || context.method === 'update')) {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  const asset = await context.app.service(assetPath).get(context.id!)

  if (!config.fsProjectSyncEnabled && asset.assetURL.startsWith('projects/default-project'))
    throw new BadRequest("You cannot rename any scenes in project 'default-project'")

  const data = context.data! as AssetPatch

  const oldName = asset.assetURL.split('/').pop()!
  const newName = data.assetURL!.split('/').pop()!
  const oldDirectory = asset.assetURL.split('/').slice(0, -1).join('/') + '/'
  const newDirectory = data.assetURL!.split('/').slice(0, -1).join('/') + '/'

  if (newName && newName !== oldName) {
    await context.app.service(fileBrowserPath).update(null, {
      oldName,
      newName,
      oldPath: oldDirectory,
      newPath: newDirectory,
      isCopy: false
    })
  }

  // update manifest if necessary
  const manifestKey = `projects/${asset.projectName}/manifest.json`
  if (!(await context.app.service(fileBrowserPath).get(manifestKey))) return // no manifest file to update

  const projectManifestResponse = await getStorageProvider().getObject(manifestKey)
  const projectManifest = JSON.parse(projectManifestResponse.Body.toString('utf-8')) as ManifestJson
  if (!projectManifest.scenes?.length) return // no scenes to update

  const projectRelativeAssetURL = data.assetURL!.replace(`projects/${asset.projectName}/`, '')
  const projectRelativeOldAssetURL = asset.assetURL!.replace(`projects/${asset.projectName}/`, '')

  const sceneIndex = projectManifest.scenes.findIndex((scene) => scene === projectRelativeOldAssetURL)
  if (sceneIndex === -1) return // scene not found in manifest

  projectManifest.scenes[sceneIndex] = projectRelativeAssetURL

  await context.app.service(fileBrowserPath).patch(null, {
    fileName: 'manifest.json',
    path: `projects/${asset.projectName}`,
    body: Buffer.from(JSON.stringify(projectManifest, null, 2)),
    contentType: 'application/json'
  })
}

export default createSkippableHooks(
  {
    around: {
      all: [schemaHooks.resolveExternal(assetExternalResolver), schemaHooks.resolveResult(assetResolver)]
    },
    before: {
      all: [],
      find: [enableClientPagination(), resolveProjectIdForAssetQuery],
      get: [],
      create: [
        iff(isProvider('external'), verifyScope('editor', 'write'), projectPermissionAuthenticate(false)),
        schemaHooks.resolveData(assetDataResolver),
        resolveProjectIdForAssetData,
        ensureUniqueName,
        createSceneFiles,
        updateManifestCreate,
        removeFieldsForAssetData
      ],
      update: [
        iff(isProvider('external'), verifyScope('editor', 'write'), projectPermissionAuthenticate(false)),
        schemaHooks.resolveData(assetDataResolver),
        resolveProjectIdForAssetData,
        renameAsset,
        removeFieldsForAssetData
      ],
      patch: [
        iff(isProvider('external'), verifyScope('editor', 'write'), projectPermissionAuthenticate(false)),
        schemaHooks.resolveData(assetDataResolver),
        resolveProjectIdForAssetData,
        ensureUniqueName,
        renameAsset,
        removeFieldsForAssetData
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
  ['create', 'update', 'patch']
)
