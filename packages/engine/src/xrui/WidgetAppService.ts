import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'
import { Downgraded, none } from '@xrengine/hyperflux/functions/StateFunctions'

import { matches, Validator } from '../common/functions/MatchesUtils'

type WidgetState = {
  [id: string]: {
    enabled: boolean
    visible: boolean
  }
}

const WidgetAppState = defineState({
  name: 'WidgetAppState',
  initial: () => ({
    widgetsMenuOpen: false,
    widgets: {} as WidgetState
  })
})

export const WidgetAppServiceReceptor = (action) => {
  getState(WidgetAppState).batch((s) => {
    matches(action)
      .when(WidgetAppActions.showWidgetMenu.matches, (action) => {
        return s.widgetsMenuOpen.set(action.shown)
      })
      .when(WidgetAppActions.registerWidget.matches, (action) => {
        return s.widgets.merge({
          [action.id]: {
            enabled: true,
            visible: false
          }
        })
      })
      .when(WidgetAppActions.unregisterWidget.matches, (action) => {
        if (s.widgets[action.id].visible) {
          s.widgetsMenuOpen.set(true)
        }
        return s.widgets[action.id].set(none)
      })
      .when(WidgetAppActions.enableWidget.matches, (action) => {
        return s.widgets[action.id].merge({
          enabled: action.enabled
        })
      })
      .when(WidgetAppActions.showWidget.matches, (action) => {
        // if opening or closing a widget, close or open the main menu
        s.widgetsMenuOpen.set(!action.shown)
        return s.widgets[action.id].merge({
          visible: action.shown
        })
      })
  })
}

export const accessWidgetAppState = () => getState(WidgetAppState)
export const useWidgetAppState = () => useState(accessWidgetAppState())

export const WidgetAppService = {}

export class WidgetAppActions {
  static showWidgetMenu = defineAction({
    type: 'WidgetAppActions.SHOW_WIDGET_MENU' as const,
    shown: matches.boolean
  })

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
