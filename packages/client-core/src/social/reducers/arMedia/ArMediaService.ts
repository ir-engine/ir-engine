/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { Dispatch } from 'redux'
import { AlertService } from '../../../common/reducers/alert/AlertService'
import { client } from '@xrengine/client-core/src/feathers'
import { ArMediaAction } from './ArMediaActions'
import { upload } from '../../../util/upload'

export const ArMediaService = {
  getArMediaService: (type?: string, limit: Number = 12) => {
    return async (dispatch: Dispatch): Promise<any> => {
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
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  getArMedia: (type?: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        dispatch(ArMediaAction.fetchingArMedia())
        const list = await client.service('ar-media').find({ query: { action: type || null } })
        dispatch(ArMediaAction.setArMedia(list.data))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  getArMediaItem: (itemId: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        dispatch(ArMediaAction.fetchingArMediaItem(itemId))
        const item = await client.service('ar-media').get(itemId)
        dispatch(ArMediaAction.retrievedArMediaItem(item))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
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
  createArMedia: (mediaItem: any, files: any) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const file = await ArMediaService.uploadFile(files)
        const newItem = await client.service('ar-media').create({
          ...mediaItem,
          ...file
        })
        dispatch(ArMediaAction.addAdminArMedia(newItem))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  updateArMedia: (mediaItem, files, id) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const result = await ArMediaService.uploadFile(files)
        const newItem = await client.service('ar-media').patch(id, {
          ...mediaItem,
          ...result
        })
        dispatch(ArMediaAction.updateAdminArMedia(newItem))
      } catch (error) {
        console.error(error)
        AlertService.dispatchAlertError(dispatch, error.message)
      }
    }
  },
  removeArMedia: (mediaItemId: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        await client.service('ar-media').remove(mediaItemId)
        dispatch(ArMediaAction.removeArMediaItem(mediaItemId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  }
}
