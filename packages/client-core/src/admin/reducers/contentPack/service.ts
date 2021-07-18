import { Dispatch } from 'redux'
import { client } from '../../../feathers'
import { createdContentPack, patchedContentPack, loadedContentPacks } from './actions'

export function uploadAvatars(data: any) {
  return async (dispatch: Dispatch, getState: any) => {
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
  }
}

export function fetchContentPacks() {
  return async (dispatch: Dispatch, getState: any) => {
    const packs = await client.service('content-pack').find({})
    dispatch(loadedContentPacks(packs))
  }
}

export function createContentPack(data: any) {
  return async (dispatch: Dispatch, getState: any) => {
    await client.service('content-pack').create(data)
    dispatch(createdContentPack())
  }
}

export function addSceneToContentPack(data: any) {
  return async (dispatch: Dispatch, getState: any) => {
    await client.service('content-pack').patch(null, data)
    dispatch(patchedContentPack())
  }
}

export function addAvatarToContentPack(data: any) {
  return async (dispatch: Dispatch) => {
    const result = await client.service('content-pack').patch(null, {
      avatar: data.avatar,
      thumbnail: data.thumbnail,
      contentPack: data.contentPack
    })
    console.log('addAvatar result:')
    console.log(result)
    dispatch(patchedContentPack())
  }
}

export function downloadContentPack(url: string) {
  return async (dispatch: Dispatch, getState: any) => {
    await client.service('content-pack').update(null, {
      manifestUrl: url
    })
  }
}

export function uploadScenes(data: any) {
  return async (dispatch: Dispatch, getState: any) => {
    data.each(async (data) => {})
  }
}
