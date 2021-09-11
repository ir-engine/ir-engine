/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import Immutable from 'immutable'
import {
  CreatorsAction,
  CreatorRetrievedAction,
  CreatorsRetrievedAction,
  CreatorsNotificationsRetrievedAction
} from './actions'

import {
  CREATORS_RETRIEVED,
  CREATOR_FETCH,
  CREATOR_FOLLOWERS_RETRIEVED,
  CREATOR_NOTIFICATION_LIST_RETRIEVED,
  CREATOR_RETRIEVED,
  CURRENT_CREATOR_RETRIEVED,
  SET_CREATOR_AS_FOLLOWED,
  SET_CREATOR_NOT_FOLLOWED,
  CREATOR_FOLLOWING_RETRIEVED,
  CREATORS_FETCH,
  CURRENT_CREATOR_FETCH,
  SET_CREATOR_AS_BLOCKED,
  CREATOR_BLOCKED_RETRIEVED
} from '../actions'

export const initialCreatorState = {
  creators: {
    creators: [],
    fetchingCreators: false,
    creator: {},
    fetchingCreator: false,
    currentCreator: {},
    fetchingCurrentCreator: false,
    currentCreatorNotifications: {},
    followers: [],
    following: [],
    fetching: false,
    blocked: []
  }
}

const immutableState = Immutable.fromJS(initialCreatorState)

const creatorReducer = (state = immutableState, action: CreatorsAction): any => {
  switch (action.type) {
    case CURRENT_CREATOR_FETCH:
      return state.set('fetchingCurrentCreator', true)
    case CURRENT_CREATOR_RETRIEVED:
      return state
        .set('currentCreator', (action as CreatorRetrievedAction).creator)
        .set(
          'creators',
          state.get('creators')?.map((creator) => {
            if (creator.id === (action as CreatorRetrievedAction).creator.id) {
              return { ...(action as CreatorRetrievedAction).creator }
            }
            return { ...creator }
          })
        )
        .set('fetchingCurrentCreator', false)

    case CREATOR_FETCH:
      return state.set('fetchingCreator', true).set('creator', {})
    case CREATOR_RETRIEVED:
      return state.set('creator', (action as CreatorRetrievedAction).creator).set('fetchingCreator', false)

    case CREATORS_FETCH:
      return state.set('fetchingCreators', true).set('creators', [])
    case CREATORS_RETRIEVED:
      return state.set('creators', (action as CreatorsRetrievedAction).creators).set('fetchingCreators', false)

    case CREATOR_NOTIFICATION_LIST_RETRIEVED:
      return state
        .set('currentCreatorNotifications', (action as CreatorsNotificationsRetrievedAction).notifications)
        .set('fetching', false)

    case SET_CREATOR_AS_FOLLOWED:
      return state.set('creator', { ...state.get('creator'), followed: true })

    case SET_CREATOR_NOT_FOLLOWED:
      return state.set('creator', { ...state.get('creator'), followed: false })

    case SET_CREATOR_AS_BLOCKED:
      return state.set('creator', { ...state.get('creator'), blocked: true })

    case CREATOR_BLOCKED_RETRIEVED:
      return state.set('blocked', (action as CreatorsRetrievedAction).creators)

    case CREATOR_FOLLOWERS_RETRIEVED:
      return state.set('followers', (action as CreatorsRetrievedAction).creators)

    case CREATOR_FOLLOWING_RETRIEVED:
      return state.set('following', (action as CreatorsRetrievedAction).creators)
  }
  return state
}

export default creatorReducer
