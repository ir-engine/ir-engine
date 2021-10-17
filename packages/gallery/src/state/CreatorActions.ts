/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */

import { Creator, CreatorShort, CreatorNotification } from '@xrengine/common/src/interfaces/Creator'

export const CreatorAction = {
  creatorLoggedRetrieved: (creator: Creator) => {
    return {
      type: 'CURRENT_CREATOR_RETRIEVED' as const,
      creator
    }
  },
  creatorRetrieved: (creator: Creator) => {
    return {
      type: 'CREATOR_RETRIEVED' as const,
      creator: creator
    }
  },
  fetchingCreators: () => {
    return {
      type: 'CREATORS_FETCH' as const
    }
  },
  fetchingCurrentCreator: () => {
    return {
      type: 'CURRENT_CREATOR_FETCH' as const
    }
  },
  fetchingCreator: () => {
    return {
      type: 'CREATOR_FETCH' as const
    }
  },
  creatorsRetrieved: (creators: CreatorShort[]) => {
    return {
      type: 'CREATORS_RETRIEVED' as const,
      creators
    }
  },
  creatorNotificationList: (notifications: CreatorNotification[]) => {
    return {
      type: 'CREATOR_NOTIFICATION_LIST_RETRIEVED' as const,
      notifications
    }
  },
  updateCreatorAsFollowed: () => {
    return {
      type: 'SET_CREATOR_AS_FOLLOWED' as const
    }
  },
  updateCreatorNotFollowed: () => {
    return {
      type: 'SET_CREATOR_NOT_FOLLOWED' as const
    }
  },
  creatorFollowers: (creators: CreatorShort[]) => {
    return {
      type: 'CREATOR_FOLLOWERS_RETRIEVED' as const,
      creators
    }
  },
  creatorFollowing: (creators: CreatorShort[]) => {
    return {
      type: 'CREATOR_FOLLOWING_RETRIEVED' as const,
      creators
    }
  },
  removeCreator: (id: string) => {
    return {
      type: 'CREATOR_REMOVED' as const,
      id
    }
  }
}

export type CreatorActionType = ReturnType<typeof CreatorAction[keyof typeof CreatorAction]>
