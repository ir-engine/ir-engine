import { bodyParser, koa } from '@feathersjs/koa'

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

const multipartMiddleware = bodyParser({
  multipart: true,
  formidable: {
    maxFileSize: Infinity
  }
})

export default (app: Application): any => {
  const fileBrowser = new FileBrowserService(app)
  // fileBrowser.docs = projectDocs
  app.use(multipartMiddleware)
  app.use(
    'file-browser/upload',
    {
      create: uploadFile(app)
    },
    {
      koa: {
        before: [
          async (ctx, next) => {
            console.log('trying to upload file')
            const files = ctx.request.files
            if (ctx?.feathers && ctx.method !== 'GET') {
              ;(ctx as any).feathers.files = (ctx as any).request.files.media
                ? (ctx as any).request.files.media
                : ctx.request.files
            }
            if (Object.keys(files as any).length > 1) {
              ctx.status = 400
              ctx.body = 'Only one file is allowed'
              return
            }
            await next()
            console.log('uploaded file')
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
