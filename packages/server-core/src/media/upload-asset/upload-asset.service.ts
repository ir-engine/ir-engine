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
import Multer from '@koa/multer'
import { createHash } from 'crypto'
import fs from 'fs'
import path from 'path'
import { Op } from 'sequelize'

import { StaticResourceInterface } from '@etherealengine/common/src/interfaces/StaticResourceInterface'
import {
  AdminAssetUploadArgumentsType,
  AssetUploadType,
  AvatarUploadArgsType,
  UploadFile
} from '@etherealengine/common/src/interfaces/UploadAssetInterface'
import { CommonKnownContentTypes, MimeTypeToExtension } from '@etherealengine/common/src/utils/CommonKnownContentTypes'
import { processFileName } from '@etherealengine/common/src/utils/processFileName'

import { Application } from '../../../declarations'
import verifyScope from '../../hooks/verify-scope'
import logger from '../../ServerLogger'
import { uploadAvatarStaticResource } from '../../user/avatar/avatar-helper'
import { getStats } from '../static-resource/static-resource-helper'
import { getCachedURL } from '../storageprovider/getCachedURL'
import { getStorageProvider } from '../storageprovider/storageprovider'
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
  url?: string
  project?: string
  userId?: string
}

export const getFileMetadata = async (data: { name?: string; file: UploadFile | string }) => {
  const { name, file } = data

  let contentLength = 0
  let extension = ''
  let assetName = name!
  let mimeType = ''

  if (typeof file === 'string') {
    const url = file
    if (/http(s)?:\/\//.test(url)) {
      const fileHead = await fetch(url, { method: 'HEAD' })
      if (!/^[23]/.test(fileHead.status.toString())) throw new Error('Invalid URL')
      contentLength = fileHead.headers['content-length'] || fileHead.headers?.get('content-length')
      mimeType = fileHead.headers['content-type'] || fileHead.headers?.get('content-type')
    } else {
      const fileHead = await fs.statSync(url)
      contentLength = fileHead.size
      mimeType = CommonKnownContentTypes[url.split('.').pop()!] ?? 'application/octet-stream'
    }
    if (!name) assetName = url.split('/').pop()!
    extension = url.split('.').pop()!
  } else {
    extension = MimeTypeToExtension[file.mimetype] ?? file.originalname.split('.').pop()
    contentLength = file.size
    assetName = name ?? file.originalname
    mimeType = file.mimetype
  }

  const hash = createHash('sha3-256').update(contentLength.toString()).update(assetName).update(mimeType).digest('hex')

  return {
    assetName,
    extension,
    hash,
    mimeType
  }
}

const addFileToStorageProvider = async (file: Buffer, mimeType: string, key: string) => {
  logger.info(`Uploading ${key} to storage provider`)
  console.log(file, mimeType, key)
  const provider = getStorageProvider()
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
  project: string
  name?: string
  path?: string
  file: UploadFile // uploaded file or strings
}

export const uploadAsset = async (app: Application, args: UploadAssetArgs) => {
  console.log('uploadAsset', args)
  const { assetName, hash, mimeType } = await getFileMetadata({
    file: args.file,
    name: args.file.originalname
  })

  const whereQuery = {
    hash
  } as any
  if (args.project) whereQuery.project = args.project

  /** @todo - if adding variants that already exist, we only return the first one */
  const existingResource = (await app.service('static-resource').Model.findOne({
    where: whereQuery
  })) as StaticResourceInterface | null

  if (existingResource) return existingResource

  const key = args.path ?? `/temp/${hash}`
  return await addAssetAsStaticResource(app, args.file, {
    hash: hash,
    path: key,
    project: args.project
  })
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
    if (!(await verifyScope('admin', 'admin')({ app, params } as any))) throw new Error('Unauthorized')

    if (!data.args.project) throw new Error('No project specified')

    if (!files || files.length === 0) throw new Error('No files to upload')

    return (
      await Promise.all(
        files.map((file, i) =>
          uploadAsset(app, {
            path: data.args.path,
            name: data.args.name,
            file: file,
            project: data.args.project!
          })
        )
      )
    ).flat()
  }
}

export const createStaticResourceHash = (file: Buffer | string, props: { name?: string; assetURL?: string }) => {
  return createHash('sha3-256')
    .update(typeof file === 'string' ? file : file.length.toString())
    .update(props.name || props.assetURL!.split('/').pop()!.split('.')[0])
    .digest('hex')
}

/**
 * Uploads a file to the storage provider and adds a "static-resource" entry
 * - if a main file is a buffer, upload it and all variants to storage provider and create a new static resource entry
 * - if the asset is coming from an external URL, create a new static resource entry
 * - if the asset is already in the static resource table, update the entry with the new file
 */
export const addAssetAsStaticResource = async (
  app: Application,
  file: UploadFile,
  args: AdminAssetUploadArgumentsType
): Promise<StaticResourceInterface> => {
  console.log('addAssetAsStaticResource', file, args)
  const provider = getStorageProvider()

  const isExternalURL = args.path.startsWith('http')

  // make userId optional and safe for feathers create
  const primaryKey = isExternalURL ? args.path : processFileName(path.join(args.path, file.originalname))
  const url = isExternalURL ? args.path : getCachedURL(primaryKey, provider.cacheDomain)

  const whereArgs = {
    [Op.or]: [{ url }, { id: args.id ?? '' }]
  } as any
  if (args.project) whereArgs.project = args.project
  const existingAsset = (await app.service('static-resource').Model.findOne({
    where: whereArgs
  })) as StaticResourceInterface

  const stats = await getStats(file.buffer, file.mimetype)

  const hash = args.hash || createStaticResourceHash(file.buffer, { name: args.name, assetURL: url })
  const body: Partial<StaticResourceInterface> = {
    hash,
    url,
    key: primaryKey,
    mimeType: file.mimetype,
    project: args.project
  }
  if (stats) body.stats = stats
  // if (args.userId) body.userId = args.userId

  if (typeof file.buffer !== 'string') {
    await addFileToStorageProvider(file.buffer, file.mimetype, primaryKey)
  }

  let resourceId = ''

  if (existingAsset) {
    await app.service('static-resource').patch(existingAsset.id, body, { isInternal: true })
    resourceId = existingAsset.id
  } else {
    const resource = (await app
      .service('static-resource')
      .create(body, { isInternal: true })) as StaticResourceInterface
    resourceId = resource.id
  }

  return app.service('static-resource').get(resourceId)
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
