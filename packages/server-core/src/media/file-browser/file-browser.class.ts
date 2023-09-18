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

import { Forbidden } from '@feathersjs/errors'
import { NullableId, Paginated, ServiceInterface } from '@feathersjs/feathers/lib/declarations'
import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path/posix'

import { processFileName } from '@etherealengine/common/src/utils/processFileName'

import {
  FileBrowserContentType,
  FileBrowserPatch,
  FileBrowserUpdate
} from '@etherealengine/engine/src/schemas/media/file-browser.schema'
import { StaticResourceType, staticResourcePath } from '@etherealengine/engine/src/schemas/media/static-resource.schema'
import { projectPermissionPath } from '@etherealengine/engine/src/schemas/projects/project-permission.schema'
import { Knex } from 'knex'
import { Application } from '../../../declarations'
import { RootParams } from '../../api/root-params'
import { copyRecursiveSync, getIncrementalName } from '../FileUtil'
import { getCacheDomain } from '../storageprovider/getCacheDomain'
import { getCachedURL } from '../storageprovider/getCachedURL'
import { getStorageProvider } from '../storageprovider/storageprovider'
import { StorageObjectInterface } from '../storageprovider/storageprovider.interface'
import { createStaticResourceHash } from '../upload-asset/upload-asset.service'

export const projectsRootFolder = path.join(appRootPath.path, 'packages/projects')

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FileBrowserParams extends RootParams {}

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
   * @param params
   */
  async get(key: string, params?: FileBrowserParams) {
    if (!key) return false
    const storageProvider = getStorageProvider()
    const [_, directory, file] = /(.*)\/([^\\\/]+$)/.exec(key)!
    const exists = await storageProvider.doesExist(file, directory)
    return exists
  }

  /**
   * Return the metadata for each file in a directory
   * @param directory
   * @param params
   * @returns
   */
  async find(params?: FileBrowserParams) {
    if (!params) params = {}
    if (!params.query) params.query = {}
    const { $skip, $limit } = params.query
    let { directory } = params.query

    const skip = $skip ? $skip : 0
    const limit = $limit ? $limit : 100

    const storageProvider = getStorageProvider()
    const isAdmin = params.user && params.user?.scopes?.find((scope) => scope.type === 'admin:admin')
    if (directory[0] === '/') directory = directory.slice(1) // remove leading slash
    if (params.provider && !isAdmin && directory !== '' && !/^projects/.test(directory))
      throw new Forbidden('Not allowed to access that directory')
    let result = await storageProvider.listFolderContent(directory)
    const total = result.length

    result = result.slice(skip, skip + limit)

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
   * @param directory: string
   * @param params
   * @returns
   */
  async create(directory: string, params?: FileBrowserParams) {
    const storageProvider = getStorageProvider(params?.query?.storageProviderName)
    if (directory[0] === '/') directory = directory.slice(1) // remove leading slash

    const parentPath = path.dirname(directory)
    const key = await getIncrementalName(path.basename(directory), parentPath, storageProvider, true)

    const result = await storageProvider.putObject({ Key: path.join(parentPath, key) } as StorageObjectInterface, {
      isDirectory: true
    })

    await storageProvider.createInvalidation([key])

    fs.mkdirSync(path.join(projectsRootFolder, parentPath, key))

    return result
  }

  /**
   * Move content from one path to another
   * @param id
   * @param data
   * @param params
   * @returns
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

    const oldNamePath = path.join(projectsRootFolder, _oldPath, data.oldName)
    const newNamePath = path.join(projectsRootFolder, _newPath, fileName)

    await Promise.all([
      storageProvider.createInvalidation([oldNamePath]),
      storageProvider.createInvalidation([newNamePath])
    ])

    if (data.isCopy) {
      copyRecursiveSync(oldNamePath, newNamePath)
    } else {
      fs.renameSync(oldNamePath, newNamePath)
    }

    return result
  }

  /**
   * Upload file
   * @param id
   * @param data
   * @param params
   */
  async patch(id: NullableId, data: FileBrowserPatch, params?: FileBrowserParams) {
    const storageProviderName = data.storageProviderName
    delete data.storageProviderName
    const storageProvider = getStorageProvider(storageProviderName)
    const name = processFileName(data.fileName)

    const key = path.join(data.path[0] === '/' ? data.path.substring(1) : data.path, name)

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

    const hash = createStaticResourceHash(data.body, { assetURL: key })
    const cacheDomain = getCacheDomain(storageProvider, params && params.provider == null)
    const url = getCachedURL(key, cacheDomain)

    await this.app.service(staticResourcePath).create(
      {
        hash,
        key,
        url,
        mimeType: data.contentType
      },
      { isInternal: true }
    )
    await storageProvider.createInvalidation([key])

    const filePath = path.join(projectsRootFolder, key)
    const parentDirPath = path.dirname(filePath)

    if (!fs.existsSync(parentDirPath)) fs.mkdirSync(parentDirPath, { recursive: true })
    fs.writeFileSync(filePath, data.body)

    return url
  }

  /**
   * Remove a directory
   * @param key
   * @param params
   * @returns
   */
  async remove(key: string, params?: FileBrowserParams) {
    const storageProviderName = params?.query?.storageProviderName
    if (storageProviderName) delete params.query?.storageProviderName
    const storageProvider = getStorageProvider(storageProviderName)
    const dirs = await storageProvider.listObjects(key, true)
    const result = await storageProvider.deleteResources([key, ...dirs.Contents.map((a) => a.Key)])
    await storageProvider.createInvalidation([key])

    const filePath = path.join(projectsRootFolder, key)

    if (fs.lstatSync(filePath).isDirectory()) {
      fs.rmSync(filePath, { force: true, recursive: true })
    } else {
      fs.unlinkSync(filePath)
    }

    const staticResource = (await this.app.service(staticResourcePath).find({
      query: {
        key: filePath,
        $limit: 1
      }
    })) as Paginated<StaticResourceType>

    if (staticResource?.data?.length > 0) await this.app.service(staticResourcePath).remove(staticResource?.data[0]?.id)

    return result
  }
}
