import { Dispatch } from 'redux';
import { client } from '../feathers';
import { Relationship } from '@xr3ngine/common/interfaces/Relationship';
import {
  changedRelation,
  loadedUsers,
  loadedLayerUsers,
  loadedChannelLayerUsers,
  loadedUserRelationship,
  displayUserToast,
} from './actions';
import { User } from '@xr3ngine/common/interfaces/User';

export function getUserRelationship(userId: string) {
  return (dispatch: Dispatch): any => {
    // dispatch(actionProcessing(true))

    console.log('------get relations-------', userId);
    client.service('user-relationship').findAll({
      query: {
        userId
      }
    }).then((res: any) => {
      console.log('relations------', res);
      dispatch(loadedUserRelationship(res as Relationship));
    })
      .catch((err: any) => {
        console.log(err);
      });
      // .finally(() => dispatch(actionProcessing(false)))
  };
}

export function getUsers(userId: string, search: string) {
  return (dispatch: Dispatch): any => {
    // dispatch(actionProcessing(true))

    client.service('user').find({
      query: {
        userId,
        action: 'withRelation',
        search
      }
    }).then((res: any) => {
      dispatch(loadedUsers(res.data as User[]));
    })
      .catch((err: any) => {
        console.log(err);
      });
      // .finally(() => dispatch(actionProcessing(false)))
  };
}

export function getLayerUsers(instance = true) {
  return async (dispatch: Dispatch): Promise<any> => {
    const layerUsers = await client.service('user').find({
      query: {
        $limit: 1000,
        action: instance === true ? 'layer-users' : 'channel-users'
      }
    });
    dispatch(instance === true ? loadedLayerUsers(layerUsers.data) : loadedChannelLayerUsers(layerUsers.data));
  };
}

function createRelation(userId: string, relatedUserId: string, type: 'friend' | 'blocking') {
  return (dispatch: Dispatch): any => {
    client.service('user-relationship').create({
      relatedUserId,
      userRelationshipType: type
    }).then((res: any) => {
      dispatch(changedRelation());
    })
      .catch((err: any) => {
        console.log(err);
      });
      // .finally(() => dispatch(actionProcessing(false)))
  };
}

function removeRelation(userId: string, relatedUserId: string) {
  return (dispatch: Dispatch): any => {
    client.service('user-relationship').remove(relatedUserId)
      .then((res: any) => {
        dispatch(changedRelation());
      })
      .catch((err: any) => {
        console.log(err);
      });
      // .finally(() => dispatch(actionProcessing(false)))
  };
}

function patchRelation(userId: string, relatedUserId: string, type: 'friend') {
  return (dispatch: Dispatch): any => {
    client.service('user-relationship').patch(relatedUserId, {
      userRelationshipType: type
    }).then((res: any) => {
      dispatch(changedRelation());
    })
      .catch((err: any) => {
        console.log(err);
      });
      // .finally(() => dispatch(actionProcessing(false)))
  };
}

export function requestFriend(userId: string, relatedUserId: string) {
  return createRelation(userId, relatedUserId, 'friend');
}

export function blockUser(userId: string, relatedUserId: string) {
  return createRelation(userId, relatedUserId, 'blocking');
}

export function acceptFriend(userId: string, relatedUserId: string) {
  return patchRelation(userId, relatedUserId, 'friend');
}

export function declineFriend(userId: string, relatedUserId: string) {
  return removeRelation(userId, relatedUserId);
}

export function cancelBlock(userId: string, relatedUserId: string) {
  return removeRelation(userId, relatedUserId);
}

export function showUserToast(user: User, args: string) {
  return displayUserToast(user, args);
}
