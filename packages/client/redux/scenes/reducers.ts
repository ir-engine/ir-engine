import Immutable from 'immutable';
import {
  ScenesFetchedAction,
  PublicScenesState,
} from './actions';

import {
  SCENES_FETCHED_SUCCESS,
  SCENES_FETCHED_ERROR,
  SET_CURRENT_SCENE,
} from '../actions';

export const initialState: PublicScenesState = {
  scenes: [],
  currentScene: null,
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
    case SET_CURRENT_SCENE:
        return state
        .set('currentScene', (action as ScenesFetchedAction).scene);
  }
  
  return state;
};

export default sceneReducer;
