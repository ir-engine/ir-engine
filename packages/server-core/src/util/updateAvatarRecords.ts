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

import { avatarPath } from '@ir-engine/common/src/schema.type.module'
import { isValidId } from '@ir-engine/common/src/utils/isValidId'
import { Application } from '@ir-engine/server-core/declarations'
import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'
import { patchStaticResourceAsAvatar, supportedAvatars } from '../user/avatar/avatar-helper'

const projectRelativeFolder = path.resolve(appRootPath.path, 'packages/projects')

export default async function (app: Application, avatarsFolder: string, manifestName: string) {
  await Promise.all(
    fs
      .readdirSync(avatarsFolder)
      .filter((file) => supportedAvatars.includes(file.split('.').pop()!))
      .map((file) =>
        patchStaticResourceAsAvatar(
          app,
          manifestName,
          path.resolve(avatarsFolder, file).replace(projectRelativeFolder + '/', '')
        )
      )
  )
  const existingAvatars = await app.service(avatarPath).find({
    query: {
      isPublic: true,
      project: manifestName
    },
    paginate: false
  })
  await Promise.all(
    existingAvatars.map(async (existingAvatar) => {
      if (!existingAvatar.modelResource && !existingAvatar.thumbnailResource && isValidId(existingAvatar.id))
        return await app.service(avatarPath).remove(existingAvatar.id)
      else return Promise.resolve()
    })
  )
}
