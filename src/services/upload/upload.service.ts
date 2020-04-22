import express from 'express'
import { ServiceAddons } from '@feathersjs/feathers'
import multer from 'multer'
import StorageProvider from '../../storage/storageprovider'
import blobService from 'feathers-blob'

import { Application } from '../../declarations'
import { Upload } from './upload.class'
import hooks from './upload.hooks'

const multipartMiddleware = multer()

declare module '../../declarations' {
  interface ServiceTypes {
    'upload': Upload & ServiceAddons<any>
  }
}

export default (app: Application): void => {
  const provider = new StorageProvider()

  app.use('/upload',
    multipartMiddleware.single('file'),
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (req?.feathers) {
        req.feathers.file = (req as any).file
        req.feathers.body = (req as any).body
        req.feathers.mime_type = req.file.mimetype
        req.feathers.storageProvider = provider
        req.feathers.thumbnail = (req as any).thumbnail
        next()
      }
    },
    blobService({ Model: provider.getStorage() })
  )

  const service = app.service('upload')

  service.hooks(hooks)
}
