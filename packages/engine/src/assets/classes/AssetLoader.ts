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

import { AudioLoader, TextureLoader } from 'three'

import { getState } from '@etherealengine/hyperflux'
import { isAbsolutePath } from '@etherealengine/spatial/src/common/functions/isAbsolutePath'
import { iOS } from '@etherealengine/spatial/src/common/functions/isMobile'
import { EngineState } from '@etherealengine/spatial/src/EngineState'

import { AssetExt, AssetType, FileExtToAssetExt, FileToAssetType } from '@etherealengine/common/src/constants/AssetType'
import loadVideoTexture from '../../scene/materials/functions/LoadVideoTexture'
import { FileLoader } from '../loaders/base/FileLoader'
import { DDSLoader } from '../loaders/dds/DDSLoader'
import { FBXLoader } from '../loaders/fbx/FBXLoader'
import { TGALoader } from '../loaders/tga/TGALoader'
import { USDZLoader } from '../loaders/usdz/USDZLoader'
import { AssetLoaderState } from '../state/AssetLoaderState'

/**
 * Get asset type from the asset file extension.
 * @param assetFileName Name of the Asset file.
 * @returns Asset type of the file.
 */
const getAssetType = (assetFileName: string): AssetExt => {
  const ext = assetFileName.split('.').pop()
  if (!ext) return undefined!
  return FileExtToAssetExt(ext)!
}

/**
 * Get asset class from the asset file extension.
 * @param assetFileName Name of the Asset file.
 * @returns Asset class of the file.
 */
const getAssetClass = (assetFileName: string): AssetType => {
  return FileToAssetType(assetFileName)
}

const setupTextureForIOS = async (src: string): Promise<string> => {
  return new Promise(async (resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous' //browser will yell without this
    img.src = src
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
    resolve(dataURI)
  })
}

const ddsLoader = () => new DDSLoader()
const fbxLoader = () => new FBXLoader()
const textureLoader = () => ({
  load: async (src, onLoad, onProgress, onError, signal?) => {
    if (iOS) {
      src = await setupTextureForIOS(src)
    }
    const loader = new TextureLoader()
    loader.load(src, onLoad, onProgress, onError)
  }
})
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
    case AssetExt.GLTF:
    case AssetExt.GLB:
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

const getAbsolutePath = (url) => (isAbsolutePath(url) ? url : getState(EngineState).publicPath + url)

const loadAsset = async <T>(
  url: string,
  onLoad: (response: T) => void = () => {},
  onProgress: (request: ProgressEvent) => void = () => {},
  onError: (event: ErrorEvent | Error) => void = () => {},
  signal?: AbortSignal
) => {
  if (!url) {
    onError(new Error('URL is empty'))
    return
  }
  url = getAbsolutePath(url)
  const assetExt = AssetLoader.getAssetType(url)
  const loader = getLoader(assetExt)

  try {
    return loader.load(url, onLoad, onProgress, onError, signal)
  } catch (error) {
    onError(error)
  }
}

export const AssetLoader = {
  getAbsolutePath,
  getAssetType,
  getAssetClass,
  /** @deprecated Use resourceLoaderHooks instead */
  loadAsset
}
