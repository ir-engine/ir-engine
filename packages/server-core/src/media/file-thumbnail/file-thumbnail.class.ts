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

import { ServiceInterface } from '@feathersjs/feathers/lib/declarations'
import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path/posix'

import { isDev } from '@etherealengine/common/src/config'
import { FileThumbnailPatch } from '@etherealengine/common/src/schemas/media/file-thumbnail.schema'
import { StaticResourceType, staticResourcePath } from '@etherealengine/common/src/schemas/media/static-resource.schema'
import { KnexAdapterParams } from '@feathersjs/knex'
import { Application } from '../../../declarations'
import { getCacheDomain } from '../storageprovider/getCacheDomain'
import { getCachedURL } from '../storageprovider/getCachedURL'
import { getStorageProvider } from '../storageprovider/storageprovider'

export const projectsRootFolder = path.join(appRootPath.path, 'packages/projects')

export interface FileThumbnailParams extends KnexAdapterParams {}

const PROJECT_FILE_REGEX = /^projects/

/**
 * A class for File Thumbnail service
 */
export class FileThumbnailService
  implements ServiceInterface<string | null, FileThumbnailPatch, FileThumbnailParams, FileThumbnailPatch>
{
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  /**
   * Returns the metadata for a single file or directory
   */
  async get(key: string, params?: FileThumbnailParams) {
    if (!key) return null

    const findResults = (await this.app.service(staticResourcePath).find({
      query: { key },
      paginate: false
    })) as StaticResourceType[]

    const thumbnail = findResults?.[0]

    if (thumbnail == null) {
      return null
    }

    return getCachedURL(thumbnail.key, getStorageProvider().cacheDomain)
  }

  /**
   * Upload file
   */
  async patch(assetKey: string, data: FileThumbnailPatch, params?: FileThumbnailParams) {
    const findResults = (await this.app.service(staticResourcePath).find({
      query: { key: assetKey },
      paginate: false
    })) as StaticResourceType[]

    if (findResults?.length === 0) {
      return null
    }

    const thumbnail = findResults[0]

    await this.app.service(staticResourcePath).patch(thumbnail.id, {
      hasCustomThumbnail: data.isCustom
    })

    const storageProvider = getStorageProvider()
    await storageProvider.putObject(
      {
        Key: thumbnail.key,
        Body: data.body,
        ContentType: data.contentType
      },
      {
        isDirectory: false
      }
    )

    if (isDev && PROJECT_FILE_REGEX.test(thumbnail.key)) {
      const filePath = path.resolve(projectsRootFolder, thumbnail.key)
      const dirname = path.dirname(filePath)
      fs.mkdirSync(dirname, { recursive: true })
      fs.writeFileSync(filePath, data.body)
    }

    await storageProvider.createInvalidation([thumbnail.key])

    const cacheDomain = getCacheDomain(storageProvider, params && params.provider == null)
    return getCachedURL(thumbnail.key, cacheDomain)
  }
}
