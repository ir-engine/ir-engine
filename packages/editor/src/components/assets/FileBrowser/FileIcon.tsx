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

import { FileBrowserContentType } from '@etherealengine/common/src/schema.type.module'
import { CommonKnownContentTypes } from '@etherealengine/common/src/utils/CommonKnownContentTypes'
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew'
import DescriptionIcon from '@mui/icons-material/Description'
import FolderIcon from '@mui/icons-material/Folder'
import PhotoSizeSelectActualIcon from '@mui/icons-material/PhotoSizeSelectActual'
import VideocamIcon from '@mui/icons-material/Videocam'
import ViewInArIcon from '@mui/icons-material/ViewInAr'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import React from 'react'
import { isFolder } from '../../../functions/isFolder'
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

const fileConsistsOfContentType = function (file: FileBrowserContentType, contentType: string): boolean {
  if (isFolder(file)) {
    return contentType.startsWith('image')
  } else {
    const guessedType: string = CommonKnownContentTypes[file.type]
    return guessedType?.startsWith(contentType)
  }
}

export const FileIcon = ({ file, showRibbon }: { file: FileBrowserContentType; showRibbon?: boolean }) => {
  const fallback = { icon: FileIconType[file.type] }

  if (file.thumbnailKey == null) {
    if (fileConsistsOfContentType(file, 'model')) {
      // create thumbnail of model, then upload it
    } else if (fileConsistsOfContentType(file, 'image')) {
      // create thumbnail of image, then upload it
    }
  }

  return (
    <>
      {isFolder(file) ? (
        <FolderIcon fontSize={'inherit'} />
      ) : file.thumbnailKey ? (
        <img style={{ maxHeight: '50px' }} crossOrigin="anonymous" src={file.thumbnailKey} alt="" />
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
