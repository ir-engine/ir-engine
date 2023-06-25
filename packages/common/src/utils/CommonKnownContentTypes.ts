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

/**
 * CommonKnownContentTypes object containing common content types.
 *
 * @type {Object}
 */
export const CommonKnownContentTypes = {
  xre: 'prefab/xre',
  gltf: 'model/gltf',
  glb: 'model/gltf-binary',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  pdf: 'application/pdf',
  m3u8: 'application/vnd.apple.mpegurl',
  mp4: 'video/mp4',
  mkv: 'video/x-matroska',
  avi: 'video/x-msvideo',
  mp3: 'audio/mpeg',
  tsx: 'application/octet-stream',
  ts: 'application/octet-stream',
  js: 'application/octet-stream',
  json: 'application/json'
}

export const MimeTypeToExtension = {
  'prefab/xre': 'xre',
  'model/gltf': 'gltf',
  'model/gltf-binary': 'glb',
  'model/usdz': 'usdz',
  'model/fbx': 'fbx',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/ktx2': 'ktx2',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
  'application/vnd.apple.mpegurl': 'm3u8',
  'video/mp4': 'mp4',
  'video/x-matroska': 'mkv',
  'video/x-msvideo': 'avi',
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/ogg': 'ogg'
}
