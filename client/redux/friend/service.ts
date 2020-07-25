import { Dispatch } from 'redux'
import { client } from '../feathers'
import {
  loadedFriends,
  unfriended,
  fetchingFriends
} from './actions'
import { User } from '../../../shared/interfaces/User'

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
    const friendResult = await client.service('user').find({
      query: {
        action: 'friends',
        $limit: limit != null ? limit : getState().get('friends').get('friends').get('limit'),
        $skip: skip != null ? skip : getState().get('friends').get('friends').get('skip'),
        search
      }
    })
    console.log('GOT FRIENDS')
    console.log(friendResult)
    dispatch(loadedFriends(friendResult))
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
    await client.service('user-relationship').remove(relatedUserId)
    dispatch(unfriended())
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
