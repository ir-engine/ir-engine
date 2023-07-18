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
import axios from 'axios'
import i18n from 'i18next'

import config from '@etherealengine/common/src/config'
import { AvatarInterface } from '@etherealengine/common/src/interfaces/AvatarInterface'
import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { StaticResourceInterface } from '@etherealengine/common/src/interfaces/StaticResourceInterface'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { AvatarNetworkAction } from '@etherealengine/engine/src/avatar/state/AvatarNetworkState'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { WorldNetworkAction } from '@etherealengine/engine/src/networking/functions/WorldNetworkAction'
import { defineAction, defineState, dispatchAction, getMutableState, getState } from '@etherealengine/hyperflux'

import { NotificationService } from '../../common/services/NotificationService'
import { uploadToFeathersService } from '../../util/upload'
import { AuthAction, AuthState } from './AuthService'

export const AVATAR_PAGE_LIMIT = 100

// State
export const AvatarState = defineState({
  name: 'AvatarState',
  initial: () => ({
    avatarList: [] as Array<AvatarInterface>,
    search: undefined as string | undefined,
    skip: 0,
    limit: AVATAR_PAGE_LIMIT,
    total: 0
  })
})

export const AvatarServiceReceptor = (action) => {
  const s = getMutableState(AvatarState)
  matches(action)
    .when(AvatarActions.updateAvatarListAction.matches, (action) => {
      s.search.set(action.search ?? undefined)
      s.skip.set(action.skip)
      s.total.set(action.total)
      return s.avatarList.set(action.avatarList)
    })
    .when(AvatarActions.updateAvatarAction.matches, (action) => {
      const index = s.avatarList.findIndex((item) => item.id.value === action.avatar.id)
      return s.avatarList[index].set(action.avatar)
    })
}

export const AvatarService = {
  async createAvatar(model: File, thumbnail: File, avatarName: string, isPublic: boolean) {
    const newAvatar = await Engine.instance.api.service('avatar').create({
      name: avatarName,
      isPublic
    })

    await AvatarService.uploadAvatarModel(model, thumbnail, newAvatar.identifierName, isPublic, newAvatar.id)

    if (!isPublic) {
      const selfUser = getState(AuthState).user
      const userId = selfUser.id!
      await AvatarService.updateUserAvatarId(userId, newAvatar.id)
    }
  },

  async fetchAvatarList(search?: string, incDec?: 'increment' | 'decrement') {
    const skip = getState(AvatarState).skip
    const newSkip =
      incDec === 'increment' ? skip + AVATAR_PAGE_LIMIT : incDec === 'decrement' ? skip - AVATAR_PAGE_LIMIT : skip
    const result = (await Engine.instance.api.service('avatar').find({
      query: {
        search,
        $skip: newSkip,
        $limit: AVATAR_PAGE_LIMIT
      }
    })) as Paginated<AvatarInterface>
    dispatchAction(
      AvatarActions.updateAvatarListAction({ avatarList: result.data, search, skip: result.skip, total: result.total })
    )
  },

  async patchAvatar(
    originalAvatar: AvatarInterface,
    avatarName: string,
    updateModels: boolean,
    avatarFile?: File,
    thumbnailFile?: File
  ) {
    let payload = {
      modelResourceId: originalAvatar.modelResourceId,
      thumbnailResourceId: originalAvatar.thumbnailResourceId,
      name: avatarName
    }

    if (updateModels && avatarFile && thumbnailFile) {
      const uploadResponse = await AvatarService.uploadAvatarModel(
        avatarFile,
        thumbnailFile,
        avatarName + '_' + originalAvatar.id,
        originalAvatar.isPublic,
        originalAvatar.id
      )
      const removalPromises = [] as any
      if (uploadResponse[0].id !== originalAvatar.modelResourceId)
        removalPromises.push(AvatarService.removeStaticResource(originalAvatar.modelResourceId))
      if (uploadResponse[1].id !== originalAvatar.thumbnailResourceId)
        removalPromises.push(AvatarService.removeStaticResource(originalAvatar.thumbnailResourceId))
      await Promise.all(removalPromises)

      payload = {
        modelResourceId: uploadResponse[0].id,
        thumbnailResourceId: uploadResponse[1].id,
        name: avatarName
      }
    }

    const avatar = await Engine.instance.api.service('avatar').patch(originalAvatar.id, payload)
    dispatchAction(AvatarActions.updateAvatarAction({ avatar }))

    const authState = getState(AuthState)
    const userAvatarId = authState.user?.avatarId
    if (userAvatarId === avatar.id) {
      const userId = authState.user?.id!
      await AvatarService.updateUserAvatarId(userId, avatar.id)
    }
  },

  async removeAvatar(keys: string) {
    await Engine.instance.api.service('avatar').remove('', { query: { keys } })
    NotificationService.dispatchNotify(i18n.t('user:avatar.remove-success-msg'), { variant: 'success' })
    return this.fetchAvatarList()
  },

  async removeStaticResource(id: string) {
    return Engine.instance.api.service('static-resource').remove(id)
  },

  async updateUserAvatarId(userId: UserId, avatarId: string) {
    const res = await Engine.instance.api.service('user').patch(userId, { avatarId: avatarId })
    // dispatchAlertSuccess(dispatch, 'User Avatar updated');
    dispatchAction(AuthAction.userAvatarIdUpdatedAction({ avatarId: res.avatarId! }))
    dispatchAction(
      AvatarNetworkAction.setAvatarID({
        avatarID: avatarId,
        entityUUID: userId as string as EntityUUID
      })
    )
  },

  async uploadAvatar(data: any) {
    const authState = getState(AuthState)
    const token = authState.authUser.accessToken
    const selfUser = authState.user
    const res = await axios.post(`https://${config.client.serverHost}/upload`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + token
      }
    })
    const userId = selfUser.id ?? null
    await Engine.instance.api.service('user').patch(userId, {
      name: selfUser.name
    })
    const result = res.data
    NotificationService.dispatchNotify('Avatar updated', { variant: 'success' })
    dispatchAction(AuthAction.avatarUpdatedAction({ url: result.url }))
  },

  async uploadAvatarModel(avatar: File, thumbnail: File, avatarName: string, isPublic: boolean, avatarId?: string) {
    return uploadToFeathersService('upload-asset', [avatar, thumbnail], {
      type: 'user-avatar-upload',
      args: {
        avatarName,
        avatarId,
        isPublic
      }
    }).promise as Promise<StaticResourceInterface[]>
  },

  async getAvatar(id: string) {
    try {
      return Engine.instance.api.service('avatar').get(id)
    } catch (err) {
      return null
    }
  }
}

export class AvatarActions {
  static updateAvatarListAction = defineAction({
    type: 'ee.client.avatar.AVATAR_FETCHED' as const,
    avatarList: matches.array as Validator<unknown, AvatarInterface[]>,
    search: matches.string.optional(),
    skip: matches.number,
    total: matches.number
  })
  static updateAvatarAction = defineAction({
    type: 'ee.client.avatar.AVATAR_UPDATED' as const,
    avatar: matches.object as Validator<unknown, AvatarInterface>
  })
}
