import Immutable from 'immutable';
import {
  CreatorsAction,
  CreatorRetrievedAction,
  CreatorsRetrievedAction,
  CreatorsNotificationsRetrievedAction
} from './actions';

import {
  CREATORS_RETRIEVED,
  CREATOR_FETCH,
  CREATOR_NOTIFICATION_LIST_RETRIEVED,
  CREATOR_RETRIEVED,
  CURRENT_CREATOR_RETRIEVED
} from '../actions';

export const initialState = {
  creators: {
    creators: [],
    creator: {},
    currentCreator: {},
    currentCreatorNotifications: {},
    fetching: false
  },
};

const immutableState = Immutable.fromJS(initialState);

const creatorReducer = (state = immutableState, action: CreatorsAction): any => {
  switch (action.type) {
    case CREATOR_FETCH : return state.set('fetching', true);

    case CREATORS_RETRIEVED:
      return state.set('creators', (action as CreatorsRetrievedAction).creators).set('fetching', false);

    case CURRENT_CREATOR_RETRIEVED:
      return state.set('currentCreator', (action as CreatorRetrievedAction).creator).set('fetching', false);

    case CREATOR_RETRIEVED: 
      return state.set('creator', (action as CreatorRetrievedAction).creator).set('fetching', false);

    case CREATOR_NOTIFICATION_LIST_RETRIEVED:
      return state.set('currentCreatorNotifications', (action as CreatorsNotificationsRetrievedAction).notifications).set('fetching', false);

  }
  return state;
};

export default creatorReducer;
