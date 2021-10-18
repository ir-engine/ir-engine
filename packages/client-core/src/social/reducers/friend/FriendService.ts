import { Dispatch } from 'redux'
import { client } from '../../../feathers'
import { FriendAction } from './FriendActions'
import { AlertService } from '../../../common/reducers/alert/AlertService'
import Store from '../../../store'
import { Config } from '@xrengine/common/src/config'
import { UserAction } from '../../../user/store/UserAction'
import { accessAuthState } from '../../../user/reducers/auth/AuthState'
import { accessFriendState } from './FriendState'
const store = Store.store
export const FriendService = {
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

  getFriends: (search: string, skip?: number, limit?: number) => {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
      dispatch(FriendAction.fetchingFriends())
      try {
        const friendState = accessFriendState()
        const friendResult = await client.service('user').find({
          query: {
            action: 'friends',
            $limit: limit != null ? limit : friendState.friends.limit.value,
            $skip: skip != null ? skip : friendState.friends.skip.value,
            search
          }
        })
        dispatch(FriendAction.loadedFriends(friendResult))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
        dispatch(FriendAction.loadedFriends({ data: [], limit: 0, skip: 0, total: 0 }))
      }
    }
  },

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
  removeFriend: (relatedUserId: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        await client.service('user-relationship').remove(relatedUserId)
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
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

  unfriend: (relatedUserId: string) => {
    return FriendService.removeFriend(relatedUserId)
  }
}
if (!Config.publicRuntimeConfig.offlineMode) {
  client.service('user-relationship').on('created', (params) => {
    if (params.userRelationship.userRelationshipType === 'friend') {
      store.dispatch(FriendAction.createdFriend(params.userRelationship))
    }
  })

  client.service('user-relationship').on('patched', (params) => {
    const patchedUserRelationship = params.userRelationship
    const selfUser = accessAuthState().user
    if (patchedUserRelationship.userRelationshipType === 'friend') {
      store.dispatch(FriendAction.patchedFriend(patchedUserRelationship, selfUser.value))
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
      store.dispatch(FriendAction.removedFriend(deletedUserRelationship, selfUser.value))
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
