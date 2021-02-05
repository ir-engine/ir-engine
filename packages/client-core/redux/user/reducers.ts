import Immutable from 'immutable';
import {
  AddedLayerUserAction,
  LoadedLayerUsersAction,
  LoadedUsersAction,
  LoadedUserRelationshipAction,
  RemovedLayerUserAction,
  UserAction,
} from './actions';

import {
  ADDED_LAYER_USER,
  CHANGED_RELATION,
  CLEAR_LAYER_USERS,
  LOADED_LAYER_USERS,
  LOADED_RELATIONSHIP,
  LOADED_USERS,
  REMOVED_LAYER_USER
} from '../actions';
import { RelationshipSeed } from '@xr3ngine/common/interfaces/Relationship';

export const initialState = {
  relationship: RelationshipSeed,
  users: [],
  updateNeeded: true,
  layerUsers: [],
  layerUsersUpdateNeeded: true
};

const immutableState = Immutable.fromJS(initialState);

const userReducer = (state = immutableState, action: UserAction): any => {
  let layerUsers, match, newUser;
  switch (action.type) {
    case LOADED_RELATIONSHIP:
      return state
        .set('relationship', (action as LoadedUserRelationshipAction).relationship)
        .set('updateNeeded', false);
    case LOADED_USERS:
      return state
        .set('users', (action as LoadedUsersAction).users)
        .set('updateNeeded', false);
    case CHANGED_RELATION:
      return state
        .set('updateNeeded', true);
    case CLEAR_LAYER_USERS:
      return state
        .set('layersUsers', [])
        .set('layerUsersUpdateNeeded', true);
    case LOADED_LAYER_USERS:
      return state
        .set('layerUsers', (action as LoadedLayerUsersAction).users)
        .set('layerUsersUpdateNeeded', false);
    case ADDED_LAYER_USER:
      newUser = (action as AddedLayerUserAction).user;
      layerUsers = state.get('layerUsers');
      match = layerUsers.find((layerUser) => layerUser.id === newUser.id);
      if (match == null) {
        layerUsers.push(newUser);
      } else {
        layerUsers = layerUsers.map((layerUser) => layerUser.id === newUser.id ? newUser : layerUser);
      }
      return state
          .set('layerUsers', layerUsers)
          .set('layerUsersUpdateNeeded', true);

    case REMOVED_LAYER_USER:
      newUser = (action as RemovedLayerUserAction).user;
      layerUsers = state.get('layerUsers');
      layerUsers = layerUsers.filter((layerUser) => layerUser.id !== newUser.id);
      return state
          .set('layerUsers', layerUsers);
  }

  return state;
};

export default userReducer;
