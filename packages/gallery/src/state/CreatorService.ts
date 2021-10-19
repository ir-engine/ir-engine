/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { Creator } from '@xrengine/common/src/interfaces/Creator'
import { upload } from '@xrengine/client-core/src/util/upload'
import { AlertService } from '@xrengine/client-core/src/common/state/AlertService'
import { client } from '@xrengine/client-core/src/feathers'
import { CreatorAction } from './CreatorActions'
import { useDispatch } from '@xrengine/client-core/src/store'

export const CreatorService = {
  createCreator: async (data?: any) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(CreatorAction.fetchingCurrentCreator())
        if (!data) {
          data = {}
          let userNumber = Math.floor(Math.random() * 1000) + 1
          data.name = 'User' + userNumber
          data.username = 'user_' + userNumber
        }

        const creator = await client.service('creator').create(data)
        dispatch(CreatorAction.creatorLoggedRetrieved(creator))
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
  fetchCreatorAsAdmin: async () => {
    const dispatch = useDispatch()
    {
      try {
        const result = await client.service('creator').find({ query: { action: 'admin' } })
        dispatch(CreatorAction.creatorLoggedRetrieved(result))
      } catch (error) {
        console.error(error)
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
  updateCreator: async (creator: Creator) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(CreatorAction.fetchingCurrentCreator())
        if (creator.newAvatar) {
          const storedAvatar = await upload(creator.newAvatar, null)
          ;(creator as any).avatarId = (storedAvatar as any).file_id
          delete creator.newAvatar
        }
        const updatedCreator = await client.service('creator').patch(creator.id, creator)
        dispatch(CreatorAction.creatorLoggedRetrieved(updatedCreator))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
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
  },
  deleteCreator: async (creatorId: string) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('creator').remove(creatorId)
        dispatch(CreatorAction.removeCreator(creatorId))
      } catch (err) {
        console.log(err)
      }
    }
  }
}
