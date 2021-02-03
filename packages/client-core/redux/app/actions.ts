import {
  SET_APP_LOADED,
  SET_APP_LOADING_PERCENT,
  SET_VIEWPORT_SIZE,
  SET_IN_VR_MODE,
  SET_APP_ONBOARDING_STEP,
  SET_APP_SPECIFIC_ONBOARDING_STEP,
  SET_USER_HAS_INTERACTED
} from '../actions';

export enum generalStateList { START_STATE, SCENE_LOADING, SCENE_LOADED, FAILED, DEVICE_SETUP, AVATAR_SELECTION, AVATAR_SELECTED, ALL_DONE }

type Action = {
  type: string;
  [key: string]: any;
}
export interface AppLoadedAction extends Action {
  loaded: boolean;
  [payload: string]: any;
}

export interface SetViewportAction extends Action {
  viewportSize: {
    width: number;
    height: number;
  };
}
export interface AppLoadPercentAction extends Action {
  loadPercent: number;
}

export interface AppOnBoardingStepAction extends Action {
  onBoardingStep: number;
  isTutorial?: boolean;
}

// used for displaying loading screen

export const setAppLoaded = (loaded: boolean): AppLoadedAction => ({ type: SET_APP_LOADED, loaded });

export const setAppLoadPercent = (loadPercent: number): AppLoadPercentAction => ({ type: SET_APP_LOADING_PERCENT, loadPercent });
//onboarding progress
export const setAppOnBoardingStep = (onBoardingStep: number): AppOnBoardingStepAction => ({ type: SET_APP_ONBOARDING_STEP, onBoardingStep });
//restart tutorial walkthrought
export const setAppSpecificOnBoardingStep = (onBoardingStep: number, isTutorial: boolean): AppOnBoardingStepAction => ({ type: SET_APP_SPECIFIC_ONBOARDING_STEP, onBoardingStep, isTutorial });
// used for getting window.innerWidth and height.
export const setViewportSize = (width: number, height: number) => ({
  type: SET_VIEWPORT_SIZE,
  width,
  height
});

export const setAppInVrMode = (inVrMode: boolean) => ({
  type: SET_IN_VR_MODE,
  inVrMode
});

export const setUserHasInteracted = () => ({
  type: SET_USER_HAS_INTERACTED
});