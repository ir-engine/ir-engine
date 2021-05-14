import Immutable from 'immutable';
import {
  InstanceRemovedResponse,
  InstancesRetrievedResponse,
  LocationTypesRetrievedResponse,
  userRoleRetrievedResponse,
  VideoCreatedAction
} from './actions';

import { VIDEO_CREATED } from "../actions";
import {
  LOCATIONS_RETRIEVED,
  LOCATION_CREATED,
  LOCATION_PATCHED,
  LOCATION_REMOVED,
  INSTANCE_REMOVED
} from '../../../social/reducers/actions';
import {
  SCENES_RETRIEVED,
  LOCATION_TYPES_RETRIEVED,
  USER_ROLE_RETRIEVED,
  INSTANCES_RETRIEVED,
  USER_ROLE_CREATED
} from "../../../world/reducers/actions";
import {
  LOADED_USERS,
} from '../../../common/reducers/actions';
import { UserSeed } from '@xrengine/common/src/interfaces/User';
import { IdentityProviderSeed } from '@xrengine/common/src/interfaces/IdentityProvider';
import { AuthUserSeed } from '@xrengine/common/src/interfaces/AuthUser';
import {
  LoadedUsersAction
} from "../../../user/reducers/user/actions";
import { CollectionsFetchedAction } from "../../../world/reducers/scenes/actions";
import { LocationsRetrievedAction } from '../../../social/reducers/location/actions';

export const PAGE_LIMIT = 100;

export const initialAdminState = {
  isLoggedIn: false,
  isProcessing: false,
  error: '',
  authUser: AuthUserSeed,
  user: UserSeed,
  identityProvider: IdentityProviderSeed,
  locations: {
    locations: [],
    skip: 0,
    limit: PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: new Date()
  },
  locationTypes: {
    locationTypes: [],
    updateNeeded: true
  },
  scenes: {
    scenes: [],
    skip: 0,
    limit: 1000,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: new Date()
  },
  users: {
    users: [],
    skip: 0,
    limit: PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: new Date()
  },
  instances: {
    instances: [],
    skip: 0,
    limit: PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: new Date()
  }
};

const immutableState = Immutable.fromJS(initialAdminState);

const adminReducer = (state = immutableState, action: any): any => {
  let result, updateMap;
  switch (action.type) {
    case VIDEO_CREATED:
      return state
        .set('data', (action as VideoCreatedAction).data);

    case LOCATIONS_RETRIEVED:
      result = (action as LocationsRetrievedAction).locations;
      updateMap = new Map(state.get('locations'));
      updateMap.set('locations', result.data);
      updateMap.set('skip', (result as any).skip);
      updateMap.set('limit', (result as any).limit);
      updateMap.set('total', (result as any).total);
      updateMap.set('retrieving', false);
      updateMap.set('fetched', true);
      updateMap.set('updateNeeded', false);
      updateMap.set('lastFetched', new Date());
      return state
        .set('locations', updateMap);

    case LOCATION_CREATED:
      updateMap = new Map(state.get('locations'));
      updateMap.set('updateNeeded', true);
      return state
        .set('locations', updateMap);

    case LOCATION_PATCHED:
      updateMap = new Map(state.get('locations'));
      const locations = updateMap.get('locations');

      for (let i = 0; i < locations.length; i++) {
        if (locations[i].id === (action as any).location.id) {
          locations[i] = (action as any).location;
        } else if ((action as any).location.isLobby && locations[i].isLobby) {
          // if updated location is lobby then remove old lobby.
          locations[i].isLobby = false;
        }
      }

      updateMap.set('locations', locations);
      return state
        .set('locations', updateMap);

    case LOCATION_REMOVED:
      updateMap = new Map(state.get('locations'));
      updateMap.set('updateNeeded', true);
      return state
        .set('locations', updateMap);

    case LOADED_USERS:
      result = (action as LoadedUsersAction).users;
      updateMap = new Map(state.get('users'));
      let combinedUsers = state.get('users').get('users');
      (result as any).data.forEach(item => {
        const match = combinedUsers.find(user => user.id === item.id);
        if (match == null) {
          combinedUsers = combinedUsers.concat(item);
        } else {
          combinedUsers = combinedUsers.map((user) => user.id === item.id ? item : user);
        }
      });
      updateMap.set('users', combinedUsers);
      updateMap.set('skip', (result as any).skip);
      updateMap.set('limit', (result as any).limit);
      updateMap.set('total', (result as any).total);
      updateMap.set('retrieving', false);
      updateMap.set('fetched', true);
      updateMap.set('updateNeeded', false);
      updateMap.set('lastFetched', new Date());
      return state
        .set('users', updateMap);

    case INSTANCES_RETRIEVED:
      result = (action as InstancesRetrievedResponse).instances;
      updateMap = new Map(state.get('instances'));
      let combinedInstances = state.get('instances').get('instances');
      (result as any).data.forEach(item => {
        const match = combinedInstances.find(instance => instance.id === item.id);
        if (match == null) {
          combinedInstances = combinedInstances.concat(item);
        } else {
          combinedInstances = combinedInstances.map((instance) => instance.id === item.id ? item : instance);
        }
      });
      updateMap.set('instances', combinedInstances);
      updateMap.set('skip', (result as any).skip);
      updateMap.set('limit', (result as any).limit);
      updateMap.set('total', (result as any).total);
      updateMap.set('retrieving', false);
      updateMap.set('fetched', true);
      updateMap.set('updateNeeded', false);
      updateMap.set('lastFetched', new Date());
      return state
        .set('instances', updateMap);

    case SCENES_RETRIEVED:
      result = (action as CollectionsFetchedAction).collections;
      updateMap = new Map(state.get('scenes'));
      updateMap.set('scenes', (result as any).data);
      updateMap.set('skip', (result as any).skip);
      updateMap.set('limit', (result as any).limit);
      updateMap.set('total', (result as any).total);
      updateMap.set('retrieving', false);
      updateMap.set('fetched', true);
      updateMap.set('updateNeeded', false);
      updateMap.set('lastFetched', new Date());
      return state
        .set('scenes', updateMap);

    case LOCATION_TYPES_RETRIEVED:
      result = (action as LocationTypesRetrievedResponse).types;
      updateMap = new Map(state.get('locationTypes'));
      updateMap.set('locationTypes', result.data);
      updateMap.set('updateNeeded', false);
      return state
        .set('locationTypes', updateMap);

    case INSTANCE_REMOVED:
      result = (action as InstanceRemovedResponse).instance;
      updateMap = new Map(state.get('instances'));
      let instances = updateMap.get('instances');
      instances = instances.filter(instance => instance.id !== result.id);
      updateMap.set('instances', instances);
      return state
        .set('instances', updateMap);

    case USER_ROLE_RETRIEVED:
      result = (action as userRoleRetrievedResponse).types;
      updateMap = new Map(state.get('userRole'));
      updateMap.set('userRole', result.data);
      updateMap.set('updateNeeded', false);
      return state
        .set('userRole', updateMap);

    case USER_ROLE_CREATED:
      updateMap = new Map(state.get('userRole'));
      updateMap.set('updateNeeded', true);
      return state
        .set('userRole', updateMap);
  }

  return state;
};

export default adminReducer;
