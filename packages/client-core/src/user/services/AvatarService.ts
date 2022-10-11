import { Paginated } from '@feathersjs/feathers'
import axios from 'axios'
import i18n from 'i18next'

import { AvatarInterface } from '@xrengine/common/src/interfaces/AvatarInterface'
import { StaticResourceInterface } from '@xrengine/common/src/interfaces/StaticResourceInterface'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { WorldNetworkAction } from '@xrengine/engine/src/networking/functions/WorldNetworkAction'
import { defineAction, defineState, dispatchAction, getState } from '@xrengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'
import { uploadToFeathersService } from '../../util/upload'
import { accessAuthState, AuthAction } from './AuthService'

// State
export const AvatarState = defineState({
  name: 'AvatarState',
  initial: () => ({
    avatarList: [] as Array<AvatarInterface>
  })
})

export const AvatarServiceReceptor = (action) => {
  const s = getState(AvatarState)
  matches(action).when(AvatarActions.updateAvatarListAction.matches, (action) => {
    return s.avatarList.set(action.avatarList)
  })
}

export const AvatarService = {
  async createAvatar(model: Blob, thumbnail: Blob, avatarName: string, isPublic: boolean) {
    const newAvatar = await API.instance.client.service('avatar').create({
      name: avatarName,
      isPublic
    })

    const uploadResponse = await AvatarService.uploadAvatarModel(model, thumbnail, newAvatar.identifierName, isPublic)

    const patchedAvatar = (await AvatarService.patchAvatar(
      newAvatar.id,
      uploadResponse[0].id,
      uploadResponse[1].id,
      newAvatar.name
    )) as AvatarInterface

    if (!isPublic) {
      const selfUser = accessAuthState().user
      const userId = selfUser.id.value!
      await AvatarService.updateUserAvatarId(
        userId,
        newAvatar.id,
        patchedAvatar.modelResource?.url || '',
        patchedAvatar.thumbnailResource?.url || ''
      )
    }
  },

  async fetchAvatarList() {
    const result = (await API.instance.client.service('avatar').find({
      query: {
        $limit: 1000
      }
    })) as Paginated<AvatarInterface>
    dispatchAction(AvatarActions.updateAvatarListAction({ avatarList: result.data }))
  },

  async patchAvatar(avatarId: string, modelResourceId: string, thumbnailResourceId: string, avatarName: string) {
    return API.instance.client.service('avatar').patch(avatarId, {
      modelResourceId: modelResourceId,
      thumbnailResourceId: thumbnailResourceId,
      name: avatarName
    })
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
    const res = await axios.post(`https://${globalThis.process.env['VITE_SERVER_HOST']}/upload`, data, {
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

  async uploadAvatarModel(avatar: Blob, thumbnail: Blob, avatarName: string, isPublic: boolean) {
    return uploadToFeathersService('upload-asset', [avatar, thumbnail], {
      type: 'user-avatar-upload',
      args: {
        avatarName,
        isPublic
      }
    }).promise as Promise<StaticResourceInterface[]>
  }
}

export class AvatarActions {
  static updateAvatarListAction = defineAction({
    type: 'xre.client.avatar.AVATAR_FETCHED' as const,
    avatarList: matches.array as Validator<unknown, AvatarInterface[]>
  })
}
