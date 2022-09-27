import { Params } from '@feathersjs/feathers'
import express from 'express'
import multer from 'multer'
import { Op } from 'sequelize'
import { MathUtils } from 'three'

import { StaticResourceInterface } from '@xrengine/common/src/interfaces/StaticResourceInterface'
import {
  AdminAssetUploadArgumentsType,
  AssetUploadType,
  UploadFile
} from '@xrengine/common/src/interfaces/UploadAssetInterface'
import { processFileName } from '@xrengine/common/src/utils/processFileName'

import { Application } from '../../../declarations'
import verifyScope from '../../hooks/verify-scope'
import logger from '../../ServerLogger'
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

export interface UploadParams extends Params {
  files: UploadFile[]
}

export const addGenericAssetToS3AndStaticResources = async (
  app: Application,
  file: Buffer,
  mimeType: string,
  args: AdminAssetUploadArgumentsType,
  storageProviderName?: string
) => {
  const provider = getStorageProvider(storageProviderName)
  // make userId optional and safe for feathers create
  const userIdQuery = args.userId ? { userId: args.userId } : {}
  const key = processFileName(args.key)
  const existingAsset = await app.service('static-resource').Model.findAndCountAll({
    where: {
      [Op.or]: [{ key: key }, { id: args.id ?? '' }]
    }
  })

  let returned: Promise<StaticResourceInterface>
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
          ContentType: mimeType
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
            key: key,
            mimeType: mimeType,
            staticResourceType: args.staticResourceType
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
                url: assetURL,
                key: key,
                mimeType: mimeType,
                staticResourceType: args.staticResourceType,
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
      create: async (data: AssetUploadType, params: UploadParams) => {
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

          if (argsData.key && argsData.key.startsWith('static-resources/') === false) {
            const splits = argsData.key.split('.')
            let ext = ''
            let name = argsData.key
            if (splits.length > 1) {
              ext = `.${splits.pop()}`
              name = splits.join('.')
            }

            argsData.key = `static-resources/${name}_${MathUtils.generateUUID()}${ext}`
          }

          if (files && files.length > 0) {
            return Promise.all(
              files.map((file, i) =>
                addGenericAssetToS3AndStaticResources(app, file.buffer, file.mimetype, { ...argsData })
              )
            )
          } else {
            return Promise.all(
              data?.files.map((file, i) =>
                addGenericAssetToS3AndStaticResources(app, file as Buffer, (data.args as any).mimeType, { ...argsData })
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
