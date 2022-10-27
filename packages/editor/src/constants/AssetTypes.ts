import { NativeTypes } from 'react-dnd-html5-backend'

import { AssetType } from '@xrengine/engine/src/assets/enum/AssetType'

/**
 * ItemTypes object containing types of items used.
 *
 * @type {Object}
 */
export const ItemTypes = {
  File: NativeTypes.FILE,
  Folder: 'folder',
  Audios: [AssetType.MP3, 'mpeg', 'audio/mpeg'],
  Images: [AssetType.PNG, AssetType.JPEG, 'jpg', 'gif', AssetType.KTX2, 'image/png', 'image/jpeg', 'image/ktx2'],
  Models: [
    AssetType.glB,
    'model/glb',
    AssetType.glTF,
    'model/gltf',
    AssetType.FBX,
    'model/fbx',
    AssetType.USDZ,
    'model/usdz'
  ],
  Scripts: ['tsx', AssetType.TS, 'jsx', 'js', AssetType.Script],
  Videos: [AssetType.MP4, 'm3u8', 'video/mp4', AssetType.MKV],
  Volumetrics: ['drcs', 'uvol'],
  Text: [AssetType.PlainText, 'txt'],
  ECS: [AssetType.XRE, 'scene.json'],
  Node: 'Node',
  Material: 'Material',
  Prefab: 'Prefab'
}

export const SupportedFileTypes = [
  ...ItemTypes.Images,
  ...ItemTypes.Audios,
  ...ItemTypes.Videos,
  ...ItemTypes.Volumetrics,
  ...ItemTypes.Models,
  ...ItemTypes.Scripts,
  ItemTypes.Folder,
  ItemTypes.File
]
