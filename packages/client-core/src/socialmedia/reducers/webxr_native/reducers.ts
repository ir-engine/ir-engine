/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */

import Immutable from 'immutable';
import {
  TOUGLE_WEBXRNATIVE, SET_WEBXRNATIVE
} from './actions';


export const initialWebXrNative = {
  webxrnative: null
};

const immutableState = Immutable.fromJS(initialWebXrNative);

const webxrnativeReducer = (state = immutableState, action: any): any => {
  switch (action.type) {
    case SET_WEBXRNATIVE:
      return state.set('webxrnative', false);
    case TOUGLE_WEBXRNATIVE:
      return state.set('webxrnative', !state.get('webxrnative'));
  }
  return state;
};

export default webxrnativeReducer;
