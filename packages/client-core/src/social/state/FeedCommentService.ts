/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { store, useDispatch } from '../../store'
import { AlertService } from '../../common/state/AlertService'
import { client } from '../../feathers'
import { FeedCommentAction } from './FeedCommentActions'

export const FeedCommentService = {
  getFeedComments: async (feedId: string, limit?: number) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(FeedCommentAction.fetchingFeedComments())
        const comments = await client.service('comments').find({ query: { feedId } })
        dispatch(FeedCommentAction.feedsCommentsRetrieved(comments.data))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  addCommentToFeed: async (feedId: string, text: string) => {
    const dispatch = useDispatch()
    {
      try {
        const newComment = await client.service('comments').create({ feedId, text })
        dispatch(FeedCommentAction.addFeedComment(newComment))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  addFireToFeedComment: async (commentId: string) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('comments-fires').create({ commentId })
        dispatch(FeedCommentAction.addFeedCommentFire(commentId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  removeFireToFeedComment: async (commentId: string) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('comments-fires').remove(commentId)
        dispatch(FeedCommentAction.removeFeedCommentFire(commentId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  getCommentFires: async (commentId: string, limit?: number) => {
    const dispatch = useDispatch()
    {
      try {
        const comments = await client.service('comments-fires').find({ query: { action: 'comment-fires', commentId } })
        dispatch(FeedCommentAction.commentFires(comments.data))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  }
}
