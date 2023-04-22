import koaMulter from '@koa/multer'
import Koa from 'koa'
import Router from 'koa-router'

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

const router = new Router()
const multipartMiddleware = koaMulter({ limits: { fieldSize: Infinity, files: 1 } })

export default (app: Application): any => {
  const fileBrowser = new FileBrowserService(app)
  // fileBrowser.docs = projectDocs

  router.post(
    'file-browser/upload',
    multipartMiddleware.any(),
    async (ctx: Koa.Context, next: Koa.Next) => {
      if (ctx?.feathers && ctx.method !== 'GET') {
        ;(ctx as any).feathers.files = (ctx as any).request.files.media
          ? (ctx as any).request.files.media
          : ctx.request.files
      }

      await next()
    },
    async (ctx: Koa.Context) => {
      ctx.body = await uploadFile(app)(ctx.request.body, ctx.feathers as any)
    }
  )

  app.use(router.routes())

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
