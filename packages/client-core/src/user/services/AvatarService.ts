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

import { Paginated } from '@feathersjs/feathers'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { avatarPath, AvatarType } from '@etherealengine/engine/src/schemas/user/avatar.schema'
import { defineState, getMutableState, getState } from '@etherealengine/hyperflux'

import { staticResourcePath, StaticResourceType } from '@etherealengine/engine/src/schemas/media/static-resource.schema'
import { uploadToFeathersService } from '../../util/upload'

import { AvatarState as AvatarNetworkState } from '@etherealengine/engine/src/avatar/state/AvatarNetworkState'

export const AVATAR_PAGE_LIMIT = 100

export const AvatarState = defineState({
  name: 'AvatarState',
  initial: () => ({
    avatarList: [] as Array<AvatarType>,
    search: undefined as string | undefined,
    skip: 0,
    limit: AVATAR_PAGE_LIMIT,
    total: 0
  })
})

// Creates new avatar and stores it in featherjs service or updates it based on id if not public
export const AvatarService = {
  async createAvatar(model: File, thumbnail: File, avatarName: string, isPublic: boolean) {
    const newAvatar = await Engine.instance.api.service(avatarPath).create({
      name: avatarName,
      isPublic
    })

    await AvatarService.uploadAvatarModel(model, thumbnail, newAvatar.identifierName, isPublic, newAvatar.id)

    if (!isPublic) {
      AvatarNetworkState.updateUserAvatarId(newAvatar.id)
    }
  },

  // Fetches avatars by querry and updates AvatarState
  async fetchAvatarList(search?: string, incDec?: 'increment' | 'decrement') {
    const avatarState = getMutableState(AvatarState)
    const skip = avatarState.skip.value
    const newSkip =
      incDec === 'increment' ? skip + AVATAR_PAGE_LIMIT : incDec === 'decrement' ? skip - AVATAR_PAGE_LIMIT : skip
    const result = (await Engine.instance.api.service(avatarPath).find({
      query: {
        name: {
          $like: `%${search}%`
        },
        $skip: newSkip,
        $limit: AVATAR_PAGE_LIMIT
      }
    })) as Paginated<AvatarType>

    avatarState.merge({
      search,
      skip,
      total: result.total,
      avatarList: result.data
    })
  },

  async patchAvatar(
    originalAvatar: AvatarType,
    avatarName: string,
    updateModels: boolean,
    avatarFile?: File,
    thumbnailFile?: File
  ) {
    // Payload for request
    let payload = {
      modelResourceId: originalAvatar.modelResourceId,
      thumbnailResourceId: originalAvatar.thumbnailResourceId,
      name: avatarName
    }
    // Update avatar in db
    if (updateModels && avatarFile && thumbnailFile) {
      const uploadResponse = await AvatarService.uploadAvatarModel(
        avatarFile,
        thumbnailFile,
        avatarName + '_' + originalAvatar.id,
        originalAvatar.isPublic,
        originalAvatar.id
      )
      // Check if payload = original if not it removes it
      const removalPromises: Promise<StaticResourceType>[] = []
      if (uploadResponse[0].id !== originalAvatar.modelResourceId)
        removalPromises.push(AvatarService.removeStaticResource(originalAvatar.modelResourceId))
      if (uploadResponse[1].id !== originalAvatar.thumbnailResourceId)
        removalPromises.push(AvatarService.removeStaticResource(originalAvatar.thumbnailResourceId))
      await Promise.all(removalPromises)
      // After removing resources repopulate with payload resources
      payload = {
        modelResourceId: uploadResponse[0].id,
        thumbnailResourceId: uploadResponse[1].id,
        name: avatarName
      }
    }
    // Update information in db then state based on new db resources
    const avatar = await Engine.instance.api.service(avatarPath).patch(originalAvatar.id, payload)
    getMutableState(AvatarState).avatarList.set((prevAvatarList) => {
      const index = prevAvatarList.findIndex((item) => item.id === avatar.id)
      prevAvatarList[index] = avatar
      return prevAvatarList
    })
    // Update id
    const userAvatarId = getState(AvatarNetworkState)[Engine.instance.userID]
    if (userAvatarId === avatar.id) {
      AvatarNetworkState.updateUserAvatarId(avatar.id)
    }
  },
  // Remmove address to old resources
  async removeStaticResource(id: string) {
    return Engine.instance.api.service(staticResourcePath).remove(id)
  },
  // Upload using featherjs which creates new path for file
  async uploadAvatarModel(avatar: File, thumbnail: File, avatarName: string, isPublic: boolean, avatarId?: string) {
    return uploadToFeathersService('upload-asset', [avatar, thumbnail], {
      type: 'user-avatar-upload',
      args: {
        avatarName,
        avatarId,
        isPublic
      }
    }).promise as Promise<StaticResourceType[]>
  },

  async getAvatar(id: string) {
    try {
      return Engine.instance.api.service(avatarPath).get(id)
    } catch (err) {
      return null
    }
  }
}
