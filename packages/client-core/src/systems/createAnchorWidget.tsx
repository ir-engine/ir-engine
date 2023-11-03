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

import { getComponent, removeComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { XRAction, XRState } from '@etherealengine/engine/src/xr/XRState'
import { createXRUI } from '@etherealengine/engine/src/xrui/functions/createXRUI'
import { WidgetAppActions } from '@etherealengine/engine/src/xrui/WidgetAppService'
import { Widget, Widgets } from '@etherealengine/engine/src/xrui/Widgets'
import {
  defineActionQueue,
  dispatchAction,
  getMutableState,
  getState,
  removeActionQueue,
  startReactor,
  useHookstate
} from '@etherealengine/hyperflux'

import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { InputComponent } from '@etherealengine/engine/src/input/components/InputComponent'
import { InputSourceComponent } from '@etherealengine/engine/src/input/components/InputSourceComponent'
import { XRStandardGamepadAxes, XRStandardGamepadButton } from '@etherealengine/engine/src/input/state/ButtonState'
import { XRAnchorSystemState } from '@etherealengine/engine/src/xr/XRAnchorSystem'
import { useEffect } from 'react'
import { MathUtils } from 'three'
import { AnchorWidgetUI } from './ui/AnchorWidgetUI'

export function createAnchorWidget() {
  const ui = createXRUI(AnchorWidgetUI)
  removeComponent(ui.entity, VisibleComponent)
  const xrState = getMutableState(XRState)

  const xrSessionQueue = defineActionQueue(XRAction.sessionChanged.matches)

  let lastX = 0
  let lastY = 0

  const widget: Widget = {
    ui,
    label: 'World Anchor',
    icon: 'Anchor',
    onOpen: () => {
      xrState.scenePlacementMode.set('placing')
      dispatchAction(WidgetAppActions.showWidgetMenu({ shown: false }))
    },
    system: () => {
      if (xrState.session.value?.interactionMode !== 'world-space') return
      if (xrState.scenePlacementMode.value !== 'placing') return

      const scenePlacementEntity = getState(XRAnchorSystemState).scenePlacementEntity
      const inputSourceEntities = getComponent(scenePlacementEntity, InputComponent).inputSources
      for (const inputEntity of inputSourceEntities) {
        const inputComponent = getComponent(inputEntity, InputSourceComponent)
        if (inputComponent.source.gamepad?.mapping !== 'xr-standard') return

        const buttonInputPressed = inputComponent.buttons[XRStandardGamepadButton.Trigger]?.down

        if (buttonInputPressed) {
          xrState.scenePlacementMode.set('placed')
        }

        const { deltaSeconds } = getState(EngineState)

        const xAxisInput = inputComponent.source.gamepad.axes[XRStandardGamepadAxes.ThumbstickX]
        const yAxisInput = inputComponent.source.gamepad.axes[XRStandardGamepadAxes.ThumbstickY]

        if (lastX) {
          const xDelta = (lastX - xAxisInput) * Math.PI * deltaSeconds
          getMutableState(XRState).sceneRotationOffset.set((currentValue) => currentValue + xDelta)
        }
        lastX = xAxisInput

        if (!xrState.sceneScaleAutoMode.value) {
          if (lastY) {
            const yDelta = (lastY - yAxisInput) * deltaSeconds
            xrState.sceneScaleTarget.set((currentValue) => MathUtils.clamp(currentValue + yDelta, 0.01, 0.2))
          }
          lastY = yAxisInput
        }

        const triggerButtonPressed = inputComponent.buttons[XRStandardGamepadButton.Stick]?.down

        if (triggerButtonPressed) {
          xrState.sceneScaleAutoMode.set(!xrState.sceneScaleAutoMode.value)
          if (!xrState.sceneScaleAutoMode.value) {
            xrState.sceneScaleTarget.set(0.2)
          }
        }
      }
    },
    cleanup: async () => {
      removeActionQueue(xrSessionQueue)
    }
  }

  const id = Widgets.registerWidget(ui.entity, widget)

  const reactor = startReactor(() => {
    const sessionMode = useHookstate(getMutableState(XRState).sessionMode)

    useEffect(() => {
      const widgetEnabled = sessionMode.value === 'immersive-ar'
      dispatchAction(WidgetAppActions.enableWidget({ id, enabled: widgetEnabled }))
    }, [sessionMode])

    return null
  })
}
