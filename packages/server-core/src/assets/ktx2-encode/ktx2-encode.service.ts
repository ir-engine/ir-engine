import appRootPath from 'app-root-path'
import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { MathUtils } from 'three'
import util from 'util'

import { KTX2EncodeArguments } from '@xrengine/engine/src/assets/constants/CompressionParms'

import { Application } from '../../../declarations'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    'ktx2-encode': {
      create: (data: KTX2EncodeArguments) => Promise<string | string[]>
    }
  }
}

async function createKtx2(data: KTX2EncodeArguments): Promise<string | string[]> {
  const promiseExec = util.promisify(exec)
  const serverDir = path.join(appRootPath.path, 'packages/server')
  const projectDir = path.join(appRootPath.path, 'packages/projects')
  const tmpDir = path.join(serverDir, `tmp-${MathUtils.generateUUID()}`)
  const BASIS_U = path.join(appRootPath.path, 'packages/server/public/loader_decoders/basisu')
  const inURI = /.*(projects\/.*)$/.exec(data.src)![1]
  const inPath = path.join(projectDir, inURI)
  const app = this.app
  async function doEncode(inPath) {
    const outPath = inPath.replace(/\.[^\.]+$/, '.ktx2')
    const outURIDir = path.dirname(inURI)
    const fileName = /[^\\/]*$/.exec(outPath)![0]
    const command = `${BASIS_U} -ktx2${data.mode === 'UASTC' ? ' -uastc' : ''}${
      data.mipmaps ? ' -mipmap' : ''
    } -y_flip -linear -q ${data.quality} ${inPath}`
    console.log(command)
    console.log(await promiseExec(command))
    console.log(await promiseExec(`mv ${fileName} ${outPath}`))
    const result: string = await app.service('file-browser').patch(null, {
      fileName,
      path: outURIDir,
      body: fs.readFileSync(outPath),
      contentType: 'image/ktx2'
    })
    return result
  }

  const fileData = fs.statSync(inPath)
  const isDir = fileData.isDirectory()
  if (isDir) {
    const files = fs.readdirSync(inPath).map((file) => path.join(inPath, file))
    return await Promise.all(files.map(doEncode))
  } else return await doEncode(inPath)
}

export default (app: Application): any => {
  app.use('ktx2-encode', {
    create: createKtx2.bind({ app })
  })
}
