import { Application } from '@feathersjs/express/lib'
import { NodeIO, Texture } from '@gltf-transform/core'
import { MeshoptCompression, MeshQuantization, TextureBasisu } from '@gltf-transform/extensions'
import { dedup, prune, quantize, reorder } from '@gltf-transform/functions'
import appRootPath from 'app-root-path'
import { exec } from 'child_process'
import fs from 'fs'
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer'
import path from 'path'
import util from 'util'

import ModelTransformLoader from '@xrengine/engine/src/assets/classes/ModelTransformLoader'

import { getContentType } from '../../util/fileUtils'

export type ModelTransformArguments = {
  src: string
  dst: string
}

export async function transformModel(app: Application, args: ModelTransformArguments) {
  const promiseExec = util.promisify(exec)
  const tmpDir = path.join(appRootPath.path, 'packages/server/tmp')
  const BASIS_U = path.join(appRootPath.path, 'packages/server/public/loader_decoders/basisu')
  const toTmp = (fileName) => {
    return `${tmpDir}/${fileName}`
  }

  /**
   *
   * @param {string} mimeType
   * @returns
   */
  const mimeToFileType = (mimeType) => {
    switch (mimeType) {
      case 'image/jpg':
      case 'image/jpeg':
        return 'jpg'
      case 'image/png':
        return 'png'
      case 'image/ktx2':
        return 'ktx2'
      default:
        return null
    }
  }

  const toValidFilename = (name: string) => {
    let result = name.replace(/[\s]/, '-')
    return result
  }

  const toPath = (texture: Texture) => {
    return `${toValidFilename(texture.getName())}.${mimeToFileType(texture.getMimeType())}`
  }

  const { io } = ModelTransformLoader()

  const document = await io.read(args.src)
  const root = document.getRoot()

  /* PROCESS MESHES */
  document
    .createExtension(MeshoptCompression)
    .setRequired(true)
    .setEncoderOptions({ method: MeshoptCompression.EncoderMethod.QUANTIZE })

  await MeshoptEncoder.ready
  await document.transform(dedup(), prune(), reorder({ encoder: MeshoptEncoder }))
  /* /PROCESS MESHES */

  /* PROCESS TEXTURES */
  document.createExtension(TextureBasisu).setRequired(true)
  const textures = root.listTextures().filter((texture) => mimeToFileType(texture.getMimeType()) !== 'ktx2')

  for (const texture of textures) {
    const oldImg = texture.getImage()
    const fileName = toPath(texture)
    const oldPath = toTmp(fileName)
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir)
    }
    fs.writeFileSync(oldPath, oldImg!)

    await promiseExec(`${BASIS_U} -ktx2 ${oldPath}`)
    const nuFileName = fileName.replace(`.${mimeToFileType(texture.getMimeType())}`, '.ktx2')
    const nuPath = `${tmpDir}/${nuFileName}`
    await promiseExec(`mv ${nuFileName} ${nuPath}`)

    texture.setImage(fs.readFileSync(nuPath))
    texture.setMimeType('image/ktx2')
    console.log('loaded ktx2 image ' + nuPath)
  }

  //await io.write(args.dst, document)
  const data = await io.writeBinary(document)
  const [_, savePath, fileName] = /.*\/packages\/projects\/(.*)\/([\w\d\s\-_\.]*)$/.exec(args.dst)!
  const result = await app.service('file-browser').patch(null, {
    path: savePath,
    fileName,
    body: data,
    contentType: getContentType(args.dst)
  })
  if (fs.existsSync(tmpDir)) await promiseExec(`rm -R ${tmpDir}`)
  console.log('Handled glb file')
  return result
}
