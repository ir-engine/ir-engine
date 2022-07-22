import { Application } from '@feathersjs/express/lib'
import { NodeIO, Texture } from '@gltf-transform/core'
import { DracoMeshCompression, MeshoptCompression, MeshQuantization, TextureBasisu } from '@gltf-transform/extensions'
import { dedup, prune, quantize, reorder } from '@gltf-transform/functions'
import appRootPath from 'app-root-path'
import { exec } from 'child_process'
import draco3d from 'draco3dgltf'
import fs from 'fs'
import { max } from 'lodash'
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer'
import path from 'path'
import sharp from 'sharp'
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
  const serverDir = path.join(appRootPath.path, 'packages/server')
  const tmpDir = path.join(serverDir, 'tmp')
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

  const fileTypeToMime = (fileType) => {
    switch (fileType) {
      case 'jpg':
        return 'image/jpg'
      case 'png':
        return 'image/png'
      case 'ktx2':
        return 'image/ktx2'
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
  //resize textures
  const handleImage = async (inPath, outPath, dstImgFormat) => {
    try {
      if (path.extname(inPath) === '.ktx2') {
        console.warn('cannot resize ktx2 compressed image at ' + inPath)
        return
      }
      const img = await sharp(inPath)
      const metadata = await img.metadata()
      await img
        .resize(Math.min(parms.maxTextureSize, metadata.width), Math.min(parms.maxTextureSize, metadata.height), {
          fit: 'contain'
        })
        .toFormat(dstImgFormat)
        .toFile(outPath.replace(/\.[\w\d]+$/, `.${dstImgFormat}`))
      console.log('handled image file ' + inPath)
    } catch (e) {
      console.error('error while handling image ' + inPath)
      console.error(e)
    }
  }
  const textures = root
    .listTextures()
    .filter(
      (texture) =>
        (mimeToFileType(texture.getMimeType()) !== parms.textureFormat && !!texture.getSize()) ||
        texture.getSize()?.reduce((x, y) => Math.max(x, y))! > parms.maxTextureSize
    )
  for (const texture of textures) {
    const oldImg = texture.getImage()
    const fileName = toPath(texture)
    const oldPath = toTmp(fileName)
    const resizeExtension = parms.textureFormat === 'ktx2' ? 'png' : parms.textureFormat
    const resizedPath = oldPath.replace(`.${mimeToFileType(texture.getMimeType())}`, `-resized.${resizeExtension}`)
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir)
    }
    fs.writeFileSync(oldPath, oldImg!)
    const xResizedName = fileName.replace(
      `.${mimeToFileType(texture.getMimeType())}`,
      `-resized.${parms.textureFormat}`
    )
    const nuFileName = fileName.replace(
      `.${mimeToFileType(texture.getMimeType())}`,
      `-transformed.${parms.textureFormat}`
    )
    const nuPath = `${tmpDir}/${nuFileName}`
    await handleImage(oldPath, resizedPath, resizeExtension)
    if (parms.textureFormat === 'ktx2') {
      //KTX2 Basisu Compression
      document.createExtension(TextureBasisu).setRequired(true)
      await promiseExec(`${BASIS_U} -ktx2 ${resizedPath}`)
      await promiseExec(`mv ${serverDir}/${xResizedName} ${nuPath}`)

      console.log('loaded ktx2 image ' + nuPath)
    } else {
      await promiseExec(`mv ${resizedPath} ${nuPath}`)
    }
    texture.setImage(fs.readFileSync(nuPath))
    texture.setMimeType(fileTypeToMime(parms.textureFormat)!)
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
