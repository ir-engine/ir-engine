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

import { NullableId, Paginated, ServiceInterface } from '@feathersjs/feathers/lib/declarations'
import { KnexAdapterParams } from '@feathersjs/knex'
import appRootPath from 'app-root-path'
import fs from 'fs'
import { Knex } from 'knex'
import path from 'path/posix'

import { projectPath, ProjectType } from '@etherealengine/common/src/schema.type.module'
import {
  FileBrowserContentType,
  FileBrowserPatch,
  FileBrowserUpdate
} from '@etherealengine/common/src/schemas/media/file-browser.schema'
import { invalidationPath } from '@etherealengine/common/src/schemas/media/invalidation.schema'
import { staticResourcePath, StaticResourceType } from '@etherealengine/common/src/schemas/media/static-resource.schema'
import {
  projectPermissionPath,
  ProjectPermissionType
} from '@etherealengine/common/src/schemas/projects/project-permission.schema'
import { processFileName } from '@etherealengine/common/src/utils/processFileName'
import { checkScope } from '@etherealengine/spatial/src/common/functions/checkScope'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import { getIncrementalName } from '../FileUtil'
import { getStorageProvider } from '../storageprovider/storageprovider'
import { StorageObjectInterface } from '../storageprovider/storageprovider.interface'
import { createStaticResourceHash } from '../upload-asset/upload-asset.service'

export const projectsRootFolder = path.join(appRootPath.path, 'packages/projects')

export interface FileBrowserParams extends KnexAdapterParams {
  nestingDirectory?: string
}

const checkDirectoryInsideNesting = (directory: string, nestingDirectory?: string) => {
  if (!nestingDirectory) {
    if (/recordings/.test(directory)) nestingDirectory = 'recordings'
    else nestingDirectory = 'projects'
  }
  const isInsideNestingDirectoryRegex = new RegExp(`^\/?(${nestingDirectory})`, 'g')

  if (!isInsideNestingDirectoryRegex.test(directory)) {
    throw new Error(`Not allowed to access "${directory}"`)
  }
}

/**
 * A class for File Browser service
 */
export class FileBrowserService
  implements
    ServiceInterface<
      boolean | string | Paginated<FileBrowserContentType>,
      string | FileBrowserUpdate | FileBrowserPatch,
      FileBrowserParams,
      FileBrowserPatch
    >
{
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  /**
   * Returns the metadata for a single file or directory
   */
  async get(key: string, params?: FileBrowserParams & { query: { getNestingDirectory?: boolean } }) {
    if (params?.query?.getNestingDirectory) {
      return params.nestingDirectory || 'projects'
    }

    if (!key) return false
    const storageProvider = getStorageProvider()
    const [_, directory, file] = /(.*)\/([^\\\/]+$)/.exec(key)!

    checkDirectoryInsideNesting(directory, params?.nestingDirectory)

    return await storageProvider.doesExist(file, directory)
  }

  /**
   * Return the metadata for each file in a directory
   */
  async find(params?: FileBrowserParams) {
    if (!params) params = {}
    if (!params.query) params.query = {}
    const { $skip, $limit } = params.query
    let { directory } = params.query

    const skip = $skip ? $skip : 0
    const limit = $limit ? $limit : 100

    const storageProvider = getStorageProvider()
    const isAdmin = params.user && (await checkScope(params.user, 'admin', 'admin'))
    if (directory[0] === '/') directory = directory.slice(1)

    checkDirectoryInsideNesting(directory, params.nestingDirectory)

    let result = await storageProvider.listFolderContent(directory)
    Object.entries(params.query).forEach(([key, value]) => {
      if (value['$like']) {
        const searchString = value['$like'].replace(/%/g, '')
        result = result.filter((item) => item[key].includes(searchString))
      }
    })

    let total = result.length

    result = result.slice(skip, skip + limit)
    result.forEach((file) => {
      file.url = storageProvider.getCachedURL(file.key, params && params.provider == null)
    })

    if (params.provider && !isAdmin) {
      const knexClient: Knex = this.app.get('knexClient')
      const projectPermissions: { 'project-permission': ProjectPermissionType; project: ProjectType }[] =
        await knexClient
          .from(projectPermissionPath)
          .join(projectPath, `${projectPermissionPath}.projectId`, `${projectPath}.id`)
          .where(`${projectPermissionPath}.userId`, params.user!.id)
          .select()
          .options({ nestTables: true })

      if (directory === 'projects/') {
        total = projectPermissions.length
      }

      const allowedProjectNames = projectPermissions.map((permission) => permission.project.name)
      result = result.filter((item) => {
        const projectRegexExec = /projects\/(.+)$/.exec(item.key)
        const subFileRegexExec = /projects\/(.+)\//.exec(item.key)
        return (
          (subFileRegexExec && allowedProjectNames.indexOf(subFileRegexExec[1]) > -1) ||
          (projectRegexExec && allowedProjectNames.indexOf(projectRegexExec[1]) > -1) ||
          item.name === 'projects'
        )
      })
    }

    return {
      total,
      limit,
      skip,
      data: result
    }
  }

  /**
   * Create a directory
   */
  async create(directory: string, params?: FileBrowserParams) {
    const storageProvider = getStorageProvider(params?.query?.storageProviderName)
    if (directory[0] === '/') directory = directory.slice(1)

    checkDirectoryInsideNesting(directory, params?.nestingDirectory)

    const parentPath = path.dirname(directory)
    const key = await getIncrementalName(path.basename(directory), parentPath, storageProvider, true)
    const keyPath = path.join(parentPath, key)

    const result = await storageProvider.putObject({ Key: keyPath } as StorageObjectInterface, {
      isDirectory: true
    })

    if (config.server.edgeCachingEnabled)
      await this.app.service(invalidationPath).create({
        path: keyPath
      })

    if (config.fsProjectSyncEnabled) fs.mkdirSync(path.resolve(projectsRootFolder, keyPath), { recursive: true })

    return result
  }

  /**
   * Move content from one path to another
   */
  async update(id: NullableId, data: FileBrowserUpdate, params?: FileBrowserParams) {
    const storageProviderName = data.storageProviderName
    delete data.storageProviderName
    const storageProvider = getStorageProvider(storageProviderName)
    const _oldPath = data.oldPath[0] === '/' ? data.oldPath.substring(1) : data.oldPath
    const _newPath = data.newPath[0] === '/' ? data.newPath.substring(1) : data.newPath

    const isDirectory = await storageProvider.isDirectory(data.oldName, _oldPath)
    const fileName = await getIncrementalName(data.newName, _newPath, storageProvider, isDirectory)
    const result = await storageProvider.moveObject(data.oldName, fileName, _oldPath, _newPath, data.isCopy)

    if (config.server.edgeCachingEnabled)
      await this.app.service(invalidationPath).create([
        {
          path: _oldPath + data.oldName
        },
        {
          path: _newPath + fileName
        }
      ])

    const staticResources = (await this.app.service(staticResourcePath).find({
      query: {
        key: { $like: `%${path.join(_oldPath, data.oldName)}%` }
      },
      paginate: false
    })) as StaticResourceType[]

    if (staticResources?.length > 0) {
      await Promise.all(
        staticResources.map(async (resource) => {
          const newKey = resource.key.replace(path.join(_oldPath, data.oldName), path.join(_newPath, fileName))
          await this.app.service(staticResourcePath).patch(
            resource.id,
            {
              key: newKey
            },
            { isInternal: true }
          )
        })
      )
    }

    const oldNamePath = path.join(projectsRootFolder, _oldPath, data.oldName)
    const newNamePath = path.join(projectsRootFolder, _newPath, fileName)

    if (config.fsProjectSyncEnabled) {
      // ensure the directory exists
      if (!fs.existsSync(path.dirname(newNamePath))) {
        const dirname = path.dirname(newNamePath)
        fs.mkdirSync(dirname, { recursive: true })
      }
      // move or copy the file
      if (data.isCopy) fs.copyFileSync(oldNamePath, newNamePath)
      else fs.renameSync(oldNamePath, newNamePath)
    }

    return result
  }

  /**
   * Upload file
   */
  async patch(id: NullableId, data: FileBrowserPatch, params?: FileBrowserParams) {
    const storageProviderName = data.storageProviderName
    delete data.storageProviderName
    const storageProvider = getStorageProvider(storageProviderName)
    const name = processFileName(data.fileName)

    const reducedPath = data.path[0] === '/' ? data.path.substring(1) : data.path

    checkDirectoryInsideNesting(reducedPath, params?.nestingDirectory)

    const reducedPathSplit = reducedPath.split('/')
    const project = reducedPathSplit.length > 0 && reducedPathSplit[0] === 'projects' ? reducedPathSplit[1] : undefined
    const key = path.join(reducedPath, name)

    await storageProvider.putObject(
      {
        Key: key,
        Body: data.body,
        ContentType: data.contentType
      },
      {
        isDirectory: false
      }
    )

    if (config.fsProjectSyncEnabled) {
      const filePath = path.resolve(projectsRootFolder, key)
      const dirname = path.dirname(filePath)
      fs.mkdirSync(dirname, { recursive: true })
      fs.writeFileSync(filePath, data.body)
    }

    const hash = createStaticResourceHash(data.body)
    const url = storageProvider.getCachedURL(key, params && params.provider == null)

    const query = {
      hash,
      mimeType: data.contentType,
      $limit: 1
    } as Record<string, unknown>
    if (project) query.project = project
    const existingResource = (await this.app.service(staticResourcePath).find({
      query
    })) as Paginated<StaticResourceType>

    if (existingResource.data.length > 0) {
      const resource = existingResource.data[0]
      await this.app.service(staticResourcePath).patch(
        resource.id,
        {
          key,
          url
        },
        { isInternal: true }
      )

      if (config.server.edgeCachingEnabled)
        await this.app.service(invalidationPath).create({
          path: key
        })
    } else {
      await this.app.service(staticResourcePath).create(
        {
          hash,
          key,
          url,
          project,
          mimeType: data.contentType
        },
        { isInternal: true }
      )

      if (config.server.edgeCachingEnabled)
        await this.app.service(invalidationPath).create({
          path: key
        })
    }

    return storageProvider.getCachedURL(key, params && params.provider == null)
  }

  /**
   * Remove a directory
   */
  async remove(key: string, params?: FileBrowserParams) {
    const storageProviderName = params?.query?.storageProviderName
    if (storageProviderName) delete params.query?.storageProviderName

    checkDirectoryInsideNesting(key, params?.nestingDirectory)

    const storageProvider = getStorageProvider(storageProviderName)
    const dirs = await storageProvider.listObjects(key, true)
    const result = await storageProvider.deleteResources([key, ...dirs.Contents.map((a) => a.Key)])

    if (config.server.edgeCachingEnabled)
      await this.app.service(invalidationPath).create({
        path: key
      })

    const staticResources = (await this.app.service(staticResourcePath).find({
      query: {
        key: { $like: `%${key}%` }
      },
      paginate: false
    })) as StaticResourceType[]

    if (staticResources?.length > 0) {
      await Promise.all(
        staticResources.map(async (resource) => await this.app.service(staticResourcePath).remove(resource.id))
      )
    }

    if (config.fsProjectSyncEnabled) fs.rmSync(path.resolve(projectsRootFolder, key), { recursive: true })

    return result
  }
}
