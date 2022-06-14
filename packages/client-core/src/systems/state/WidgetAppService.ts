import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

const WidgetAppState = defineState({
  name: 'WidgetAppState',
  initial: () => ({})
})

export const WidgetAppServiceReceptor = (action) => {
  getState(WidgetAppState).batch((s) => {
    matches(action).when(WidgetAppActions.toggleWidget.matches, (action) => {
      return s.merge({
        [action.name]: action.toggle
      })
    })
  })
}

export const accessWidgetAppState = () => getState(WidgetAppState)
export const useWidgetAppState = () => useState(accessWidgetAppState())

//Service
export const WidgetAppService = {
  registerWidget: (name: string) => {
    // TODO: make a registry on the engine
    // Engine.instance.widgets.push({ ... })

    dispatchAction(WidgetAppActions.toggleWidget({ name, toggle: false }))
  }
}

//Action
export class WidgetAppActions {
  static toggleWidget = defineAction({
    type: 'client.OPEN_WIDGET' as const,
    name: matches.string,
    toggle: matches.boolean
  })
}
