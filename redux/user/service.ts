import { Dispatch } from 'redux'
import { client } from '../feathers'
import { Relationship } from '../../interfaces/Relationship'
import { loadedUserRelationship, loadedUsers, changedRelation } from './actions'
import { User } from '../../interfaces/User'

export function getUserRelationship(userId: string) {
  return (dispatch: Dispatch) => {
    // dispatch(actionProcessing(true))

    console.log('------get relations-------', userId)
    client.service('user-relationship').find({
      query: {
        userId
      }
    }).then((res: any) => {
      console.log('relations------', res)
      dispatch(loadedUserRelationship(res as Relationship))
    })
      .catch((err: any) => {
        console.log(err)
      })
      // .finally(() => dispatch(actionProcessing(false)))
  }
}

export function getUsers(userId: string) {
  return (dispatch: Dispatch) => {
    // dispatch(actionProcessing(true))

    client.service('user').find({
      query: {
        userId,
        action: 'withRelation'
      }
    }).then((res: any) => {
      console.log('relations------', res)
      dispatch(loadedUsers(res.data as User[]))
    })
      .catch((err: any) => {
        console.log(err)
      })
      // .finally(() => dispatch(actionProcessing(false)))
  }
}

function createRelation(userId: string, relatedUserId: string, type: 'friend' | 'blocked') {
  return (dispatch: Dispatch) => {
    client.service('user-relationship').create({
      userId,
      relatedUserId,
      type,
      action: 'create'
    }).then((res: any) => {
      console.log('add relations------', res)
      dispatch(changedRelation())
    })
      .catch((err: any) => {
        console.log(err)
      })
      // .finally(() => dispatch(actionProcessing(false)))
  }
}

function removeRelation(userId: string, relatedUserId: string) {
  return (dispatch: Dispatch) => {
    client.service('user-relationship').create({
      userId,
      relatedUserId,
      action: 'remove'
    }).then((res: any) => {
      console.log('add relations------', res)
      dispatch(changedRelation())
    })
      .catch((err: any) => {
        console.log(err)
      })
      // .finally(() => dispatch(actionProcessing(false)))
  }
}

function updateRelation(userId: string, relatedUserId: string, type: 'friend') {
  return (dispatch: Dispatch) => {
    client.service('user-relationship').create({
      userId,
      relatedUserId,
      type,
      action: 'update'
    }).then((res: any) => {
      console.log('add relations------', res)
      dispatch(changedRelation())
    })
      .catch((err: any) => {
        console.log(err)
      })
      // .finally(() => dispatch(actionProcessing(false)))
  }
}

export function requestFriend(userId: string, relatedUserId: string) {
  return createRelation(userId, relatedUserId, 'friend')
}

export function blockUser(userId: string, relatedUserId: string) {
  return createRelation(userId, relatedUserId, 'blocked')
}

export function acceptFriend(userId: string, relatedUserId: string) {
  return updateRelation(userId, relatedUserId, 'friend')
}

export function declineFriend(userId: string, relatedUserId: string) {
  return removeRelation(userId, relatedUserId)
}

export function cancelBlock(userId: string, relatedUserId: string) {
  return removeRelation(userId, relatedUserId)
}
