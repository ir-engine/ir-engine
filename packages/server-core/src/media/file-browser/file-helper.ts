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

import { StaticResourceType, invalidationPath, staticResourcePath } from '@etherealengine/common/src/schema.type.module'
import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import { Application } from '../../../declarations'
import config from '../../appconfig'
import { getStats } from '../static-resource/static-resource-helper'
import { getStorageProvider } from '../storageprovider/storageprovider'
import { createStaticResourceHash } from '../upload-asset/upload-asset.service'

type StaticResourceUploadArgs = {
  key: string
  body: Buffer
  contentType: string
  project?: string
  id?: string
  type?: string
  tags?: string[]
  dependencies?: string[]
  attribution?: string
  licensing?: string
  description?: string
  thumbnailURL?: string
  thumbnailMode?: string
}

export const uploadStaticResource = async (app: Application, args: StaticResourceUploadArgs) => {
  console.log(args)
  const { key, project, body, contentType, id, ...data } = args

  const storageProvider = getStorageProvider()

  const assetClass = AssetLoader.getAssetClass(key)
  const stats = await getStats(body, contentType)
  const hash = createStaticResourceHash(body)

  await storageProvider.putObject(
    {
      Key: key,
      Body: body,
      ContentType: contentType
    },
    {
      isDirectory: false
    }
  )

  let staticResource: StaticResourceType

  if (id) {
    staticResource = await app.service(staticResourcePath).patch(
      id,
      {
        key,
        hash,
        project,
        mimeType: contentType,
        stats,
        type: data.type,
        tags: data.tags ?? [assetClass],
        dependencies: data.dependencies,
        licensing: data.licensing,
        description: data.description,
        attribution: data.attribution,
        thumbnailURL: data.thumbnailURL,
        thumbnailMode: data.thumbnailMode
      },
      { isInternal: true }
    )
  } else {
    staticResource = await app.service(staticResourcePath).create(
      {
        key,
        hash,
        mimeType: contentType,
        project,
        stats,
        type: data.type,
        tags: data.tags ?? [assetClass],
        dependencies: data.dependencies,
        licensing: data.licensing,
        description: data.description,
        attribution: data.attribution,
        thumbnailURL: data.thumbnailURL,
        thumbnailMode: data.thumbnailMode
      },
      { isInternal: true }
    )
  }

  if (config.server.edgeCachingEnabled)
    await app.service(invalidationPath).create({
      path: key
    })

  return staticResource
}
