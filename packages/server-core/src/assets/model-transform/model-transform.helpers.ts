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

import { Application } from '@feathersjs/koa/lib'
import {
  BufferUtils,
  Document,
  Format,
  Buffer as glBuffer,
  Material,
  Mesh,
  Node,
  Primitive,
  Texture
} from '@gltf-transform/core'
import { EXTMeshGPUInstancing, KHRTextureBasisu } from '@gltf-transform/extensions'
import { dedup, draco, flatten, join, palette, partition, prune, reorder, weld } from '@gltf-transform/functions'
import appRootPath from 'app-root-path'
import { execFileSync } from 'child_process'
import { createHash } from 'crypto'
import fs from 'fs'
import { MeshoptEncoder } from 'meshoptimizer'
import path from 'path'
import sharp from 'sharp'
import { MathUtils } from 'three'

import {
  ExtractedImageTransformParameters,
  extractParameters,
  ModelTransformParameters
} from '@etherealengine/engine/src/assets/classes/ModelTransform'

import { getContentType } from '../../util/fileUtils'
import { EEMaterial } from '../extensions/EE_MaterialTransformer'
import { EEResourceID } from '../extensions/EE_ResourceIDTransformer'
import ModelTransformLoader from '../ModelTransformLoader'

/**
 *
 * @param doc
 * @param batchExtension
 * @param mesh
 * @param count
 * @returns
 */
const createBatch = (doc: Document, batchExtension: EXTMeshGPUInstancing, mesh: Mesh, count) => {
  return mesh.listPrimitives().map((prim) => {
    const buffer = prim.getAttribute('POSITION')?.getBuffer() ?? doc.createBuffer()

    const batchTranslation = doc
      .createAccessor()
      .setType('VEC3')
      .setArray(new Float32Array(3 * count))
      .setBuffer(buffer)
    const batchRotation = doc
      .createAccessor()
      .setType('VEC4')
      .setArray(new Float32Array(4 * count))
      .setBuffer(buffer)
    const batchScale = doc
      .createAccessor()
      .setType('VEC3')
      .setArray(new Float32Array(3 * count))
      .setBuffer(buffer)

    return batchExtension
      .createInstancedMesh()
      .setAttribute('TRANSLATION', batchTranslation)
      .setAttribute('ROTATION', batchRotation)
      .setAttribute('SCALE', batchScale)
  })
}

function pruneUnusedNodes(nodes: Node[], logger) {
  let node: Node | undefined
  let unusedNodes = 0
  while ((node = nodes.pop())) {
    if (
      node.listChildren().length ||
      node.getCamera() ||
      node.getMesh() ||
      node.getSkin() ||
      node.listExtensions().length
    ) {
      continue
    }
    const nodeParent = node.getParentNode() as Node
    if (nodeParent instanceof Node) {
      nodes.push(nodeParent)
    }
    node.dispose()
    unusedNodes++
    console.log(`Pruned ${unusedNodes} nodes.`)
  }
}

function removeUVsOnUntexturedMeshes(document: Document) {
  document
    .getRoot()
    .listMeshes()
    .map((mesh) => {
      const prims = mesh.listPrimitives()
      if (prims.length === 1) {
        const prim = prims[0]
        const material = prim.getMaterial()
        if (
          material &&
          (material.getBaseColorTexture() ||
            material.getNormalTexture() ||
            material.getEmissiveTexture() ||
            material.getOcclusionTexture() ||
            material.getMetallicRoughnessTexture())
        ) {
          return
        }
        prim.setAttribute('TEXCOORD_0', null)
        prim.setAttribute('TEXCOORD_1', null)
      }
    })
}

const split = async (document: Document) => {
  const root = document.getRoot()
  const scene = root.listScenes()[0]
  const toSplit = root.listNodes().filter((node) => {
    const mesh = node.getMesh()
    const prims = mesh?.listPrimitives()
    return mesh && prims && prims.length > 1
  })
  const primMeshes = new Map()
  toSplit.map((node) => {
    const mesh = node.getMesh()!
    const nuNodes: Node[] = []
    mesh.listPrimitives().map((prim, primIdx) => {
      if (primIdx > 0) {
        if (!primMeshes.has(prim)) {
          primMeshes.set(prim, document.createMesh(mesh.getName() + '-' + primIdx).addPrimitive(prim))
        } else {
          console.log('found cached prim')
        }
        const nuNode = document.createNode(node.getName() + '-' + primIdx).setMesh(primMeshes.get(prim))
        node.getSkin() && nuNode.setSkin(node.getSkin())
        ;(node.getParentNode() ?? scene).addChild(nuNode)
        nuNode.setMatrix(node.getMatrix())
        nuNodes.push(nuNode)
      }
    })
    node.listChildren().map((child) => {
      nuNodes[0]?.addChild(child)
    })
    node.detach()
  })
  toSplit.map((node) => {
    const mesh = node.getMesh()!
    mesh.listPrimitives().map((prim, primIdx) => {
      if (primIdx > 0) {
        mesh.removePrimitive(prim)
      }
    })
    node.setMesh(null)
  })
}

const myInstance = async (document: Document) => {
  const root = document.getRoot()
  const scene = root.listScenes()[0]
  const batchExtension = document.createExtension(EXTMeshGPUInstancing)
  const meshes = root.listMeshes()
  console.log('meshes:', meshes)
  const nodes = root.listNodes().filter((node) => node.getMesh())
  const table = nodes.reduce(
    (_table, node) => {
      const mesh = node.getMesh()
      const idx = meshes.findIndex((mesh2) => mesh?.equals(mesh2))
      _table[idx] = _table[idx] ?? []
      _table[idx].push(node)
      return _table
    },
    {} as Record<number, any[]>
  )
  console.log('table:', table)
  const modifiedNodes = new Set<Node>()
  Object.entries(table)
    .filter(([_, _nodes]) => _nodes.length > 1)
    .map(([meshIdx, _nodes]) => {
      const mesh = meshes[meshIdx]
      console.log('mesh:', mesh, 'nodes:', nodes)
      const batches = createBatch(document, batchExtension, mesh, _nodes.length)
      batches.map((batch) => {
        const batchTranslate = batch.getAttribute('TRANSLATION')!
        const batchRotate = batch.getAttribute('ROTATION')!
        const batchScale = batch.getAttribute('SCALE')!
        const batchNode = document.createNode().setMesh(mesh).setExtension('EXT_mesh_gpu_instancing', batch)
        scene.addChild(batchNode)
        _nodes.map((node, i) => {
          batchTranslate.setElement(i, node.getWorldTranslation())
          batchRotate.setElement(i, node.getWorldRotation())
          batchScale.setElement(i, node.getWorldScale())
          node.setMesh(null)
          modifiedNodes.add(node)
        })
      })
      console.log('modified nodes: ', modifiedNodes)
      pruneUnusedNodes([...modifiedNodes], document.getLogger())
    })
}

function unInstanceSingletons(document: Document) {
  const root = document.getRoot()
  root
    .listNodes()
    .filter((node) => (node.getExtension('EXT_mesh_gpu_instancing') as any)?.listAttributes()?.[0].getCount() === 1)
    .map((node) => {
      console.log('removed instanced singleton', node.getName())
      node.setExtension('EXT_mesh_gpu_instancing', null) //delete instancing
    })
}

export type ModelTransformArguments = {
  src: string
  dst: string
  resourceUri: string
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
  const nuPrims = [...matMap.entries()].map(([material, prims]) => {
    const nuPrim = document.createPrimitive()
    nuPrim.setMaterial(material)
    prims.map((prim) => {
      prim.listSemantics().map((key) => {
        const accessor = prim.getAttribute(key)!
        let nuAttrib = nuPrim.getAttribute(key)
        if (!nuAttrib) {
          nuPrim.setAttribute(key, accessor)
          nuAttrib = accessor
        } else {
          nuAttrib.setArray(
            BufferUtils.concat([Uint8Array.from(nuAttrib.getArray()!), Uint8Array.from(accessor.getArray()!)])
          )
        }
      })
    })
    return nuPrim
  })
  root.listNodes().map((node) => {
    if (node.getMesh()) {
      node.setMesh(null)
    }
  })
  nuPrims.map((nuPrim) => {
    root.listScenes()[0].addChild(document.createNode().setMesh(document.createMesh().addPrimitive(nuPrim)))
  })
}

function hashBuffer(buffer: Uint8Array): string {
  const hash = createHash('sha256')
  hash.update(buffer)
  return hash.digest('hex')
}

export async function transformModel(app: Application, args: ModelTransformArguments) {
  const parms = args.parms
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
  const resourcePath = args.resourceUri
    ? path.join(path.dirname(args.src), args.resourceUri)
    : path.join(path.dirname(args.src), resourceName)
  const projectRoot = path.join(appRootPath.path, 'packages/projects')

  const toValidFilename = (name: string) => {
    const result = name.replace(/[\s]/g, '-')
    return result
  }
  let pathIndex = 0
  const toPath = (element: Texture | glBuffer, index?: number) => {
    if (element instanceof Texture) {
      if (element.getURI()) {
        return path.basename(element.getURI())
      } else {
        pathIndex++
        return `${toValidFilename(element.getName())}-${pathIndex}-.${mimeToFileType(element.getMimeType())}`
      }
    } else if (element instanceof glBuffer) {
      return `buffer-${index}-${Date.now()}.bin`
    } else throw new Error('invalid element to find path')
  }

  const fileUploadPath = (fUploadPath: string) => {
    const pathCheck = /.*\/packages\/projects\/(.*)\/([\w\d\s\-_.]*)$/
    const [_, savePath, fileName] =
      pathCheck.exec(fUploadPath) ?? pathCheck.exec(path.join(path.dirname(args.src), fUploadPath))!
    return [savePath, fileName]
  }

  const { io } = await ModelTransformLoader()

  const document = await io.read(args.src)

  await MeshoptEncoder.ready

  const root = document.getRoot()

  /* ID unnamed resources */
  unInstanceSingletons(document)
  await split(document)
  await combineMaterials(document)
  args.parms.instance && (await myInstance(document))
  args.parms.dedup && (await document.transform(dedup()))
  args.parms.flatten && (await document.transform(flatten()))
  args.parms.join && (await document.transform(join(args.parms.join.options)))
  if (args.parms.palette.enabled) {
    removeUVsOnUntexturedMeshes(document)
    await document.transform(palette(args.parms.palette.options))
  }
  args.parms.prune && (await document.transform(prune()))

  /* Separate Instanced Geometry */
  const instancedNodes = root
    .listNodes()
    .filter((node) => !!node.getMesh()?.getExtension('EXT_mesh_gpu_instancing'))
    .map((node) => [node, node.getParent()])
  instancedNodes.map(([node, parent]) => {
    node instanceof Node && parent?.removeChild(node)
  })

  /* PROCESS MESHES */
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

  if (args.parms.dracoCompression.enabled) {
    await document.transform(draco(args.parms.dracoCompression.options))
  }

  /* /PROCESS MESHES */

  /* Return Instanced Geometry to Scene Graph */
  instancedNodes.map(([node, parent]) => {
    node instanceof Node && parent?.addChild(node)
  })

  /* PROCESS TEXTURES */
  if (parms.textureFormat !== 'default') {
    const textures = root
      .listTextures()
      .filter(
        (texture) =>
          (mimeToFileType(texture.getMimeType()) !== parms.textureFormat && !!texture.getSize()) ||
          texture.getSize()?.reduce((x, y) => Math.max(x, y))! > parms.maxTextureSize
      )
    for (const texture of textures) {
      const oldImg = texture.getImage()
      const resourceId = texture.getExtension<EEResourceID>('EEResourceID')?.resourceId
      const resourceParms = parms.resources.images.find(
        (resource) => resource.enabled && resource.resourceId === resourceId
      )
      const mergedParms = {
        ...parms,
        ...(resourceParms ? extractParameters(resourceParms) : {})
      } as ExtractedImageTransformParameters
      const fileName = toPath(texture)
      const oldPath = toTmp(fileName)
      const resizeExtension = mergedParms.textureFormat === 'ktx2' ? 'png' : mergedParms.textureFormat
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
        `-resized.${mergedParms.textureFormat}`
      )
      const nuFileName = fileName.replace(
        new RegExp(`\\.${mimeToFileType(texture.getMimeType())}$`),
        `-transformed.${mergedParms.textureFormat}`
      )
      const nuPath = `${tmpDir}/${nuFileName}`

      try {
        if (path.extname(oldPath) === '.ktx2') {
          console.warn('cannot resize ktx2 compressed image at ' + oldPath)
          continue
        }
        const img = await sharp(oldPath)
        const metadata = await img.metadata()
        let resizedDimension = 2
        while (resizedDimension * 2 < Math.min(mergedParms.maxTextureSize, Math.min(metadata.width, metadata.height))) {
          resizedDimension *= 2
        }
        //resize the image to be no larger than the max texture size
        await img
          .resize(resizedDimension, resizedDimension, {
            fit: 'fill'
          })
          .toFormat(resizeExtension)
          .toFile(resizedPath.replace(/\.[\w\d]+$/, `.${resizeExtension}`))
        console.log('handled image file ' + oldPath)
      } catch (e) {
        console.error('error while handling image ' + oldPath)
        console.error(e)
      }

      if (mergedParms.textureFormat === 'ktx2') {
        //KTX2 Basisu Compression
        document.createExtension(KHRTextureBasisu).setRequired(true)
        const basisArgs = `-ktx2 ${resizedPath} -q ${mergedParms.textureCompressionQuality} ${
          mergedParms.textureCompressionType === 'uastc' ? '-uastc' : ''
        } ${mergedParms.linear ? '-linear' : ''} ${mergedParms.flipY ? '-y_flip' : ''}`
          .split(/\s+/)
          .filter((x) => !!x)
        execFileSync(BASIS_U, basisArgs)
        execFileSync('mv', [`${serverDir}/${xResizedName}`, nuPath])
        console.log('loaded ktx2 image ' + nuPath)
      } else {
        execFileSync('mv', [resizedPath, nuPath])
      }
      texture.setImage(fs.readFileSync(nuPath))
      texture.setMimeType(fileTypeToMime(mergedParms.textureFormat) ?? texture.getMimeType())
    }
  }
  let result
  if (parms.modelFormat === 'glb') {
    const data = await io.writeBinary(document)
    const [savePath, fileName] = fileUploadPath(args.dst)
    result = await app.service('file-browser').patch(null, {
      path: savePath,
      fileName,
      body: data,
      contentType: getContentType(args.dst)
    })
    console.log('Handled glb file')
  } else if (parms.modelFormat === 'gltf') {
    ;[root.listBuffers(), root.listMeshes(), root.listTextures()].forEach((elements) =>
      elements.map((element: Texture | Mesh | glBuffer) => {
        let elementName = ''
        if (element instanceof Texture) {
          elementName = hashBuffer(element.getImage()!)
        } else if (element instanceof Mesh) {
          elementName = hashBuffer(Uint8Array.from(element.listPrimitives()[0].getAttribute('POSITION')!.getArray()!))
        } else if (element instanceof glBuffer) {
          const bufferPath = path.join(path.dirname(args.src), element.getURI())
          const bufferData = fs.readFileSync(bufferPath)
          elementName = hashBuffer(bufferData)
        }
        element.setName(elementName)
      })
    )
    document.transform(
      partition({
        animations: true,
        meshes: root.listMeshes().map((mesh) => mesh.getName())
      })
    )
    const { json, resources } = await io.writeJSON(document, { format: Format.GLTF, basename: resourceName })
    if (!fs.existsSync(resourcePath)) {
      await app.service('file-browser').create(resourcePath.replace(projectRoot, '') as any)
    }
    json.images?.map((image) => {
      const nuURI = path.join(
        args.resourceUri ? args.resourceUri : resourceName,
        `${image.name}.${mimeToFileType(image.mimeType)}`
      )
      resources[nuURI] = resources[image.uri!]
      delete resources[image.uri!]
      image.uri = nuURI
    })
    const defaultBufURI = MathUtils.generateUUID() + '.bin'
    json.buffers?.map((buffer) => {
      buffer.uri = path.join(
        args.resourceUri ? args.resourceUri : resourceName,
        path.basename(buffer.uri ?? defaultBufURI)
      )
    })
    Object.keys(resources).map((uri) => {
      const localPath = path.join(resourcePath, path.basename(uri))
      resources[localPath] = resources[uri]
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
  }
  fs.existsSync(tmpDir) && (await execFileSync('rm', ['-R', tmpDir]))
  return result
}
