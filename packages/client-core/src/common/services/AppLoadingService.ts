import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, getState, useState } from '@xrengine/hyperflux'

export const AppLoadingStates = {
  START_STATE: 'START_STATE' as const,
  SCENE_LOADING: 'SCENE_LOADING' as const,
  SUCCESS: 'SUCCESS' as const
}

type AppLoadingStatesType = typeof AppLoadingStates[keyof typeof AppLoadingStates]

//State
const AppLoadingState = defineState({
  name: 'AppLoadingState',
  initial: () => ({
    loaded: false,
    state: AppLoadingStates.START_STATE as AppLoadingStatesType,
    loadPercent: 0
  })
})

export const AppLoadingServiceReceptor = (action) => {
  const s = getState(AppLoadingState)
  matches(action)
    .when(AppLoadingAction.setLoadPercent.matches, (action) => {
      return s.merge({ loadPercent: action.loadPercent })
    })
    .when(AppLoadingAction.setLoadingState.matches, (action) => {
      return s.merge({
        state: action.state,
        loaded: action.state === AppLoadingStates.SUCCESS
      })
    })
}

export const accessLoadingState = () => getState(AppLoadingState)

export const useLoadingState = () => useState(accessLoadingState())

export class AppLoadingAction {
  static setLoadPercent = defineAction({
    type: 'xre.client.AppLoading.SET_LOADING_PERCENT' as const,
    loadPercent: matches.number
  })

  static setLoadingState = defineAction({
    type: 'xre.client.AppLoading.SET_LOADING_STATE' as const,
    state: matches.string as Validator<unknown, AppLoadingStatesType>
  })
}
