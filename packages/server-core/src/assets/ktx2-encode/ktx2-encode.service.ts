import appRootPath from 'app-root-path'
import { execFileSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { MathUtils } from 'three'

import { KTX2EncodeArguments } from '@etherealengine/engine/src/assets/constants/CompressionParms'

import { Application } from '../../../declarations'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    'ktx2-encode': {
      create: (data: KTX2EncodeArguments) => Promise<string | string[]>
    }
  }
}

async function createKtx2(data: KTX2EncodeArguments): Promise<string | string[]> {
  const serverDir = path.join(appRootPath.path, 'packages/server')
  const projectDir = path.join(appRootPath.path, 'packages/projects')
  const BASIS_U = path.join(appRootPath.path, 'packages/server/public/loader_decoders/basisu')
  const inURI = /.*(projects\/.*)$/.exec(data.src)![1]
  const inPath = path.join(projectDir, inURI)
  const app: Application = this.app
  const fileData = fs.statSync(inPath)
  const isDir = fileData.isDirectory()
  async function doEncode(inPath) {
    const outPath = inPath.replace(/\.[^\.]+$/, '.ktx2')
    const outURIDir = path.dirname(inURI)
    const fileName = /[^\\/]*$/.exec(outPath)![0]
    const args = `-ktx2${data.mode === 'UASTC' ? ' -uastc' : ''}${data.mipmaps ? ' -mipmap' : ''} -y_flip -linear -q ${
      data.quality
    } ${inPath}`
    console.log(args)
    console.log(execFileSync(BASIS_U, args.split(/\s+/)))
    console.log(execFileSync('mv', [fileName, outPath]))
    const result = await this.app.service('file-browser').patch(null, {
      fileName,
      path: outURIDir,
      body: fs.readFileSync(outPath),
      contentType: 'image/ktx2'
    })
    return result
  }
  if (isDir) {
    const files = fs
      .readdirSync(inPath)
      .filter((file) => file && ['.jpg', '.jpeg', '.png'].some((ending) => file.endsWith(ending)))
      .map((file) => path.join(inPath, file))
    return await Promise.all(files.map(doEncode))
  } else return await doEncode(inPath)
}

export default (app: Application): any => {
  app.use('ktx2-encode', {
    create: createKtx2.bind({ app })
  })
}
