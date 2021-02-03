import Immutable from 'immutable';
import {
  InstanceRemovedResponse,
  InstancesRetrievedResponse,
  LocationTypesRetrievedResponse,
  VideoCreatedAction
} from './actions';

import {
  VIDEO_CREATED,
  LOCATIONS_RETRIEVED,
  LOCATION_CREATED,
  LOCATION_PATCHED,
  LOCATION_REMOVED,
  SCENES_RETRIEVED,
  LOCATION_TYPES_RETRIEVED,
  LOADED_USERS,
  INSTANCES_RETRIEVED, INSTANCE_REMOVED
} from '../actions';
import { UserSeed } from '@xr3ngine/common/interfaces/User';
import { IdentityProviderSeed } from '@xr3ngine/common/interfaces/IdentityProvider';
import { AuthUserSeed } from '@xr3ngine/common/interfaces/AuthUser';
import {
  LocationsRetrievedAction,
} from "../location/actions";
import {
  LoadedUsersAction
} from "../user/actions";
import {CollectionsFetchedAction} from "../scenes/actions";

export const PAGE_LIMIT = 100;

export const initialState = {
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

const immutableState = Immutable.fromJS(initialState);

const adminReducer = (state = immutableState, action: any): any => {
  let result, updateMap;
  switch (action.type) {
    case VIDEO_CREATED:
      return state
        .set('data', (action as VideoCreatedAction).data);

    case LOCATIONS_RETRIEVED:
      result = (action as LocationsRetrievedAction).locations;
      updateMap = new Map(state.get('locations'));
      let combinedLocations = state.get('locations').get('locations');
      (result as any).data.forEach(item => {
        const match = combinedLocations.find(location => location.id === item.id);
        if (match == null) {
          combinedLocations = combinedLocations.concat(item);
        } else {
          combinedLocations = combinedLocations.map((location) => location.id === item.id ? item : location);
        }
      });
      updateMap.set('locations', combinedLocations);
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
      updateMap.set('updateNeeded', true);
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
  }

  return state;
};

export default adminReducer;
