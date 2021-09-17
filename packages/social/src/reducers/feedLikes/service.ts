import { Dispatch } from 'redux'
import { dispatchAlertError } from '@xrengine/client-core/src/common/reducers/alert/service'
import { client } from '@xrengine/client-core/src/feathers'
import { fetchingFeedLikes, feedLikesRetrieved } from './actions'
import { addFeedLike, removeFeedLike } from '../feed/actions'

export function getFeedLikes(feedId: string) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      dispatch(fetchingFeedLikes())
      const feedsResults = await client.service('feed-likes').find({ query: { feedId: feedId } })
      dispatch(feedLikesRetrieved(feedsResults.data))
    } catch (err) {
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function addLikeToFeed(feedId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('feed-likes').create({ feedId })
      dispatch(addFeedLike(feedId))
    } catch (err) {
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function removeLikeToFeed(feedId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('feed-likes').remove(feedId)
      dispatch(removeFeedLike(feedId))
    } catch (err) {
      dispatchAlertError(dispatch, err.message)
    }
  }
}
