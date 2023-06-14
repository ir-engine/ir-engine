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
