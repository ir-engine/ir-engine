import { Paginated } from '@feathersjs/feathers'
import axios from 'axios'
import i18n from 'i18next'

import config from '@etherealengine/common/src/config'
import { AvatarInterface } from '@etherealengine/common/src/interfaces/AvatarInterface'
import { StaticResourceInterface } from '@etherealengine/common/src/interfaces/StaticResourceInterface'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { WorldNetworkAction } from '@etherealengine/engine/src/networking/functions/WorldNetworkAction'
import { defineAction, defineState, dispatchAction, getMutableState, useState } from '@etherealengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'
import { uploadToFeathersService } from '../../util/upload'
import { accessAuthState, AuthAction } from './AuthService'

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
/**@deprecated use getMutableState directly instead */
export const accessAvatarState = () => getMutableState(AvatarState)
/**@deprecated use useHookstate(getMutableState(...) directly instead */
export const useAvatarService = () => useState(accessAvatarState())

export const AvatarService = {
  async createAvatar(model: Blob, thumbnail: Blob, avatarName: string, isPublic: boolean) {
    const newAvatar = await API.instance.client.service('avatar').create({
      name: avatarName,
      isPublic
    })

    const uploadResponse = await AvatarService.uploadAvatarModel(
      model,
      thumbnail,
      newAvatar.identifierName,
      isPublic,
      newAvatar.id
    )

    if (!isPublic) {
      const selfUser = accessAuthState().user
      const userId = selfUser.id.value!
      await AvatarService.updateUserAvatarId(
        userId,
        newAvatar.id,
        uploadResponse[0]?.LOD0_url || '',
        uploadResponse[1]?.LOD0_url || ''
      )
    }
  },

  async fetchAvatarList(search?: string, incDec?: 'increment' | 'decrement') {
    const skip = accessAvatarState().skip.value
    const newSkip =
      incDec === 'increment' ? skip + AVATAR_PAGE_LIMIT : incDec === 'decrement' ? skip - AVATAR_PAGE_LIMIT : skip
    const result = (await API.instance.client.service('avatar').find({
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
    avatarBlob?: Blob,
    thumbnailBlob?: Blob
  ) {
    let payload = {
      modelResourceId: originalAvatar.modelResourceId,
      thumbnailResourceId: originalAvatar.thumbnailResourceId,
      name: avatarName
    }

    if (updateModels && avatarBlob && thumbnailBlob) {
      const uploadResponse = await AvatarService.uploadAvatarModel(
        avatarBlob,
        thumbnailBlob,
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

    const avatar = await API.instance.client.service('avatar').patch(originalAvatar.id, payload)
    dispatchAction(AvatarActions.updateAvatarAction({ avatar }))

    const authState = accessAuthState()
    const userAvatarId = authState.user?.avatarId?.value
    if (userAvatarId === avatar.id) {
      const userId = authState.user?.id.value!
      await AvatarService.updateUserAvatarId(
        userId,
        avatar.id,
        avatar.modelResource?.LOD0_url || '',
        avatar.thumbnailResource?.LOD0_url || ''
      )
    }
  },

  async removeAvatar(keys: string) {
    await API.instance.client.service('avatar').remove('', { query: { keys } })
    NotificationService.dispatchNotify(i18n.t('user:avatar.remove-success-msg'), { variant: 'success' })
    return this.fetchAvatarList()
  },

  async removeStaticResource(id: string) {
    return API.instance.client.service('static-resource').remove(id)
  },

  async updateUserAvatarId(userId: string, avatarId: string, avatarURL: string, thumbnailURL: string) {
    const res = await API.instance.client.service('user').patch(userId, { avatarId: avatarId })
    // dispatchAlertSuccess(dispatch, 'User Avatar updated');
    dispatchAction(AuthAction.userAvatarIdUpdatedAction({ avatarId: res.avatarId! }))
    dispatchAction(
      WorldNetworkAction.avatarDetails({
        avatarDetail: { avatarURL, thumbnailURL }
      })
    )
  },

  async uploadAvatar(data: any) {
    const token = accessAuthState().authUser.accessToken.value
    const selfUser = accessAuthState().user
    const res = await axios.post(`https://${config.client.serverHost}/upload`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + token
      }
    })
    const userId = selfUser.id.value ?? null
    await API.instance.client.service('user').patch(userId, {
      name: selfUser.name.value
    })
    const result = res.data
    NotificationService.dispatchNotify('Avatar updated', { variant: 'success' })
    dispatchAction(AuthAction.avatarUpdatedAction({ url: result.url }))
  },

  async uploadAvatarModel(avatar: Blob, thumbnail: Blob, avatarName: string, isPublic: boolean, avatarId?: string) {
    return uploadToFeathersService('upload-asset', [avatar, thumbnail], {
      type: 'user-avatar-upload',
      args: {
        avatarName,
        avatarId,
        isPublic
      }
    }).promise as Promise<StaticResourceInterface[]>
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
