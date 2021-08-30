/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { Dispatch } from 'redux'
import { dispatchAlertError } from '@xrengine/client-core/src/common/reducers/alert/service'
import { client } from '@xrengine/client-core/src/feathers'
import { feedsRetrieved } from '../feed/actions'
import {
  addFeedComment,
  addFeedCommentFire,
  commentFires,
  fetchingFeedComments,
  removeFeedCommentFire
} from './actions'

export function getFeedComments(feedId: string, limit?: number) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      dispatch(fetchingFeedComments())
      const comments = await client.service('comments').find({ query: { feedId } })
      dispatch(feedsRetrieved(comments.data))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function addCommentToFeed(feedId: string, text: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const newComment = await client.service('comments').create({ feedId, text })
      dispatch(addFeedComment(newComment))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function addFireToFeedComment(commentId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('comments-fires').create({ commentId })
      dispatch(addFeedCommentFire(commentId))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function removeFireToFeedComment(commentId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('comments-fires').remove(commentId)
      dispatch(removeFeedCommentFire(commentId))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function getCommentFires(commentId: string, limit?: number) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      const comments = await client.service('comments-fires').find({ query: { action: 'comment-fires', commentId } })
      dispatch(commentFires(comments.data))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}
