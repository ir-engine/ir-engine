/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { Dispatch } from 'redux'
import { AlertService } from '../../../common/reducers/alert/AlertService'
import { client } from '../../../feathers'
import { FeedCommentAction } from './FeedCommentActions'

export const FeedCommentService = {
  getFeedComments: (feedId: string, limit?: number) => {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
      try {
        dispatch(FeedCommentAction.fetchingFeedComments())
        const comments = await client.service('comments').find({ query: { feedId } })
        dispatch(FeedCommentAction.feedsCommentsRetrieved(comments.data))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  addCommentToFeed: (feedId: string, text: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const newComment = await client.service('comments').create({ feedId, text })
        dispatch(FeedCommentAction.addFeedComment(newComment))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  addFireToFeedComment: (commentId: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        await client.service('comments-fires').create({ commentId })
        dispatch(FeedCommentAction.addFeedCommentFire(commentId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  removeFireToFeedComment: (commentId: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        await client.service('comments-fires').remove(commentId)
        dispatch(FeedCommentAction.removeFeedCommentFire(commentId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  getCommentFires: (commentId: string, limit?: number) => {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
      try {
        const comments = await client.service('comments-fires').find({ query: { action: 'comment-fires', commentId } })
        dispatch(FeedCommentAction.commentFires(comments.data))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  }
}
