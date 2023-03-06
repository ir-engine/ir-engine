import { Application } from '@feathersjs/express/lib'
import {
  BufferUtils,
  Document,
  Format,
  Buffer as glBuffer,
  Material,
  Primitive,
  Property,
  Texture
} from '@gltf-transform/core'
import { MeshQuantization, TextureBasisu } from '@gltf-transform/extensions'
import { EncoderMethod } from '@gltf-transform/extensions/dist/ext-meshopt-compression/constants'
import { dedup, draco, partition, prune, quantize, reorder, weld } from '@gltf-transform/functions'
import appRootPath from 'app-root-path'
import { exec } from 'child_process'
import fs from 'fs'
import { MeshoptEncoder } from 'meshoptimizer'
import path from 'path'
import sharp from 'sharp'
import { MathUtils } from 'three'
import util from 'util'

import { ModelTransformParameters } from '@etherealengine/engine/src/assets/classes/ModelTransform'

import { getContentType } from '../../util/fileUtils'
import { EEMaterial } from '../extensions/EE_MaterialTransformer'
import ModelTransformLoader from '../ModelTransformLoader'

export type ModelTransformArguments = {
  src: string
  dst: string
  parms: ModelTransformParameters
}

export async function combineMaterials(document: Document) {
  const root = document.getRoot()
  const cache: Material[] = []
  console.log('combining materials...')
  root.listMaterials().map((material) => {
    const eeMat = material.getExtension<EEMaterial>('EE_material')
    const dupe = cache.find((cachedMaterial) => {
      const cachedEEMat = cachedMaterial.getExtension<EEMaterial>('EE_material')
      if (eeMat !== null && cachedEEMat !== null) {
        return (
          eeMat.prototype === cachedEEMat.prototype &&
          ((eeMat.args === cachedEEMat.args) === null || (cachedEEMat.args && eeMat.args?.equals(cachedEEMat.args)))
        )
      } else return material.equals(cachedMaterial)
    })
    if (dupe !== undefined) {
      console.log('found duplicate material...')
      let dupeCount = 0
      root
        .listMeshes()
        .flatMap((mesh) => mesh.listPrimitives())
        .map((prim) => {
          if (prim.getMaterial() === material) {
            prim.setMaterial(dupe)
            dupeCount++
          }
        })
      console.log('replaced ' + dupeCount + ' materials')
    } else {
      cache.push(material)
    }
  })
}

export async function combineMeshes(document: Document) {
  const root = document.getRoot()
  const prims = root.listMeshes().flatMap((mesh) => mesh.listPrimitives())
  const matMap = new Map<Material, Primitive[]>()
  for (const prim of prims) {
    const material = prim.getMaterial()
    if (material) {
      if (!matMap.has(material)) {
        matMap.set(material, [])
      }
      const matPrims = matMap.get(material)
      matPrims?.push(prim)
    }
  }
  ;[...matMap.entries()].map(([material, prims]) => {
    const nuPrim = document.createPrimitive()
    nuPrim.setMaterial(material)
    prims.map((prim) => {
      prim.listAttributes().map((accessor) => {
        let nuAttrib = nuPrim.getAttribute(accessor.getName())
        if (!nuAttrib) {
          nuPrim.setAttribute(accessor.getName(), accessor)
          nuAttrib = accessor
        } else {
          nuAttrib.setArray(
            BufferUtils.concat([Uint8Array.from(nuAttrib.getArray()!), Uint8Array.from(accessor.getArray()!)])
          )
        }
      })
    })
  })
}

export async function transformModel(app: Application, args: ModelTransformArguments) {
  const parms = args.parms
  const promiseExec = util.promisify(exec)
  const serverDir = path.join(appRootPath.path, 'packages/server')
  const tmpDir = path.join(serverDir, 'tmp')
  const BASIS_U = path.join(appRootPath.path, 'packages/server/public/loader_decoders/basisu')
  const GLTF_PACK = path.join(appRootPath.path, 'packages/server/public/loader_decoders/gltfpack')
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

  const resourceName = /*'model-resources'*/ path.basename(args.src).slice(0, path.basename(args.src).lastIndexOf('.'))
  const resourcePath = path.join(path.dirname(args.src), resourceName)
  const projectRoot = path.join(appRootPath.path, 'packages/projects')

  const toValidFilename = (name: string) => {
    let result = name.replace(/[\s]/, '-')
    return result
  }

  const toPath = (element: Texture | glBuffer, index?: number) => {
    if (element instanceof Texture) {
      if (element.getURI()) {
        return path.basename(element.getURI())
      } else
        return `${toValidFilename(element.getName())}-${index}-${Date.now()}.${mimeToFileType(element.getMimeType())}`
    } else if (element instanceof glBuffer) return `buffer-${index}-${Date.now()}.bin`
    else throw new Error('invalid element to find path')
  }

  const fileUploadPath = (fUploadPath: string) => {
    const pathCheck = /.*\/packages\/projects\/(.*)\/([\w\d\s\-_\.]*)$/
    const [_, savePath, fileName] =
      pathCheck.exec(fUploadPath) ?? pathCheck.exec(path.join(path.dirname(args.src), fUploadPath))!
    return [savePath, fileName]
  }

  const initializeResourceDir = async () => {
    if (fs.existsSync(resourcePath)) {
      //fs.rmSync(resourcePath, { recursive: true, force: true })
      await app.service('file-browser').remove(resourcePath.replace(projectRoot, ''))
    }
    //fs.mkdirSync(resourcePath)
    if (!fs.existsSync(resourcePath))
      await app.service('file-browser').create(resourcePath.replace(projectRoot, '') as any)
  }

  const { io } = await ModelTransformLoader()

  const document = await io.read(args.src)

  await MeshoptEncoder.ready

  const root = document.getRoot()

  /* ID unnamed resources */
  await combineMaterials(document)

  if (args.parms.dedup) {
    await document.transform(dedup())
  }

  if (args.parms.prune) {
    await document.transform(prune())
  }

  if (args.parms.weld.enabled) {
    await document.transform(weld({ tolerance: args.parms.weld.tolerance }))
  }

  if (args.parms.reorder) {
    await document.transform(
      reorder({
        encoder: MeshoptEncoder,
        target: 'performance'
      })
    )
  }

  /* PROCESS MESHES */
  if (args.parms.meshQuantization.enabled) {
    document.createExtension(MeshQuantization).setRequired(true)
    await document.transform(quantize(args.parms.meshQuantization.options))
  }

  if (args.parms.dracoCompression.enabled) {
    await document.transform(draco(args.parms.dracoCompression.options))
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
    const resizedPath = oldPath.replace(
      new RegExp(`\\.${mimeToFileType(texture.getMimeType())}$`),
      `-resized.${resizeExtension}`
    )
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir)
    }
    fs.writeFileSync(oldPath, oldImg!)
    const xResizedName = fileName.replace(
      new RegExp(`\\.${mimeToFileType(texture.getMimeType())}$`),
      `-resized.${parms.textureFormat}`
    )
    const nuFileName = fileName.replace(
      new RegExp(`\\.${mimeToFileType(texture.getMimeType())}$`),
      `-transformed.${parms.textureFormat}`
    )
    const nuPath = `${tmpDir}/${nuFileName}`
    await handleImage(oldPath, resizedPath, resizeExtension)
    if (parms.textureFormat === 'ktx2') {
      //KTX2 Basisu Compression
      document.createExtension(TextureBasisu).setRequired(true)
      await promiseExec(
        `${BASIS_U} -ktx2 ${resizedPath} -q ${parms.textureCompressionQuality} ${
          parms.textureCompressionType === 'uastc' ? '-uastc' : ''
        } -linear -y_flip`
      )
      await promiseExec(`mv ${serverDir}/${xResizedName} ${nuPath}`)

      console.log('loaded ktx2 image ' + nuPath)
    } else {
      await promiseExec(`mv ${resizedPath} ${nuPath}`)
    }
    texture.setImage(fs.readFileSync(nuPath))
    texture.setMimeType(fileTypeToMime(parms.textureFormat)!)
  }

  let result
  switch (parms.modelFormat) {
    case 'glb':
      const data = await io.writeBinary(document)
      const [savePath, fileName] = fileUploadPath(args.dst)
      result = await app.service('file-browser').patch(null, {
        path: savePath,
        fileName,
        body: data,
        contentType: getContentType(args.dst)
      })

      console.log('Handled glb file')
      break
    case 'gltf':
      const idResources = (elements) =>
        elements.filter((mesh) => !mesh.getName()).map((mesh) => mesh.setName(MathUtils.generateUUID()))
      idResources(root.listBuffers())
      idResources(root.listMeshes())
      idResources(root.listTextures())
      document.transform(
        partition({
          animations: true,
          meshes: root.listMeshes().map((mesh) => mesh.getName())
        })
      )

      const { json, resources } = await io.writeJSON(document, { format: Format.GLTF, basename: resourceName })
      await initializeResourceDir()
      json.images?.map((image) => {
        image.uri = path.join(resourceName, path.basename(image.uri!))
      })
      const defaultBufURI = MathUtils.generateUUID() + '.bin'
      json.buffers?.map((buffer) => {
        buffer.uri = path.join(resourceName, path.basename(buffer.uri ?? defaultBufURI))
      })
      Object.keys(resources).map((uri) => {
        resources[path.join(resourceName, path.basename(uri))] = resources[uri]
        delete resources[uri]
      })
      const doUpload = (uri, data) => {
        const [savePath, fileName] = fileUploadPath(uri)
        return app.service('file-browser').patch(null, {
          path: savePath,
          fileName,
          body: data,
          contentType: getContentType(uri)
        })
      }
      await Promise.all(Object.entries(resources).map(([uri, data]) => doUpload(uri, data)))
      result = await doUpload(args.dst.replace(/\.glb$/, '.gltf'), Buffer.from(JSON.stringify(json)))
      console.log('Handled gltf file')
      break
  }
  if (fs.existsSync(tmpDir)) await promiseExec(`rm -R ${tmpDir}`)
  return result
}
