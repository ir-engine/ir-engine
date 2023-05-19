import Multer from '@koa/multer'

import { Application } from '../../../declarations'
import { UploadParams } from '../upload-asset/upload-asset.service'
import { FileBrowserService } from './file-browser.class'
import hooks from './file-browser.hooks'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    'file-browser': FileBrowserService
    'file-browser/upload': {
      create: ReturnType<typeof uploadFile>
    }
  }
}

export const uploadFile = (app: Application) => async (data: any, params: UploadParams) => {
  if (typeof data.args === 'string') data.args = JSON.parse(data.args)

  const result = (await Promise.all(
    params.files.map((file) =>
      app
        .service('file-browser')
        .patch(null, { fileName: data.fileName, path: data.path, body: file.buffer, contentType: file.mimetype })
    )
  )) as string[]

  // Clear params otherwise all the files and auth details send back to client as  response
  for (const prop of Object.getOwnPropertyNames(params)) delete params[prop]

  return result
}

const multipartMiddleware = Multer({ limits: { fieldSize: Infinity, files: 1 } })

export default (app: Application): any => {
  const fileBrowser = new FileBrowserService(app)
  // fileBrowser.docs = projectDocs

  app.use(
    'file-browser/upload',
    {
      create: uploadFile(app)
    },
    {
      koa: {
        before: [
          multipartMiddleware.any(),
          async (ctx, next) => {
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

  /**
   * Initialize our service with any options it requires and docs
   */
  app.use('file-browser', fileBrowser)

  /**
   * Get our initialized service so that we can register hooks
   */
  const service = app.service('file-browser')

  service.hooks(hooks as any)
}
