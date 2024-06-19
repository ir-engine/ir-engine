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

import React from 'react'
//import styles from '../styles.module.scss'
import { HiFolder } from 'react-icons/hi2'
import { IoAccessibilityOutline } from 'react-icons/io5'

import bustURLCache from '@etherealengine/common/src/utils/bustURLcache'
import { getState } from '@etherealengine/hyperflux'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { MdOutlineAudioFile, MdOutlinePhotoSizeSelectActual, MdOutlineViewInAr } from 'react-icons/md'
import { PiVideoCameraBold } from 'react-icons/pi'
import { TbFileDescription } from 'react-icons/tb'

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

export const FileIcon = ({
  thumbnailURL,
  type,
  isFolder,
  color = 'text-white'
}: {
  thumbnailURL?: string
  type: string
  isFolder?: boolean
  color?: string
}) => {
  const FallbackIcon = FileIconType[type ?? '']
  thumbnailURL = getState(EngineState).isEditing ? bustURLCache(thumbnailURL) : thumbnailURL
  return (
    <>
      {isFolder ? (
        <HiFolder className={`${color}`} />
      ) : thumbnailURL ? (
        <img className="h-full w-full min-w-[90px] object-contain" crossOrigin="anonymous" src={thumbnailURL} alt="" />
      ) : FallbackIcon ? (
        <FallbackIcon className={`${color}`} />
      ) : (
        <>
          <TbFileDescription className={`${color}`} />
          {/* type && type.length > 0 && showRibbon && <span className='text-xs'>{type}</span> */}
        </>
      )}
    </>
  )
}
