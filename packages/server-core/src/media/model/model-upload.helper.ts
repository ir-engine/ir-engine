import path from 'path'

import { ModelInterface } from '@etherealengine/common/src/interfaces/ModelInterface'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import { downloadResourceAndMetadata, getExistingResource } from '../static-resource/static-resource-helper'
import { getStorageProvider } from '../storageprovider/storageprovider'
import { addAssetAsStaticResource, getFileMetadata, UploadAssetArgs } from '../upload-asset/upload-asset.service'

export const addModelAssetFromProject = async (
  app: Application,
  urls: string[],
  project: string,
  download = config.server.cloneProjectStaticResources
) => {
  console.log('addModelAssetFromProject', urls, project, download)
  const storageProvider = getStorageProvider()
  const mainURL = urls[0]
  const isExternalToProject =
    !project || project !== mainURL.split(path.join(storageProvider.cacheDomain, 'projects/'))?.[1]?.split('/')?.[0]

  const { assetName, hash } = await getFileMetadata({ file: mainURL })
  const existingModel = await getExistingResource<ModelInterface>(app, 'model', hash)
  if (existingModel) return existingModel

  const files = await Promise.all(
    urls.map((url) => downloadResourceAndMetadata(url, isExternalToProject ? false : download))
  )

  const key = isExternalToProject ? `static-resources/${project}/` : `projects/${project}/assets/`

  const resource = await addAssetAsStaticResource(app, files, {
    hash: hash,
    path: key,
    staticResourceType: 'model3d',
    project
  })

  return (await app.service('model').create({
    name: assetName,
    staticResourceId: resource.id!
  })) as ModelInterface
}

/**
 * hash exists?
 * no - upload to /temp & return new static resource
 * yes - return static resource
 */
export const modelUploadFile = async (app: Application, data: UploadAssetArgs) => {
  console.log('modelUpload', data)
  const { assetName, hash } = await getFileMetadata({
    file: data.files[0],
    name: data.files[0].originalname
  })

  const existingAudio = await getExistingResource<ModelInterface>(app, 'model', hash)
  if (existingAudio) return existingAudio

  const key = `/temp/${hash}`
  const resource = await addAssetAsStaticResource(app, data.files, {
    hash: hash,
    path: key,
    staticResourceType: 'model3d',
    project: data.project
  })

  return (await app.service('model').create({
    name: assetName,
    staticResourceId: resource.id
  })) as ModelInterface
}
