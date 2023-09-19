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

import {
  fileBrowserUploadMethods,
  fileBrowserUploadPath
} from '@etherealengine/engine/src/schemas/media/file-browser-upload.schema'
import { Application } from '../../../declarations'
import { FileBrowserUploadService } from './file-browser-upload.class'
import fileBrowserUploadDocs from './file-browser-upload.docs'
import hooks from './file-browser-upload.hooks'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    [fileBrowserUploadPath]: FileBrowserUploadService
  }
}

const multipartMiddleware = Multer({ limits: { fieldSize: Infinity, files: 1 } })

export default (app: Application): void => {
  app.use(fileBrowserUploadPath, new FileBrowserUploadService(app), {
    // A list of all methods this service exposes externally
    methods: fileBrowserUploadMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: fileBrowserUploadDocs,
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
  })

  const service = app.service(fileBrowserUploadPath)
  service.hooks(hooks)
}
