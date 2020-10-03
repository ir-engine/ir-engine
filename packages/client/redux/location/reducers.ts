import Immutable from 'immutable';
import {
  LocationsAction,
  LocationsRetrievedAction
} from './actions';

import {
  LOCATIONS_RETRIEVED
} from '../actions';

export const initialState = {
  locations: {
    locations: [],
    total: 0,
    limit: 10,
    skip: 0
  },
  updateNeeded: true
};

const immutableState = Immutable.fromJS(initialState);

const locationReducer = (state = immutableState, action: LocationsAction): any => {
  let newValues, updateMap, existingLocations;
  switch (action.type) {
    case LOCATIONS_RETRIEVED:
      newValues = (action as LocationsRetrievedAction).locations;
      console.log('newValues:');
      console.log(newValues);
      updateMap = new Map();
      existingLocations = state.get('locations').get('locations');
      updateMap.set('locations', (existingLocations.size != null || state.get('updateNeeded') === true) ? newValues.data : existingLocations.concat(newValues.data));
      updateMap.set('skip', newValues.skip);
      updateMap.set('limit', newValues.limit);
      updateMap.set('total', newValues.total);
      console.log('updateMap:');
      console.log(updateMap);
      return state
        .set('locations', updateMap)
        .set('updateNeeded', false);
  }

  return state;
};

export default locationReducer;
