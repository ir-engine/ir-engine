import { AvatarInputSettingsState } from '@xrengine/engine/src/avatar/state/AvatarInputSettingsState'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { removeComponent, setComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { VisibleComponent } from '@xrengine/engine/src/scene/components/VisibleComponent'
import { getCameraMode, XRAction, XRState } from '@xrengine/engine/src/xr/XRState'
import { XRUIInteractableComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { WidgetAppActions, WidgetAppState } from '@xrengine/engine/src/xrui/WidgetAppService'
import { Widget, Widgets } from '@xrengine/engine/src/xrui/Widgets'
import { createActionQueue, dispatchAction, getState, removeActionQueue } from '@xrengine/hyperflux'

import AnchorIcon from '@mui/icons-material/Anchor'

import { AnchorWidgetUI } from './ui/AnchorWidgetUI'

export function createAnchorWidget(world: World) {
  const ui = createXRUI(AnchorWidgetUI)
  removeComponent(ui.entity, VisibleComponent)
  setComponent(ui.entity, XRUIInteractableComponent)
  const xrState = getState(XRState)
  const avatarInputSettings = getState(AvatarInputSettingsState)

  const widgetState = getState(WidgetAppState)

  const xrSessionQueue = createActionQueue(XRAction.sessionChanged.matches)

  const widget: Widget = {
    ui,
    label: 'World Anchor',
    icon: AnchorIcon,
    onOpen: () => {
      dispatchAction(
        XRAction.changePlacementMode({
          inputSource: Array.from(world.inputSources.values()).find(
            (inputSource) => inputSource.handedness === avatarInputSettings.preferredHand.value
          )
        })
      )
    },
    system: () => {
      for (const action of xrSessionQueue()) {
        const widgetEnabled = xrState.sessionMode.value === 'immersive-ar'
        if (widgetState.widgets[id].enabled.value !== widgetEnabled)
          dispatchAction(WidgetAppActions.enableWidget({ id, enabled: widgetEnabled }))
      }
      if (!xrState.scenePlacementMode.value) return
      const flipped = avatarInputSettings.preferredHand.value === 'left'
      const buttonInput = flipped ? world.buttons.ButtonX?.down : world.buttons.ButtonA?.down
      if (buttonInput) {
        dispatchAction(
          XRAction.changePlacementMode({
            inputSource: null
          })
        )
      }
    },
    cleanup: async () => {
      removeActionQueue(xrSessionQueue)
    }
  }

  const id = Widgets.registerWidget(world, ui.entity, widget)
  /** @todo better API to disable */
  dispatchAction(WidgetAppActions.enableWidget({ id, enabled: false }))
}
