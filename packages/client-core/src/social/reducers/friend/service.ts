import { Dispatch } from 'redux'
import { client } from '../../../feathers'
import { loadedFriends, createdFriend, patchedFriend, removedFriend, fetchingFriends } from './actions'
import { dispatchAlertError } from '../../../common/reducers/alert/AlertService'
import Store from '../../../store'
import { User } from '@xrengine/common/src/interfaces/User'
import { Config } from '@xrengine/common/src/config'
import { UserAction } from '../../../user/store/UserAction'
import { accessAuthState } from '../../../user/reducers/auth/AuthState'

const store = Store.store

// export function getUserRelationship(userId: string) {
//   return (dispatch: Dispatch): any => {
//     // dispatch(actionProcessing(true))
//
//     console.log('------get relations-------', userId)
//     client.service('user-relationship').find({
//       query: {
//         userId
//       }
//     }).then((res: any) => {
//       console.log('relations------', res)
//       dispatch(loadedUserRelationship(res as Relationship))
//     })
//       .catch((err: any) => {
//         console.log(err)
//       })
//       // .finally(() => dispatch(actionProcessing(false)))
//   }
// }

export function getFriends(search: string, skip?: number, limit?: number) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    dispatch(fetchingFriends())
    try {
      const friendResult = await client.service('user').find({
        query: {
          action: 'friends',
          $limit: limit != null ? limit : getState().get('friends').get('friends').get('limit'),
          $skip: skip != null ? skip : getState().get('friends').get('friends').get('skip'),
          search
        }
      })
      dispatch(loadedFriends(friendResult))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
      dispatch(loadedFriends({ data: [], limit: 0, skip: 0, total: 0 }))
    }
  }
}

// function createRelation(userId: string, relatedUserId: string, type: 'friend' | 'blocking') {
//   return (dispatch: Dispatch): any => {
//     client.service('user-relationship').create({
//       relatedUserId,
//       userRelationshipType: type
//     }).then((res: any) => {
//       console.log('add relations------', res)
//       dispatch(changedRelation())
//     })
//       .catch((err: any) => {
//         console.log(err)
//       })
//       // .finally(() => dispatch(actionProcessing(false)))
//   }
// }
//
function removeFriend(relatedUserId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('user-relationship').remove(relatedUserId)
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}
//
// function patchRelation(userId: string, relatedUserId: string, type: 'friend') {
//   return (dispatch: Dispatch): any => {
//     client.service('user-relationship').patch(relatedUserId, {
//       userRelationshipType: type
//     }).then((res: any) => {
//       console.log('Patching relationship to friend', res)
//       dispatch(changedRelation())
//     })
//       .catch((err: any) => {
//         console.log(err)
//       })
//       // .finally(() => dispatch(actionProcessing(false)))
//   }
// }

// export function requestFriend(userId: string, relatedUserId: string) {
//   return createRelation(userId, relatedUserId, 'friend')
// }
//
// export function blockUser(userId: string, relatedUserId: string) {
//   return createRelation(userId, relatedUserId, 'blocking')
// }
//
// export function acceptFriend(userId: string, relatedUserId: string) {
//   return patchRelation(userId, relatedUserId, 'friend')
// }
//
// export function declineFriend(userId: string, relatedUserId: string) {
//   return removeRelation(userId, relatedUserId)
// }
//
// export function cancelBlock(userId: string, relatedUserId: string) {
//   return removeRelation(userId, relatedUserId)
// }

export function unfriend(relatedUserId: string) {
  return removeFriend(relatedUserId)
}

if (!Config.publicRuntimeConfig.offlineMode) {
  client.service('user-relationship').on('created', (params) => {
    if (params.userRelationship.userRelationshipType === 'friend') {
      store.dispatch(createdFriend(params.userRelationship))
    }
  })

  client.service('user-relationship').on('patched', (params) => {
    const patchedUserRelationship = params.userRelationship
    const selfUser = accessAuthState().user
    if (patchedUserRelationship.userRelationshipType === 'friend') {
      store.dispatch(patchedFriend(patchedUserRelationship, selfUser.value))
      if (
        patchedUserRelationship.user.channelInstanceId != null &&
        patchedUserRelationship.user.channelInstanceId === selfUser.channelInstanceId.value
      )
        store.dispatch(UserAction.addedChannelLayerUser(patchedUserRelationship.user))
      if (patchedUserRelationship.user.channelInstanceId !== selfUser.channelInstanceId.value)
        store.dispatch(UserAction.removedChannelLayerUser(patchedUserRelationship.user))
    }
  })

  client.service('user-relationship').on('removed', (params) => {
    const deletedUserRelationship = params.userRelationship
    const selfUser = accessAuthState().user
    if (deletedUserRelationship.userRelationshipType === 'friend') {
      store.dispatch(removedFriend(deletedUserRelationship, selfUser.value))
      if (
        deletedUserRelationship.user.channelInstanceId != null &&
        deletedUserRelationship.user.channelInstanceId === selfUser.channelInstanceId.value
      )
        store.dispatch(UserAction.addedChannelLayerUser(deletedUserRelationship.user))
      if (deletedUserRelationship.user.channelInstanceId !== selfUser.channelInstanceId.value)
        store.dispatch(UserAction.removedChannelLayerUser(deletedUserRelationship.user))
    }
  })
}
