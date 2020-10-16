import Immutable from 'immutable';
import {
  AppLoadedAction,
  generalStateList,
  SetViewportAction
} from './actions';

import {
  SET_APP_LOADED,
  SET_APP_LOADING_PERCENT,
  SET_VIEWPORT_SIZE,
  SET_IN_VR_MODE,
  SET_APP_ONBOARDING_STEP
} from '../actions';

type AppState = {
  loaded: boolean;
  inVrMode: boolean;
  viewport: {
    width: number;
    height: number;
  };
  onBoardingStep : number;
}

export const initialState: AppState = {
  loaded: false,
  inVrMode: false,
  viewport: {
    width: 1400,
    height: 900
  },
  onBoardingStep: generalStateList.START_STATE
};

const immutableState = Immutable.fromJS(initialState);

const appReducer = (state = immutableState, action: AppLoadedAction | SetViewportAction): AppState => {
  switch (action.type) {
    case SET_APP_LOADED:
      return state
        .set('loaded', action.loaded);
    case SET_APP_LOADING_PERCENT:
      return state
        .set('loadPercent', action.loadPercent);
    case SET_VIEWPORT_SIZE:
      return state
        .set('viewport', { width: action.width, height: action.height });
    case SET_IN_VR_MODE:
      return state
        .set('inVrMode', action.inVrMode);
    case SET_APP_ONBOARDING_STEP: 
          return state
            .set('onBoardingStep', action.onBoardingStep >= state.get('onBoardingStep') ? action.onBoardingStep : state.get('onBoardingStep'));
    default:
      break;
  }

  return state;
};

export default appReducer;
