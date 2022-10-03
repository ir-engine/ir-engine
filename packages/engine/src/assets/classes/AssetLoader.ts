import {
  AnimationClip,
  AudioLoader,
  BufferAttribute,
  BufferGeometry,
  FileLoader,
  Group,
  Loader,
  LoaderUtils,
  LOD,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshMatcapMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  RepeatWrapping,
  ShaderMaterial,
  SkinnedMesh,
  Texture,
  TextureLoader
} from 'three'

import { isAbsolutePath } from '../../common/functions/isAbsolutePath'
import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { EntityTreeNode } from '../../ecs/functions/EntityTree'
import { matchActionOnce } from '../../networking/functions/matchActionOnce'
import loadVideoTexture from '../../renderer/materials/functions/LoadVideoTexture'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { generateMeshBVH } from '../../scene/functions/bvhWorkerPool'
import { LODS_REGEXP } from '../constants/LoaderConstants'
import { AssetClass } from '../enum/AssetClass'
import { AssetType } from '../enum/AssetType'
import { createGLTFLoader } from '../functions/createGLTFLoader'
import { FBXLoader } from '../loaders/fbx/FBXLoader'
import type { GLTF, GLTFLoader } from '../loaders/gltf/GLTFLoader'
import { KTX2Loader } from '../loaders/gltf/KTX2Loader'
import { TGALoader } from '../loaders/tga/TGALoader'
import { DependencyTreeActions } from './DependencyTree'
import { XRELoader } from './XRELoader'

// import { instanceGLTF } from '../functions/transformGLTF'

/**
 * Interface for result of the GLTF Asset load.
 */
export interface LoadGLTFResultInterface {
  animations: AnimationClip[]
  scene: Object3D | Group | Mesh
  json: any
  stats: any
}

// TODO: refactor global scope
const gltfLoader = createGLTFLoader()
export function getGLTFLoader(): GLTFLoader {
  return gltfLoader
}

export function disposeDracoLoaderWorkers(): void {
  gltfLoader.dracoLoader?.dispose()
}

export const loadExtensions = async (gltf: GLTF) => {
  if (isClient) {
    const bvhTraverse: Promise<void>[] = []
    gltf.scene.traverse((mesh) => {
      ;(mesh as Mesh).isMesh && bvhTraverse.push(generateMeshBVH(mesh as Mesh))
    })
    await Promise.all(bvhTraverse)
  }
}

const onUploadDropBuffer = (uuid?: string) =>
  function (this: BufferAttribute) {
    const dropBuffer = () => {
      // @ts-ignore
      this.array = new this.array.constructor(1)
    }
    if (uuid)
      matchActionOnce(
        DependencyTreeActions.dependencyFulfilled.matches.validate((action) => action.uuid === uuid, ''),
        dropBuffer
      )
    else dropBuffer()
  }

const onTextureUploadDropSource = (uuid?: string) =>
  function (this: Texture) {
    const dropTexture = () => {
      this.source.data = null
      this.mipmaps.map((b) => delete b.data)
      this.mipmaps = []
    }
    if (uuid)
      matchActionOnce(
        DependencyTreeActions.dependencyFulfilled.matches.validate((action) => action.uuid === uuid, ''),
        dropTexture
      )
    else dropTexture()
  }

export const cleanupAllMeshData = (child: Mesh, args: LoadingArgs) => {
  if (Engine.instance.isEditor || !child.isMesh) return
  const geo = child.geometry as BufferGeometry
  const mat = child.material as MeshStandardMaterial & MeshBasicMaterial & MeshMatcapMaterial & ShaderMaterial
  const attributes = geo.attributes
  if (!args.ignoreDisposeGeometry) {
    for (var name in attributes) (attributes[name] as BufferAttribute).onUploadCallback = onUploadDropBuffer(args.uuid)
    if (geo.index) geo.index.onUploadCallback = onUploadDropBuffer(args.uuid)
  }
  Object.entries(mat)
    .filter(([k, v]: [keyof typeof mat, Texture]) => v?.isTexture)
    .map(([_, v]) => (v.onUpdate = onTextureUploadDropSource(args.uuid)))
}

const processModelAsset = (asset: Mesh, args: LoadingArgs): void => {
  const replacedMaterials = new Map()
  const loddables = new Array<Object3D>()

  asset.traverse((child: Mesh<any, Material>) => {
    //test for LODs within this traversal
    if (haveAnyLODs(child)) loddables.push(child)

    if (!child.isMesh) return

    if (replacedMaterials.has(child.material)) {
      child.material = replacedMaterials.get(child.material)
    } else {
      if (child.material?.userData?.gltfExtensions?.KHR_materials_clearcoat) {
        const newMaterial = new MeshPhysicalMaterial({})
        newMaterial.setValues(child.material as any) // to copy properties of original material
        newMaterial.clearcoat = child.material.userData.gltfExtensions.KHR_materials_clearcoat.clearcoatFactor
        newMaterial.clearcoatRoughness =
          child.material.userData.gltfExtensions.KHR_materials_clearcoat.clearcoatRoughnessFactor
        newMaterial.defines = { STANDARD: '', PHYSICAL: '' } // override if it's replaced by non PHYSICAL defines of child.material

        replacedMaterials.set(child.material, newMaterial)
        child.material = newMaterial
      }
    }
    cleanupAllMeshData(child, args)
  })
  replacedMaterials.clear()

  for (const loddable of loddables) handleLODs(loddable)
}

const haveAnyLODs = (asset) => !!asset.children?.find((c) => String(c.name).match(LODS_REGEXP))

/**
 * Handles Level of Detail for asset.
 * @param asset Asset on which LOD will apply.
 * @returns LOD handled asset.
 */
const handleLODs = (asset: Object3D): Object3D => {
  const LODs = new Map<string, { object: Object3D; level: string }[]>()
  asset.children.forEach((child) => {
    const childMatch = child.name.match(LODS_REGEXP)
    if (!childMatch) {
      return
    }
    const [_, name, level]: string[] = childMatch
    if (!name || !level) {
      return
    }

    if (!LODs.has(name)) {
      LODs.set(name, [])
    }

    LODs.get(name)?.push({ object: child, level })
  })

  LODs.forEach((value, key) => {
    const lod = new LOD()
    lod.name = key
    value[0].object.parent?.add(lod)

    value.forEach(({ level, object }) => {
      lod.addLevel(object, Engine.instance.currentWorld.LOD_DISTANCES[level])
    })
  })

  return asset
}

/**
 * Get asset type from the asset file extension.
 * @param assetFileName Name of the Asset file.
 * @returns Asset type of the file.
 */
const getAssetType = (assetFileName: string): AssetType => {
  assetFileName = assetFileName.toLowerCase()

  if (/\.xre\.gltf$/.test(assetFileName)) return AssetType.XRE
  else if (/\.(?:gltf)$/.test(assetFileName)) return AssetType.glTF
  else if (/\.(?:glb)$/.test(assetFileName)) return AssetType.glB
  else if (/\.(?:fbx)$/.test(assetFileName)) return AssetType.FBX
  else if (/\.(?:vrm)$/.test(assetFileName)) return AssetType.VRM
  else if (/\.(?:tga)$/.test(assetFileName)) return AssetType.TGA
  else if (/\.(?:ktx2)$/.test(assetFileName)) return AssetType.KTX2
  else if (/\.(?:png)$/.test(assetFileName)) return AssetType.PNG
  else if (/\.(?:jpg|jpeg|)$/.test(assetFileName)) return AssetType.JPEG
  else if (/\.(?:mp3)$/.test(assetFileName)) return AssetType.MP3
  else if (/\.(?:aac)$/.test(assetFileName)) return AssetType.AAC
  else if (/\.(?:ogg)$/.test(assetFileName)) return AssetType.OGG
  else if (/\.(?:m4a)$/.test(assetFileName)) return AssetType.M4A
  else if (/\.(?:mp4)$/.test(assetFileName)) return AssetType.MP4
  else if (/\.(?:mkv)$/.test(assetFileName)) return AssetType.MKV
  return null!
}

/**
 * Get asset class from the asset file extension.
 * @param assetFileName Name of the Asset file.
 * @returns Asset class of the file.
 */
const getAssetClass = (assetFileName: string): AssetClass => {
  assetFileName = assetFileName.toLowerCase()

  if (/\.xre\.gltf$/.test(assetFileName)) {
    return AssetClass.Asset
  } else if (/\.(?:gltf|glb|vrm|fbx|obj)$/.test(assetFileName)) {
    return AssetClass.Model
  } else if (/\.png|jpg|jpeg|tga|ktx2$/.test(assetFileName)) {
    return AssetClass.Image
  } else if (/\.mp4|avi|webm|mov$/.test(assetFileName)) {
    return AssetClass.Video
  } else if (/\.mp3|ogg|m4a|flac|wav$/.test(assetFileName)) {
    return AssetClass.Audio
  } else {
    return AssetClass.Unknown
  }
}

/**
 * Returns true if the given file type is supported
 * Note: images are not supported on node
 * @param assetFileName
 * @returns
 */
const isSupported = (assetFileName: string) => {
  const assetClass = getAssetClass(assetFileName)
  if (isClient) return !!assetClass
  return assetClass === AssetClass.Model || assetClass === AssetClass.Asset
}

//@ts-ignore
const fbxLoader = () => new FBXLoader()
const textureLoader = () => new TextureLoader()
const fileLoader = () => new FileLoader()
const audioLoader = () => new AudioLoader()
const tgaLoader = () => new TGALoader()
const xreLoader = () => new XRELoader(fileLoader())
const videoLoader = () => ({ load: loadVideoTexture })
const ktx2Loader = () => ({
  load: (src, onLoad) => {
    const ktxLoader = gltfLoader.ktx2Loader
    if (!ktxLoader) throw new Error('KTX2Loader not yet initialized')
    ktxLoader.load(
      src,
      (texture) => {
        console.log('KTX2Loader loaded texture', texture)
        texture.source.data.src = src
        onLoad(texture)
      },
      () => {},
      () => {}
    )
  }
})
export const getLoader = (assetType: AssetType) => {
  switch (assetType) {
    case AssetType.XRE:
      return xreLoader()
    case AssetType.KTX2:
      return ktx2Loader()
    case AssetType.glTF:
    case AssetType.glB:
    case AssetType.VRM:
      return gltfLoader
    case AssetType.FBX:
      return fbxLoader()
    case AssetType.TGA:
      return tgaLoader()
    case AssetType.PNG:
    case AssetType.JPEG:
      return textureLoader()
    case AssetType.AAC:
    case AssetType.MP3:
    case AssetType.OGG:
    case AssetType.M4A:
      return audioLoader()
    case AssetType.MP4:
    case AssetType.MKV:
      return videoLoader()
    default:
      return fileLoader()
  }
}

const assetLoadCallback =
  (url: string, args: LoadingArgs, assetType: AssetType, onLoad: (response: any) => void) => async (asset) => {
    const assetClass = AssetLoader.getAssetClass(url)
    if (assetClass === AssetClass.Model) {
      if (assetType === AssetType.FBX) {
        asset = { scene: asset }
      } else if (assetType === AssetType.VRM) {
        asset = asset.userData.vrm
      }

      if (asset.scene && !asset.scene.userData) asset.scene.userData = {}
      if (asset.scene.userData) asset.scene.userData.type = assetType
      if (asset.userData) asset.userData.type = assetType

      AssetLoader.processModelAsset(asset.scene, args)
    }
    if ([AssetClass.Image, AssetClass.Video].includes(assetClass)) {
      const texture = asset as Texture
      texture.wrapS = RepeatWrapping
      texture.wrapT = RepeatWrapping
    }

    onLoad(asset)
  }

const getAbsolutePath = (url) => (isAbsolutePath(url) ? url : Engine.instance.publicPath + url)

type LoadingArgs = {
  ignoreDisposeGeometry?: boolean
  uuid?: string
  assetRoot?: EntityTreeNode
}

const load = (
  _url: string,
  args: LoadingArgs,
  onLoad = (response: any) => {},
  onProgress = (request: ProgressEvent) => {},
  onError = (event: ErrorEvent | Error) => {}
) => {
  if (!_url) {
    onError(new Error('URL is empty'))
    return
  }
  const url = getAbsolutePath(_url)

  const assetType = AssetLoader.getAssetType(url)
  const loader = getLoader(assetType)
  if (args.assetRoot && (loader as XRELoader).isXRELoader) {
    ;(loader as XRELoader).rootNode = args.assetRoot
  }
  const callback = assetLoadCallback(url, args, assetType, onLoad)

  try {
    // TODO: fix instancing for GLTFs - move this to the gltf loader
    // if (instanced) {
    //   ;(loader as GLTFLoader).parse(await instanceGLTF(url), null!, callback, onError)
    // } else {
    return loader.load(url, callback, onProgress, onError)
    // }
  } catch (error) {
    onError(error)
  }
}

const loadAsync = async (url: string, args: LoadingArgs = {}, onProgress = (request: ProgressEvent) => {}) => {
  return new Promise<any>((resolve, reject) => {
    load(url, args, resolve, onProgress, reject)
  })
}

export const AssetLoader = {
  loaders: new Map<number, any>(),
  processModelAsset,
  handleLODs,
  getAbsolutePath,
  getAssetType,
  getAssetClass,
  isSupported,
  getLoader,
  assetLoadCallback,
  load,
  loadAsync
}
