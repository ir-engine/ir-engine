import Api from '../../../../../world/components/editor/Api'
import { Dispatch } from 'redux'
import { client } from '../../../../../feathers'
import { addAdminArMedia, updateAdminArMedia, removeArMediaItem, fetchingArMedia, setAdminArMedia } from './actions'
import { dispatchAlertError } from '../../../../../common/reducers/alert/service'

/**
 *
 * @param files FIle type
 * @returns URL
 * @author KIMENYI Kevin <kimenyikevin@gmail.com>
 */
export function getArMediaService(type?: string, limit: Number = 12) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      dispatch(fetchingArMedia())
      const list = await client.service('ar-media').find({
        query: {
          action: type,
          $limit: limit
        }
      })
      dispatch(setAdminArMedia(list))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

const uploadtFIle = async (files) => {
  const api = new Api()
  const manifest = files.manifest instanceof File ? await api.upload(files.manifest, null) : null
  const audio = files.audio instanceof File ? await api.upload(files.audio, null) : null
  const dracosis = files.dracosis instanceof File ? await api.upload(files.dracosis, null) : null
  const preview = files.preview instanceof File ? await api.upload(files.preview, null) : null
  return {
    manifestId: manifest?.file_id,
    audioId: audio?.file_id,
    dracosisId: dracosis?.file_id,
    previewId: preview?.file_id
  }
}

export function createArMedia(mediaItem: any, files: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const file = await uploadtFIle(files)
      //@ts-ignore error that this vars are void because upload is defines as void function
      const newItem = await client.service('ar-media').create({
        ...mediaItem,
        ...file
      })
      dispatch(addAdminArMedia(newItem))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export const updateArMedia =
  (mediaItem, files, id) =>
  async (dispatch: Dispatch): Promise<any> => {
    try {
      const result = await uploadtFIle(files)
      const newItem = await client.service('ar-media').patch(id, {
        ...mediaItem,
        ...result
      })
      dispatch(updateAdminArMedia(newItem))
    } catch (error) {
      console.error(error)
      dispatchAlertError(dispatch, error.message)
    }
  }

export function removeArMedia(mediaItemId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('ar-media').remove(mediaItemId)
      dispatch(removeArMediaItem(mediaItemId))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}
