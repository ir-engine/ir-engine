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

import {
  AnimationClip,
  AudioLoader,
  BufferAttribute,
  BufferGeometry,
  Group,
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
  Texture,
  TextureLoader
} from 'three'

import { FileLoader } from '../loaders/base/FileLoader'

import { getState } from '@etherealengine/hyperflux'

import { isClient } from '@etherealengine/common/src/utils/getEnvironment'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { isAbsolutePath } from '@etherealengine/spatial/src/common/functions/isAbsolutePath'
import { iOS } from '@etherealengine/spatial/src/common/functions/isMobile'
import iterateObject3D from '@etherealengine/spatial/src/common/functions/iterateObject3D'
import { SourceType } from '../../scene/materials/components/MaterialSource'
import loadVideoTexture from '../../scene/materials/functions/LoadVideoTexture'
import { DEFAULT_LOD_DISTANCES, LODS_REGEXP } from '../constants/LoaderConstants'
import { AssetClass } from '../enum/AssetClass'
import { AssetType } from '../enum/AssetType'
import { DDSLoader } from '../loaders/dds/DDSLoader'
import { FBXLoader } from '../loaders/fbx/FBXLoader'
import { GLTF } from '../loaders/gltf/GLTFLoader'
import { registerMaterials } from '../loaders/gltf/extensions/RegisterMaterialsExtension'
import { TGALoader } from '../loaders/tga/TGALoader'
import { USDZLoader } from '../loaders/usdz/USDZLoader'
import { AssetLoaderState } from '../state/AssetLoaderState'

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

export function disposeDracoLoaderWorkers(): void {
  getState(AssetLoaderState).gltfLoader!.dracoLoader?.dispose()
}

const onUploadDropBuffer = () =>
  function (this: BufferAttribute) {
    // @ts-ignore
    this.array = new this.array.constructor(1)
  }

export const cleanupAllMeshData = (child: Mesh, args: LoadingArgs) => {
  if (getState(EngineState).isEditor || !child.isMesh) return
  const geo = child.geometry as BufferGeometry
  const mat = child.material as MeshStandardMaterial & MeshBasicMaterial & MeshMatcapMaterial & ShaderMaterial
  const attributes = geo.attributes
  if (!args.ignoreDisposeGeometry) {
    for (const name in attributes) (attributes[name] as BufferAttribute).onUploadCallback = onUploadDropBuffer()
    if (geo.index) geo.index.onUploadCallback = onUploadDropBuffer()
  }
}

const processModelAsset = (asset: Mesh, args: LoadingArgs): void => {
  const replacedMaterials = new Map()
  const loddables = new Array<Object3D>()

  iterateObject3D(asset, (child: Mesh<any, Material>) => {
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
  const LODState = DEFAULT_LOD_DISTANCES
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
      lod.addLevel(object, LODState[level])
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
  const suffix = assetFileName.split('.').pop()
  switch (suffix) {
    case 'gltf':
      return AssetType.glTF
    case 'glb':
      return AssetType.glB
    case 'usdz':
      return AssetType.USDZ
    case 'fbx':
      return AssetType.FBX
    case 'vrm':
      return AssetType.VRM
    case 'tga':
      return AssetType.TGA
    case 'ktx2':
      return AssetType.KTX2
    case 'ddx':
      return AssetType.DDS
    case 'png':
      return AssetType.PNG
    case 'jpg':
    case 'jpeg':
      return AssetType.JPEG
    case 'mp3':
      return AssetType.MP3
    case 'aac':
      return AssetType.AAC
    case 'ogg':
      return AssetType.OGG
    case 'm4a':
      return AssetType.M4A
    case 'mp4':
      return AssetType.MP4
    case 'mkv':
      return AssetType.MKV
    case 'm3u8':
      return AssetType.M3U8
    case 'material':
      return AssetType.MAT
    default:
      return null!
  }
}

/**
 * Get asset class from the asset file extension.
 * @param assetFileName Name of the Asset file.
 * @returns Asset class of the file.
 */
const getAssetClass = (assetFileName: string): AssetClass => {
  assetFileName = assetFileName.toLowerCase()
  if (/\.(gltf|glb|vrm|fbx|obj|usdz)$/.test(assetFileName)) {
    if (/\.(material.gltf)$/.test(assetFileName)) {
      console.log('Material asset')
      return AssetClass.Material
    }
    return AssetClass.Model
  } else if (/\.(png|jpg|jpeg|tga|ktx2|dds)$/.test(assetFileName)) {
    return AssetClass.Image
  } else if (/\.(mp4|avi|webm|mkv|mov|m3u8|mpd)$/.test(assetFileName)) {
    return AssetClass.Video
  } else if (/\.(mp3|ogg|m4a|flac|wav)$/.test(assetFileName)) {
    return AssetClass.Audio
  } else if (/\.(drcs|uvol|manifest)$/.test(assetFileName)) {
    return AssetClass.Volumetric
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
const ddsLoader = () => new DDSLoader()
const fbxLoader = () => new FBXLoader()
const textureLoader = () => new TextureLoader()
const fileLoader = () => new FileLoader()
const audioLoader = () => new AudioLoader()
const tgaLoader = () => new TGALoader()
const videoLoader = () => ({ load: loadVideoTexture })
const ktx2Loader = () => ({
  load: (src, onLoad, onProgress, onError) => {
    const gltfLoader = getState(AssetLoaderState).gltfLoader
    gltfLoader.ktx2Loader!.load(
      src,
      (texture) => {
        // console.log('KTX2Loader loaded texture', texture)
        texture.source.data.src = src
        onLoad(texture)
      },
      onProgress,
      onError
    )
  }
})
const usdzLoader = () => new USDZLoader()

export const getLoader = (assetType: AssetType) => {
  switch (assetType) {
    case AssetType.KTX2:
      return ktx2Loader()
    case AssetType.DDS:
      return ddsLoader()
    case AssetType.glTF:
    case AssetType.glB:
    case AssetType.VRM:
      return getState(AssetLoaderState).gltfLoader
    case AssetType.USDZ:
      return usdzLoader()
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
    case AssetType.M3U8:
      return videoLoader()
    default:
      return fileLoader()
  }
}

const assetLoadCallback =
  (url: string, args: LoadingArgs, assetType: AssetType, onLoad: (response: any) => void) => async (asset) => {
    const assetClass = AssetLoader.getAssetClass(url)
    if (assetClass === AssetClass.Model) {
      const notGLTF = [AssetType.FBX, AssetType.USDZ].includes(assetType)
      if (notGLTF) {
        asset = { scene: asset }
      } else if (assetType === AssetType.VRM) {
        asset = asset.userData.vrm
        asset.userData = { flipped: true }
      }

      if (asset.scene && !asset.scene.userData) asset.scene.userData = {}
      if (asset.scene.userData) asset.scene.userData.type = assetType
      if (asset.userData) asset.userData.type = assetType
      else asset.userData = { type: assetType }

      AssetLoader.processModelAsset(asset.scene, args)
      if (notGLTF) {
        registerMaterials(asset.scene, SourceType.MODEL, url)
      }
    }
    if (assetClass === AssetClass.Material) {
      const material = asset as Material
      material.userData.type = assetType
    }
    if ([AssetClass.Image, AssetClass.Video].includes(assetClass)) {
      const texture = asset as Texture
      texture.wrapS = RepeatWrapping
      texture.wrapT = RepeatWrapping
    }

    const gltf = asset as GLTF
    if (gltf.parser) delete asset.parser

    onLoad(asset)
  }

const getAbsolutePath = (url) => (isAbsolutePath(url) ? url : getState(EngineState).publicPath + url)

export type LoadingArgs = {
  ignoreDisposeGeometry?: boolean
  forceAssetType?: AssetType
  assetRoot?: Entity
}

const load = async (
  _url: string,
  args: LoadingArgs,
  onLoad = (response: any) => {},
  onProgress = (request: ProgressEvent) => {},
  onError = (event: ErrorEvent | Error) => {},
  signal?: AbortSignal
) => {
  if (!_url) {
    onError(new Error('URL is empty'))
    return
  }
  let url = getAbsolutePath(_url)

  const assetType = args.forceAssetType ? args.forceAssetType : AssetLoader.getAssetType(url)
  const loader = getLoader(assetType)
  if (iOS && (assetType === AssetType.PNG || assetType === AssetType.JPEG)) {
    const img = new Image()
    img.crossOrigin = 'anonymous' //browser will yell without this
    img.src = url
    await img.decode() //new way to wait for image to load
    // Initialize the canvas and it's size
    const canvas = document.createElement('canvas') //dead dom elements? Remove after Three loads them
    const ctx = canvas.getContext('2d')

    // Set width and height
    const originalWidth = img.width
    const originalHeight = img.height

    let resizingFactor = 1
    if (originalWidth >= originalHeight) {
      if (originalWidth > 1024) {
        resizingFactor = 1024 / originalWidth
      }
    } else {
      if (originalHeight > 1024) {
        resizingFactor = 1024 / originalHeight
      }
    }

    const canvasWidth = originalWidth * resizingFactor
    const canvasHeight = originalHeight * resizingFactor

    canvas.width = canvasWidth
    canvas.height = canvasHeight

    // Draw image and export to a data-uri
    ctx?.drawImage(img, 0, 0, canvasWidth, canvasHeight)
    const dataURI = canvas.toDataURL()

    // Do something with the result, like overwrite original
    url = dataURI
  }

  const callback = assetLoadCallback(url, args, assetType, onLoad)

  try {
    return loader.load(url, callback, onProgress, onError, signal)
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
