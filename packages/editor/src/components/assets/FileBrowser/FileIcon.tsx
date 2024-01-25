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
import { generateImageFileThumbnail } from '../../../functions/thumbnails'
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

const pendingThumbnails = new Map<string, Promise<string>>()

const createThumbnailKey = async (file: FileBrowserContentType): Promise<string> => {
  let thumbnailBlob: Blob | null = null
  switch (file.type.split('/')[0]) {
    case 'model': {
      break
    }
    case 'image': {
      const imageBlob = await fetch(file.url).then((response) => response.blob())
      thumbnailBlob = await generateImageFileThumbnail(imageBlob, 256, 256, 'transparent')
      break
    }
  }

  if (thumbnailBlob == null) {
    return ''
  }

  const thumbnailKey = await Engine.instance.api.service(fileThumbnailPath).patch(file.key, {
    body: thumbnailBlob,
    isCustom: false,
    contentType: 'image/png'
  })

  pendingThumbnails.delete(file.key)
  return thumbnailKey ?? ''
}

const getThumbnailKey = (file: FileBrowserContentType): Promise<string> => {
  if (file.thumbnailKey != null) {
    return Promise.resolve(file.thumbnailKey)
  }

  if (!pendingThumbnails.has(file.key)) {
    pendingThumbnails.set(file.key, createThumbnailKey(file))
  }

  return pendingThumbnails.get(file.key)!
}

export const FileIcon = ({ file, showRibbon }: { file: FileBrowserContentType; showRibbon?: boolean }) => {
  const fallback = { icon: FileIconType[file.type] }
  const [thumbnailKey, setThumbnailKey] = useState<string>()
  getThumbnailKey(file).then((key) => setThumbnailKey(key))
  return (
    <>
      {isFolder(file) ? (
        <FolderIcon fontSize={'inherit'} />
      ) : (thumbnailKey?.length ?? 0) > 0 ? (
        <img style={{ maxHeight: '50px' }} crossOrigin="anonymous" src={thumbnailKey} alt="" />
      ) : fallback ? (
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
