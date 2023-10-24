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

import { getContentType } from '@etherealengine/common/src/utils/getContentType'

import {
  ExtractedImageTransformParameters,
  extractParameters,
  ModelTransformParameters
} from '@etherealengine/engine/src/assets/classes/ModelTransform'
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
import { EXTMeshGPUInstancing } from '@gltf-transform/extensions'
import { dedup, draco, flatten, join, palette, partition, prune, reorder, weld } from '@gltf-transform/functions'
import { createHash } from 'crypto'
import { MeshoptEncoder } from 'meshoptimizer'
import { LoaderUtils, MathUtils } from 'three'

import { baseName, pathJoin } from '@etherealengine/common/src/utils/miscUtils'
import { fileBrowserPath } from '@etherealengine/engine/src/schemas/media/file-browser.schema'
import { Engine } from '../../ecs/classes/Engine'
import { EEMaterial } from './extensions/EE_MaterialTransformer'
import { EEResourceID } from './extensions/EE_ResourceIDTransformer'
import ModelTransformLoader from './ModelTransformLoader'

import config from '@etherealengine/common/src/config'

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

export async function transformModel(args: ModelTransformParameters) {
  const parms = args

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

  const resourceName = baseName(args.src).slice(0, baseName(args.src).lastIndexOf('.'))
  const resourcePath = pathJoin(LoaderUtils.extractUrlBase(args.src), args.resourceUri || resourceName + '_resources')

  const toValidFilename = (name: string) => {
    const result = name.replace(/[\s]/g, '-')
    return result
  }
  let pathIndex = 0
  const toPath = (element: Texture | glBuffer, index?: number) => {
    if (element instanceof Texture) {
      if (element.getURI()) {
        return baseName(element.getURI())
      } else {
        pathIndex++
        return `${toValidFilename(element.getName())}-${pathIndex}-.${mimeToFileType(element.getMimeType())}`
      }
    } else if (element instanceof glBuffer) {
      return `buffer-${index}-${Date.now()}.bin`
    } else throw new Error('invalid element to find path')
  }

  const fileUploadPath = (fUploadPath: string) => {
    const relativePath = fUploadPath.replace(config.client.fileServer, '')
    const pathCheck = /projects\/([^/]+)\/assets\/([\w\d\s\-_.]*)$/
    const [_, projectName, fileName] =
      pathCheck.exec(fUploadPath) ?? pathCheck.exec(pathJoin(LoaderUtils.extractUrlBase(args.src), fUploadPath))!
    return [projectName, fileName]
  }

  const { io } = await ModelTransformLoader()

  let initialSrc = args.src
  /* Meshopt Compression */
  /*
  if (args.meshoptCompression.enabled) {
    const segments = args.src.split('.')
    const ext = segments.pop()
    const base = segments.join('.')
    initialSrc = `${base}-meshopt.${ext}`
    let packArgs = `-i ${args.src} -o ${initialSrc} -noq `
    if (!args.meshoptCompression.options.mergeMaterials) {
      packArgs += `-km `
    }
    if (!args.meshoptCompression.options.mergeNodes) {
      packArgs += `-kn `
    }
    if (args.meshoptCompression.options.compression) {
      packArgs += `-cc `
    }
    execFileSync(
      GLTF_PACK,
      packArgs.split(/\s+/).filter((x) => !!x)
    )
  }
  */
  /* /Meshopt Compression */

  const document = await io.read(initialSrc)

  await MeshoptEncoder.ready

  const root = document.getRoot()

  /* ID unnamed resources */
  unInstanceSingletons(document)
  args.split && (await split(document))
  args.combineMaterials && (await combineMaterials(document))
  args.instance && (await myInstance(document))
  args.dedup && (await document.transform(dedup()))
  args.flatten && (await document.transform(flatten()))
  args.join.enabled && (await document.transform(join(args.join.options)))
  if (args.palette.enabled) {
    removeUVsOnUntexturedMeshes(document)
    await document.transform(palette(args.palette.options))
  }
  args.prune && (await document.transform(prune()))

  /* Separate Instanced Geometry */
  const instancedNodes = root
    .listNodes()
    .filter((node) => !!node.getMesh()?.getExtension('EXT_mesh_gpu_instancing'))
    .map((node) => [node, node.getParent()])
  instancedNodes.map(([node, parent]) => {
    node instanceof Node && parent?.removeChild(node)
  })

  /* PROCESS MESHES */
  if (args.weld.enabled) {
    await document.transform(weld({ tolerance: args.weld.tolerance }))
  }

  if (args.reorder) {
    await document.transform(
      reorder({
        encoder: MeshoptEncoder,
        target: 'performance'
      })
    )
  }

  /* Draco Compression */
  if (args.dracoCompression.enabled) {
    await document.transform(draco(args.dracoCompression.options))
  }
  /* /Draco Compression */

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
        ...args,
        ...(resourceParms ? extractParameters(resourceParms) : {})
      } as ExtractedImageTransformParameters

      const imgDoc = new Document()
      const imgRoot = imgDoc.getRoot()
      const nuTexture = imgDoc.createTexture(texture.getName())
      nuTexture.setImage(oldImg!)
      nuTexture.setMimeType(texture.getMimeType())

      /*

      Old command line processing for image resizing

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
        while (
          resizedDimension * 2 <=
          Math.min(mergedParms.maxTextureSize, Math.max(metadata.width, metadata.height))
        ) {
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
      }*/

      /*
      if (mergedParms.textureFormat === 'ktx2') {
        //KTX2 Basisu Compression
        document.createExtension(KHRTextureBasisu).setRequired(true)

        
        const basisArgs = `-ktx2 ${resizedPath} -q ${mergedParms.textureCompressionQuality} ${
          mergedParms.textureCompressionType === 'uastc' ? '-uastc' : ''
        } ${mergedParms.textureCompressionType === 'uastc' ? '-uastc_level ' + mergedParms.uastcLevel : ''} ${
          mergedParms.textureCompressionType === 'etc1' ? '-comp_level ' + mergedParms.compLevel : ''
        } ${
          mergedParms.textureCompressionType === 'etc1' && mergedParms.maxCodebooks
            ? '-max_endpoints 16128 -max_selectors 16128'
            : ''
        } ${mergedParms.linear ? '-linear' : ''} ${mergedParms.flipY ? '-y_flip' : ''} ${
          mergedParms.mipmap ? '-mipmap' : ''
        }`
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
      */
    }
  }
  let result
  if (parms.modelFormat === 'glb') {
    const data = Buffer.from(await io.writeBinary(document))
    const [projectName, fileName] = fileUploadPath(args.dst)
    /*
    const uploadArgs = {
      path: savePath,
      fileName,
      body: data,
      contentType: (await getContentType(args.dst)) || ''
    }
    result = await Engine.instance.api.service('file-browser').patch(null, uploadArgs)
    */
    /*dispatchAction(
      BufferHandlerExtension.saveBuffer({
        {
          name: fileName,
          byteLength: data.byteLength,
          
        }
      })
    )*/
    console.log('Handled glb file')
  } else if (parms.modelFormat === 'gltf') {
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
                const bufferPath = pathJoin(LoaderUtils.extractUrlBase(args.src), element.getURI())
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
    //await Engine.instance.api.service(fileBrowserPath).remove(folderURL)
    await Engine.instance.api.service(fileBrowserPath).create(folderURL)

    json.images?.map((image) => {
      const nuURI = pathJoin(
        args.resourceUri ? args.resourceUri : resourceName,
        `${image.name}.${mimeToFileType(image.mimeType)}`
      )
      resources[nuURI] = resources[image.uri!]
      delete resources[image.uri!]
      image.uri = nuURI
    })
    const defaultBufURI = MathUtils.generateUUID() + '.bin'
    json.buffers?.map((buffer) => {
      buffer.uri = pathJoin(args.resourceUri ? args.resourceUri : resourceName, baseName(buffer.uri ?? defaultBufURI))
    })
    Object.keys(resources).map((uri) => {
      const localPath = pathJoin(resourcePath, baseName(uri))
      resources[localPath] = resources[uri]
      delete resources[uri]
    })
    const doUpload = async (uri, data) => {
      const [savePath, fileName] = fileUploadPath(uri)
      const args = {
        path: savePath,
        fileName,
        body: data,
        contentType: (await getContentType(uri)) || ''
      }
      return Engine.instance.api.service(fileBrowserPath).patch(null, args)
    }
    await Promise.all(Object.entries(resources).map(([uri, data]) => doUpload(uri, data)))
    result = await doUpload(args.dst.replace(/\.glb$/, '.gltf'), Buffer.from(JSON.stringify(json)))
    console.log('Handled gltf file')
  }
  return result
}
