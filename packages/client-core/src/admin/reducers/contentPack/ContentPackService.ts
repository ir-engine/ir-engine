import { Dispatch } from 'redux'
import { client } from '../../../feathers'
import { ContentPackAction } from './ContentPackActions'

export const ContentPackService = {
  uploadAvatars: (data: any) => {
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
  },
  fetchContentPacks: () => {
    return async (dispatch: Dispatch, getState: any) => {
      const packs = await client.service('content-pack').find({})
      dispatch(ContentPackAction.loadedContentPacks(packs))
    }
  },
  createContentPack: (data: any) => {
    return async (dispatch: Dispatch, getState: any) => {
      await client.service('content-pack').create(data)
      dispatch(ContentPackAction.createdContentPack())
    }
  },
  addScenesToContentPack: (data: any) => {
    return async (dispatch: Dispatch, getState: any) => {
      await client.service('content-pack').patch(null, data)
      dispatch(ContentPackAction.patchedContentPack())
    }
  },
  addAvatarsToContentPack: (data: any) => {
    return async (dispatch: Dispatch) => {
      const result = await client.service('content-pack').patch(null, data)
      dispatch(ContentPackAction.patchedContentPack())
    }
  },
  addProjectToContentPack: (data: any) => {
    return async (dispatch: Dispatch) => {
      const result = await client.service('content-pack').patch(null, data)
      console.log('Patch content-pack with project(s) result', result)
      dispatch(ContentPackAction.patchedContentPack())
    }
  },
  uploadProject: (data: any) => {
    return async (dispatch: Dispatch) => {
      const result = await client.service('upload-project').create(data)
      console.log('Upload project result', result)
      dispatch(ContentPackAction.postProject())
    }
  },
  downloadContentPack: (url: string) => {
    return async (dispatch: Dispatch, getState: any) => {
      await client.service('content-pack').update(null, {
        manifestUrl: url
      })
    }
  },
  uploadScenes: (data: any) => {
    return async (dispatch: Dispatch, getState: any) => {
      data.each(async (data) => {})
    }
  }
}
