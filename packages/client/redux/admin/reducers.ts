import Immutable from 'immutable';
import {
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
  INSTANCES_RETRIEVED
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
    limit: 10,
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
    limit: 100,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: new Date()
  },
  users: {
    users: [],
    skip: 0,
    limit: 100,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: new Date()
  },
  instances: {
    instances: [],
    skip: 0,
    limit: 100,
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
      updateMap.set('locations', (result as any).data);
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
      updateMap.set('users', (result as any).data);
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
      updateMap.set('instances', (result as any).data);
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
  }

  return state;
};

export default adminReducer;
