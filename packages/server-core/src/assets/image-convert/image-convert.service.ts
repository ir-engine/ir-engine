/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

import { fileBrowserPath } from '@ir-engine/common/src/schemas/media/file-browser.schema'
import { ImageConvertParms } from '@ir-engine/engine/src/assets/constants/ImageConvertParms'

import { imageConvertPath } from '@ir-engine/common/src/schema.type.module'
import { Application } from '../../../declarations'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [imageConvertPath]: {
      create: (data: ImageConvertParms) => Promise<string | string[]>
    }
  }
}

const convertImage =
  (app: Application) =>
  (data: ImageConvertParms): Promise<string | string[]> => {
    const projectDir = path.join(appRootPath.path, 'packages/projects')
    const inURI = /.*(projects\/.*)$/.exec(data.src)![1]
    const inPath = path.join(projectDir, inURI)
    const fileData = fs.statSync(inPath)
    const isDir = fileData.isDirectory()
    const project = inURI.split('/')[1]

    async function doConvert(inPath) {
      const outPath = inPath.replace(/\.[^\.]+$/, `.${data.format}`)
      const outURIDir = isDir ? inURI : path.dirname(inURI)
      const projectRelativeDirectoryPath = outURIDir.split('/').slice(2).join('/')
      const fileName = /[^\\/]*$/.exec(outPath)![0]
      const image = sharp(inPath)
      if (data.width && data.height) {
        image.resize(data.width, data.height)
      }
      if (data.flipX) {
        image.flip(true)
      }
      if (data.flipY) {
        image.flip(false)
      }
      await image.toFile(outPath)
      const result = await app.service(fileBrowserPath).patch(null, {
        project,
        path: projectRelativeDirectoryPath + '/' + fileName,
        body: fs.readFileSync(outPath),
        contentType: `image/${data.format}`
      })
      return result.url
    }

    if (isDir) {
      const files = fs.readdirSync(inPath).map((file) => path.join(inPath, file))
      return Promise.all(files.map(doConvert))
    }
    return doConvert(inPath)
  }

export default (app: Application): any => {
  app.use(imageConvertPath, {
    create: convertImage(app)
  })
}
