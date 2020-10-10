import Immutable from 'immutable';
import {
  LocationsAction,
  LocationsRetrievedAction,
  ShowroomEnabledSetAction,
  ShowroomLocationRetrievedAction
} from './actions';

import {
  LOCATIONS_RETRIEVED,
  SHOWROOM_ENABLED_SET,
  SHOWROOM_LOCATION_RETRIEVED
} from '../actions';

export const initialState = {
  locations: {
    locations: [],
    total: 0,
    limit: 10,
    skip: 0
  },
  showroomEnabled: true,
  showroomLocation: {
    location: {}
  },
  updateNeeded: true
};

const immutableState = Immutable.fromJS(initialState);

const locationReducer = (state = immutableState, action: LocationsAction): any => {
  let newValues, updateMap, existingLocations;
  switch (action.type) {
    case LOCATIONS_RETRIEVED:
      newValues = (action as LocationsRetrievedAction).locations;
      updateMap = new Map();
      existingLocations = state.get('locations').get('locations');
      updateMap.set('locations', (existingLocations.size != null || state.get('updateNeeded') === true) ? newValues.data : existingLocations.concat(newValues.data));
      updateMap.set('skip', newValues.skip);
      updateMap.set('limit', newValues.limit);
      updateMap.set('total', newValues.total);
      return state
        .set('locations', updateMap)
        .set('updateNeeded', false);

    case SHOWROOM_ENABLED_SET:
      return state.set('showroomEnabled', (action as ShowroomEnabledSetAction).showroomEnabled);

    case SHOWROOM_LOCATION_RETRIEVED:
      newValues = (action as ShowroomLocationRetrievedAction).location;
      updateMap = new Map();
      updateMap.set('location', newValues);
      return state
          .set('showroomLocation', updateMap);
  }

  return state;
};

export default locationReducer;
