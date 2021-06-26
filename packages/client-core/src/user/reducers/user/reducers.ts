import { ADDED_LAYER_USER, CHANGED_RELATION, CLEAR_LAYER_USERS, LOADED_LAYER_USERS, LOADED_RELATIONSHIP, REMOVED_LAYER_USER, USER_TOAST } from '../../../common/reducers/actions';
import { LOADED_USERS } from '@xrengine/client-core/src/admin/reducers/actions';
import { USER_REMOVED_ROW } from  '../../reducers/actions';
import { ADDED_CHANNEL_LAYER_USER, CLEAR_CHANNEL_LAYER_USERS, LOADED_CHANNEL_LAYER_USERS, REMOVED_CHANNEL_LAYER_USER } from '../../../world/reducers/actions';
import { RelationshipSeed } from '@xrengine/common/src/interfaces/Relationship';
import Immutable from 'immutable';
import {
  AddedLayerUserAction,
  LoadedLayerUsersAction,
  LoadedUserRelationshipAction,
  LoadedUsersAction,
  RemovedLayerUserAction,
  UserAction,
  UserRemovedInstance,
  UserToastAction
} from './actions';


export const initialUserState = {
  relationship: RelationshipSeed,
  users: [],
  updateNeeded: true,
  layerUsers: [],
  layerUsersUpdateNeeded: true,
  channelLayerUsers: [],
  channelLayerUsersUpdateNeeded: true,
  toastMessages: [],
};

const immutableState = Immutable.fromJS(initialUserState);

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
      match = layerUsers.find((layerUser) => { return layerUser != null && (layerUser.id === newUser.id);});
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
      layerUsers = layerUsers.filter((layerUser) => { return layerUser != null && (layerUser.id !== newUser.id);});
      return state
          .set('layerUsers', layerUsers);
    case CLEAR_CHANNEL_LAYER_USERS:
      return state
          .set('channelLayersUsers', [])
          .set('channelLayerUsersUpdateNeeded', true);
    case LOADED_CHANNEL_LAYER_USERS:
      return state
          .set('channelLayerUsers', (action as LoadedLayerUsersAction).users)
          .set('channelLayerUsersUpdateNeeded', false);
    case ADDED_CHANNEL_LAYER_USER:
      newUser = (action as AddedLayerUserAction).user;
      layerUsers = state.get('channelLayerUsers');
      match = layerUsers.find((layerUser) => { return layerUser != null && (layerUser.id === newUser.id);});
      if (match == null) {
        layerUsers.push(newUser);
      } else {
        layerUsers = layerUsers.map((layerUser) => layerUser.id === newUser.id ? newUser : layerUser);
      }
      return state
          .set('channelLayerUsers', layerUsers)
          .set('channelLayerUsersUpdateNeeded', true);
    case REMOVED_CHANNEL_LAYER_USER:
      newUser = (action as RemovedLayerUserAction).user;
      layerUsers = state.get('channelLayerUsers');
      layerUsers = layerUsers.filter((layerUser) => { return layerUser != null && (layerUser.id !== newUser.id);});
      return state
          .set('channelLayerUsers', layerUsers);
    case USER_TOAST:
      const toastMessages = state.get('toastMessages');
      toastMessages.push((action as UserToastAction).message);
      return state.set('toastMessages', toastMessages.push((action as UserToastAction).message));

      case USER_REMOVED_ROW: 
      const users =  state.get("users");
        return  state.set('users',  users.data.filter(el => el.id !== (action as  UserRemovedInstance ).user.id))
         .set('updateNeeded', false);
      
  }

  return state;
};

export default userReducer;
