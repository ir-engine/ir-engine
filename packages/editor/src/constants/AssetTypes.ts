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

import { AssetExt } from '@ir-engine/engine/src/assets/constants/AssetType'
import { NativeTypes } from 'react-dnd-html5-backend'

export type SceneElementType = {
  componentJsonID: string
  label: string
  Icon: JSX.Element
  type: typeof ItemTypes.Component
}

export type DnDFileType = {
  dataTransfer: DataTransfer
  files: File[]
  items: DataTransferItemList
}

export type FileDataType = {
  key: string
  path: string
  name: string
  fullName: string
  size?: string
  thumbnailURL?: string
  url: string
  type: string
  isFolder: boolean
}

/**
 * ItemTypes object containing types of items used.
 */
export const ItemTypes = {
  File: NativeTypes.FILE,
  Folder: 'folder',
  Audios: [AssetExt.MP3, 'mpeg', 'audio/mpeg'],
  Images: [AssetExt.PNG, AssetExt.JPEG, 'jpg', 'gif', AssetExt.KTX2, 'image/png', 'image/jpeg', 'image/ktx2'],
  Models: [
    AssetExt.GLB,
    'model/glb',
    AssetExt.GLTF,
    'model/gltf',
    AssetExt.FBX,
    'model/fbx',
    AssetExt.USDZ,
    'model/usdz',
    AssetExt.VRM,
    'model/vrm'
  ],
  Scripts: ['tsx', 'ts', 'jsx', 'js', 'script'],
  Videos: [AssetExt.MP4, AssetExt.M3U8, 'video/mp4', AssetExt.MKV],
  Volumetrics: ['manifest'],
  Text: ['text', 'txt'],
  ECS: ['scene.json'],
  Node: 'Node',
  Material: 'Material',
  Lookdev: 'Lookdev',
  Prefab: 'Prefab',
  Component: 'Component'
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
