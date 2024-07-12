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

export const AVATAR_FILE_ALLOWED_EXTENSIONS = '.glb,.gltf,.vrm,.fbx'
export const MIN_AVATAR_FILE_SIZE = 0
export const MAX_AVATAR_FILE_SIZE = 15728640 * 10 // 150 MB
export const MIN_THUMBNAIL_FILE_SIZE = 0
export const MAX_THUMBNAIL_FILE_SIZE = 2097152 // 2 MB
export const PRESIGNED_URL_EXPIRATION_DURATION = 3600 // 1 hour
export const THUMBNAIL_FILE_ALLOWED_EXTENSIONS = '.png,.jpg'
export const THUMBNAIL_WIDTH = 300
export const THUMBNAIL_HEIGHT = 300
export const MAX_ALLOWED_TRIANGLES = 100000
