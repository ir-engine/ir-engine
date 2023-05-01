import { Params } from '@feathersjs/feathers'
import koaMulter from '@koa/multer'
import { Route53RecoveryControlConfig } from 'aws-sdk'
import { createHash } from 'crypto'
import Koa from 'koa'
import Router from 'koa-router'
import { Op } from 'sequelize'
import { MathUtils } from 'three'

import { StaticResourceInterface } from '@etherealengine/common/src/interfaces/StaticResourceInterface'
import {
  AdminAssetUploadArgumentsType,
  AssetUploadType,
  AvatarUploadArgsType,
  UploadFile
} from '@etherealengine/common/src/interfaces/UploadAssetInterface'
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

const router = new Router()
const multipartMiddleware = koaMulter({ limits: { fieldSize: Infinity, files: 1 } })

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
  project?: string
  userId?: string
}

const uploadLOD = async (file: Buffer, mimeType: string, key: string, storageProviderName?: string) => {
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

class AssetService {
  app: Application

  constructor(app: Application) {
    this.app = app
  }
  async create(data: AssetUploadType, params: UploadParams) {
    ;async (ctx: Koa.Context) => {
      ctx.body = await uploadAsset(this.app)(data, params)
    }
  }
}

const uploadAsset = (app: Application) => async (data: AssetUploadType, params: UploadParams) => {
  if (typeof data.args === 'string') data.args = JSON.parse(data.args)
  const files = params.files
  if (data.type === 'user-avatar-upload') {
    return await uploadAvatarStaticResource(
      app,
      {
        avatar: files[0].buffer,
        thumbnail: files[1].buffer,
        ...(data.args as AvatarUploadArgsType)
      },
      params
    )
  } else if (data.type === 'admin-file-upload') {
    if (!(await verifyScope('admin', 'admin')({ app, params } as any))) return

    if (files && files.length > 0) {
      return Promise.all(
        files.map((file, i) => {
          let promise
          const callBody = {
            name: data.args.key.split('.')[0],
            file
          }
          switch (data.args.staticResourceType) {
            case 'image':
              promise = imageUpload(app, callBody)
              break
            case 'video':
              promise = videoUpload(app, callBody)
              break
            case 'audio':
              promise = audioUpload(app, callBody)
              break
            case 'model3d':
              promise = modelUpload(app, callBody)
              break
          }
          return promise
        })
      )
    } else {
      return Promise.all(
        data?.files.map((file, i) => {
          let promise
          const callBody = {
            name: data.args.key.split('.')[0],
            file: file as Buffer
          }
          switch (data.args.staticResourceType) {
            case 'image':
              promise = imageUpload(app, callBody)
              break
            case 'video':
              promise = videoUpload(app, callBody)
              break
            case 'audio':
              promise = audioUpload(app, callBody)
              break
            case 'model3d':
              promise = modelUpload(app, callBody)
              break
          }
          return promise
        })
      )
    }
  }
}

export const createStaticResourceHash = (file: Buffer, props: { name?: string; assetURL?: string }) => {
  return createHash('sha3-256')
    .update(file.length.toString())
    .update(props.name || props.assetURL!.split('/').pop()!.split('.')[0])
    .digest('hex')
}

export const addGenericAssetToS3AndStaticResources = async (
  app: Application,
  file: Buffer,
  mimeType: string,
  args: AdminAssetUploadArgumentsType,
  storageProviderName?: string
): Promise<StaticResourceInterface> => {
  const provider = getStorageProvider(storageProviderName)
  // make userId optional and safe for feathers create
  const key = processFileName(args.key)
  const whereArgs = {
    [Op.or]: [{ key: key }, { id: args.id ?? '' }]
  } as any
  if (args.project) whereArgs.project = args.project
  const existingAsset = await app.service('static-resource').Model.findOne({
    where: whereArgs
  })

  let promises: Promise<any>[] = []
  const assetURL = getCachedURL(key, provider.cacheDomain)
  const hash = args.hash || createStaticResourceHash(file, { name: args.name, assetURL })
  if (!args.numLODs) args.numLODs = 1
  const body = {
    hash,
    key,
    mimeType,
    staticResourceType: args.staticResourceType,
    project: args.project
  } as ResourcePatchCreateInterface
  // upload asset to storage provider
  for (let i = 0; i < args.numLODs; i++) {
    if (i === 0) {
      let keySplit = key.split('/')
      let fileName = keySplit[keySplit.length - 1]
      if (!/LOD0/.test(fileName)) {
        let fileNameSplit = fileName.split('.')
        fileNameSplit.splice(1, 0, 'LOD0')
        fileName = fileNameSplit.join('.')
      }
      keySplit[keySplit.length - 1] = fileName
      const useKey = keySplit.join('/')
      body[`LOD${i}_url`] = getCachedURL(useKey, provider.cacheDomain)
      body[`LOD${i}_metadata`] = args.stats
      promises.push(uploadLOD(file, mimeType, useKey, storageProviderName))
    }
    // TODO: Add logic for scaling root file to additional LODs
  }
  await Promise.all(promises)
  if (existingAsset)
    return app
      .service('static-resource')
      .patch(existingAsset.id, body, { isInternal: true }) as unknown as StaticResourceInterface
  else {
    if (args.userId) body.userId = args.userId
    return app.service('static-resource').create(body, { isInternal: true }) as unknown as StaticResourceInterface
  }
}

export default (app: Application): void => {
  const assetService = new AssetService(app)
  router.use('upload-asset', multipartMiddleware.any(), async (ctx: Koa.Context, next: Koa.Next) => {
    if (ctx?.feathers && ctx.method !== 'GET') {
      ;(ctx as any).feathers.files = (ctx as any).request.files.media
        ? (ctx as any).request.files.media
        : ctx.request.files
    }

    await next()
  })

  app.use(router.routes()).use(router.allowedMethods())

  app.use('upload-asset', assetService)
  const service = app.service('upload-asset')

  service.hooks(hooks)
}
