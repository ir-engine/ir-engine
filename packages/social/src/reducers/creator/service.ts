/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { AlertService } from '@xrengine/client-core/src/common/reducers/alert/AlertService'
import { client } from '@xrengine/client-core/src/feathers'
import { Creator } from '@xrengine/common/src/interfaces/Creator'
import { upload } from '@xrengine/engine/src/scene/functions/upload'
import { Dispatch, bindActionCreators } from 'redux'

import {
  fetchingCreator,
  creatorRetrieved,
  creatorsRetrieved,
  creatorLoggedRetrieved,
  creatorNotificationList,
  updateCreatorAsFollowed,
  updateCreatorNotFollowed,
  creatorFollowers,
  creatorFollowing,
  fetchingCreators,
  fetchingCurrentCreator,
  updateCreatorAsBlocked,
  updateCreatorAsUnBlocked,
  creatorBlockedUsers
} from './actions'

export function createCreator() {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      dispatch(fetchingCurrentCreator())
      let userNumber = Math.floor(Math.random() * 1000) + 1
      const creator = await client.service('creator').create({
        name: 'User' + userNumber,
        username: 'user_' + userNumber
      })
      dispatch(creatorLoggedRetrieved(creator))
    } catch (err) {
      console.log(err)
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}

export function getLoggedCreator() {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      dispatch(fetchingCurrentCreator())
      const creator = await client.service('creator').find({ query: { action: 'current' } })
      dispatch(creatorLoggedRetrieved(creator))
    } catch (err) {
      console.log(err)
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}

export function getCreators(limit?: number) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      dispatch(fetchingCreators())
      const results = await client.service('creator').find({ query: {} })
      dispatch(creatorsRetrieved(results))
    } catch (err) {
      console.log(err)
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}

export function getCreator(creatorId) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      dispatch(fetchingCreator())
      const creator = await client.service('creator').get(creatorId)
      dispatch(creatorRetrieved(creator))
    } catch (err) {
      console.log(err)
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}

export function updateCreator(creator: Creator, callBack: Function) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      dispatch(fetchingCurrentCreator())
      if (creator.newAvatar) {
        const storedAvatar = await upload(creator.newAvatar, null)
        //@ts-ignore error that this vars are void because upload is defines as void funtion
        creator.avatarId = storedAvatar.file_id
        delete creator.newAvatar
      }
      const updatedCreator = await client.service('creator').patch(creator.id, creator)
      if (updatedCreator) {
        dispatch(creatorLoggedRetrieved(updatedCreator))
        callBack('succes')
      }
    } catch (err) {
      console.log(err)
      AlertService.dispatchAlertError(dispatch, err.message)
      callBack(err.message)
    }
  }
}

//---------------------------NOT used for now
export function getCreatorNotificationList() {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      dispatch(fetchingCreator())
      const notificationList = await client.service('notifications').find({ query: { action: 'byCurrentCreator' } })
      dispatch(creatorNotificationList(notificationList))
    } catch (err) {
      console.log(err)
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}

export function followCreator(creatorId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const follow = await client.service('follow-creator').create({ creatorId })
      follow && dispatch(updateCreatorAsFollowed())
    } catch (err) {
      console.log(err)
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}

export function unFollowCreator(creatorId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const follow = await client.service('follow-creator').remove(creatorId)
      follow && dispatch(updateCreatorNotFollowed())
    } catch (err) {
      console.log(err)
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}

export function blockCreator(creatorId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const follow = await client.service('block-creator').create({ creatorId })
      follow && dispatch(updateCreatorAsBlocked(creatorId))
    } catch (err) {
      console.log(err)
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}

export function unBlockCreator(blokedCreatorId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const follow = await client.service('block-creator').remove({ blokedCreatorId })
      if (follow) {
        bindActionCreators(getBlockedList, dispatch)(follow)
        bindActionCreators(getCreators, dispatch)()
      }
    } catch (err) {
      console.log(err)
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}

export function getBlockedList(creatorId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const list = await client.service('block-creator').find({ query: { action: 'blocked', creatorId } })
      dispatch(creatorBlockedUsers(list.data))
    } catch (err) {
      console.log(err)
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}

export function getFollowersList(creatorId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const list = await client.service('follow-creator').find({ query: { action: 'followers', creatorId } })
      dispatch(creatorFollowers(list.data))
    } catch (err) {
      console.log(err)
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}

export function getFollowingList(creatorId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const list = await client.service('follow-creator').find({ query: { action: 'following', creatorId } })
      dispatch(creatorFollowing(list.data))
    } catch (err) {
      console.log(err)
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}
