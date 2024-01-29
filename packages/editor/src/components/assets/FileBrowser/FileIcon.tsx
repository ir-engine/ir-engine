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

import { FileBrowserContentType, fileThumbnailPath } from '@etherealengine/common/src/schema.type.module'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew'
import DescriptionIcon from '@mui/icons-material/Description'
import FolderIcon from '@mui/icons-material/Folder'
import PhotoSizeSelectActualIcon from '@mui/icons-material/PhotoSizeSelectActual'
import VideocamIcon from '@mui/icons-material/Videocam'
import ViewInArIcon from '@mui/icons-material/ViewInAr'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import React, { useState } from 'react'
import { isFolder } from '../../../functions/isFolder'
import { generateImageFileThumbnail, generateVideoFileThumbnail } from '../../../functions/thumbnails'
import styles from '../styles.module.scss'

const FileIconType = {
  gltf: ViewInArIcon,
  'gltf-binary': ViewInArIcon,
  glb: ViewInArIcon,
  vrm: AccessibilityNewIcon,
  usdz: ViewInArIcon,
  fbx: ViewInArIcon,
  png: PhotoSizeSelectActualIcon,
  jpeg: PhotoSizeSelectActualIcon,
  jpg: PhotoSizeSelectActualIcon,
  ktx2: PhotoSizeSelectActualIcon,
  m3u8: VideocamIcon,
  mp4: VideocamIcon,
  mpeg: VolumeUpIcon,
  mp3: VolumeUpIcon,
  'model/gltf-binary': ViewInArIcon,
  'model/gltf': ViewInArIcon,
  'model/glb': ViewInArIcon,
  'model/vrm': AccessibilityNewIcon,
  'model/usdz': ViewInArIcon,
  'model/fbx': ViewInArIcon,
  'image/png': PhotoSizeSelectActualIcon,
  'image/jpeg': PhotoSizeSelectActualIcon,
  'image/jpg': PhotoSizeSelectActualIcon,
  'application/pdf': null,
  'application/vnd.apple.mpegurl': VideocamIcon,
  'video/mp4': VideocamIcon,
  'audio/mpeg': VolumeUpIcon,
  'audio/mp3': VolumeUpIcon
}

const generatorTypes = [
  {
    types: ['image/jpeg', 'image/jpg', 'image/png', 'jpeg', 'jpg', 'png'], // TODO: , ktx2
    gen: async (file) => {
      const imageBlob = await fetch(file.url).then((response) => response.blob())
      return await generateImageFileThumbnail(imageBlob, 256, 256, 'transparent')
    }
  },
  {
    types: ['application/vnd.apple.mpegurl', 'm3u8', 'mp4', 'video/mp4'],
    gen: async (file) => {
      const videoBlob = await fetch(file.url).then((response) => response.blob())
      return await generateVideoFileThumbnail(videoBlob, 256, 256, 'transparent')
    }
  },
  {
    types: [
      'fbx',
      'glb',
      'gltf',
      'gltf-binary',
      'model/fbx',
      'model/glb',
      'model/gltf',
      'model/gltf-binary',
      'model/usdz',
      'model/vrm',
      'usdz',
      'vrm'
    ],
    gen: null // TODO: model file thumbnail, based on ECS preview support
  }
]

const thumbnailGeneratorsByType = new Map()
for (const entry of generatorTypes) {
  for (const type of entry.types) {
    thumbnailGeneratorsByType.set(type, entry.gen)
  }
}

const pendingThumbnails = new Map<string, Promise<string>>()

const uploadThumbnail = async (file: FileBrowserContentType, blob: Blob) => {
  if (blob == null) {
    return ''
  }

  const thumbnailKey = await Engine.instance.api.service(fileThumbnailPath).patch(file.key, {
    body: await blob.arrayBuffer(),
    isCustom: false,
    contentType: 'image/png'
  })

  return thumbnailKey ?? ''
}

const getThumbnailKey = (file: FileBrowserContentType, gen): Promise<string> => {
  if (file.thumbnailKey != null) {
    return Promise.resolve(file.thumbnailKey)
  }

  if (!pendingThumbnails.has(file.key)) {
    let finished = false
    const promise = gen(file)
      .then((blob) => uploadThumbnail(file, blob))
      .then((result) => {
        finished = true
        return result
      })
    if (finished) {
      return promise
    } else {
      pendingThumbnails.set(file.key, promise)
    }
  }

  return pendingThumbnails.get(file.key)!
}

export const FileIcon = ({ file, showRibbon }: { file: FileBrowserContentType; showRibbon?: boolean }) => {
  const fallback = { icon: FileIconType[file.type] }
  const [thumbnailKey, setThumbnailKey] = useState<string>()
  if (file.thumbnailKey == null && !file.key.includes('thumbnail')) {
    const thumbnailGenerator = thumbnailGeneratorsByType.get(file.type)
    if (thumbnailGenerator != null) {
      getThumbnailKey(file, thumbnailGenerator).then((key) => setThumbnailKey(key))
    }
  }
  return (
    <>
      {isFolder(file) ? (
        <FolderIcon fontSize={'inherit'} />
      ) : (thumbnailKey?.length ?? 0) > 0 ? (
        <img style={{ maxHeight: '50px' }} crossOrigin="anonymous" src={thumbnailKey} alt="" />
      ) : fallback.icon ? (
        <fallback.icon fontSize={'inherit'} />
      ) : (
        <>
          <DescriptionIcon fontSize={'inherit'} />
          {showRibbon && <span className={styles.extensionRibbon}>{file.type}</span>}
        </>
      )}
    </>
  )
}
