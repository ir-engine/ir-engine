import appRootPath from 'app-root-path'
import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import util from 'util'

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
