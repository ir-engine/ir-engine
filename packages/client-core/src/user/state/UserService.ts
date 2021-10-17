import { Relationship } from '@xrengine/common/src/interfaces/Relationship'
import { User } from '@xrengine/common/src/interfaces/User'
import { useDispatch } from '../../store'
import { client } from '../../feathers'
import { UserAction, UserActionType } from './UserAction'

export const UserService = {
  getUserRelationship: async (userId: string) => {
    const dispatch = useDispatch()
    {
      client
        .service('user-relationship')
        .findAll({
          query: {
            userId
          }
        })
        .then((res: any) => {
          dispatch(UserAction.loadedUserRelationship(res as Relationship))
        })
        .catch((err: any) => {
          console.log(err)
        })
    }
  },

  getUsers: async (userId: string, search: string) => {
    const dispatch = useDispatch()
    {
      client
        .service('user')
        .find({
          query: {
            userId,
            action: 'withRelation',
            search
          }
        })
        .then((res: any) => {
          dispatch(UserAction.loadedUsers(res.data as User[]))
        })
        .catch((err: any) => {
          console.log(err)
        })
    }
  },

  getLayerUsers: async (instance = true) => {
    const dispatch = useDispatch()
    {
      const layerUsers = await client.service('user').find({
        query: {
          $limit: 1000,
          action: instance === true ? 'layer-users' : 'channel-users'
        }
      })
      dispatch(
        instance === true
          ? UserAction.loadedLayerUsers(layerUsers.data)
          : UserAction.loadedChannelLayerUsers(layerUsers.data)
      )
    }
  },

  requestFriend: (userId: string, relatedUserId: string) => {
    return createRelation(userId, relatedUserId, 'friend')
  },

  blockUser: (userId: string, relatedUserId: string) => {
    return createRelation(userId, relatedUserId, 'blocking')
  },

  acceptFriend: (userId: string, relatedUserId: string) => {
    return patchRelation(userId, relatedUserId, 'friend')
  },

  declineFriend: (userId: string, relatedUserId: string) => {
    return removeRelation(userId, relatedUserId)
  },

  cancelBlock: (userId: string, relatedUserId: string) => {
    return removeRelation(userId, relatedUserId)
  },

  showUserToast: (user: User, args: string) => {
    return UserAction.displayUserToast(user, args)
  }
}

function createRelation(userId: string, relatedUserId: string, type: 'friend' | 'blocking') {
  const dispatch = useDispatch()
  {
    client
      .service('user-relationship')
      .create({
        relatedUserId,
        userRelationshipType: type
      })
      .then((res: any) => {
        dispatch(UserAction.changedRelation())
      })
      .catch((err: any) => {
        console.log(err)
      })
  }
}

function removeRelation(userId: string, relatedUserId: string) {
  const dispatch = useDispatch()
  {
    client
      .service('user-relationship')
      .remove(relatedUserId)
      .then((res: any) => {
        dispatch(UserAction.changedRelation())
      })
      .catch((err: any) => {
        console.log(err)
      })
  }
}

function patchRelation(userId: string, relatedUserId: string, type: 'friend') {
  const dispatch = useDispatch()
  {
    client
      .service('user-relationship')
      .patch(relatedUserId, {
        userRelationshipType: type
      })
      .then((res: any) => {
        dispatch(UserAction.changedRelation())
      })
      .catch((err: any) => {
        console.log(err)
      })
  }
}
