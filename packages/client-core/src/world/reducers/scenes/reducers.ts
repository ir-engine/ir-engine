import { SCENES_FETCHED_ERROR, SCENES_FETCHED_SUCCESS, SET_CURRENT_SCENE } from '../actions'
import Immutable from 'immutable'
import { PublicScenesState, ScenesFetchedAction } from './actions'

export const initialSceneState: PublicScenesState = {
  scenes: [],
  currentScene: null,
  error: ''
}

const immutableState = Immutable.fromJS(initialSceneState) as any

const sceneReducer = (state = immutableState, action: ScenesFetchedAction): any => {
  switch (action.type) {
    case SCENES_FETCHED_SUCCESS:
      return state.set('scenes', (action as ScenesFetchedAction).scenes)
    case SCENES_FETCHED_ERROR:
      return state.set('error', (action as ScenesFetchedAction).message)
    case SET_CURRENT_SCENE:
      return state.set('currentScene', (action as ScenesFetchedAction).scene)
  }

  return state
}

export default sceneReducer
