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
import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path/posix'

import { processFileName } from '@etherealengine/common/src/utils/processFileName'

import { isDev } from '@etherealengine/common/src/config'
import {
  FileBrowserContentType,
  FileBrowserPatch,
  FileBrowserUpdate
} from '@etherealengine/common/src/schemas/media/file-browser.schema'
import { StaticResourceType, staticResourcePath } from '@etherealengine/common/src/schemas/media/static-resource.schema'
import { projectPermissionPath } from '@etherealengine/common/src/schemas/projects/project-permission.schema'
import { checkScope } from '@etherealengine/spatial/src/common/functions/checkScope'
import { KnexAdapterParams } from '@feathersjs/knex'
import { Knex } from 'knex'
import { Application } from '../../../declarations'
import { getIncrementalName } from '../FileUtil'
import { getCacheDomain } from '../storageprovider/getCacheDomain'
import { getCachedURL } from '../storageprovider/getCachedURL'
import { getStorageProvider } from '../storageprovider/storageprovider'
import { StorageObjectInterface } from '../storageprovider/storageprovider.interface'
import { createStaticResourceHash } from '../upload-asset/upload-asset.service'

export const projectsRootFolder = path.join(appRootPath.path, 'packages/projects')

export interface FileBrowserParams extends KnexAdapterParams {
  nestingDirectory?: string
}

const PROJECT_FILE_REGEX = /^projects/

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
    const total = result.length

    result = result.slice(skip, skip + limit)
    result.forEach((file) => {
      file.url = getCachedURL(file.key, storageProvider.cacheDomain)
    })

    if (params.provider && !isAdmin) {
      const knexClient: Knex = this.app.get('knexClient')
      const projectPermissions = await knexClient
        .from(projectPermissionPath)
        .join('project', `${projectPermissionPath}.projectId`, 'project.id')
        .where(`${projectPermissionPath}.userId`, params.user!.id)
        .select()
        .options({ nestTables: true })

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

    await storageProvider.createInvalidation([keyPath])

    if (isDev && PROJECT_FILE_REGEX.test(directory))
      fs.mkdirSync(path.resolve(projectsRootFolder, keyPath), { recursive: true })

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

    await storageProvider.createInvalidation([_oldPath, _newPath])

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

    if (isDev && PROJECT_FILE_REGEX.test(_oldPath)) {
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

    if (isDev && PROJECT_FILE_REGEX.test(key)) {
      const filePath = path.resolve(projectsRootFolder, key)
      const dirname = path.dirname(filePath)
      fs.mkdirSync(dirname, { recursive: true })
      fs.writeFileSync(filePath, data.body)
    }

    const hash = createStaticResourceHash(data.body, { mimeType: data.contentType, assetURL: key })
    const cacheDomain = getCacheDomain(storageProvider, params && params.provider == null)
    const url = getCachedURL(key, cacheDomain)

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
      await storageProvider.createInvalidation([key])
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
      await storageProvider.createInvalidation([key])
    }

    return getCachedURL(key, storageProvider.cacheDomain)
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
    await storageProvider.createInvalidation([key])

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

    if (isDev && PROJECT_FILE_REGEX.test(key)) fs.rmSync(path.resolve(projectsRootFolder, key), { recursive: true })

    return result
  }
}
