/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { Creator } from '@xrengine/common/src/interfaces/Creator'
import { Dispatch } from 'redux'
import { upload } from '@xrengine/client-core/src/util/upload'
import { AlertService } from '@xrengine/client-core/src/common/reducers/alert/AlertService'
import { client } from '@xrengine/client-core/src/feathers'
import { CreatorAction } from './CreatorActions'

export const CreatorService = {
  createCreator: (data?: any) => {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
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
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  getLoggedCreator: () => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        dispatch(CreatorAction.fetchingCurrentCreator())
        const creator = await client.service('creator').find({ query: { action: 'current' } })
        dispatch(CreatorAction.creatorLoggedRetrieved(creator))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  fetchCreatorAsAdmin: () => {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
      try {
        const result = await client.service('creator').find({ query: { action: 'admin' } })
        dispatch(CreatorAction.creatorLoggedRetrieved(result))
      } catch (error) {
        console.error(error)
      }
    }
  },
  getCreators: (limit?: number) => {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
      try {
        dispatch(CreatorAction.fetchingCreators())
        const results = await client.service('creator').find({ query: {} })
        dispatch(CreatorAction.creatorsRetrieved(results))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  getCreator: (creatorId) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        dispatch(CreatorAction.fetchingCreator())
        const creator = await client.service('creator').get(creatorId)
        dispatch(CreatorAction.creatorRetrieved(creator))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  updateCreator: (creator: Creator) => {
    return async (dispatch: Dispatch): Promise<any> => {
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
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  //---------------------------NOT used for now
  getCreatorNotificationList: () => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        dispatch(CreatorAction.fetchingCreator())
        const notificationList = await client.service('notifications').find({ query: { action: 'byCurrentCreator' } })
        dispatch(CreatorAction.creatorNotificationList(notificationList))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  followCreator: (creatorId: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const follow = await client.service('follow-creator').create({ creatorId })
        follow && dispatch(CreatorAction.updateCreatorAsFollowed())
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  unFollowCreator: (creatorId: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const follow = await client.service('follow-creator').remove(creatorId)
        follow && dispatch(CreatorAction.updateCreatorNotFollowed())
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  getFollowersList: (creatorId: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const list = await client.service('follow-creator').find({ query: { action: 'followers', creatorId } })
        dispatch(CreatorAction.creatorFollowers(list.data))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  getFollowingList: (creatorId: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const list = await client.service('follow-creator').find({ query: { action: 'following', creatorId } })
        dispatch(CreatorAction.creatorFollowing(list.data))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  deleteCreator: (creatorId: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        await client.service('creator').remove(creatorId)
        dispatch(CreatorAction.removeCreator(creatorId))
      } catch (err) {
        console.log(err)
      }
    }
  }
}
