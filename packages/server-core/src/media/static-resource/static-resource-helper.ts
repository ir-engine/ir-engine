import fs from 'fs'

import { ServiceTypes } from '@etherealengine/common/declarations'
import { StaticResourceInterface } from '@etherealengine/common/src/interfaces/StaticResourceInterface'
import { UploadFile } from '@etherealengine/common/src/interfaces/UploadAssetInterface'
import { CommonKnownContentTypes } from '@etherealengine/common/src/utils/CommonKnownContentTypes'

import { Application } from '../../../declarations'
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
export const downloadResourceAndMetadata = async (
  url: string,
  download = config.server.cloneProjectStaticResources
): Promise<UploadFile> => {
  console.log('getResourceFiles', url, download)
  if (/http(s)?:\/\//.test(url)) {
    // if configured to clone project static resources, we need to fetch the file and upload it
    if (download) {
      const file = await fetch(url)
      return {
        buffer: Buffer.from(await file.arrayBuffer()),
        originalname: url.split('/').pop()!,
        mimetype:
          file.headers.get('content-type') ||
          file.headers.get('Content-Type') ||
          CommonKnownContentTypes[url.split('.').pop()!],
        size: parseInt(file.headers.get('content-length') || file.headers.get('Content-Length') || '0')
      }
    } else {
      // otherwise we just return the url and let the client download it as needed
      const file = await fetch(url, { method: 'HEAD' })
      return {
        buffer: url,
        originalname: url.split('/').pop()!,
        mimetype:
          file.headers.get('content-type') ||
          file.headers.get('Content-Type') ||
          CommonKnownContentTypes[url.split('.').pop()!],
        size: parseInt(file.headers.get('content-length') || file.headers.get('Content-Length') || '0')
      }
    }
  } else {
    const file = fs.readFileSync(url)
    return {
      buffer: download ? file : url,
      originalname: url.split('/').pop()!,
      mimetype: CommonKnownContentTypes[url.split('.').pop()!],
      size: file.length
    }
  }
}

export const getExistingResource = async <T>(
  app: Application,
  model: keyof ServiceTypes,
  hash: string
): Promise<T | undefined> => {
  const existingResource = (await app.service('static-resource').Model.findOne({
    where: {
      hash
    }
  })) as StaticResourceInterface | null

  if (existingResource) {
    return app.service(model).Model.findOne({
      include: {
        model: app.service('static-resource').Model,
        as: 'staticResource',
        where: {
          id: existingResource.id
        }
      }
    })
  }
}
