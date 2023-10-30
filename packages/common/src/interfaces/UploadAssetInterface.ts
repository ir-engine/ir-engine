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

import { AvatarID } from '@etherealengine/engine/src/schemas/user/avatar.schema'
import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'

export type AvatarUploadArgsType = {
  avatarName: string
  avatarId: AvatarID
  isPublic: boolean
}

export type AvatarUploadType = {
  type: 'user-avatar-upload'
  files: (Blob | Buffer)[]
  userId?: UserID
  args: string | AvatarUploadArgsType
}

export type AdminAssetUploadArgumentsType = {
  id?: string
  path: string
  userId?: UserID
  name?: string
  project?: string
  hash?: string
  stats?: any
}

export type AdminAssetUploadType = {
  type: 'admin-file-upload'
  project: string
  files: Blob[]
  args: AdminAssetUploadArgumentsType
  variants: boolean
  userId?: UserID
}

export type AssetUploadType = AvatarUploadType | AdminAssetUploadType

export interface UploadFile {
  fieldname?: string
  originalname: string
  encoding?: string
  mimetype: string
  buffer: Buffer | string
  size: number
}
