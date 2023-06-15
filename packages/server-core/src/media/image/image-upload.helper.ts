import fetch from 'node-fetch'
import path from 'path'
import probe from 'probe-image-size'
import { Readable } from 'stream'

import { ImageInterface } from '@etherealengine/common/src/interfaces/ImageInterface'
import { KTX2Loader } from '@etherealengine/engine/src/assets/loaders/gltf/KTX2Loader'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import logger from '../../ServerLogger'
import { downloadResourceAndMetadata, getExistingResource } from '../static-resource/static-resource-helper'
import { getStorageProvider } from '../storageprovider/storageprovider'
import { addAssetAsStaticResource, getFileMetadata, UploadAssetArgs } from '../upload-asset/upload-asset.service'

/**
 * install project
 * if external url and clone static resources, clone to /static-resources/project
 * if external url and not clone static resources, link new static resource
 * if internal url, link new static resource
 */
export const addImageAssetFromProject = async (
  app: Application,
  urls: string[],
  project: string,
  download = config.server.cloneProjectStaticResources
) => {
  console.log('addImageAssetFromProject', urls, project, download)
  const storageProvider = getStorageProvider()
  const mainURL = urls[0]
  const isExternalToProject =
    !project || project !== mainURL.split(path.join(storageProvider.cacheDomain, 'projects/'))?.[1]?.split('/')?.[0]

  const { assetName, hash, extension } = await getFileMetadata({ file: mainURL })
  const existingImage = await getExistingResource<ImageInterface>(app, 'image', hash, project)
  if (existingImage) return existingImage

  const files = await Promise.all(
    urls.map((url) => downloadResourceAndMetadata(url, isExternalToProject ? false : download))
  )
  const stats = await getImageStats(files[0].buffer, extension)

  const key = isExternalToProject ? `static-resources/${project}/` : `projects/${project}/assets/`

  const resource = await addAssetAsStaticResource(app, files, {
    hash: hash,
    path: key,
    staticResourceType: 'image',
    stats,
    project
  })

  return await app.service('image').create({
    name: assetName,
    width: stats.width,
    height: stats.height,
    staticResourceId: resource.id
  })
}

/**
 * hash exists?
 * no - upload to /temp & return new static resource
 * yes - return static resource
 */
export const imageUploadFile = async (app: Application, data: UploadAssetArgs) => {
  console.log('imageUploadFile', data)
  const { assetName, hash, extension } = await getFileMetadata({
    file: data.files[0],
    name: data.files[0].originalname
  })

  const existingImage = await getExistingResource<ImageInterface>(app, 'image', hash)
  if (existingImage) return existingImage

  const stats = await getImageStats(data.files[0].buffer, extension)

  const key = `/temp/${hash}`
  const resource = await addAssetAsStaticResource(app, data.files, {
    hash: hash,
    path: key,
    staticResourceType: 'image',
    stats,
    project: data.project
  })

  return await app.service('image').create({
    name: assetName,
    width: stats.width,
    height: stats.height,
    staticResourceId: resource.id
  })
}

export const getImageStats = async (file: Buffer | string, extension: string) => {
  if (extension === 'ktx2') {
    const loader = new KTX2Loader()
    return new Promise<{ width: number; height: number }>((resolve, reject) => {
      if (typeof file === 'string') {
        loader.load(
          file,
          (texture) => {
            const { width, height } = texture.source.data
            resolve({
              width,
              height
            })
          },
          () => {},
          (err) => {
            logger.error('error parsing ktx2')
            logger.error(err)
            reject(err)
          }
        )
      } else {
        loader.parse(
          file,
          (texture) => {
            const { width, height } = texture.source.data
            resolve({
              width,
              height
            })
          },
          (err) => {
            logger.error('error parsing ktx2')
            logger.error(err)
            reject(err)
          }
        )
      }
    })
  } else {
    if (typeof file === 'string') {
      file = await (await fetch(file)).buffer()
    }
    const stream = new Readable()
    stream.push(file)
    stream.push(null)
    const imageDimensions = await probe(stream)
    return {
      width: imageDimensions.width as number,
      height: imageDimensions.height as number
    }
  }
}
