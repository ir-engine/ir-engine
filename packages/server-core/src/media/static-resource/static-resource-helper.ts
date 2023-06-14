import fs from 'fs'

import { UploadFile } from '@etherealengine/common/src/interfaces/UploadAssetInterface'
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

/**
 * Get the files to upload for a given resource
 * @param data
 * @param download - if true, will download the file and return it as a buffer, otherwise will return the url
 * @returns
 */
export const getResourceFiles = async (
  data: UploadAssetArgs,
  download = config.server.cloneProjectStaticResources
): Promise<UploadFile[]> => {
  if (data.url) {
    if (/http(s)?:\/\//.test(data.url)) {
      // if configured to clone project static resources, we need to fetch the file and upload it
      if (download) {
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
      if (download) {
        const file = fs.readFileSync(data.url)
        return [
          {
            buffer: file,
            originalname: data.name!,
            mimetype: CommonKnownContentTypes[data.url.split('.').pop()!],
            size: file.length
          }
        ]
      } else {
        const file = fs.readFileSync(data.url)
        return [
          {
            buffer: data.url,
            originalname: data.name!,
            mimetype: CommonKnownContentTypes[data.url.split('.').pop()!],
            size: file.length
          }
        ]
      }
    }
  } else {
    return data.files!
  }
}
