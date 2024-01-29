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

import { staticResourcePath } from '@etherealengine/common/src/schemas/media/static-resource.schema'
import { recordingResourcePath } from '@etherealengine/common/src/schemas/recording/recording-resource.schema'
import { getDateTimeSql } from '@etherealengine/common/src/utils/datetime-sql'
import { KnexAdapterParams } from '@feathersjs/knex'
import { Application } from '../../../declarations'
import { getCachedURL } from '../../media/storageprovider/getCachedURL'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import { createStaticResourceHash } from '../../media/upload-asset/upload-asset.service'

export interface RecordingResourceUploadParams extends KnexAdapterParams {}

/**
 * A class for File Browser Upload service
 */
export class RecordingResourceUploadService implements ServiceInterface<void, RecordingResourceUploadParams> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async create(data: any, params?: RecordingResourceUploadParams) {
    const { key, body, mimeType, recordingID, hash } = data

    const storageProvider = getStorageProvider()

    const uploadPromise = storageProvider.putObject({
      Key: key,
      Body: body,
      ContentType: mimeType
    })

    const url = getCachedURL(key, storageProvider.cacheDomain)
    const localHash = hash || createStaticResourceHash(body, { mimeType: mimeType, assetURL: key })

    const staticResource = await this.app.service(staticResourcePath).create(
      {
        hash: localHash,
        key: key,
        url,
        mimeType: mimeType
      },
      { isInternal: true }
    )

    const recordingResource = await this.app.service(recordingResourcePath).create({
      recordingId: recordingID,
      staticResourceId: staticResource.id
    })

    const updatedAt = await getDateTimeSql()
    await uploadPromise

    await this.app.service(recordingResourcePath).patch(recordingResource.id, {
      updatedAt
    })
  }
}
