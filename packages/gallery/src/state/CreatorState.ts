/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { CreatorActionType } from './CreatorActions'
import { Creator, CreatorShort, CreatorNotification } from '@xrengine/common/src/interfaces/Creator'
const state = createState({
  creators: {
    creators: [] as Array<Creator>,
    fetchingCreators: false,
    creator: {} as Creator,
    fetchingCreator: false,
    currentCreator: {} as Creator,
    fetchingCurrentCreator: false,
    currentCreatorNotifications: [] as Array<CreatorNotification>,
    followers: [] as Array<CreatorShort>,
    following: [] as Array<CreatorShort>,
    fetching: false
  },
  updateNeeded: true,
  lastFetched: Date.now()
})

export const receptor = (action: CreatorActionType): any => {
  state.batch((s) => {
    let creators
    switch (action.type) {
      case 'CURRENT_CREATOR_FETCH':
        return s.creators.fetchingCurrentCreator.set(true)
      case 'CURRENT_CREATOR_RETRIEVED':
        creators = s.creators.creators?.value?.map((creator) => {
          if (creator.id === action.creator.id) {
            return { ...action.creator }
          }
          return { ...creator }
        })
        s.creators.currentCreator.set(action.creator)
        s.creators.creators.set(creators)
        s.creators.fetchingCurrentCreator.set(false)
        s.updateNeeded.set(false)
        return s.lastFetched.set(Date.now())

      case 'CREATOR_FETCH':
        return s.creators.merge({ fetchingCreator: true, creator: {} })
      case 'CREATOR_RETRIEVED':
        return s.creators.merge({ creator: action.creator, fetchingCreator: false })
      case 'CREATORS_FETCH':
        return s.creators.merge({ fetchingCreators: true, creators: [] })
      case 'CREATORS_RETRIEVED':
        return s.creators.merge({ creators: action.creators, fetchingCreators: false })
      case 'CREATOR_NOTIFICATION_LIST_RETRIEVED':
        return s.creators.merge({ currentCreatorNotifications: action.notifications, fetching: false })
      case 'SET_CREATOR_AS_FOLLOWED':
        return s.creators.creator.set({ ...s.creators.creator.value, followed: true })
      case 'SET_CREATOR_NOT_FOLLOWED':
        return s.creators.creator.set({ ...s.creators.creator.value, followed: false })
      case 'CREATOR_FOLLOWERS_RETRIEVED':
        return s.creators.followers.set(action.creators)
      case 'CREATOR_FOLLOWING_RETRIEVED':
        return s.creators.following.set(action.creators)
      case 'CREATOR_REMOVED':
        creators = s.creators.creators?.value?.filter((creator) => creator.id !== action.id)
        s.creators.currentCreator.set(none)
        return s.creators.creator.set(creators)
    }
  }, action.type)
}

export const accessCreatorState = () => state
export const useCreatorState = () => useState(state)
