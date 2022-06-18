import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { matches, Validator } from '../common/functions/MatchesUtils'

type WidgetState = {
  [id: string]: {
    enabled: boolean
    visible: boolean
  }
}

const WidgetAppState = defineState({
  name: 'WidgetAppState',
  initial: () => ({} as WidgetState)
})

export const WidgetAppServiceReceptor = (action) => {
  getState(WidgetAppState).batch((s) => {
    matches(action)
      .when(WidgetAppActions.registerWidget.matches, (action) => {
        return s.merge({
          [action.id]: {
            enabled: true,
            visible: false
          }
        })
      })
      .when(WidgetAppActions.unregisterWidget.matches, (action) => {
        return s[action.id].set(undefined!)
      })
      .when(WidgetAppActions.enableWidget.matches, (action) => {
        return s[action.id].merge({
          enabled: action.enabled
        })
      })
      .when(WidgetAppActions.showWidget.matches, (action) => {
        return s[action.id].merge({
          visible: action.shown
        })
      })
  })
}

export const accessWidgetAppState = () => getState(WidgetAppState)
export const useWidgetAppState = () => useState(accessWidgetAppState())

export const WidgetAppService = {}

export class WidgetAppActions {
  static registerWidget = defineAction({
    type: 'WidgetAppActions.REGISTER_WIDGET' as const,
    id: matches.string
  })

  static unregisterWidget = defineAction({
    type: 'WidgetAppActions.UNREGISTER_WIDGET' as const,
    id: matches.string
  })

  static enableWidget = defineAction({
    type: 'WidgetAppActions.ENABLE_WIDGET' as const,
    id: matches.string,
    enabled: matches.boolean
  })

  static showWidget = defineAction({
    type: 'WidgetAppActions.SHOW_WIDGET' as const,
    id: matches.string,
    shown: matches.boolean
  })
}
