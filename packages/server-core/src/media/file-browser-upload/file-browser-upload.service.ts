/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import Multer from '@koa/multer'

import { Application } from '../../../declarations'
import { UploadParams } from '../upload-asset/upload-asset.service'
import { FileBrowserService } from './file-browser.class'
import hooks from './file-browser.hooks'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    'file-browser/upload': {
      create: ReturnType<typeof uploadFile>
    }
  }
}

export const uploadFile = (app: Application) => async (data: any, params: UploadParams) => {
  if (typeof data.args === 'string') data.args = JSON.parse(data.args)

  const result = (await Promise.all(
    params.files.map((file) =>
      app.service('file-browser').patch(null, {
        fileName: data.fileName,
        path: data.path,
        body: file.buffer as Buffer,
        contentType: file.mimetype
      })
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
