import { Params } from '@feathersjs/feathers'
import express from 'express'
import multer from 'multer'

import { AdminAssetUploadArgumentsType, AssetUploadType } from '@xrengine/common/src/interfaces/UploadAssetInterface'
import { processFileName } from '@xrengine/common/src/utils/processFileName'

import { Application } from '../../../declarations'
import verifyScope from '../../hooks/verify-scope'
import logger from '../../logger'
import { uploadAvatarStaticResource } from '../../user/avatar/avatar-helper'
import { getCachedURL } from '../storageprovider/getCachedURL'
import { getStorageProvider } from '../storageprovider/storageprovider'
import hooks from './upload-asset.hooks'

const multipartMiddleware = multer({ limits: { fieldSize: Infinity } })

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    'upload-asset': any
  }
}

export const addGenericAssetToS3AndStaticResources = async (
  app: Application,
  file: Buffer,
  args: AdminAssetUploadArgumentsType
) => {
  const provider = getStorageProvider()
  // make userId optional and safe for feathers create
  const userIdQuery = args.userId ? { userId: args.userId } : {}
  const key = processFileName(args.key)
  const existingAsset = await app.service('static-resource').Model.findAndCountAll({
    where: {
      staticResourceType: args.staticResourceType || 'avatar',
      ...{ key: key },
      ...userIdQuery
    }
  })

  let returned
  const promises: Promise<any>[] = []

  // upload asset to storage provider
  promises.push(
    new Promise<void>(async (resolve) => {
      try {
        await provider.createInvalidation([key])
      } catch (e) {
        logger.info(`[ERROR addGenericAssetToS3AndStaticResources while invalidating ${key}]:`, e)
      }

      await provider.putObject(
        {
          Key: key,
          Body: file,
          ContentType: args.contentType
        },
        {
          isDirectory: false
        }
      )
      resolve()
    })
  )

  // add asset to static resources
  const assetURL = getCachedURL(key, provider.cacheDomain)
  try {
    if (existingAsset.rows.length) {
      promises.push(provider.deleteResources([existingAsset.rows[0].id]))
      promises.push(
        app.service('static-resource').patch(
          existingAsset.rows[0].id,
          {
            url: assetURL,
            key: key
          },
          { isInternal: true }
        )
      )
    } else {
      promises.push(
        new Promise(async (resolve, reject) => {
          try {
            const newResource = await app.service('static-resource').create(
              {
                mimeType: args.contentType,
                url: assetURL,
                key: key,
                ...userIdQuery
              },
              { isInternal: true }
            )
            resolve(newResource)
          } catch (err) {
            logger.error(err)
            reject(err)
          }
        })
      )
    }
    await Promise.all(promises)
    returned = promises[promises.length - 1]
  } catch (e) {
    logger.info('[ERROR addGenericAssetToS3AndStaticResources while adding to static resources]: %o', e)
    return null!
  }
  return returned
}

export default (app: Application): void => {
  app.use(
    'upload-asset',
    multipartMiddleware.any(),
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (req?.feathers && req.method !== 'GET') {
        ;(req as any).feathers.files = (req as any).files.media ? (req as any).files.media : (req as any).files
      }
      next()
    },
    {
      create: async (data: AssetUploadType, params: Params) => {
        if (typeof data.args === 'string') data.args = JSON.parse(data.args)
        const files = params.files
        if (data.type === 'user-avatar-upload') {
          return await uploadAvatarStaticResource(
            app,
            {
              avatar: files[0].buffer,
              thumbnail: files[1].buffer,
              ...data.args
            },
            params
          )
        } else if (data.type === 'admin-file-upload') {
          if (!(await verifyScope('admin', 'admin')({ app, params } as any))) return
          const argsData = typeof data.args === 'string' ? JSON.parse(data.args) : data.args
          if (files && files.length > 0) {
            return Promise.all(
              files.map((file, i) =>
                addGenericAssetToS3AndStaticResources(app, file.buffer as Buffer, { ...argsData[i] })
              )
            )
          } else {
            return Promise.all(
              data?.files.map((file, i) =>
                addGenericAssetToS3AndStaticResources(app, file as Buffer, { ...argsData[0] })
              )
            )
          }
        }
      }
    }
  )
  const service = app.service('upload-asset')
  ;(service as any).hooks(hooks)
}
