import { Application } from '@feathersjs/express/lib'
import { NodeIO, Texture } from '@gltf-transform/core'
import { DracoMeshCompression, MeshoptCompression, MeshQuantization, TextureBasisu } from '@gltf-transform/extensions'
import { dedup, prune, quantize, reorder } from '@gltf-transform/functions'
import appRootPath from 'app-root-path'
import { exec } from 'child_process'
import draco3d from 'draco3dgltf'
import fs from 'fs'
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer'
import path from 'path'
import util from 'util'

import ModelTransformLoader, {
  ModelTransformParameters
} from '@xrengine/engine/src/assets/classes/ModelTransformLoader'

import { getContentType } from '../../util/fileUtils'

export type ModelTransformArguments = {
  src: string
  dst: string
  parms: ModelTransformParameters
}

export async function transformModel(app: Application, args: ModelTransformArguments) {
  const parms = args.parms
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

  const { io } = await ModelTransformLoader()

  const document = await io.read(args.src)
  const root = document.getRoot()

  /* PROCESS MESHES */
  if (args.parms.useMeshopt) {
    document
      .createExtension(MeshoptCompression)
      .setRequired(true)
      .setEncoderOptions({ method: MeshoptCompression.EncoderMethod.QUANTIZE })

    await MeshoptEncoder.ready
    await document.transform(dedup(), prune(), reorder({ encoder: MeshoptEncoder }))
  }
  if (args.parms.useMeshQuantization) {
    document.createExtension(MeshQuantization).setRequired(true)
    await document.transform(quantize())
  }

  /* /PROCESS MESHES */

  /* PROCESS TEXTURES */

  switch (parms.textureFormat) {
    case 'ktx2':
      //KTX2 Basisu Compression
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
      break
    case 'jpg':
      break
    case 'webp':
      break
  }

  //Draco compression option
  if (args.parms.useDraco) {
    document.createExtension(DracoMeshCompression).setRequired(true)
  }

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
