import { createState, useState } from '@speigg/hookstate'

import { AvatarInterface } from '@xrengine/common/src/interfaces/AvatarInterface'
import { AvatarResult } from '@xrengine/common/src/interfaces/AvatarResult'
import { AdminAssetUploadType, AssetUploadType } from '@xrengine/common/src/interfaces/UploadAssetInterface'

import { client } from '../../feathers'
import { store, useDispatch } from '../../store'

//State
export const AVATAR_PAGE_LIMIT = 12

const state = createState({
  avatars: [] as Array<AvatarInterface>,
  skip: 0,
  limit: AVATAR_PAGE_LIMIT,
  total: 0,
  retrieving: false,
  fetched: false,
  updateNeeded: true,
  lastFetched: Date.now()
})

store.receptors.push((action: AvatarActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'AVATARS_RETRIEVED':
        return s.merge({
          avatars: action.avatars.data,
          skip: action.avatars.skip,
          limit: action.avatars.limit,
          total: action.avatars.total,
          retrieving: false,
          fetched: true,
          updateNeeded: false,
          lastFetched: Date.now()
        })
      case 'AVATAR_CREATED':
        return s.merge({ updateNeeded: true })
      case 'AVATAR_REMOVED':
        return s.merge({ updateNeeded: true })
      case 'AVATAR_UPDATED':
        return s.merge({ updateNeeded: true })
    }
  }, action.type)
})

export const accessAvatarState = () => state

export const useAvatarState = () => useState(state) as any as typeof state

//Service
export const AvatarService = {
  fetchAdminAvatars: async (
    incDec?: 'increment' | 'decrement',
    skip = accessAvatarState().skip.value,
    search: string | null = null
  ) => {
    const dispatch = useDispatch()
    {
      const adminAvatarState = accessAvatarState()
      const limit = adminAvatarState.limit.value
      const avatars = await client.service('static-resource').find({
        query: {
          $select: ['id', 'sid', 'key', 'name', 'url', 'staticResourceType', 'userId'],
          staticResourceType: 'avatar',
          userId: null,
          $limit: limit,
          $skip: skip * AVATAR_PAGE_LIMIT,
          getAvatarThumbnails: true,
          search: search
        }
      })
      dispatch(AvatarAction.avatarsFetched(avatars))
    }
  },
  createAdminAvatar: async (blob: Blob, thumbnail: Blob, data: any) => {
    const dispatch = useDispatch()
    try {
      if (blob) {
        const uploadArguments: AdminAssetUploadType = {
          type: 'admin-file-upload',
          files: [blob, thumbnail],
          args: [
            {
              key: `avatars/public/${thumbnail['name']}`,
              contentType: 'multipart/form-data',
              staticResourceType: data.staticResourceType
            }
          ]
        }
        const response = await client.service('upload-asset').create(uploadArguments)
        data.url = response[0]
      }
      const result = await client.service('static-resource').create(data)
      dispatch(AvatarAction.avatarCreated(result))
    } catch (error) {
      console.error(error)
    }
  },
  updateAdminAvatar: async (id: string, data: any) => {
    const dispatch = useDispatch()
    try {
      const result = await client.service('static-resource').patch(id, data)
      dispatch(AvatarAction.avatarUpdated(result))
    } catch (error) {
      console.error(error)
    }
  },
  removeAdminAvatar: async (id) => {
    const dispatch = useDispatch()
    try {
      const result = await client.service('static-resource').remove(id)
      dispatch(AvatarAction.avatarRemoved(result))
    } catch (err) {
      console.error(err)
    }
  }
}

//Action
export const AvatarAction = {
  avatarsFetched: (avatars: AvatarResult) => {
    return {
      type: 'AVATARS_RETRIEVED' as const,
      avatars: avatars
    }
  },
  avatarCreated: (avatar: AvatarResult) => {
    return {
      type: 'AVATAR_CREATED' as const,
      avatar: avatar
    }
  },
  avatarRemoved: (avatar: AvatarResult) => {
    return {
      type: 'AVATAR_REMOVED' as const,
      avatar: avatar
    }
  },
  avatarUpdated: (avatar: any) => {
    return {
      type: 'AVATAR_UPDATED' as const,
      avatar: avatar
    }
  }
}

export type AvatarActionType = ReturnType<typeof AvatarAction[keyof typeof AvatarAction]>
