import Immutable from 'immutable';
import {
  AlertState,
  AlertAction
} from './actions';

import {
  SHOW_NOTIFICATION,
  HIDE_NOTIFICATION
} from '../actions';

export const initialState: AlertState = {
  type: 'none',
  message: ''
};

const immutableState = Immutable.fromJS(initialState);

const alertReducer = (state = immutableState, action: AlertAction): any => {
  switch (action.type) {
    case SHOW_NOTIFICATION:
    case HIDE_NOTIFICATION:
      return state
        .set('type', action.alertType)
        .set('message', action.message);
    default:
      break;
  }

  return state;
};

export default alertReducer;
