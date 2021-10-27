/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { AlertService } from '../../common/state/AlertService'
import { client } from '../../feathers'
import { upload } from '../../util/upload'
import { useDispatch, store } from '../../store'
import { Creator, CreatorShort, CreatorNotification } from '@xrengine/common/src/interfaces/Creator'
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'

//State
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

store.receptors.push((action: CreatorActionType): any => {
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
})

export const accessCreatorState = () => state
export const useCreatorState = () => useState(state)

//Service
export const CreatorService = {
  createCreator: async (creator?: Creator) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(CreatorAction.fetchingCurrentCreator())
        let userNumber = Math.floor(Math.random() * 1000) + 1

        let creatorInfo =
          creator != null
            ? creator
            : {
                name: creator?.name || 'User' + userNumber,
                username: creator?.username || 'user_' + userNumber
              }

        const creatorResponse = await client.service('creator').create(creatorInfo)
        dispatch(CreatorAction.creatorLoggedRetrieved(creatorResponse))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  getLoggedCreator: async () => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(CreatorAction.fetchingCurrentCreator())
        const creator = await client.service('creator').find({ query: { action: 'current' } })
        dispatch(CreatorAction.creatorLoggedRetrieved(creator))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  getCreators: async (limit?: number) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(CreatorAction.fetchingCreators())
        const results = await client.service('creator').find({ query: {} })
        dispatch(CreatorAction.creatorsRetrieved(results))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  getCreator: async (creatorId) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(CreatorAction.fetchingCreator())
        const creator = await client.service('creator').get(creatorId)
        dispatch(CreatorAction.creatorRetrieved(creator))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  updateCreator: async (creator: Creator, callBack?: Function) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(CreatorAction.fetchingCurrentCreator())
        if (creator.newAvatar) {
          const storedAvatar = await upload(creator.newAvatar, null)
          //@ts-ignore error that this vars are void because upload is defines as void funtion
          creator.avatarId = storedAvatar.file_id
          delete creator.newAvatar
        }
        const updatedCreator = await client.service('creator').patch(creator.id, creator)
        if (updatedCreator) {
          dispatch(CreatorAction.creatorLoggedRetrieved(updatedCreator))
          if (callBack) {
            callBack('succes')
          }
        }
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
        if (callBack) {
          callBack(err.message)
        }
      }
    }
  },
  //---------------------------NOT used for now
  getCreatorNotificationList: async () => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(CreatorAction.fetchingCreator())
        const notificationList = await client.service('notifications').find({ query: { action: 'byCurrentCreator' } })
        dispatch(CreatorAction.creatorNotificationList(notificationList))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  followCreator: async (creatorId: string) => {
    const dispatch = useDispatch()
    {
      try {
        const follow = await client.service('follow-creator').create({ creatorId })
        follow && dispatch(CreatorAction.updateCreatorAsFollowed())
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  unFollowCreator: async (creatorId: string) => {
    const dispatch = useDispatch()
    {
      try {
        const follow = await client.service('follow-creator').remove(creatorId)
        follow && dispatch(CreatorAction.updateCreatorNotFollowed())
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  blockCreator: async (creatorId: string) => {
    const dispatch = useDispatch()
    {
      try {
        const follow = await client.service('block-creator').create({ creatorId })
        follow && dispatch(CreatorAction.updateCreatorAsBlocked(creatorId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  unBlockCreator: async (blokedCreatorId: string) => {
    const dispatch = useDispatch()
    {
      try {
        const follow = await client.service('block-creator').remove({ blokedCreatorId })
        if (follow) {
          CreatorService.getBlockedList(follow)
          CreatorService.getCreators()
        }
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  getBlockedList: async (creatorId: string) => {
    const dispatch = useDispatch()
    {
      try {
        const list = await client.service('block-creator').find({ query: { action: 'blocked', creatorId } })
        dispatch(CreatorAction.creatorBlockedUsers(list.data))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  getFollowersList: async (creatorId: string) => {
    const dispatch = useDispatch()
    {
      try {
        const list = await client.service('follow-creator').find({ query: { action: 'followers', creatorId } })
        dispatch(CreatorAction.creatorFollowers(list.data))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  getFollowingList: async (creatorId: string) => {
    const dispatch = useDispatch()
    {
      try {
        const list = await client.service('follow-creator').find({ query: { action: 'following', creatorId } })
        dispatch(CreatorAction.creatorFollowing(list.data))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  }
}

//Action
export const CreatorAction = {
  setStateCreators: (splashTimeout: boolean) => {
    return {
      type: 'SET_STATE_CREATORS' as const,
      splashTimeout
    }
  },
  creatorLoggedRetrieved: (creator: Creator) => {
    return {
      type: 'CURRENT_CREATOR_RETRIEVED' as const,
      creator
    }
  },
  creatorRetrieved: (creator: Creator) => {
    return {
      type: 'CREATOR_RETRIEVED' as const,
      creator
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
  updateCreatorAsBlocked: (creatorId: string) => {
    return {
      type: 'SET_CREATOR_AS_BLOCKED' as const,
      creatorId
    }
  },
  updateCreatorAsUnBlocked: (blokedCreatorId: string) => {
    return {
      type: 'SET_CREATOR_AS_UN_BLOCKED' as const,
      blokedCreatorId
    }
  },
  creatorBlockedUsers: (creators: CreatorShort[]) => {
    return {
      type: 'CREATOR_BLOCKED_RETRIEVED' as const,
      creators
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
  }
}

export type CreatorActionType = ReturnType<typeof CreatorAction[keyof typeof CreatorAction]>
