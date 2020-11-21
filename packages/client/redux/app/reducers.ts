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
  SET_APP_ONBOARDING_STEP,
  SET_APP_SPECIFIC_ONBOARDING_STEP,
  SET_USER_HAS_INTERACTED
} from '../actions';

type AppState = {
  loaded: boolean;
  inVrMode: boolean;
  viewport: {
    width: number;
    height: number;
  };
  onBoardingStep: number;
  isTutorial: boolean | false;
  userHasInteracted: boolean;
}

export const initialState: AppState = {
  loaded: false,
  inVrMode: false,
  viewport: {
    width: 1400,
    height: 900
  },
  onBoardingStep: generalStateList.START_STATE,
  isTutorial: false,
  userHasInteracted: false
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
    case SET_USER_HAS_INTERACTED:
      return state
          .set('userHasInteracted', true);
    case SET_APP_ONBOARDING_STEP: 
      console.log('onBoardingStep', action.onBoardingStep, 'isTutorial', action.isTutorial, '   -----',state.get('onBoardingStep'));

      return (action.onBoardingStep === generalStateList.ALL_DONE) ?
         state
          .set('onBoardingStep', action.onBoardingStep >= state.get('onBoardingStep') ? action.onBoardingStep : state.get('onBoardingStep')) :
          (action.onBoardingStep === generalStateList.SCENE_LOADED) ?
            state
              .set('onBoardingStep', action.onBoardingStep >= state.get('onBoardingStep') ? action.onBoardingStep : state.get('onBoardingStep'))
              .set('isTutorial', true)
            :
            state
              .set('onBoardingStep', action.onBoardingStep >= state.get('onBoardingStep') ? action.onBoardingStep : state.get('onBoardingStep'))
              .set('isTutorial', false);
    case SET_APP_SPECIFIC_ONBOARDING_STEP: 
    console.log('onBoardingStep', action.onBoardingStep, 'isTutorial', action.isTutorial);
          return state.set('onBoardingStep', action.onBoardingStep).set('isTutorial', action.isTutorial);
    default:
      break;
  }

  return state;
};

export default appReducer;
