import { Application } from '@feathersjs/express/lib'
import { Document, Format, NodeIO, Property, Texture } from '@gltf-transform/core'
import { DracoMeshCompression, MeshoptCompression, MeshQuantization, TextureBasisu } from '@gltf-transform/extensions'
import { dedup, draco, meshopt, prune, quantize, reorder } from '@gltf-transform/functions'
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

export type ModelResourcesArguments = {
  src: string
  filter: string
}

export async function getModelResources(app: Application, args: ModelResourcesArguments) {
  const { io } = await ModelTransformLoader()
  const document = await io.read(args.src)
  const root = document.getRoot()
  const listTable = (element) => {
    switch (element) {
      case 'meshes':
        return root.listMeshes()
      case 'textures':
        return root.listTextures()
      case 'materials':
        return root.listMaterials()
      case 'nodes':
        return root.listNodes()
      default:
        return []
    }
  }
  const entries = listTable(args.filter).map((resource, idx): [string, Property] => [
    `${resource.propertyType}-${idx}`,
    resource
  ])
  return Object.fromEntries(entries)
}

const fileUploadPath = (fUploadPath: string) => {
  const [_, savePath, fileName] = /.*\/packages\/projects\/(.*)\/([\w\d\s\-_\.]*)$/.exec(fUploadPath)!
  return [savePath, fileName]
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

  const toPath = (texture: Texture, index?: number) => {
    return `${toValidFilename(texture.getName())}-${index}-${Date.now()}.${mimeToFileType(texture.getMimeType())}`
  }

  const externalizeImages = async (document: Document) => {
    const resourceName = path.basename(args.src).slice(0, path.basename(args.src).lastIndexOf('.'))
    const resourcePath = path.join(path.dirname(args.dst), resourceName)
    if (fs.existsSync(resourcePath)) {
      fs.rmSync(resourcePath, { recursive: true, force: true })
    }
    fs.mkdirSync(resourcePath)
    const root = document.getRoot()
    root.listTextures().map((texture, index) => {
      externalizeImage(resourcePath, texture, index)
    })
  }

  const externalizeImage = async (resourcePath: string, texture: Texture, index?: number) => {
    if (texture.getURI()) return
    const data = texture.getImage()
    const fullResourcePath = path.join(resourcePath, toPath(texture, index))
    const [savePath, fileName] = fileUploadPath(fullResourcePath)
    await app.service('file-browser').patch(null, {
      path: savePath,
      fileName,
      body: data,
      contentType: getContentType(fullResourcePath)
    })
    console.log('externalized image to path ' + fullResourcePath)
    texture.setURI(fullResourcePath)
    texture.setImage(new Uint8Array())
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
  if (args.parms.useDraco) {
    await document.transform(
      draco({
        method: 'sequential',
        encodeSpeed: 0,
        decodeSpeed: 0
      })
    )
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

  if (parms.externalizeTextures) {
    await externalizeImages(document)
  }
  const basename = path.basename(args.dst).replace(/\.glb$/, '')
  const json = await io.writeJSON(document, {
    basename,
    format: Format.GLTF
  })
  const data = await io.writeBinary(document)
  const [savePath, fileName] = fileUploadPath(args.dst)
  const result = await app.service('file-browser').patch(null, {
    path: savePath,
    fileName,
    body: data,
    contentType: getContentType(args.dst)
  })
  const gltfName = fileName.replace(/\.glb$/, '.gltf')
  await app.service('file-browser').patch(null, {
    path: savePath,
    fileName: gltfName,
    body: JSON.stringify(json.json),
    contentTYpe: getContentType('test.gltf')
  })
  if (fs.existsSync(tmpDir)) await promiseExec(`rm -R ${tmpDir}`)
  console.log('Handled glb file')
  return result
}
