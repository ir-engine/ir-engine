/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { CreatorActionType } from './CreatorActions'
import { Creator, CreatorShort, CreatorNotification } from '@standardcreative/common/src/interfaces/Creator'

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
    fetching: false,
    blocked: [] as Array<CreatorShort>,
    splashTimeout: true,
    updateNeeded: false
  }
})

export const receptor = (action: CreatorActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'SET_STATE_CREATORS':
        return s.creators.splashTimeout.set(action.splashTimeout)
      case 'CURRENT_CREATOR_FETCH':
        return s.creators.fetchingCurrentCreator.set(true)
      case 'CURRENT_CREATOR_RETRIEVED':
        return s.creators.merge({
          currentCreator: action.creator,
          creators: s.creators.creators?.value.map((creator) => {
            if (creator.id === action.creator.id) {
              return { ...action.creator }
            }
            return { ...creator }
          }),
          fetchingCurrentCreator: false
        })

      case 'CREATOR_FETCH':
        return s.creators.merge({ fetchingCreator: true, creator: { id: '', name: '', username: '' } })
      case 'CREATOR_RETRIEVED':
        return s.creators.merge({ creator: action.creator, fetchingCreator: false })
      case 'CREATORS_FETCH':
        return s.creators.merge({ fetchingCreators: true, creators: [] })
      case 'CREATORS_RETRIEVED':
        return s.creators.merge({ creators: action.creators, fetchingCreators: false })

      case 'CREATOR_NOTIFICATION_LIST_RETRIEVED':
        return s.creators.merge({ currentCreatorNotifications: action.notifications, fetching: false })

      case 'SET_CREATOR_AS_FOLLOWED':
        return s.creators.creator.followed.set(true)
      case 'SET_CREATOR_NOT_FOLLOWED':
        return s.creators.creator.followed.set(false)
      case 'SET_CREATOR_AS_BLOCKED':
        const newCreators = [...s.creators.creators.value]
        const idBlockedCreator = newCreators.findIndex(
          (item) => item.id === (action as { type: string; creatorId: string }).creatorId
        )
        newCreators.splice(idBlockedCreator, 1)
        s.creators.creator.blocked.set(true)
        return s.creators.creators.set(newCreators)

      case 'SET_CREATOR_AS_UN_BLOCKED':
        // вместо этого сделать запрос
        const blocked = [...s.creators.blocked.value]
        const unBlockedCreatorId = blocked.findIndex(
          (blockedCreator) =>
            blockedCreator.userId === (action as { type: string; blokedCreatorId: string }).blokedCreatorId
        )
        blocked.splice(unBlockedCreatorId, 1)
        return s.creators.blocked.set(blocked)

      case 'CREATOR_BLOCKED_RETRIEVED':
        return s.creators.blocked.set(action.creators)

      case 'CREATOR_FOLLOWERS_RETRIEVED':
        return s.creators.followers.set(action.creators)
      case 'CREATOR_FOLLOWING_RETRIEVED':
        return s.creators.following.set(action.creators)
    }
  }, action.type)
}

export const accessCreatorState = () => state
export const useCreatorState = () => useState(state)
