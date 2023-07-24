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

import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

import { ImageConvertParms } from '@etherealengine/engine/src/assets/constants/ImageConvertParms'

import { Application } from '../../../declarations'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    'image-convert': {
      create: (data: ImageConvertParms) => Promise<string | string[]>
    }
  }
}

async function convertImage(data: ImageConvertParms): Promise<string | string[]> {
  const projectDir = path.join(appRootPath.path, 'packages/projects')
  const inURI = /.*(projects\/.*)$/.exec(data.src)![1]
  const inPath = path.join(projectDir, inURI)
  const app: Application = this.app
  const fileData = fs.statSync(inPath)
  const isDir = fileData.isDirectory()
  async function doConvert(inPath) {
    const outPath = inPath.replace(/\.[^\.]+$/, `.${data.format}`)
    const outURIDir = isDir ? inURI : path.dirname(inURI)
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
    const result: string = await app.service('file-browser').patch(null, {
      fileName,
      path: outURIDir,
      body: fs.readFileSync(outPath),
      contentType: `image/${data.format}`
    })
    return result
  }
  if (isDir) {
    const files = fs.readdirSync(inPath).map((file) => path.join(inPath, file))
    return await Promise.all(files.map(doConvert))
  }
  return await doConvert(inPath)
}

export default (app: Application): any => {
  app.use('image-convert', {
    create: convertImage.bind({ app })
  })
}
