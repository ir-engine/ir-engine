/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import {
  defineAction,
  defineActionQueue,
  defineState,
  dispatchAction,
  getMutableState
} from '@etherealengine/hyperflux'
import { none } from '@etherealengine/hyperflux/functions/StateFunctions'

import { matches, Validator } from '../common/functions/MatchesUtils'
import { Engine } from '../ecs/classes/Engine'
import { defineSystem } from '../ecs/functions/SystemFunctions'

type WidgetMutableState = Record<string, { enabled: boolean; visible: boolean }>

export const WidgetAppState = defineState({
  name: 'WidgetAppState',
  initial: () => ({
    widgetsMenuOpen: false,
    widgets: {} as WidgetMutableState,
    handedness: 'left' as 'left' | 'right'
  })
})

export const WidgetAppService = {
  setWidgetVisibility: (widgetName: string, visibility: boolean) => {
    const widgetMutableState = getMutableState(WidgetAppState)
    const widgets = Object.entries(widgetMutableState.widgets.value).map(([id, widgetMutableState]) => ({
      id,
      ...widgetMutableState,
      ...Engine.instance.widgets.get(id)!
    }))

    const currentWidget = widgets.find((w) => w.label === widgetName)

    // close currently open widgets until we support multiple widgets being open at once
    for (let widget of widgets) {
      if (currentWidget && widget.id !== currentWidget.id && widget.visible) {
        dispatchAction(WidgetAppActions.showWidget({ id: widget.id, shown: false }))
      }
    }

    currentWidget && dispatchAction(WidgetAppActions.showWidget({ id: currentWidget.id, shown: visibility }))
  }
}

export class WidgetAppActions {
  static showWidgetMenu = defineAction({
    type: 'xre.xrui.WidgetAppActions.SHOW_WIDGET_MENU' as const,
    shown: matches.boolean,
    handedness: matches.string.optional() as Validator<unknown, 'left' | 'right' | undefined>
  })

  static registerWidget = defineAction({
    type: 'xre.xrui.WidgetAppActions.REGISTER_WIDGET' as const,
    id: matches.string
  })

  static unregisterWidget = defineAction({
    type: 'xre.xrui.WidgetAppActions.UNREGISTER_WIDGET' as const,
    id: matches.string
  })

  static enableWidget = defineAction({
    type: 'xre.xrui.WidgetAppActions.ENABLE_WIDGET' as const,
    id: matches.string,
    enabled: matches.boolean
  })

  static showWidget = defineAction({
    type: 'xre.xrui.WidgetAppActions.SHOW_WIDGET' as const,
    id: matches.string,
    shown: matches.boolean,
    openWidgetMenu: matches.boolean.optional(),
    handedness: matches.string.optional() as Validator<unknown, 'left' | 'right' | undefined>
  })
}

const showWidgetMenuActionQueue = defineActionQueue(WidgetAppActions.showWidgetMenu.matches)
const registerWidgetActionQueue = defineActionQueue(WidgetAppActions.registerWidget.matches)
const unregisterWidgetActionQueue = defineActionQueue(WidgetAppActions.unregisterWidget.matches)
const enableWidgetActionQueue = defineActionQueue(WidgetAppActions.enableWidget.matches)
const showWidgetActionQueue = defineActionQueue(WidgetAppActions.showWidget.matches)

export const execute = () => {
  const s = getMutableState(WidgetAppState)

  for (const action of showWidgetMenuActionQueue()) {
    s.widgetsMenuOpen.set(action.shown)
    if (action.handedness) s.handedness.set(action.handedness)
  }

  for (const action of registerWidgetActionQueue()) {
    s.widgets.merge({
      [action.id]: {
        enabled: true,
        visible: false
      }
    })
  }

  for (const action of unregisterWidgetActionQueue()) {
    if (s.widgets[action.id].visible) {
      s.widgetsMenuOpen.set(true)
    }
    s.widgets[action.id].set(none)
  }

  for (const action of enableWidgetActionQueue()) {
    s.widgets[action.id].merge({
      enabled: action.enabled
    })
  }

  for (const action of showWidgetActionQueue()) {
    // if opening or closing a widget, close or open the main menu
    if (action.handedness) s.handedness.set(action.handedness)
    if (action.shown) s.widgetsMenuOpen.set(false)
    if (action.openWidgetMenu && !action.shown) s.widgetsMenuOpen.set(true)
    s.widgets[action.id].merge({
      visible: action.shown
    })
  }
}

export const WidgetAppServiceReceptorSystem = defineSystem({
  uuid: 'ee.engine.widgets.WidgetAppServiceReceptorSystem',
  execute
})
