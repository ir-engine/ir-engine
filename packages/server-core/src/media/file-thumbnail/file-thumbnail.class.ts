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
import { FileThumbnailPatch } from '@etherealengine/common/src/schemas/media/file-thumbnail.schema'
import { StaticResourceType, staticResourcePath } from '@etherealengine/common/src/schemas/media/static-resource.schema'
import { KnexAdapterParams } from '@feathersjs/knex'
import { Application } from '../../../declarations'
import { getCacheDomain } from '../storageprovider/getCacheDomain'
import { getCachedURL } from '../storageprovider/getCachedURL'
import { getStorageProvider } from '../storageprovider/storageprovider'
import { createStaticResourceHash } from '../upload-asset/upload-asset.service'

export const projectsRootFolder = path.join(appRootPath.path, 'packages/projects')

export interface FileThumbnailParams extends KnexAdapterParams {
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
export class FileThumbnailService
  implements ServiceInterface<boolean | string, string | FileThumbnailPatch, FileThumbnailParams, FileThumbnailPatch>
{
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  /**
   * Returns the metadata for a single file or directory
   */
  async get(key: string, params?: FileThumbnailParams & { query: { getNestingDirectory?: boolean } }) {
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
   * Upload file
   */
  async patch(id: NullableId, data: FileThumbnailPatch, params?: FileThumbnailParams) {
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

    return url
  }

  /**
   * Remove a directory
   */
  async remove(key: string, params?: FileThumbnailParams) {
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
