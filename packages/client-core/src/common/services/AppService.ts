import { matches } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, getState, useState } from '@xrengine/hyperflux'

/**
 * @todo
 *
 * Rename this service to 'LocationLoadService'
 */

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
const AppState = defineState({
  name: 'AppState',
  initial: () => ({
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
})

export const AppServiceReceptor = (action) => {
  getState(AppState).batch((s) => {
    matches(action)
      .when(AppAction.setAppLoaded.matches, (action) => {
        return s.merge({ loaded: action.loaded })
      })
      .when(AppAction.setAppLoadPercent.matches, (action) => {
        return s.merge({ loadPercent: action.loadPercent })
      })
      .when(AppAction.setAppOnBoardingStep.matches, (action) => {
        return action.onBoardingStep === GeneralStateList.ALL_DONE
          ? s.merge({
              onBoardingStep:
                action.onBoardingStep >= s.onBoardingStep.value ? action.onBoardingStep : s.onBoardingStep.value
            })
          : action.onBoardingStep === GeneralStateList.SCENE_LOADED
          ? s.merge({
              onBoardingStep:
                action.onBoardingStep >= s.onBoardingStep.value ? action.onBoardingStep : s.onBoardingStep.value,
              isTutorial: true
            })
          : s.merge({
              onBoardingStep:
                action.onBoardingStep >= s.onBoardingStep.value ? action.onBoardingStep : s.onBoardingStep.value,
              isTutorial: false
            })
      })
      .when(AppAction.setAppSpecificOnBoardingStep.matches, (action) => {
        return s.merge({ onBoardingStep: action.onBoardingStep, isTutorial: action.isTutorial })
      })
  })
}

export const accessAppState = () => getState(AppState)

export const useAppState = () => useState(accessAppState())

//Action

export class AppAction {
  // used for displaying loading screen
  static setAppLoaded = defineAction({
    type: 'SET_APP_LOADED' as const,
    loaded: matches.boolean
  })

  static setAppLoadPercent = defineAction({
    type: 'SET_APP_LOADING_PERCENT' as const,
    loadPercent: matches.number
  })

  //onboarding progress
  static setAppOnBoardingStep = defineAction({
    type: 'SET_APP_ONBOARDING_STEP' as const,
    onBoardingStep: matches.number
  })

  //restart tutorial walkthrought
  static setAppSpecificOnBoardingStep = defineAction({
    type: 'SET_APP_SPECIFIC_ONBOARDING_STEP' as const,
    onBoardingStep: matches.number,
    isTutorial: matches.boolean
  })
}
