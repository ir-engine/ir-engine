/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { Dispatch } from 'redux'
import { AlertService } from '../../../common/reducers/alert/AlertService'
import { client } from '../../../feathers'
import { upload } from '@xrengine/engine/src/scene/functions/upload'

import { accessAuthState } from '../../../user/reducers/auth/AuthState'

import { FeedAction } from './FeedActions'

export const FeedService = {
  getFeeds: (type: string, id?: string, limit?: number) => {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
      try {
        const feedsResults = []
        if (type && (type === 'featured' || type === 'featuredGuest')) {
          dispatch(FeedAction.fetchingFeaturedFeeds())
          const feedsResults = await client.service('feed').find({
            query: {
              action: type
            }
          })
          dispatch(FeedAction.feedsFeaturedRetrieved(feedsResults.data))
        } else if (type && type === 'creator') {
          dispatch(FeedAction.fetchingCreatorFeeds())
          const feedsResults = await client.service('feed').find({
            query: {
              action: 'creator',
              creatorId: id
            }
          })
          dispatch(FeedAction.feedsCreatorRetrieved(feedsResults.data))
        } else if (type && type === 'fired') {
          dispatch(FeedAction.fetchingFiredFeeds())
          const feedsResults = await client.service('feed').find({
            query: {
              action: 'fired',
              creatorId: id
            }
          })
          dispatch(FeedAction.feedsFiredRetrieved(feedsResults.data))
        } else if (type && type === 'bookmark') {
          dispatch(FeedAction.fetchingBookmarkedFeeds())
          const feedsResults = await client.service('feed').find({
            query: {
              action: 'bookmark',
              creatorId: id
            }
          })
          dispatch(FeedAction.feedsBookmarkRetrieved(feedsResults.data))
        } else if (type && type === 'myFeatured') {
          dispatch(FeedAction.fetchingMyFeaturedFeeds())
          const feedsResults = await client.service('feed').find({
            query: {
              action: 'myFeatured',
              creatorId: id
            }
          })
          dispatch(FeedAction.feedsMyFeaturedRetrieved(feedsResults.data))
        } else if (type && type === 'admin') {
          const user = accessAuthState().user
          if (user.userRole.value === 'admin') {
            dispatch(FeedAction.fetchingAdminFeeds())
            const feedsResults = await client.service('feed').find({
              query: {
                action: 'admin'
              }
            })
            dispatch(FeedAction.feedsAdminRetrieved(feedsResults))
          }
        } else {
          const feedsResults = await client.service('feed').find({ query: { action: type || '' } })
          dispatch(FeedAction.feedsRetrieved(feedsResults.data))
        }
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  getFeed: (feedId: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        dispatch(FeedAction.fetchingFeeds())
        const feed = await client.service('feed').get(feedId)
        dispatch(FeedAction.feedRetrieved(feed))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  addViewToFeed: (feedId: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        await client.service('feed').patch(feedId, { viewsCount: feedId })
        dispatch(FeedAction.addFeedView(feedId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  createFeed: ({ title, description, video, preview }: any) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        dispatch(FeedAction.fetchingFeeds())
        const storedVideo = (await upload(video, null)) as any
        const storedPreview = (await upload(preview, null)) as any

        if (storedVideo && storedPreview) {
          const feed = await client
            .service('feed')
            .create({ title, description, videoId: storedVideo.file_id, previewId: storedPreview.file_id })
          dispatch(FeedAction.addFeed(feed))
          const mediaLinks = { video: storedVideo.origin, preview: storedPreview.origin }
          return mediaLinks
        }
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  updateFeedAsAdmin: (feedId: string, feed: any) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        if (feed.video) {
          const storedVideo = await upload(feed.video, null)
          feed.videoId = (storedVideo as any).file_id
          delete feed.video
        }
        if (feed.preview) {
          const storedPreview = await upload(feed.preview, null)
          feed.previewId = (storedPreview as any).file_id
          delete feed.preview
        }
        const updatedFeed = await client.service('feed').patch(feedId, feed)
        dispatch(FeedAction.updateFeedInList(updatedFeed))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  setFeedAsFeatured: (feedId: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        await client.service('feed').patch(feedId, { featured: 1 })
        dispatch(FeedAction.feedAsFeatured(feedId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  setFeedNotFeatured: (feedId: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        await client.service('feed').patch(feedId, { featured: 0 })
        dispatch(FeedAction.feedNotFeatured(feedId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  removeFeed: (feedId: string, previewImageUrl: string, videoUrl: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const findIdInUrl = (url) => {
          const urlSplit = url.split('/')
          return urlSplit.sort((a, b) => {
            return b.length - a.length
          })[0]
        }

        await client.service('static-resource').remove(findIdInUrl(previewImageUrl))
        await client.service('static-resource').remove(findIdInUrl(videoUrl))
        await client.service('feed').remove(feedId)
        dispatch(FeedAction.deleteFeed(feedId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  clearCreatorFeatured: () => {
    return async (dispatch: Dispatch): Promise<any> => {
      dispatch(FeedAction.reduxClearCreatorFeatured())
    }
  },
  setLastFeedVideoUrl: (filepath: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        dispatch(FeedAction.lastFeedVideoUrl(filepath))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  }
}
