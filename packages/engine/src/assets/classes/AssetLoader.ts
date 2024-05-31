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

import { AudioLoader, Material, RepeatWrapping, Texture, TextureLoader } from 'three'

import { getState } from '@etherealengine/hyperflux'
import { isAbsolutePath } from '@etherealengine/spatial/src/common/functions/isAbsolutePath'
import { iOS } from '@etherealengine/spatial/src/common/functions/isMobile'
import { EngineState } from '@etherealengine/spatial/src/EngineState'

import { AssetExt, AssetType } from '@etherealengine/common/src/constants/AssetType'
import loadVideoTexture from '../../scene/materials/functions/LoadVideoTexture'
import { FileLoader } from '../loaders/base/FileLoader'
import { DDSLoader } from '../loaders/dds/DDSLoader'
import { FBXLoader } from '../loaders/fbx/FBXLoader'
import { GLTF } from '../loaders/gltf/GLTFLoader'
import { TGALoader } from '../loaders/tga/TGALoader'
import { USDZLoader } from '../loaders/usdz/USDZLoader'
import { AssetLoaderState } from '../state/AssetLoaderState'

/**
 * Get asset type from the asset file extension.
 * @param assetFileName Name of the Asset file.
 * @returns Asset type of the file.
 */
const getAssetType = (assetFileName: string): AssetExt => {
  assetFileName = assetFileName.toLowerCase()
  const suffix = assetFileName.split('.').pop()
  switch (suffix) {
    case 'gltf':
      return AssetExt.glTF
    case 'glb':
      return AssetExt.glB
    case 'usdz':
      return AssetExt.USDZ
    case 'fbx':
      return AssetExt.FBX
    case 'vrm':
      return AssetExt.VRM
    case 'tga':
      return AssetExt.TGA
    case 'ktx2':
      return AssetExt.KTX2
    case 'ddx':
      return AssetExt.DDS
    case 'png':
      return AssetExt.PNG
    case 'jpg':
    case 'jpeg':
      return AssetExt.JPEG
    case 'mp3':
      return AssetExt.MP3
    case 'wav':
      return AssetExt.WAV
    case 'aac':
      return AssetExt.AAC
    case 'ogg':
      return AssetExt.OGG
    case 'm4a':
      return AssetExt.M4A
    case 'mp4':
      return AssetExt.MP4
    case 'mkv':
      return AssetExt.MKV
    case 'm3u8':
      return AssetExt.M3U8
    case 'material':
      return AssetExt.MAT
    case 'json':
      return AssetExt.JSON
    default:
      return null!
  }
}

/**
 * Get asset class from the asset file extension.
 * @param assetFileName Name of the Asset file.
 * @returns Asset class of the file.
 */
const getAssetClass = (assetFileName: string): AssetType => {
  assetFileName = assetFileName.toLowerCase()
  if (/\.(gltf|glb|vrm|fbx|obj|usdz)$/.test(assetFileName)) {
    if (/\.(material.gltf)$/.test(assetFileName)) {
      console.log('Material asset')
      return AssetType.Material
    } else if (/\.(lookdev.gltf)$/.test(assetFileName)) {
      console.log('Lookdev asset')
      return AssetType.Lookdev
    }
    if (/\.(prefab.gltf)$/.test(assetFileName)) {
      console.log('prefab asset')
      return AssetType.Prefab
    }
    return AssetType.Model
  } else if (/\.(png|jpg|jpeg|tga|ktx2|dds)$/.test(assetFileName)) {
    return AssetType.Image
  } else if (/\.(mp4|avi|webm|mkv|mov|m3u8|mpd)$/.test(assetFileName)) {
    return AssetType.Video
  } else if (/\.(mp3|ogg|m4a|flac|wav)$/.test(assetFileName)) {
    return AssetType.Audio
  } else if (/\.(drcs|uvol|manifest)$/.test(assetFileName)) {
    return AssetType.Volumetric
  } else {
    return AssetType.Unknown
  }
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
  load: (src, onLoad, onProgress, onError, signal?) => {
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

export const getLoader = (assetType: AssetExt) => {
  switch (assetType) {
    case AssetExt.KTX2:
      return ktx2Loader()
    case AssetExt.DDS:
      return ddsLoader()
    case AssetExt.glTF:
    case AssetExt.glB:
    case AssetExt.VRM:
      return getState(AssetLoaderState).gltfLoader
    case AssetExt.USDZ:
      return usdzLoader()
    case AssetExt.FBX:
      return fbxLoader()
    case AssetExt.TGA:
      return tgaLoader()
    case AssetExt.PNG:
    case AssetExt.JPEG:
      return textureLoader()
    case AssetExt.AAC:
    case AssetExt.MP3:
    case AssetExt.OGG:
    case AssetExt.M4A:
      return audioLoader()
    case AssetExt.MP4:
    case AssetExt.MKV:
    case AssetExt.M3U8:
      return videoLoader()
    default:
      return fileLoader()
  }
}

const assetLoadCallback = (url: string, assetType: AssetExt, onLoad: (response: any) => void) => async (asset) => {
  const assetClass = AssetLoader.getAssetClass(url)
  if (assetClass === AssetType.Model) {
    const notGLTF = [AssetExt.FBX, AssetExt.USDZ].includes(assetType)
    if (notGLTF) {
      asset = { scene: asset }
    } else if (assetType === AssetExt.VRM) {
      asset = asset.userData.vrm
    }

    if (asset.scene && !asset.scene.userData) asset.scene.userData = {}
    if (asset.scene.userData) asset.scene.userData.type = assetType
    if (asset.userData) asset.userData.type = assetType
    else asset.userData = { type: assetType }
  }
  if (assetClass === AssetType.Material) {
    const material = asset as Material
    material.userData.type = assetType
  }
  if ([AssetType.Image, AssetType.Video].includes(assetClass)) {
    const texture = asset as Texture
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
  }

  const gltf = asset as GLTF
  if (gltf.parser) delete asset.parser

  onLoad(asset)
}

const getAbsolutePath = (url) => (isAbsolutePath(url) ? url : getState(EngineState).publicPath + url)

const load = async (
  _url: string,
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

  const assetType = AssetLoader.getAssetType(url)
  const loader = getLoader(assetType)
  if (iOS && (assetType === AssetExt.PNG || assetType === AssetExt.JPEG)) {
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

  const callback = assetLoadCallback(url, assetType, onLoad)

  try {
    return loader.load(url, callback, onProgress, onError, signal)
  } catch (error) {
    onError(error)
  }
}

const loadAsync = async (url: string, onProgress = (request: ProgressEvent) => {}) => {
  return new Promise<any>((resolve, reject) => {
    load(url, resolve, onProgress, reject)
  })
}

export const AssetLoader = {
  loaders: new Map<number, any>(),
  getAbsolutePath,
  getAssetType,
  getAssetClass,
  /** @deprecated Use hooks from resourceHooks.ts instead **/
  load,
  /** @deprecated Use hooks from resourceHooks.ts instead **/
  loadAsync
}
