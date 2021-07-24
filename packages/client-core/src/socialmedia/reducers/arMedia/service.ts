/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { Dispatch } from 'redux'
import { dispatchAlertError } from '../../../common/reducers/alert/service'
import { client } from '../../../feathers'
import {
  fetchingArMedia,
  setAdminArMedia,
  setArMedia,
  addAdminArMedia,
  removeArMediaItem,
  fetchingArMediaItem,
  retrievedArMediaItem
} from './actions'
import Api from '../../../world/components/editor/Api'

export function getArMediaService(type?: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      dispatch(fetchingArMedia())
      const list = await client.service('ar-media').find({ query: { action: type } })
      dispatch(setAdminArMedia(list))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function getArMedia(type?: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      dispatch(fetchingArMedia())
      const list = await client.service('ar-media').find({ query: { action: type || null } })
      dispatch(setArMedia(list.data))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function getArMediaItem(itemId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      dispatch(fetchingArMediaItem(itemId))
      const item = await client.service('ar-media').get(itemId)
      dispatch(retrievedArMediaItem(item))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function createArMedia(mediaItem: any, files: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const api = new Api()
      const manifest = await api.upload(files.manifest, null)
      const audio = await api.upload(files.audio, null)
      const dracosis = await api.upload(files.dracosis, null)
      const preview = await api.upload(files.preview, null)
      //@ts-ignore error that this vars are void because upload is defines as void function
      const newItem = await client.service('ar-media').create({
        ...mediaItem,
        manifestId: manifest.file_id,
        audioId: audio.file_id,
        dracosisId: dracosis.file_id,
        previewId: preview.file_id
      })
      dispatch(addAdminArMedia(newItem))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
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
