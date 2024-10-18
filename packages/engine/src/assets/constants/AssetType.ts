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

/** List of Asset Types. */
export enum AssetType {
  Model = 'Model',
  Material = 'Material',
  Image = 'Image',
  Video = 'Video',
  Audio = 'Audio',
  Prefab = 'Prefab',
  Lookdev = 'Lookdev',
  Volumetric = 'Volumetric',
  Unknown = 'unknown'
}

/** List of Asset Extensions. */
export enum AssetExt {
  GLB = 'glb',
  GLTF = 'gltf',
  VRM = 'vrm',
  FBX = 'fbx',
  OBJ = 'obj',
  USDZ = 'usdz',
  BIN = 'bin',

  PNG = 'png',
  JPEG = 'jpeg',
  TGA = 'tga',
  KTX2 = 'ktx2',
  DDS = 'dds',

  MP4 = 'mp4',
  AVI = 'avi',
  WEBM = 'webm',
  MKV = 'mkv',
  MOV = 'mov',
  M3U8 = 'm3u8',
  MPD = 'mpd',

  MP3 = 'mp3',
  WAV = 'wav',
  OGG = 'ogg',
  M4A = 'm4a',
  FLAC = 'flac',
  AAC = 'acc',

  MAT = 'material',

  UVOL = 'uvol',
  JSON = 'json'
}

export const AssetExtToAssetType = (assetExt: AssetExt | undefined): AssetType => {
  switch (assetExt) {
    // Model
    case AssetExt.GLB:
    case AssetExt.GLTF:
    case AssetExt.VRM:
    case AssetExt.FBX:
    case AssetExt.OBJ:
    case AssetExt.USDZ:
      return AssetType.Model

    // Image
    case AssetExt.PNG:
    case AssetExt.JPEG:
    case AssetExt.TGA:
    case AssetExt.KTX2:
    case AssetExt.DDS:
      return AssetType.Image

    // Video
    case AssetExt.MP4:
    case AssetExt.AVI:
    case AssetExt.WEBM:
    case AssetExt.MKV:
    case AssetExt.MOV:
    case AssetExt.M3U8:
    case AssetExt.MPD:
      return AssetType.Video

    // Audio
    case AssetExt.MP3:
    case AssetExt.WAV:
    case AssetExt.OGG:
    case AssetExt.M4A:
    case AssetExt.FLAC:
    case AssetExt.AAC:
      return AssetType.Audio

    // Material
    case AssetExt.MAT:
      return AssetType.Material

    // Volumetric
    case AssetExt.JSON:
    case AssetExt.UVOL:
      return AssetType.Volumetric

    default:
      return AssetType.Unknown
  }
}

export const FileExtToAssetExt = (fileExt: string): AssetExt | undefined => {
  fileExt = fileExt.toLowerCase()
  if (fileExt === 'jpg') return AssetExt.JPEG
  return <AssetExt>fileExt
}

const dataURLStart = 'data:image'
export const FileToAssetExt = (file: string): AssetExt | undefined => {
  if (isURL(file)) {
    const url = new URL(file)
    file = url.pathname.split('/').pop() as string
  }
  // Check if image data url
  else if (file.startsWith(dataURLStart)) {
    return file.startsWith('/png', dataURLStart.length) ? AssetExt.PNG : AssetExt.JPEG
  }
  const ext = file.split('.').pop()
  return ext ? FileExtToAssetExt(ext) : undefined
}

export const FileToAssetExtAndType = (file: string): [AssetExt | undefined, AssetType] => {
  return [FileToAssetExt(file), FileToAssetType(file)]
}

export const FileToAssetType = (fileName: string): AssetType => {
  if (!fileName || fileName === '') {
    return AssetType.Unknown
  }

  if (isURL(fileName)) {
    const url = new URL(fileName)
    fileName = url.pathname.split('/').pop() as string
  }

  const split = fileName.split('.')
  const ext = split.pop()?.toLowerCase()

  if (!ext) return AssetType.Unknown
  if (ext === 'gltf') {
    const prev = split.pop()
    if (prev) {
      if (prev === 'material') return AssetType.Material
      else if (prev === 'lookdev') return AssetType.Lookdev
      else if (prev === 'prefab') return AssetType.Prefab
    }
  }

  return AssetExtToAssetType(FileExtToAssetExt(ext))
}

export function isURL(path: string) {
  if (!path || path === '') return false
  return path.startsWith('http://') || path.startsWith('https://') || path.startsWith('file://')
}
