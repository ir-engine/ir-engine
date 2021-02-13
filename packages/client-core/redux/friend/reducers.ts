import Immutable from 'immutable';
import {
  FriendAction,
  LoadedFriendsAction,
  PatchedFriendAction,
  RemovedFriendAction
} from './actions';

import {
  LOADED_FRIENDS,
  CREATED_FRIEND,
  PATCHED_FRIEND,
  REMOVED_FRIEND,
  FETCHING_FRIENDS
} from '../actions';
import { User } from '@xr3ngine/common/interfaces/User';
import { UserRelationship } from '@xr3ngine/common/interfaces/UserRelationship';
import _ from 'lodash';

export const initialState = {
  friends: {
    friends: [],
    total: 0,
    limit: 5,
    skip: 0
  },
  getFriendsInProgress: false,
  updateNeeded: true
};

const immutableState = Immutable.fromJS(initialState);

const friendReducer = (state = immutableState, action: FriendAction): any => {
  let newValues, updateMap, updateMapFriends, updateMapFriendsChild, selfUser, otherUser, otherUserId;
  switch (action.type) {
    case LOADED_FRIENDS:
      newValues = (action as LoadedFriendsAction);
      updateMap = new Map(state.get('friends'));
      updateMapFriends = updateMap.get('friends');
      updateMap.set('friends', (updateMapFriends.size != null || state.get('updateNeeded') === true) ? newValues.friends : updateMapFriends.concat(newValues.friends));
      updateMap.set('skip', newValues.skip);
      updateMap.set('limit', newValues.limit);
      updateMap.set('total', newValues.total);
      return state
        .set('friends', updateMap)
        .set('updateNeeded', false)
          .set('getFriendsInProgress', false);
    case CREATED_FRIEND:
      newValues = (action as LoadedFriendsAction);
      const createdUserRelationship = newValues.userRelationship;
      updateMap = new Map(state.get('friends'));
      updateMapFriends = updateMap.get('friends');
      updateMapFriends = updateMapFriends.concat([createdUserRelationship]);
      updateMap.set('friends', updateMapFriends);
      return state
          .set('friends', updateMap);

    case PATCHED_FRIEND:
      newValues = (action as PatchedFriendAction);
      const patchedUserRelationship = newValues.userRelationship;
        selfUser = newValues.selfUser;
      otherUser = patchedUserRelationship.userId === selfUser.id ? patchedUserRelationship.relatedUser : patchedUserRelationship.user;
      updateMap = new Map(state.get('friends'));
      updateMapFriends = updateMap.get('friends');
      updateMapFriendsChild = _.find(updateMapFriends, (friend: User) => friend.id === otherUser.id);
      if (updateMapFriendsChild != null) {
        updateMapFriends = updateMapFriends.map((friend: User) => friend.id === otherUser.id ? otherUser : friend);
      }
      else {
        updateMapFriends.push(otherUser);
      }
      updateMap.set('friends', updateMapFriends);
      return state
          .set('friends', updateMap);
    case REMOVED_FRIEND:
      newValues = (action as RemovedFriendAction);
      const removedUserRelationship = newValues.userRelationship;
      selfUser = newValues.selfUser;
      otherUserId = removedUserRelationship.userId === selfUser.id ? removedUserRelationship.relatedUserId : removedUserRelationship.userId;
      updateMap = new Map(state.get('friends'));
      updateMapFriends = updateMap.get('friends');
      updateMapFriendsChild = _.find(updateMapFriends, (friend: User) => friend.id === otherUserId);
      if (updateMapFriendsChild != null) {
        _.remove(updateMapFriends, (friend: User) => friend.id === otherUserId);
        updateMap.set('friends', updateMapFriends);
        updateMap.set('skip', updateMap.get('skip') - 1);
      }
      return state
          .set('friends', updateMap);
    case FETCHING_FRIENDS:
      return state
          .set('getFriendsInProgress', true);
  }

  return state;
};

export default friendReducer;
