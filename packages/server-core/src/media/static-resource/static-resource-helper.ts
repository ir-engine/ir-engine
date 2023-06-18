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

import fs from 'fs'

import { CommonKnownContentTypes } from '@etherealengine/common/src/utils/CommonKnownContentTypes'

import config from '../../appconfig'
import { UploadAssetArgs } from '../upload-asset/upload-asset.service'

export type MediaUploadArguments = {
  media: Buffer
  thumbnail?: Buffer
  hash: string
  mediaId: string
  fileName: string
  mediaFileType: string
  parentType?: string
  parentId?: string
  LODNumber?: string
  stats?: any
}

export const getResourceFiles = async (data: UploadAssetArgs, forceDownload = false) => {
  if (data.url) {
    if (/http(s)?:\/\//.test(data.url)) {
      // if configured to clone project static resources, we need to fetch the file and upload it
      if (config.server.cloneProjectStaticResources || forceDownload) {
        const file = await fetch(data.url)
        return [
          {
            buffer: Buffer.from(await file.arrayBuffer()),
            originalname: data.name!,
            mimetype:
              file.headers.get('content-type') || file.headers.get('Content-Type') || 'application/octet-stream',
            size: parseInt(file.headers.get('content-length') || file.headers.get('Content-Length') || '0')
          }
        ]
      } else {
        // otherwise we just return the url and let the client download it as needed
        const file = await fetch(data.url, { method: 'HEAD' })
        return [
          {
            buffer: data.url,
            originalname: data.name!,
            mimetype:
              file.headers.get('content-type') || file.headers.get('Content-Type') || 'application/octet-stream',
            size: parseInt(file.headers.get('content-length') || file.headers.get('Content-Length') || '0')
          }
        ]
      }
    } else {
      const file = fs.readFileSync(data.url)
      const mimetype = CommonKnownContentTypes[data.url.split('.').pop()!]
      return [
        {
          buffer: file,
          originalname: data.name!,
          mimetype: mimetype,
          size: file.length
        }
      ]
    }
  } else {
    return data.files!
  }
}
