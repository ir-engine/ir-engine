import express from 'express'
import { ServiceAddons } from '@feathersjs/feathers'
import multer from 'multer'
import StorageProvider from '../../storage/storageprovider'
import blobService from 'feathers-blob'

import { Application } from '../../declarations'
import { Uploads } from './upload.class'
import hooks from './upload.hooks'
import { Resource } from '../resource/resource.class'
import resourceModel from '../../models/resource.model'

const multipartMiddleware = multer()

declare module '../../declarations' {
  interface ServiceTypes {
    'uploads': Uploads & ServiceAddons<any>
  }
}

export default (app: Application): void => {
  const provider = new StorageProvider()

  const options = {
    Model: resourceModel(app),
    paginate: app.get('paginate')
  }

  var resourceOptions

  app.use('/uploads',
    multipartMiddleware.single('file'),
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (req?.feathers) {
        req.feathers.file = (req as any).file
        resourceOptions = {
          ...options,
          req,
          res,
          next
        }
        next(resourceOptions)
      }
    },
    blobService({ Model: provider.getStorage() }) //,
    // new Resource(resourceOptions, app)
  )

  const service = app.service('uploads')

  service.hooks(hooks)
}
