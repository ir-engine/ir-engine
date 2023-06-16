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

import { Params } from '@feathersjs/feathers'
import { bodyParser, koa } from '@feathersjs/koa'
import Multer from '@koa/multer'
import { createHash } from 'crypto'
import path from 'path'
import { Op } from 'sequelize'
import { MathUtils } from 'three'

import { StaticResourceVariantInterface } from '@etherealengine/common/src/dbmodels/StaticResourceVariant'
import { StaticResourceInterface } from '@etherealengine/common/src/interfaces/StaticResourceInterface'
import {
  AdminAssetUploadArgumentsType,
  AssetUploadType,
  AvatarUploadArgsType,
  UploadFile
} from '@etherealengine/common/src/interfaces/UploadAssetInterface'
import { CommonKnownContentTypes } from '@etherealengine/common/src/utils/CommonKnownContentTypes'
import { processFileName } from '@etherealengine/common/src/utils/processFileName'

import { Application } from '../../../declarations'
import verifyScope from '../../hooks/verify-scope'
import logger from '../../ServerLogger'
import { uploadAvatarStaticResource } from '../../user/avatar/avatar-helper'
import { audioUpload } from '../audio/audio-upload.helper'
import { imageUpload } from '../image/image-upload.helper'
import { modelUpload } from '../model/model-upload.helper'
import { getCachedURL } from '../storageprovider/getCachedURL'
import { getStorageProvider } from '../storageprovider/storageprovider'
import { videoUpload } from '../video/video-upload.helper'
import hooks from './upload-asset.hooks'

const multipartMiddleware = Multer({ limits: { fieldSize: Infinity } })

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    'upload-asset': any
  }
}

export interface UploadParams extends Params {
  files: UploadFile[]
}

export interface ResourcePatchCreateInterface {
  hash: string
  key: string
  mimeType: string
  staticResourceType: string
  url?: string
  project?: string
  userId?: string
}

const uploadVariant = async (file: Buffer, mimeType: string, key: string, storageProviderName?: string) => {
  const provider = getStorageProvider(storageProviderName)
  try {
    await provider.createInvalidation([key])
  } catch (e) {
    logger.info(`[ERROR lod-upload while invalidating ${key}]:`, e)
  }

  await provider.putObject(
    {
      Key: key,
      Body: file,
      ContentType: mimeType
    },
    {
      isDirectory: false
    }
  )
}

export type UploadAssetArgs = {
  name?: string
  files?: Array<UploadFile>
  url?: string
}

const uploadAsset = (app: Application, type: string, args: UploadAssetArgs) => {
  switch (type) {
    case 'image':
      return imageUpload(app, args)
    case 'video':
      return videoUpload(app, args)
    case 'audio':
      return audioUpload(app, args)
    case 'model3d':
      return modelUpload(app, args)
  }
}

const uploadAssets = (app: Application) => async (data: AssetUploadType, params: UploadParams) => {
  if (typeof data.args === 'string') data.args = JSON.parse(data.args)
  const files = params.files
  if (data.type === 'user-avatar-upload') {
    return await uploadAvatarStaticResource(
      app,
      {
        avatar: files[0].buffer as Buffer,
        thumbnail: files[1].buffer as Buffer,
        ...(data.args as AvatarUploadArgsType)
      },
      params
    )
  } else if (data.type === 'admin-file-upload') {
    if (!(await verifyScope('admin', 'admin')({ app, params } as any))) return

    if (!data.args.staticResourceType) return

    if (!files || files.length === 0) throw new Error('No files to upload')

    if (data.variants) {
      return uploadAsset(app, data.args.staticResourceType!, {
        name: data.args.key,
        files: files
      })
    }

    return Promise.all(
      files.map((file, i) =>
        uploadAsset(app, data.args.staticResourceType!, {
          name: data.args.key.split('.')[0],
          files: [file]
        })
      )
    )
  }
}

export const createStaticResourceHash = (file: Buffer | string, props: { name?: string; assetURL?: string }) => {
  return createHash('sha3-256')
    .update(typeof file === 'string' ? file : file.length.toString())
    .update(props.name || props.assetURL!.split('/').pop()!.split('.')[0])
    .digest('hex')
}

export const addGenericAssetToS3AndStaticResources = async (
  app: Application,
  files: UploadFile[],
  extension: string,
  args: AdminAssetUploadArgumentsType,
  storageProviderName?: string
): Promise<StaticResourceInterface> => {
  const provider = getStorageProvider(storageProviderName)
  // make userId optional and safe for feathers create
  const key = processFileName(args.key)
  const whereArgs = {
    [Op.or]: [{ key: path.join(key, files[0].originalname) }, { id: args.id ?? '' }]
  } as any
  if (args.project) whereArgs.project = args.project
  const existingAsset = (await app.service('static-resource').Model.findOne({
    where: whereArgs
  })) as StaticResourceInterface

  const mimeType = CommonKnownContentTypes[extension] as string

  const assetURL = getCachedURL(path.join(key, files[0].originalname), provider.cacheDomain)
  const hash = args.hash || createStaticResourceHash(files[0].buffer, { name: args.name, assetURL })
  const body = {
    hash,
    key,
    mimeType,
    staticResourceType: args.staticResourceType,
    project: args.project
  } as ResourcePatchCreateInterface
  const variants = [] as { url: string; metadata: Record<string, string | number> }[]
  const promises = [] as Promise<void>[]
  // upload asset to storage provider
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const useKey = path.join(key, file.originalname)
    variants.push({
      url: getCachedURL(useKey, provider.cacheDomain),
      metadata: { size: file.size }
    })
    if (i === 0) {
      body.url = variants[0].url
    }
    if (typeof file.buffer !== 'string') {
      promises.push(uploadVariant(file.buffer, mimeType, useKey, storageProviderName))
    }
  }
  await Promise.all(promises)

  if (existingAsset) {
    await app.service('static-resource').patch(existingAsset.id, body, { isInternal: true })

    await Promise.all(
      variants.map((variant, i) =>
        app.service('static-resource-variant').create(
          {
            ...variant,
            staticResourceId: existingAsset.id
          },
          { isInternal: true }
        )
      )
    )

    return app.service('static-resource').get(existingAsset.id)
  } else {
    if (args.userId) body.userId = args.userId
    const staticResource = (await app
      .service('static-resource')
      .create(body, { isInternal: true })) as StaticResourceInterface

    await Promise.all(
      variants.map((variant, i) =>
        app.service('static-resource-variant').create(
          {
            ...variant,
            staticResourceId: staticResource.id
          },
          { isInternal: true }
        )
      )
    )

    return app.service('static-resource').get(staticResource.id)
  }
}

export default (app: Application): void => {
  app.use(
    'upload-asset',
    {
      create: uploadAssets(app)
    },
    {
      koa: {
        before: [
          multipartMiddleware.any(),
          async (ctx, next) => {
            const files = ctx.request.files
            if (ctx?.feathers && ctx.method !== 'GET') {
              ;(ctx as any).feathers.files = (ctx as any).request.files.media
                ? (ctx as any).request.files.media
                : ctx.request.files
            }

            await next()
            return ctx.body
          }
        ]
      }
    }
  )
  const service = app.service('upload-asset')

  service.hooks(hooks)
}
