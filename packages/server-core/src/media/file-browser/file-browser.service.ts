import { Params } from '@feathersjs/feathers'
import express from 'express'
import multer from 'multer'

import { Application } from '../../../declarations'
import { FileBrowserService } from './file-browser.class'
import hooks from './file-browser.hooks'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    'file-browser': FileBrowserService
    'file-browser/upload': any
  }
}

const multipartMiddleware = multer({ limits: { fieldSize: Infinity, files: 1 } })

export default (app: Application): any => {
  const fileBrowser = new FileBrowserService(app)
  // fileBrowser.docs = projectDocs

  app.use(
    'file-browser/upload',
    multipartMiddleware.any(),
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (req?.feathers && req.method !== 'GET') {
        ;(req as any).feathers.files = (req as any).files.media ? (req as any).files.media : (req as any).files
      }

      next()
    },
    {
      create: async (data: any, params: Params) => {
        if (typeof data.args === 'string') data.args = JSON.parse(data.args)

        const result = await Promise.all(
          params.files.map((file) =>
            app
              .service('file-browser')
              .patch(null, { fileName: data.fileName, path: data.path, body: file.buffer, contentType: file.mimeType })
          )
        )

        // Clear params otherwise all the files and auth details send back to client as  response
        for (const prop of Object.getOwnPropertyNames(params)) delete params[prop]

        return result
      }
    }
  )

  /**
   * Initialize our service with any options it requires and docs
   *
   * @author Abhishek Pathak
   */
  app.use('file-browser', fileBrowser)

  /**
   * Get our initialized service so that we can register hooks
   *
   * @author Abhishek Pathak
   */
  const service = app.service('file-browser')

  service.hooks(hooks as any)
}
