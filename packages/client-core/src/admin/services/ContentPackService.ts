import { useDispatch } from '../../store'
import { client } from '../../feathers'
import _ from 'lodash'
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { AdminContentPack } from '@xrengine/common/src/interfaces/AdminContentPack'
import { store } from '../../store'

//State
const state = createState({
  contentPacks: [] as Array<AdminContentPack>,
  updateNeeded: true
})

store.receptors.push((action: ContentPackActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'LOADED_CONTENT_PACKS':
        return s.merge({ updateNeeded: false, contentPacks: action.contentPacks })
      case 'CONTENT_PACK_CREATED':
        return s.merge({ updateNeeded: true })
      case 'CONTENT_PACK_PATCHED':
        return s.merge({ updateNeeded: true })
    }
  }, action.type)
})

export const accessContentPackState = () => state

export const useContentPackState = () => useState(state) as any as typeof state

//Service
export const ContentPackService = {
  uploadAvatars: (data: any) => {
    data.each(async (data) => {
      const existingFiles = await client.service('static-resource').find({
        query: {
          name: data.name
        }
      })
      const existingThumbnail = existingFiles.data.find((file) => file.staticResourceType === 'user-thumbnail')
      const existingModel = existingFiles.data.find((file) => file.staticResourceType === 'avatar')

      if (existingThumbnail == null) {
        await client.service('static-resource').create({
          name: data.name,
          url: data.thumbnail,
          staticResourceType: 'user-thumbnail',
          key: `avatars/${data.name}.png`
        })
      } else {
        await client.service('static-resource').patch(existingThumbnail.id, {
          name: data.name,
          url: data.thumbnail,
          key: `avatars/${data.name}.png`
        })
      }

      if (existingModel == null) {
        await client.service('static-resource').create({
          name: data.name,
          url: data.glb,
          staticResourceType: 'avatar',
          key: `avatars/${data.name}.png`
        })
      } else {
        await client.service('static-resource').patch(existingThumbnail.id, {
          name: data.name,
          url: data.glb,
          key: `avatars/${data.name}.png`
        })
      }
    })
  },
  fetchContentPacks: async () => {
    const dispatch = useDispatch()
    const packs = await client.service('content-pack').find({})
    dispatch(ContentPackAction.loadedContentPacks(packs))
  },
  createContentPack: async (data: any) => {
    const dispatch = useDispatch()
    await client.service('content-pack').create(data)
    dispatch(ContentPackAction.createdContentPack())
  },
  addScenesToContentPack: async (data: any) => {
    const dispatch = useDispatch()
    await client.service('content-pack').patch(null, data)
    dispatch(ContentPackAction.patchedContentPack())
  },
  addAvatarsToContentPack: async (data: any) => {
    const dispatch = useDispatch()
    const result = await client.service('content-pack').patch(null, data)
    dispatch(ContentPackAction.patchedContentPack())
  },
  addProjectToContentPack: async (data: any) => {
    const dispatch = useDispatch()
    const result = await client.service('content-pack').patch(null, data)
    console.log('Patch content-pack with reality-pack(s) result', result)
    dispatch(ContentPackAction.patchedContentPack())
  },
  downloadContentPack: async (url: string) => {
    await client.service('content-pack').update(null, {
      manifestUrl: url
    })
  },
  uploadScenes: (data: any) => {
    data.each(async (data) => { })
  }
}

//Action
export const ContentPackAction = {
  loadedContentPacks: (contentPacks: AdminContentPack[]) => {
    return {
      type: 'LOADED_CONTENT_PACKS' as const,
      contentPacks: contentPacks
    }
  },
  createdContentPack: () => {
    return {
      type: 'CONTENT_PACK_CREATED' as const
    }
  },
  patchedContentPack: () => {
    return {
      type: 'CONTENT_PACK_PATCHED' as const
    }
  }
}

export type ContentPackActionType = ReturnType<typeof ContentPackAction[keyof typeof ContentPackAction]>
