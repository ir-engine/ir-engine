import { upload } from '@xrengine/engine/src/scene/functions/upload'
import { Dispatch } from 'redux'
import { client } from '@xrengine/client-core/src/feathers'
import { addAdminArMedia, updateAdminArMedia, removeArMediaItem, fetchingArMedia, setAdminArMedia } from './actions'
import { dispatchAlertError } from '@xrengine/client-core/src/common/reducers/alert/service'

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

const uploadFile = async (files) => {
  const manifest = files.manifest instanceof File ? await upload(files.manifest, null) : null
  const audio = files.audio instanceof File ? await upload(files.audio, null) : null
  const dracosis = files.dracosis instanceof File ? await upload(files.dracosis, null) : null
  const preview = files.preview instanceof File ? await upload(files.preview, null) : null
  return {
    manifestId: (manifest as any)?.file_id,
    audioId: (audio as any)?.file_id,
    dracosisId: (dracosis as any)?.file_id,
    previewId: (preview as any)?.file_id
  }
}

export function createArMedia(mediaItem: any, files: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const file = await uploadFile(files)
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
      const result = await uploadFile(files)
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
