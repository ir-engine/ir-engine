/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import { Dispatch } from 'redux'
import { dispatchAlertError } from '../../../common/reducers/alert/service'
import { client } from '../../../feathers'
import Api from '../../../world/components/editor/Api'
import {
  addTipsAndTricks,
  fetchingTipsAndTricks,
  tips_and_tricksRetrieved,
  deleteTipsAndTricks,
  updateTipsAndTricksInList
} from './actions'

export function getTipsAndTricks() {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      dispatch(fetchingTipsAndTricks())
      const tips_and_tricks = await client.service('tips-and-tricks').find()
      dispatch(tips_and_tricksRetrieved(tips_and_tricks.data))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function createTipsAndTricksNew(data) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const api = new Api()
      const storedVideo = await api.upload(data.video, null)
      const tips_and_tricks = await client.service('tips-and-tricks').create({
        title: data.title,
        // @ts-ignore
        videoId: storedVideo.file_id,
        description: data.description
      })
      // console.log('tips_and_tricks REDUX API CHECK', tips_and_tricks)
      dispatch(addTipsAndTricks(tips_and_tricks))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function updateTipsAndTricksAsAdmin(data: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      let tips_and_tricks = { id: data.id, title: data.title, videoId: data.video, description: data.description }
      if (typeof data.video === 'object') {
        const api = new Api()
        const storedVideo = await api.upload(data.video, null)
        // @ts-ignore
        tips_and_tricks['videoId'] = storedVideo.file_id
      }
      const updatedItem = await client.service('tips-and-tricks').patch(tips_and_tricks.id, tips_and_tricks)
      // console.log(updatedItem)
      dispatch(updateTipsAndTricksInList(updatedItem))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function removeTipsAndTricks(tips_and_tricksId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('tips-and-tricks').remove(tips_and_tricksId)
      dispatch(deleteTipsAndTricks(tips_and_tricksId))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}
