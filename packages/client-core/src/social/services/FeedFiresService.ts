/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { store, useDispatch } from '../../store'
import { AlertService } from '../../common/services/AlertService'
import { client } from '../../feathers'
import { FeedAction } from './FeedService'
import { CreatorShort } from '@xrengine/common/src/interfaces/Creator'
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'

//State
const state = createState({
  feedFires: {
    feedFires: [] as Array<CreatorShort>,
    fetching: false
  }
})

store.receptors.push((action: FeedFiresActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'FEED_FIRES_FETCH':
        return s.feedFires.fetching.set(true)
      case 'FEED_FIRES_RETRIEVED':
        return s.feedFires.merge({ feedFires: action.feedFires, fetching: false })
    }
  }, action.type)
})

export const accessFeedFiresState = () => state
export const useFeedFiresState = () => useState(state)

//Service
export const FeedFiresService = {
  getFeedFires: async (feedId: string) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(FeedFiresAction.fetchingFeedFires())
        const feedsResults = await client.service('feed-fires').find({ query: { feedId: feedId } })
        dispatch(FeedFiresAction.feedFiresRetrieved(feedsResults.data))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  addFireToFeed: async (feedId: string) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('feed-fires').create({ feedId })
        dispatch(FeedAction.addFeedFire(feedId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  removeFireToFeed: async (feedId: string) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('feed-fires').remove(feedId)
        dispatch(FeedAction.removeFeedFire(feedId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  }
}

//Action

export const FeedFiresAction = {
  feedFiresRetrieved: (feedFires: CreatorShort[]) => {
    return {
      type: 'FEED_FIRES_RETRIEVED' as const,
      feedFires: feedFires
    }
  },
  fetchingFeedFires: () => {
    return {
      type: 'FEED_FIRES_FETCH' as const
    }
  }
}

export type FeedFiresActionType = ReturnType<typeof FeedFiresAction[keyof typeof FeedFiresAction]>
