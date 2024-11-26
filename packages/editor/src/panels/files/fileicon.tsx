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

import { useHookstate } from '@hookstate/core'
import React from 'react'
import { IoAccessibilityOutline } from 'react-icons/io5'
import { MdOutlineAudioFile, MdOutlinePhotoSizeSelectActual, MdOutlineViewInAr } from 'react-icons/md'
import { PiVideoCameraBold } from 'react-icons/pi'
import { twMerge } from 'tailwind-merge'

const FileIconType = {
  gltf: MdOutlineViewInAr,
  'gltf-binary': MdOutlineViewInAr,
  glb: MdOutlineViewInAr,
  vrm: IoAccessibilityOutline,
  usdz: MdOutlineViewInAr,
  fbx: MdOutlineViewInAr,
  png: MdOutlinePhotoSizeSelectActual,
  jpeg: MdOutlinePhotoSizeSelectActual,
  jpg: MdOutlinePhotoSizeSelectActual,
  ktx2: MdOutlinePhotoSizeSelectActual,
  m3u8: PiVideoCameraBold,
  mp4: PiVideoCameraBold,
  mpeg: MdOutlineAudioFile,
  mp3: MdOutlineAudioFile,
  'model/gltf-binary': MdOutlineViewInAr,
  'model/gltf': MdOutlineViewInAr,
  'model/glb': MdOutlineViewInAr,
  'model/vrm': IoAccessibilityOutline,
  'model/usdz': MdOutlineViewInAr,
  'model/fbx': MdOutlineViewInAr,
  'image/png': MdOutlinePhotoSizeSelectActual,
  'image/jpeg': MdOutlinePhotoSizeSelectActual,
  'image/jpg': MdOutlinePhotoSizeSelectActual,
  'application/pdf': null,
  'application/vnd.apple.mpegurl': PiVideoCameraBold,
  'video/mp4': PiVideoCameraBold,
  'audio/mpeg': MdOutlineAudioFile,
  'audio/mp3': MdOutlineAudioFile
}

const FOLDER_ICON_PATH = '/static/editor/folder-icon.png'
const FILE_ICON_PATH = '/static/editor/file-icon.png'
const FILE_ICON_BLUR = '/static/editor/file-icon-blur.png'

export const FileIcon = ({
  thumbnailURL,
  type,
  isFolder,
  color = 'text-white',
  isMinified = false
}: {
  thumbnailURL?: string
  type: string
  isFolder?: boolean
  color?: string
  isMinified?: boolean
}) => {
  const FallbackIcon = FileIconType[type ?? '']
  const imageLoaded = useHookstate(false)

  const handleImageLoaded = () => {
    imageLoaded.set(true)
  }

  return (
    <>
      {isFolder ? (
        <img
          className={twMerge(isMinified ? 'h-4 w-4' : 'h-full max-h-40 w-full max-w-40', 'object-contain')}
          crossOrigin="anonymous"
          src={FOLDER_ICON_PATH}
          alt="folder-icon"
        />
      ) : thumbnailURL ? (
        <>
          <img
            className={twMerge(
              isMinified ? 'h-4 w-4' : 'h-full max-h-40 w-full max-w-40',
              'object-contain',
              imageLoaded.value ? 'block' : 'hidden'
            )}
            crossOrigin="anonymous"
            src={thumbnailURL}
            alt="file-thumbnail"
            onLoad={handleImageLoaded}
          />
          <img
            className={twMerge(
              isMinified ? 'h-4 w-4' : 'h-full max-h-40 w-full max-w-40',
              'object-contain',
              imageLoaded.value ? 'hidden' : 'block'
            )}
            crossOrigin="anonymous"
            src={FILE_ICON_BLUR}
            alt="file-thumbnail"
          />
        </>
      ) : FallbackIcon ? (
        <FallbackIcon className={twMerge(color, isMinified ? 'h-4 w-4' : 'h-full max-h-40 w-full max-w-40')} />
      ) : (
        <img
          className={twMerge(isMinified ? 'h-4 w-4' : 'h-full max-h-40 w-full max-w-40', 'object-contain')}
          crossOrigin="anonymous"
          src={FILE_ICON_PATH}
          alt="file-icon"
        />
      )}
    </>
  )
}
