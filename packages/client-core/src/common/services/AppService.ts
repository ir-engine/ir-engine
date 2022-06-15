import { createState, useState } from '@speigg/hookstate'

import { store } from '../../store'

export enum GeneralStateList {
  START_STATE,
  AWAITING_INPUT,
  SCENE_LOADING,
  SCENE_LOADED,
  SUCCESS,
  FAILED,
  ALL_DONE
}

//State
const state = createState({
  loaded: false,
  inVrMode: false,
  viewport: {
    width: 1400,
    height: 900
  },
  onBoardingStep: GeneralStateList.START_STATE,
  isTutorial: false,
  loadPercent: 0
})

store.receptors.push((action: AppActionType): void => {
  state.batch((s) => {
    switch (action.type) {
      case 'SET_APP_LOADED':
        return s.merge({ loaded: action.loaded })
      case 'SET_APP_LOADING_PERCENT':
        return s.merge({ loadPercent: action.loadPercent })
      case 'SET_APP_ONBOARDING_STEP':
        return action.onBoardingStep === GeneralStateList.ALL_DONE
          ? s.merge({
              onBoardingStep:
                action.onBoardingStep >= state.onBoardingStep.value ? action.onBoardingStep : state.onBoardingStep.value
            })
          : action.onBoardingStep === GeneralStateList.SCENE_LOADED
          ? s.merge({
              onBoardingStep:
                action.onBoardingStep >= state.onBoardingStep.value
                  ? action.onBoardingStep
                  : state.onBoardingStep.value,
              isTutorial: true
            })
          : s.merge({
              onBoardingStep:
                action.onBoardingStep >= state.onBoardingStep.value
                  ? action.onBoardingStep
                  : state.onBoardingStep.value,
              isTutorial: false
            })
      case 'SET_APP_SPECIFIC_ONBOARDING_STEP':
        return s.merge({ onBoardingStep: action.onBoardingStep, isTutorial: action.isTutorial })
      default:
        break
    }
  }, action.type)
})

export const appState = () => state

export const useAppState = () => useState(state) as any as typeof state as any

//Action

export const AppAction = {
  // used for displaying loading screen
  setAppLoaded: (loaded: boolean) => {
    return {
      type: 'SET_APP_LOADED' as const,
      loaded
    }
  },
  setAppLoadPercent: (loadPercent: number) => {
    return {
      type: 'SET_APP_LOADING_PERCENT' as const,
      loadPercent
    }
  },
  //onboarding progress
  setAppOnBoardingStep: (onBoardingStep: number) => {
    return {
      type: 'SET_APP_ONBOARDING_STEP' as const,
      onBoardingStep
    }
  },
  //restart tutorial walkthrought
  setAppSpecificOnBoardingStep: (onBoardingStep: number, isTutorial: boolean) => {
    return {
      type: 'SET_APP_SPECIFIC_ONBOARDING_STEP' as const,
      onBoardingStep,
      isTutorial
    }
  }
}

export type AppActionType = ReturnType<typeof AppAction[keyof typeof AppAction]>
