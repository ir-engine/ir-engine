import express from 'express'
import multer from 'multer'
import { useStorageProvider } from '../storageprovider/storageprovider'
import blobService from 'feathers-blob'

import { Application } from '../../../declarations'
import { Upload } from './upload.class'
import hooks from './upload.hooks'
import uploadDocs from './upload.docs'

const multipartMiddleware = multer()

declare module '../../../declarations' {
  interface ServiceTypes {
    upload: Upload
  }
}

export default (app: Application): void => {
  const provider = useStorageProvider()
  const doc = uploadDocs

  /**
   * Initialize our service with any options it requires and docs
   *
   * @author Vyacheslav Solovjov
   */
  app.use(
    '/upload',
    multipartMiddleware.fields([{ name: 'file' }, { name: 'thumbnail' }]),
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (req?.feathers) {
        req.feathers.file = (req as any).files.file ? (req as any).files.file[0] : null
        req.feathers.body = (req as any).body
        req.feathers.mimeType = req.feathers.file.mimetype
        req.feathers.storageProvider = provider
        req.feathers.thumbnail = (req as any).files.thumbnail ? (req as any).files.thumbnail[0] : null
        next()
      }
    },
    blobService({ Model: provider.getStorage() })
  )

  const service = app.service('upload')

  service.hooks(hooks)
}
