import { Application } from '@feathersjs/express/lib'
import {
  Accessor,
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
import { MeshGPUInstancing, TextureBasisu } from '@gltf-transform/extensions'
import { dedup, draco, partition, prune, reorder, weld } from '@gltf-transform/functions'
import appRootPath from 'app-root-path'
import { execFileSync } from 'child_process'
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

const createBatch = (doc, batchExtension, mesh, count) => {
  return mesh.listPrimitives().map((prim) => {
    const buffer = prim.getAttribute('POSITION').getBuffer()

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
    const nodeParent = node.getParent() as Node
    if (nodeParent instanceof Node) {
      nodes.push(nodeParent)
    }
    node.dispose()
    unusedNodes++
    console.log(`Pruned ${unusedNodes} nodes.`)
  }
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
    mesh.listPrimitives().map((prim, primIdx) => {
      if (primIdx > 0) {
        if (!primMeshes.has(prim)) {
          primMeshes.set(prim, document.createMesh(mesh.getName() + '-' + primIdx).addPrimitive(prim))
        } else {
          console.log('found cached prim')
        }
        const nuNode = document.createNode(node.getName() + '-' + primIdx).setMesh(primMeshes.get(prim))
        node.getParent()?.addChild(nuNode)
        nuNode.setMatrix(node.getMatrix())
      }
    })
  })
  toSplit.map((node) => {
    const mesh = node.getMesh()!
    mesh.listPrimitives().map((prim, primIdx) => {
      if (primIdx > 0) {
        mesh.removePrimitive(prim)
      }
    })
  })
}
/**
 *
 * @param {Document} document
 * @param {*} args
 */
const myInstance = async (document: Document, args: any | null = null) => {
  const root = document.getRoot()
  const scene = root.listScenes()[0]
  const batchExtension = document.createExtension(MeshGPUInstancing)
  const meshes = root.listMeshes()
  console.log('meshes:', meshes)
  const nodes = root.listNodes().filter((node) => node.getMesh())
  const table = nodes.reduce((_table, node) => {
    const mesh = node.getMesh()
    const idx = meshes.findIndex((mesh2) => mesh?.equals(mesh2))
    _table[idx] = _table[idx] ?? []
    _table[idx].push(node)
    return _table
  }, {} as Record<number, any[]>)
  console.log('table:', table)
  const modifiedNodes = new Set<Node>()
  Object.entries(table)
    .filter(([_, _nodes]) => _nodes.length > 1)
    .map(([meshIdx, _nodes]) => {
      const mesh = meshes[meshIdx]
      console.log('mesh:', mesh, 'nodes:', nodes)
      const batches = createBatch(document, batchExtension, mesh, _nodes.length)
      batches.map((batch) => {
        const batchTranslate = batch.getAttribute('TRANSLATION')
        const batchRotate = batch.getAttribute('ROTATION')
        const batchScale = batch.getAttribute('SCALE')
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
    const result = name.replace(/[\s]/, '-')
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
  unInstanceSingletons(document)
  await split(document)
  await combineMaterials(document)
  await myInstance(document)

  if (args.parms.dedup) {
    await document.transform(dedup())
  }

  if (args.parms.prune) {
    await document.transform(prune())
  }

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
        await img
          .resize(
            Math.min(mergedParms.maxTextureSize, metadata.width),
            Math.min(mergedParms.maxTextureSize, metadata.height),
            {
              fit: 'contain'
            }
          )
          .toFormat(resizeExtension)
          .toFile(resizedPath.replace(/\.[\w\d]+$/, `.${resizeExtension}`))
        console.log('handled image file ' + oldPath)
      } catch (e) {
        console.error('error while handling image ' + oldPath)
        console.error(e)
      }

      if (mergedParms.textureFormat === 'ktx2') {
        //KTX2 Basisu Compression
        document.createExtension(TextureBasisu).setRequired(true)
        execFileSync(
          BASIS_U,
          `-ktx2 ${resizedPath} -q ${mergedParms.textureCompressionQuality} ${
            mergedParms.textureCompressionType === 'uastc' ? '-uastc' : ''
          } -linear -y_flip`.split(/\s+/)
        )
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
      ;[root.listBuffers(), root.listMeshes(), root.listTextures()].forEach((elements) =>
        elements.map((mesh: Texture | Mesh | glBuffer) => !mesh.getName() && mesh.setName(MathUtils.generateUUID()))
      )
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
  if (fs.existsSync(tmpDir)) await execFileSync('rm', ['-R', tmpDir])
  return result
}
