// Initializes the `uploads` service on path `/uploads`
import express from 'express'
import { ServiceAddons } from '@feathersjs/feathers'
import multer from 'multer'
import StorageProvider from '../../storage/storageprovider'

// TODO: Add type defintions
// @ts-ignore
import blobService from 'feathers-blob'

import { Application } from '../../declarations'
import { Uploads } from './upload.class'
import hooks from './upload.hooks'

const multipartMiddleware = multer()

declare module '../../declarations' {
  interface ServiceTypes {
    'uploads': Uploads & ServiceAddons<any>
  }
}

export default (app: Application): void => {
  const provider = new StorageProvider()

  app.use('/uploads',
    multipartMiddleware.single('file'),
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (req?.feathers) req.feathers.file = (req as any).file
      next()
    },
    blobService({ Model: provider.getStorage() })
  )

  const service = app.service('uploads')

  service.hooks(hooks)
}
