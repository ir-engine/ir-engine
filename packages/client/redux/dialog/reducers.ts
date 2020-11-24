import Immutable from 'immutable';
import {
  DialogState,
  DialogAction
} from './actions';

import {
  CLOSE_DIALOG,
  SHOW_DIALOG
} from '../actions';

export const initialState: DialogState = {
  isOpened: false,
  content: undefined
};

const immutableState = Immutable.fromJS(initialState);

const dialogReducer = (state = immutableState, action: DialogAction): any => {
  switch (action.type) {
    case SHOW_DIALOG:
      return state
        .set('isOpened', true)
        .set('content', action.content);
    case CLOSE_DIALOG:
      return state
        .set('isOpened', false)
        .set('content', undefined);
    default:
      break;
  }

  return state;
};

export default dialogReducer;
