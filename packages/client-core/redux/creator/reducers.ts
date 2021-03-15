import Immutable from 'immutable';
import {
  CreatorsAction,
  CreatorRetrievedAction
} from './actions';

import {
  CREATOR_FETCH,
  CREATOR_RETRIEVED,
  CURRENT_CREATOR_RETRIEVED
} from '../actions';

export const initialState = {
  creators: {
    creators: [],
    creator: {},
    currentCreator: {},
    fetching: false
  },
};

const immutableState = Immutable.fromJS(initialState);

const creatorReducer = (state = immutableState, action: CreatorsAction): any => {
  switch (action.type) {
    case CREATOR_FETCH : return state.set('fetching', true);

    case CURRENT_CREATOR_RETRIEVED:
      return state.set('currentCreator', (action as CreatorRetrievedAction).creator).set('fetching', false);

    case CREATOR_RETRIEVED: 
      return state.set('creator', (action as CreatorRetrievedAction).creator).set('fetching', false);
  }
  return state;
};

export default creatorReducer;
