import { Application } from '../../../declarations'
import multer from 'multer'
import { Params } from '@feathersjs/feathers'
import hooks from './upload-asset.hooks'
import express from 'express'
import { AvatarUploadArguments } from '../../user/avatar/avatar-helper'

const multipartMiddleware = multer({ limits: { fieldSize: Infinity } })

declare module '../../../declarations' {
  interface ServiceTypes {
    'upload-asset': any
  }
}

type UploadedAsset = {
  userId: string
} & any

export default (app: Application): void => {
  app.use(
    'upload-asset',
    multipartMiddleware.single('files'),
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (req?.feathers && req.method !== 'GET') {
        req.feathers.files = (req as any).files
        req.feathers.args = (req as any).args
      }
      next()
    },
    {
      create: async (data: UploadedAsset, params?: Params) => {
        // console.log('\n\nupload-asset', data, params, '\n\n')
        if (data.args?.avatarName) {
          return await app.service('avatar').create(
            {
              avatar: data.files[0],
              thumbnail: data.files[1],
              ...data.args
            } as AvatarUploadArguments,
            null!
          )
        }
      }
    }
  )
  const service = app.service('upload-asset')
  ;(service as any).hooks(hooks)
}
