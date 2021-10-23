export enum GeneralStateList {
  START_STATE,
  AWAITING_INPUT,
  SCENE_LOADING,
  SCENE_LOADED,
  SUCCESS,
  FAILED,
  ALL_DONE
}

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
  },
  // used for getting window.innerWidth and height.
  setViewportSize: (width: number, height: number) => {
    return {
      type: 'SET_VIEWPORT_SIZE' as const,
      width,
      height
    }
  },
  setAppInVrMode: (inVrMode: boolean) => {
    return {
      type: 'SET_IN_VR_MODE' as const,
      inVrMode
    }
  },
  setUserHasInteracted: () => {
    return {
      type: 'SET_USER_HAS_INTERACTED' as const
    }
  }
}

export type AppActionType = ReturnType<typeof AppAction[keyof typeof AppAction]>
