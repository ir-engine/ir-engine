import Immutable from 'immutable';
import {
  ScenesFetchedAction,
  PublicScenesState
} from './actions';

import {
  SCENES_FETCHED_SUCCESS,
  SCENES_FETCHED_ERROR
} from '../actions';

export const initialState: PublicScenesState = {
  scenes: [],
  error: ''
};

const immutableState = Immutable.fromJS(initialState);

const sceneReducer = (state = immutableState, action: ScenesFetchedAction): any => {
  switch (action.type) {
    case SCENES_FETCHED_SUCCESS:
      return state
        .set('scenes', (action as ScenesFetchedAction).scenes);
    case SCENES_FETCHED_ERROR:
      return state
        .set('error', (action as ScenesFetchedAction).message);
  }

  return state;
};

export default sceneReducer;
