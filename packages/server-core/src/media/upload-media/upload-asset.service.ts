import { Application } from '../../../declarations'
import multer from 'multer'
import { Params } from '@feathersjs/feathers'
import hooks from './upload-asset.hooks'

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
  app.use('upload-asset', multipartMiddleware.any(), {
    create: async (data: UploadedAsset, params?: Params) => {
      console.log('\n\nupload-asset', data, params, '\n\n')
      // TODO: make this an exposable abstraction or something
      if (data.avatar) {
        return await app.service('avatar').create(data, null!)
      }
    }
  })
  const service = app.service('upload-asset')
  ;(service as any).hooks(hooks)
}
