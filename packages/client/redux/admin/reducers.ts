import Immutable from 'immutable';
import {
  LocationTypesRetrievedResponse,
  VideoCreatedAction
} from './actions';

import {
  VIDEO_CREATED,
  LOCATIONS_RETRIEVED,
  LOCATION_CREATED,
  LOCATION_PATCHED,
  LOCATION_REMOVED,
  SCENES_RETRIEVED, LOCATION_TYPES_RETRIEVED
} from '../actions';
import { UserSeed } from '@xr3ngine/common/interfaces/User';
import { IdentityProviderSeed } from '@xr3ngine/common/interfaces/IdentityProvider';
import { AuthUserSeed } from '@xr3ngine/common/interfaces/AuthUser';
import {
  LocationCreatedAction,
  LocationsRetrievedAction,
  LocationPatchedAction,
  LocationRemovedAction
} from "../location/actions";
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
    updateNeeded: true
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
    updateNeeded: true
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
