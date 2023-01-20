import appRootPath from 'app-root-path'
import { exec } from 'child_process'
import express from 'express'
import multer from 'multer'
import path from 'path'
import sharp from 'sharp'
import util from 'util'

import { Application } from '../../../declarations'

const multipartMiddleware = multer({ limits: { fieldSize: Infinity, files: 1 } })

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    'ktx2-encode': {
      create: any
    }
  }
}

export type KTX2EncodeArguments = {
  src: string
  mode: 'ETC1S' | 'UASTC'
  quality: number
  mipmaps: boolean
  powerOfTwo: boolean
  resize: boolean
  resizeWidth: number
  resizeHeight: number
  resizeMethod: 'stretch' | 'aspect'
}

export function toValidFilename(str: string) {
  return str.replace(/[\s]/gi, '-').toLowerCase()
}

export async function createKtx2(data: KTX2EncodeArguments, params: any): Promise<any> {
  const promiseExec = util.promisify(exec)
  const serverDir = path.join(appRootPath.path, 'packages/server')
  const projectDir = path.join(appRootPath.path, 'packages/projects/projects')
  const tmpDir = path.join(serverDir, 'tmp')
  const BASIS_U = path.join(appRootPath.path, 'packages/server/public/loader_decoders/basisu')
  const inPath = path.join(projectDir, /.*projects\/(.*)$/.exec(data.src)![1])
  const outPath = inPath.replace(/\.[^\.]+$/, '.ktx2')
  const command = `${BASIS_U} -ktx2${data.mode === 'UASTC' ? ' -uastc' : ''}${data.mipmaps ? ' -mipmap' : ''} -q ${
    data.quality
  } ${inPath}`
  await promiseExec(command)

  return outPath
}

export default (app: Application): any => {
  app.use('ktx2-encode', {
    create: createKtx2
  })
}
