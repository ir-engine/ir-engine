import { GeneralStateList, AppActionType } from './AppActions'
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'

/*
type AppState = {
  loaded: boolean
  inVrMode: boolean
  viewport: {
    width: number
    height: number
  }
  onBoardingStep: number
  isTutorial: boolean | false
  userHasInteracted: boolean
  loadPercent: number
}*/

const state = createState({
  loaded: false,
  inVrMode: false,
  viewport: {
    width: 1400,
    height: 900
  },
  onBoardingStep: GeneralStateList.START_STATE,
  isTutorial: false,
  userHasInteracted: false,
  loadPercent: 0
})

export const receptor = (action: AppActionType): void => {
  state.batch((s) => {
    switch (action.type) {
      case 'SET_APP_LOADED':
        return s.merge({ loaded: action.loaded })
      case 'SET_APP_LOADING_PERCENT':
        return s.merge({ loadPercent: action.loadPercent })
      case 'SET_VIEWPORT_SIZE':
        return s.merge({ viewport: { width: action.width, height: action.height } })
      case 'SET_IN_VR_MODE':
        return s.merge({ inVrMode: action.inVrMode })
      case 'SET_USER_HAS_INTERACTED':
        return s.merge({ userHasInteracted: true })
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
}

export const appState = () => state

export const useAppState = () => useState(state) as any as typeof state as any
