/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { AlertService } from '../../../common/reducers/alert/AlertService'
import { client } from '../../../feathers'
import { Creator } from '@xrengine/common/src/interfaces/Creator'
import { upload } from '@xrengine/engine/src/scene/functions/upload'
import { Dispatch, bindActionCreators } from 'redux'

import { CreatorAction } from './CreatorActions'

export const CreatorService = {
  createCreator: (creator?: Creator) => {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
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
  updateCreator: (creator: Creator, callBack?: Function) => {
    return async (dispatch: Dispatch): Promise<any> => {
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
        AlertService.dispatchAlertError(dispatch, err.message)
        if (callBack) {
          callBack(err.message)
        }
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
  blockCreator: (creatorId: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const follow = await client.service('block-creator').create({ creatorId })
        follow && dispatch(CreatorAction.updateCreatorAsBlocked(creatorId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  unBlockCreator: (blokedCreatorId: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const follow = await client.service('block-creator').remove({ blokedCreatorId })
        if (follow) {
          bindActionCreators(CreatorService.getBlockedList, dispatch)(follow)
          bindActionCreators(CreatorService.getCreators, dispatch)()
        }
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  getBlockedList: (creatorId: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const list = await client.service('block-creator').find({ query: { action: 'blocked', creatorId } })
        dispatch(CreatorAction.creatorBlockedUsers(list.data))
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
  }
}
