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

import { AudioLoader } from 'three'

import { getState } from '@ir-engine/hyperflux'

import { AssetExt, AssetType, FileToAssetExt, FileToAssetType } from '@ir-engine/engine/src/assets/constants/AssetType'
import loadVideoTexture from '../../scene/materials/functions/LoadVideoTexture'
import { FileLoader } from '../loaders/base/FileLoader'
import { Loader } from '../loaders/base/Loader'
import { DDSLoader } from '../loaders/dds/DDSLoader'
import { FBXLoader } from '../loaders/fbx/FBXLoader'
import { TextureLoader } from '../loaders/texture/TextureLoader'
import { TGALoader } from '../loaders/tga/TGALoader'
import { USDZLoader } from '../loaders/usdz/USDZLoader'
import { AssetLoaderState } from '../state/AssetLoaderState'
import { DomainConfigState } from '../state/DomainConfigState'

/**
 * Get asset type from the asset file extension.
 * @param assetFileName Name of the Asset file.
 * @returns Asset type of the file.
 */
const getAssetType = (assetFileName: string): AssetExt => {
  return FileToAssetExt(assetFileName)!
}

/**
 * Get asset class from the asset file extension.
 * @param assetFileName Name of the Asset file.
 * @returns Asset class of the file.
 */
const getAssetClass = (assetFileName: string): AssetType => {
  return FileToAssetType(assetFileName)
}

export const getLoader = (assetType: AssetExt) => {
  switch (assetType) {
    case AssetExt.KTX2:
      return getState(AssetLoaderState).gltfLoader.ktx2Loader!
    case AssetExt.DDS:
      return new DDSLoader()
    case AssetExt.GLTF:
    case AssetExt.GLB:
    case AssetExt.VRM:
      return getState(AssetLoaderState).gltfLoader
    case AssetExt.USDZ:
      return new USDZLoader()
    case AssetExt.FBX:
      return new FBXLoader()
    case AssetExt.TGA:
      return new TGALoader()
    case AssetExt.PNG:
    case AssetExt.JPEG:
      return new TextureLoader()
    case AssetExt.AAC:
    case AssetExt.MP3:
    case AssetExt.OGG:
    case AssetExt.M4A:
      return new AudioLoader()
    case AssetExt.MP4:
    case AssetExt.MKV:
    case AssetExt.M3U8:
      return { load: loadVideoTexture }
    default:
      return new FileLoader()
  }
}
export type AssetLoader = ReturnType<typeof getLoader> | Loader
/**
 * Matches absolute URLs. For eg: `http://example.com`, `https://example.com`, `ftp://example.com`, `//example.com`, etc.
 * This Does NOT match relative URLs like `example.com`
 */
export const ABSOLUTE_URL_PROTOCOL_REGEX = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/

export const isAbsolutePath = (path) => {
  return ABSOLUTE_URL_PROTOCOL_REGEX.test(path)
}

const getAbsolutePath = (url) => (isAbsolutePath(url) ? url : getState(DomainConfigState).publicDomain + url)

const loadAsset = async <T>(
  url: string,
  onLoad: (response: T) => void = () => {},
  onProgress: (request: ProgressEvent) => void = () => {},
  onError: (event: ErrorEvent | Error) => void = () => {},
  signal?: AbortSignal,
  loader?: AssetLoader
) => {
  if (!url) {
    onError(new Error('URL is empty'))
    return
  }
  url = getAbsolutePath(url)

  if (!loader) {
    const assetExt = getAssetType(url)
    loader = getLoader(assetExt)
  }

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
