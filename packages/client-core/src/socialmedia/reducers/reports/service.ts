/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */

import { Dispatch } from 'redux'
import { dispatchAlertError } from '../../../common/reducers/alert/service'
import { client } from '../../../feathers'
import Api from '../../../world/components/editor/Api'
import { addReports, fetchingReports, reportsRetrieved, deleteReports, updateReportsInList } from './actions'

export function getReportsNew() {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      dispatch(fetchingReports())
      const reports = await client.service('reports').find()
      dispatch(reportsRetrieved(reports.data))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}
const func = async () => {
	await console.log('createReportsNew adawdawdawwdawdwa')
}

export const createReportsNew = (data: any) => {
  console.log('createReportsNew Redux Before')
  return async (dispatch: Dispatch) => {
	  console.log('createReportsNew Redux Beetween')
    try {
      const reports = await client.service('reports').create({
        title: data.title,
        feedId: data.feedId,
        description: data.description
      })
      dispatch(addReports(reports))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function updateReportsAsAdmin(data: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      let reports = { id: data.id, title: data.title, videoId: data.video, description: data.description }
      if (typeof data.video === 'object') {
        const api = new Api()
        const storedVideo = await api.upload(data.video, null)
        // @ts-ignore
        reports['videoId'] = storedVideo.file_id
      }
      const updatedItem = await client.service('reports').patch(reports.id, reports)
      dispatch(updateReportsInList(updatedItem))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function removeReports(reportsId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('reports').remove(reportsId)
      dispatch(deleteReports(reportsId))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}
