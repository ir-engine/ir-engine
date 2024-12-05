/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { Paginated, Params } from '@feathersjs/feathers'
import Multer from '@koa/multer'
import { createHash } from 'crypto'

import {
  AssetUploadType,
  AvatarUploadArgsType,
  UploadFile
} from '@ir-engine/common/src/interfaces/UploadAssetInterface'
import { fileBrowserPath, uploadAssetPath, UserType } from '@ir-engine/common/src/schema.type.module'
import { staticResourcePath, StaticResourceType } from '@ir-engine/common/src/schemas/media/static-resource.schema'

import { Application } from '../../../declarations'
import verifyScope from '../../hooks/verify-scope'
import logger from '../../ServerLogger'
import { uploadAvatarStaticResource } from '../../user/avatar/avatar-helper'
import hooks from './upload-asset.hooks'

const multipartMiddleware = Multer({ limits: { fieldSize: Infinity } })

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [uploadAssetPath]: {
      create: ReturnType<typeof uploadAssets>
    }
  }
}

export interface UploadParams extends Params {
  files: UploadFile[]
  user: UserType
}

export type UploadAssetArgs = {
  project: string
  name?: string
  path?: string
  file: UploadFile // uploaded file or strings
}

export const uploadAsset = async (app: Application, args: UploadAssetArgs) => {
  logger.info('uploadAsset', {
    project: args.project,
    name: args.name,
    path: args.path
  })
  const hash = createStaticResourceHash(args.file.buffer)

  const query = {
    hash,
    $limit: 1
  } as any
  if (args.project) query.project = args.project

  /** @todo - if adding variants that already exist, we only return the first one */
  const existingResource = (await app.service(staticResourcePath).find({
    query
  })) as Paginated<StaticResourceType>

  if (existingResource.data.length > 0) return existingResource.data[0]

  const name = args.name ?? args.file.originalname
  const relativePath = args.path!.replace('projects/' + args.project + '/', '') + name
  await app.service(fileBrowserPath).patch(
    null,
    {
      project: args.project,
      body: args.file,
      path: relativePath
    },
    {
      isInternal: true
    }
  )

  return (
    await app.service(staticResourcePath).find({
      query: {
        key: args.path,
        $limit: 1
      }
    })
  ).data[0]
}

const uploadAssets = (app: Application) => async (data: AssetUploadType, params: UploadParams) => {
  if (typeof data.args === 'string') data.args = JSON.parse(data.args)
  const files = params.files
  if (data.type === 'user-avatar-upload') {
    const callData = {
      avatar: files[0].buffer as Buffer,
      thumbnail: files[1].buffer as Buffer,
      ...(data.args as AvatarUploadArgsType)
    } as any
    if (data.path) callData.path = data.path

    return await uploadAvatarStaticResource(app, callData, params)
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

export const createStaticResourceHash = (file: Buffer | string) => {
  return createHash('sha3-256').update(file).digest('hex')
}

export default (app: Application): void => {
  app.use(
    uploadAssetPath,
    {
      create: uploadAssets(app)
    },
    {
      koa: {
        before: [
          multipartMiddleware.any(),
          async (ctx, next) => {
            if (ctx?.feathers && ctx.method !== 'GET') {
              ctx.feathers.headers = ctx.headers
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
  const service = app.service(uploadAssetPath)

  service.hooks(hooks)
}
