/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import {
  BufferUtils,
  Document,
  Extension,
  Format,
  Buffer as glBuffer,
  Material,
  Mesh,
  Node,
  Primitive,
  Texture,
  Transform
} from '@gltf-transform/core'
import { EXTMeshGPUInstancing, EXTMeshoptCompression, KHRTextureBasisu } from '@gltf-transform/extensions'
import {
  cloneDocument,
  dedup,
  draco,
  flatten,
  join,
  palette,
  partition,
  prune,
  reorder,
  simplify,
  textureCompress,
  weld
} from '@gltf-transform/functions'
import { createHash } from 'crypto'
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer'
import { getPixels } from 'ndarray-pixels'
import { $attributes } from 'property-graph'
import { LoaderUtils } from 'three'
import { v4 as uuidv4 } from 'uuid'

import { API } from '@ir-engine/common'
import config from '@ir-engine/common/src/config'
import { fileBrowserPath } from '@ir-engine/common/src/schema.type.module'
import {
  ExtractedImageTransformParameters,
  extractParameters,
  ModelFormat,
  ModelTransformParameters,
  ResourceTransforms
} from '@ir-engine/engine/src/assets/classes/ModelTransform'
import { baseName, dropRoot, pathJoin } from '@ir-engine/engine/src/assets/functions/miscUtils'
import { getMutableState, NO_PROXY } from '@ir-engine/hyperflux'
import { KTX2Encoder } from '@ir-engine/xrui/core/textures/KTX2Encoder'

import {
  EEArgEntry,
  EEMaterial,
  EEMaterialExtension
} from '@ir-engine/engine/src/assets/compression/extensions/EE_MaterialTransformer'
import {
  EEResourceID,
  EEResourceIDExtension
} from '@ir-engine/engine/src/assets/compression/extensions/EE_ResourceIDTransformer'
import { UploadRequestState } from '@ir-engine/engine/src/assets/state/UploadRequestState'
import ModelTransformLoader from './ModelTransformLoader'

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

const removeUVsOnUntexturedMeshes: Transform = (document: Document) => {
  document
    .getRoot()
    .listMeshes()
    .map((mesh) => mesh.listPrimitives())
    .filter((primitives) => primitives.length === 1)
    .map(([prim]) => {
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
    })
}

const split: Transform = (document: Document) => {
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

const pruneUnusedNodes = (nodes: Node[], logger) => {
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

const doInstancing: Transform = (document: Document) => {
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

const unInstanceSingletons: Transform = (document: Document) => {
  const root = document.getRoot()
  root
    .listNodes()
    .filter((node) => (node.getExtension('EXT_mesh_gpu_instancing') as any)?.listAttributes()?.[0].getCount() === 1)
    .map((node) => {
      console.log('removed instanced singleton', node.getName())
      node.setExtension('EXT_mesh_gpu_instancing', null) //delete instancing
    })
}

const combineMaterials: Transform = (document: Document) => {
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
          ((eeMat.args === cachedEEMat.args && eeMat.args === null) ||
            (cachedEEMat.args && eeMat.args?.equals(cachedEEMat.args)))
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

const combineMeshes: Transform = (document: Document) => {
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

const meshoptCompression: Transform = (document: Document) => {
  document
    .createExtension(EXTMeshoptCompression)
    .setRequired(true)
    .setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.FILTER })
}

const hashBuffer = (buffer: Uint8Array): string => {
  const hash = createHash('sha256')
  hash.update(buffer)
  return hash.digest('hex')
}

enum Status {
  TransformingModels,
  ProcessingTexture,
  WritingFiles,
  Complete
}

export { Status as ModelTransformStatus }

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

const loaderIO = ModelTransformLoader().then(({ io }) => io)
let ktx2Encoder: KTX2Encoder | null = null

const doUpload = async (projectName, fileName, buffer) => {
  const file = new File([buffer], fileName)
  const uploadRequestState = getMutableState(UploadRequestState)
  const queue = uploadRequestState.queue.get(NO_PROXY)
  let resolver
  const promise = new Promise((resolve) => {
    resolver = resolve
  })
  uploadRequestState.queue.set([...queue, { file, projectName, callback: resolver }])
  await promise
}

const toProjectAndFileName = (fUploadPath: string, srcBaseURL: string): [string, string] => {
  const pathCheck = /projects\/([^/]+\/[^/]+)\/assets\/([\w\d\s\-|_./]*)$/
  // TODO: remove srcBaseURL if it's unnecessary
  const [_, projectName, fileName] = pathCheck.exec(fUploadPath) ?? pathCheck.exec(pathJoin(srcBaseURL, fUploadPath))!
  return [projectName, fileName]
}

const toTransformedDocument = async (srcDocument: Document, args: ModelTransformParameters): Promise<Document> => {
  const document = cloneDocument(srcDocument)

  const sourceExtensions = new Map<string, Extension>(
    srcDocument
      .getRoot()
      .listExtensionsUsed()
      .map((ext) => [ext.extensionName, ext])
  )
  const targetExtensions = new Map<string, Extension>(
    document
      .getRoot()
      .listExtensionsUsed()
      .map((ext) => [ext.extensionName, ext])
  )

  for (const extName of sourceExtensions.keys()) {
    ;(sourceExtensions.get(extName) as any).copyTo?.(targetExtensions.get(extName))
  }

  if (args.meshoptCompression.enabled) {
    await document.transform(meshoptCompression)
  }

  /* ID unnamed resources */
  await document.transform(unInstanceSingletons)
  args.split && (await document.transform(split))
  args.combineMaterials && (await document.transform(combineMaterials))
  args.instance && (await document.transform(doInstancing))
  args.dedup && (await document.transform(dedup()))
  args.flatten && (await document.transform(flatten()))
  args.join.enabled && (await document.transform(join(args.join.options)))
  args.palette.enabled &&
    (await Promise.all([
      document.transform(removeUVsOnUntexturedMeshes),
      document.transform(palette(args.palette.options))
    ]))
  args.prune && (await document.transform(prune({ keepAttributes: true /*keepExtras: true*/ })))

  /* Separate Instanced Geometry */
  // TODO: make sure the order of operations is correct. They are very order dependent!
  const instancedNodes = document
    .getRoot()
    .listNodes()
    .filter((node) => !!node.getMesh()?.getExtension('EXT_mesh_gpu_instancing'))
    .map((node) => [node, node.getParentNode()])
  instancedNodes.map(([node, parent]) => {
    node instanceof Node && parent?.removeChild(node)
  })

  if (args.weld.enabled) {
    await document.transform(weld())
  }

  if (args.simplifyRatio < 1) {
    const simplifyTransforms = [] as Transform[]
    //gltfTransform documentation recommends doing a weld before simply
    if (!args.weld.enabled) simplifyTransforms.push(weld())
    simplifyTransforms.push(
      simplify({ simplifier: MeshoptSimplifier, ratio: args.simplifyRatio, error: args.simplifyErrorThreshold })
    )
    await document.transform(...simplifyTransforms)
  }

  if (args.reorder) {
    await MeshoptEncoder.ready
    await document.transform(
      reorder({
        encoder: MeshoptEncoder,
        target: 'performance'
      })
    )
  }

  if (args.dracoCompression.enabled) {
    await document.transform(draco(args.dracoCompression.options))
  }

  /* Return Instanced Geometry to Scene Graph */
  instancedNodes.map(([node, parent]) => {
    node instanceof Node && parent?.addChild(node)
  })

  return document
}

type TextureOperation = {
  shouldResize: boolean
  shouldConvertToKTX: boolean
  texture: Texture
  params: ExtractedImageTransformParameters
}

const hashTextureOperation = (operation: TextureOperation): string => {
  const { shouldResize, shouldConvertToKTX, params, texture } = operation
  return JSON.stringify({ uri: texture.getURI(), shouldResize, shouldConvertToKTX, params: { ...params, dst: '' } })
}

const createTextureOperations = (
  document: Document,
  args: ExtractedImageTransformParameters,
  resources: ResourceTransforms,
  textureUsages: Map<string, Set<string>>
): TextureOperation[] => {
  const operations: TextureOperation[] = []

  const root = document.getRoot()
  const textures = root.listTextures()

  // TODO: write the GLTF transform maintainers a bug about losing references to extension-provided textures, meshes and buffers
  const eeMaterialExtension: EEMaterialExtension | undefined = root
    .listExtensionsUsed()
    .find((ext) => ext.extensionName === 'EE_material') as EEMaterialExtension
  if (eeMaterialExtension) {
    for (let i = 0; i < eeMaterialExtension.textures.length; i++) {
      const texture = eeMaterialExtension.textures[i]
      const extensions = eeMaterialExtension.textureExtensions[i]
      for (const extension of extensions) {
        texture.setExtension(extension.extensionName, extension)
      }
    }

    textures.push(...eeMaterialExtension.textures)
  }

  if (args.textureFormat !== 'default') {
    for (const texture of textures) {
      console.log('considering texture ' + texture.getURI())
      if (texture.getMimeType() === 'image/ktx2') continue
      const oldSize = texture.getSize()
      if (!oldSize) continue
      const maxDimension = Math.max(...oldSize!)

      const usages = textureUsages.get(texture.getURI()) ?? new Set()

      let { maxTextureSize, textureCompressionType } = args
      if (usages.has('map') || usages.has('baseColor')) {
        console.log(
          'Heuristic: diffuse maps should have twice the texture size',
          texture.getURI(),
          [...usages].join(', ')
        )
        maxTextureSize *= 2
      }

      const shouldResize = maxDimension > maxTextureSize
      const shouldConvertToKTX = args.textureFormat === 'ktx2' // && texture.getMimeType() !== 'image/ktx2' // We are already skipping ktx2 textures. -JS

      if (shouldConvertToKTX) {
        ktx2Encoder ??= new KTX2Encoder()
        document.createExtension(KHRTextureBasisu).setRequired(true)

        if (usages.has('normal')) {
          textureCompressionType = 'uastc'
          console.log(
            'Heuristic: normal maps should be compressed with UASTC',
            texture.getURI(),
            [...usages].join(', ')
          )
        }
      }

      if (shouldResize || shouldConvertToKTX) {
        const resourceId = texture.getExtension<EEResourceID>(EEResourceIDExtension.EXTENSION_NAME)?.resourceId
        const resourceParms = resources.images.find(
          (resource) => resource.enabled && resource.resourceId === resourceId
        )
        const params = {
          ...args,
          ...(resourceParms ? extractParameters(resourceParms) : {}),
          maxTextureSize,
          textureCompressionType
        }

        operations.push({
          shouldResize,
          shouldConvertToKTX,
          texture,
          params
        })
      }
    }
  }

  return operations
}

const transformTexture = async (resultCache: Map<string, Texture>, operation: TextureOperation) => {
  const { shouldResize, shouldConvertToKTX, texture, params } = operation

  const hash = hashTextureOperation(operation)

  const prevResult = resultCache.get(hash)
  if (prevResult != null && prevResult !== texture) {
    const originalName = texture.getName()
    texture.copy(prevResult)
    texture.setName(originalName)
    return
  }
  if (shouldResize) {
    const oldImage = texture.getImage()!
    const originalName = texture.getName()
    const originalURI = texture.getURI()
    const [_, fileName, extension] = /(.*)\.([^.]+)$/.exec(originalURI) ?? []
    const quality = params.textureCompressionType === 'uastc' ? params.uastcLevel : params.compLevel
    const nuURI = `${fileName}-${params.maxTextureSize}x${quality}.${extension}`

    const imgDoc = new Document()
    const nuTexture = imgDoc.createTexture(texture.getName())
    nuTexture.setExtras(texture.getExtras())
    nuTexture.setImage(oldImage)
    nuTexture.setMimeType(texture.getMimeType())
    await imgDoc.transform(
      textureCompress({
        resize: [params.maxTextureSize, params.maxTextureSize]
      })
    )
    texture.copy(nuTexture)
    texture.setName(originalName)
    texture.setURI(nuURI)
  }

  if (shouldConvertToKTX) {
    const texturePixels = await getPixels(texture.getImage()!, texture.getMimeType())
    const clampedData = new Uint8ClampedArray(texturePixels.data as Uint8Array)
    const imgSize = texture.getSize() ?? texturePixels.shape.slice(0, 2)
    const imgData = new ImageData(clampedData, imgSize[0], imgSize[1])

    const compressedData = await ktx2Encoder!.encode(imgData, {
      uastc: params.textureCompressionType === 'uastc',
      qualityLevel: params.textureCompressionQuality,
      srgb: !params.linear,
      mipmaps: params.mipmap,
      yFlip: params.flipY
    })

    texture.setImage(new Uint8Array(compressedData))
    texture.setMimeType('image/ktx2')
    texture.setURI(texture.getURI().replace(/\.[^.]+$/, '.ktx2'))
  }
  resultCache.set(hash, texture)
}

const writeFiles = async (
  srcURL: string,
  document: Document,
  {
    modelFormat,
    resourceUri,
    dst
  }: {
    modelFormat: ModelFormat
    resourceUri: string
    dst: string
  }
): Promise<string> => {
  const srcBaseURL = LoaderUtils.extractUrlBase(srcURL)
  const root = document.getRoot()
  const io = await loaderIO

  const resourceName = baseName(srcURL).slice(0, baseName(srcURL).lastIndexOf('.'))
  const resourcePath = pathJoin(srcBaseURL, resourceUri || resourceName + '_resources')

  let finalPath = dst.replace(/\.[^.]*$/, `.${modelFormat}`)
  if (!finalPath.endsWith(`.${modelFormat}`)) {
    finalPath += `.${modelFormat}`
  }

  if (['glb', 'vrm'].includes(modelFormat)) {
    const data = await io.writeBinary(document)
    await doUpload(...toProjectAndFileName(finalPath, srcBaseURL), data)
  } else if (modelFormat === 'gltf') {
    await Promise.all(
      [root.listBuffers(), root.listMeshes(), root.listTextures()].map(
        async (elements) =>
          await Promise.all(
            elements.map(async (element: Texture | Mesh | glBuffer) => {
              let elementName = ''
              if (element instanceof Texture) {
                elementName = hashBuffer(element.getImage()!)
              } else if (element instanceof Mesh) {
                elementName = hashBuffer(
                  Uint8Array.from(element.listPrimitives()[0].getAttribute('POSITION')!.getArray()!)
                )
              } else if (element instanceof glBuffer) {
                const bufferPath = pathJoin(srcBaseURL, element.getURI())
                const response = await fetch(bufferPath)
                const arrayBuffer = await response.arrayBuffer()
                const bufferData = new Uint8Array(arrayBuffer)
                elementName = hashBuffer(bufferData)
              }
              element.setName(elementName)
            })
          )
      )
    )
    document.transform(
      partition({
        animations: true,
        meshes: root.listMeshes().map((mesh) => mesh.getName())
      })
    )
    const { json, resources } = await io.writeJSON(document, { format: Format.GLTF, basename: resourceName })
    const folderURL = resourcePath.replace(config.client.fileServer, '')

    const fileBrowserService = API.instance.service(fileBrowserPath)
    const folderExists = await fileBrowserService.get(folderURL)
    if (!folderExists) {
      await fileBrowserService.create(folderURL)
    }

    const removeExtension = (uri: string) => {
      const pathSegments = uri.split('/')
      const filename = pathSegments.pop()
      if (filename != null) {
        const nameSegments = filename.split('.')
        nameSegments.pop()
        pathSegments.push(nameSegments.join('.'))
      }
      return pathSegments.join('/')
    }

    json.images?.map((image) => {
      const nuURI = pathJoin(
        resourceUri.length > 0 ? resourceUri : resourceName + '_resources',
        `${
          (image.uri ?? '').length > 0 ? removeExtension(image.uri!).replaceAll(/^\.\//g, '') : image.name
        }.${mimeToFileType(image.mimeType)}`
      )
      resources[nuURI] = resources[image.uri!]
      delete resources[image.uri!]
      image.uri = nuURI
    })
    const defaultBufURI = uuidv4() + '.bin'
    json.buffers?.map((buffer) => {
      buffer.uri = pathJoin(
        resourceUri ? resourceUri : resourceName + '_resources',
        baseName(buffer.uri ?? defaultBufURI)
      )
    })
    Object.keys(resources).map((uri) => {
      const localPath = pathJoin(resourcePath, dropRoot(uri))
      resources[localPath] = resources[uri]
      delete resources[uri]
    })

    await Promise.all(
      Object.entries(resources).map(async ([uri, data]) => {
        const blob = new Blob([data as BlobPart], { type: fileTypeToMime(uri.split('.').pop()!)! })
        await doUpload(...toProjectAndFileName(uri, srcBaseURL), blob)
      })
    )
    await doUpload(
      ...toProjectAndFileName(finalPath, srcBaseURL),
      new Blob([JSON.stringify(json)], { type: 'application/json' })
    )
  }

  finalPath = pathJoin(srcBaseURL, finalPath)
  console.log(`Wrote ${modelFormat} file: ${finalPath}`)
  return finalPath
}

export const transformModel = async (
  srcURL: string,
  modelOperations: ModelTransformParameters[],
  onMetadata: (index: number, key: string, data: any) => void = (key, data) => {},
  onProgress?: (progress: number, status: Status, numerator?: number, denominator?: number) => void
): Promise<string[]> => {
  onProgress?.(0, Status.TransformingModels)

  const srcDocument = await (await loaderIO).read(srcURL)
  const documents: Document[] = []
  const textureOperations: TextureOperation[] = []
  const numDocOperations = modelOperations.length

  const textureUsages = new Map<string, Set<string>>()
  {
    const graph = srcDocument.getGraph()
    for (const mat of srcDocument.getRoot().listMaterials()) {
      for (const edge of graph.listChildEdges(mat)) {
        const texture = edge.getChild() as Texture
        if (texture?.propertyType !== 'Texture') {
          continue
        }

        const uri = texture.getURI()

        if (!textureUsages.has(uri)) {
          textureUsages.set(uri, new Set())
        }

        textureUsages.get(uri)!.add(edge.getName().replaceAll(/(Map|Texture)/g, ''))
      }

      eeMatScan: {
        const eeMat = mat.getExtension<EEMaterial>('EE_material')
        const args = eeMat?.args
        if (args == null) {
          break eeMatScan
        }

        for (const edge of graph.listChildEdges(args)) {
          const argEntry = edge.getChild() as EEArgEntry
          if (argEntry == null) {
            continue
          }
          const { type, contents } = argEntry[$attributes]
          if (type !== 'texture' || contents == null) {
            continue
          }

          const uri = contents.getURI()

          if (!textureUsages.has(uri)) {
            textureUsages.set(uri, new Set())
          }

          textureUsages.get(uri)!.add(edge.getName().replaceAll(/(Map|Texture)/g, ''))
        }
      }
    }
  }

  for (let i = 0; i < numDocOperations; i++) {
    const docOperation = modelOperations[i]

    const document = await toTransformedDocument(srcDocument, docOperation)
    documents.push(document)

    const operations = createTextureOperations(document, docOperation, docOperation.resources, textureUsages)
    const maxTextureSize = Math.max(...operations.map(({ texture }) => texture.getSize()?.[0] ?? 0))
    onMetadata(i, 'maxTextureSize', maxTextureSize)
    textureOperations.push(...operations)
  }

  const numTextureOperations = textureOperations.length
  const totalProgressSteps = 1 + numTextureOperations + numDocOperations

  const resultCache = new Map<string, Texture>()
  for (let i = 0; i < numTextureOperations; i++) {
    onProgress?.((i + 1) / totalProgressSteps, Status.ProcessingTexture, i, numTextureOperations)
    await transformTexture(resultCache, textureOperations[i])
  }

  const results: string[] = []

  for (const document of documents) {
    const eeMaterialExtension: EEMaterialExtension | undefined = document
      .getRoot()
      .listExtensionsUsed()
      .find((ext) => ext.extensionName === 'EE_material') as EEMaterialExtension
    if (eeMaterialExtension) {
      for (const texture of eeMaterialExtension.textures) {
        document.createTexture().copy(texture)
        // Find all materials that reference the old texture, and change their reference to the new texture
      }
      for (const material of document.getRoot().listMaterials()) {
        const eeMaterial = material.getExtension<EEMaterial>('EE_material')
        if (eeMaterial == null) continue
        const matArgs = eeMaterial.args!

        const newTextures = document.getRoot().listTextures()
        const materialArgsInfo = eeMaterialExtension.materialInfoMap.get(matArgs.getExtras().uuid as string)!
        materialArgsInfo.map((field) => {
          let argEntry: EEArgEntry
          try {
            argEntry = matArgs.getPropRef(field) as EEArgEntry
          } catch (e) {
            argEntry = matArgs.getProp(field) as EEArgEntry
          }

          if (argEntry.type === 'texture') {
            const oldTexture = argEntry.contents as Texture
            if (oldTexture != null) {
              const uuid: string = oldTexture.getExtras().uuid as string
              const newTexture = newTextures.find((texture) => texture.getExtras().uuid === uuid)
              if (newTexture == null) {
                throw new Error('Transformed texture is not listed.')
              }
              argEntry.contents = newTexture
            }
          }
        })
      }
    }
  }

  for (let i = 0; i < numDocOperations; i++) {
    onProgress?.((i + 1 + numTextureOperations) / totalProgressSteps, Status.WritingFiles)

    const document = documents[i]
    results.push(...(await writeFiles(srcURL, document, modelOperations[i])))

    const totalVertexCount = document
      .getRoot()
      .listMeshes()
      .flatMap((mesh) => mesh.listPrimitives())
      .map((prim) => prim.getIndices()?.getCount() ?? 0)
      .reduce((prev, curr) => prev + curr, 0)
    onMetadata(i, 'vertexCount', totalVertexCount)
  }

  onProgress?.(1, Status.Complete)

  return results
}
