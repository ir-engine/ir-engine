/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { AlertService } from '../../common/state/AlertService'
import { client } from '../../feathers'
import { Creator } from '@standardcreative/common/src/interfaces/Creator'
import { upload } from '../../util/upload'

import { CreatorAction } from './CreatorActions'
import { useDispatch } from '../../store'

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
