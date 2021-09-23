/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { Creator } from '@xrengine/common/src/interfaces/Creator'
import { Dispatch } from 'redux'
import { upload } from '@xrengine/engine/src/scene/functions/upload'
import { dispatchAlertError } from '@xrengine/client-core/src/common/reducers/alert/AlertService'
import { client } from '@xrengine/client-core/src/feathers'
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
  removeCreator
} from './actions'

export function createCreator(data?: any) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      dispatch(fetchingCurrentCreator())
      if (!data) {
        data = {}
        let userNumber = Math.floor(Math.random() * 1000) + 1
        data.name = 'User' + userNumber
        data.username = 'user_' + userNumber
      }

      const creator = await client.service('creator').create(data)
      dispatch(creatorLoggedRetrieved(creator))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
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
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export const fetchCreatorAsAdmin =
  () =>
  async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      const result = await client.service('creator').find({ query: { action: 'admin' } })
      dispatch(creatorLoggedRetrieved(result))
    } catch (error) {
      console.error(error)
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
      dispatchAlertError(dispatch, err.message)
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
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function updateCreator(creator: Creator) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      dispatch(fetchingCurrentCreator())
      if (creator.newAvatar) {
        const storedAvatar = await upload(creator.newAvatar, null)
        ;(creator as any).avatarId = (storedAvatar as any).file_id
        delete creator.newAvatar
      }
      const updatedCreator = await client.service('creator').patch(creator.id, creator)
      dispatch(creatorLoggedRetrieved(updatedCreator))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
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
      dispatchAlertError(dispatch, err.message)
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
      dispatchAlertError(dispatch, err.message)
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
      dispatchAlertError(dispatch, err.message)
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
      dispatchAlertError(dispatch, err.message)
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
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function deleteCreator(creatorId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('creator').remove(creatorId)
      dispatch(removeCreator(creatorId))
    } catch (err) {
      console.log(err)
    }
  }
}
