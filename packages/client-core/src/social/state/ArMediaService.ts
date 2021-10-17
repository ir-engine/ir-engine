/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { useDispatch } from '../../store'
import { AlertService } from '../../common/state/AlertService'
import { client } from '../../feathers'
import { ArMediaAction } from './ArMediaActions'
import { upload } from '../../util/upload'

export const ArMediaService = {
  getArMediaService: async (type?: string, limit: Number = 12) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(ArMediaAction.fetchingArMedia())
        const list = await client.service('ar-media').find({
          query: {
            action: type,
            $limit: limit
          }
        })
        dispatch(ArMediaAction.setAdminArMedia(list))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  getArMedia: async (type?: string) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(ArMediaAction.fetchingArMedia())
        const list = await client.service('ar-media').find({ query: { action: type || null } })
        dispatch(ArMediaAction.setArMedia(list.data))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  getArMediaItem: async (itemId: string) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(ArMediaAction.fetchingArMediaItem(itemId))
        const item = await client.service('ar-media').get(itemId)
        dispatch(ArMediaAction.retrievedArMediaItem(item))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  uploadFile: async (files) => {
    const manifest = files.manifest instanceof File ? ((await upload(files.manifest, null)) as any) : null
    const audio = files.audio instanceof File ? ((await upload(files.audio, null)) as any) : null
    const dracosis = files.dracosis instanceof File ? ((await upload(files.dracosis, null)) as any) : null
    const preview = files.preview instanceof File ? ((await upload(files.preview, null)) as any) : null
    return {
      manifestId: manifest?.file_id,
      audioId: audio?.file_id,
      dracosisId: dracosis?.file_id,
      previewId: preview?.file_id
    }
  },
  createArMedia: async (mediaItem: any, files: any) => {
    const dispatch = useDispatch()
    {
      try {
        const file = await ArMediaService.uploadFile(files)
        const newItem = await client.service('ar-media').create({
          ...mediaItem,
          ...file
        })
        dispatch(ArMediaAction.addAdminArMedia(newItem))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  updateArMedia: async (mediaItem, files, id) => {
    const dispatch = useDispatch()
    {
      try {
        const result = await ArMediaService.uploadFile(files)
        const newItem = await client.service('ar-media').patch(id, {
          ...mediaItem,
          ...result
        })
        dispatch(ArMediaAction.updateAdminArMedia(newItem))
      } catch (error) {
        console.error(error)
        AlertService.dispatchAlertError(error.message)
      }
    }
  },
  removeArMedia: async (mediaItemId: string) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('ar-media').remove(mediaItemId)
        dispatch(ArMediaAction.removeArMediaItem(mediaItemId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  }
}
