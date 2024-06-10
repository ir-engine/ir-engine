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
        type: data?.type ?? undefined,
        tags: data?.tags ?? [assetClass],
        dependencies: data?.dependencies ?? undefined,
        licensing: data?.licensing ?? undefined,
        description: data?.description ?? undefined,
        attribution: data?.attribution ?? undefined,
        thumbnailURL: data?.thumbnailURL ?? undefined,
        thumbnailMode: data?.thumbnailMode ?? undefined
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
        type: data?.type ?? undefined,
        tags: data?.tags ?? [assetClass],
        dependencies: data?.dependencies ?? undefined,
        licensing: data?.licensing ?? undefined,
        description: data?.description ?? undefined,
        attribution: data?.attribution ?? undefined,
        thumbnailURL: data?.thumbnailURL ?? undefined,
        thumbnailMode: data?.thumbnailMode ?? undefined
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
