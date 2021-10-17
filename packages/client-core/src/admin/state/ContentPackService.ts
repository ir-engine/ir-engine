import { useDispatch } from '../../store'
import { client } from '../../feathers'
import { ContentPackAction } from './ContentPackActions'

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
  addProjectsToContentPack: async (data: any) => {
    const dispatch = useDispatch()
    const result = await client.service('content-pack').patch(null, data)
    console.log('Patch content-pack with reality-pack(s) result', result)
    dispatch(ContentPackAction.patchedContentPack())
  },
  uploadProject: async (data: any) => {
    const dispatch = useDispatch()
    const result = await client.service('upload-project').create(data)
    console.log('Upload project result', result)
    dispatch(ContentPackAction.postProject())
  },
  downloadContentPack: async (url: string) => {
    await client.service('content-pack').update(null, {
      manifestUrl: url
    })
  },
  uploadScenes: (data: any) => {
    data.each(async (data) => {})
  }
}
