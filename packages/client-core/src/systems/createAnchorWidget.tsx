import { AvatarInputSettingsState } from '@xrengine/engine/src/avatar/state/AvatarInputSettingsState'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { removeComponent, setComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { GamepadButtons } from '@xrengine/engine/src/input/enums/InputEnums'
import { VisibleComponent } from '@xrengine/engine/src/scene/components/VisibleComponent'
import { getControlMode, XRAction, XRState } from '@xrengine/engine/src/xr/XRState'
import { XRUIInteractableComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { Widget, Widgets } from '@xrengine/engine/src/xrui/Widgets'
import { dispatchAction, getState, removeActionQueue } from '@xrengine/hyperflux'

import AnchorIcon from '@mui/icons-material/Anchor'

import { AnchorWidgetUI } from './ui/AnchorWidgetUI'

export function createAnchorWidget(world: World) {
  const ui = createXRUI(AnchorWidgetUI)
  removeComponent(ui.entity, VisibleComponent)
  setComponent(ui.entity, XRUIInteractableComponent)
  const xrState = getState(XRState)
  const avatarInputSettings = getState(AvatarInputSettingsState)

  const widget: Widget = {
    ui,
    label: 'World Anchor',
    icon: AnchorIcon,
    onOpen: () => {
      /** todo, actually disable the widget instead of just not dispatching the action */
      if (xrState.sessionMode.value !== 'immersive-ar') return
      dispatchAction(
        XRAction.changePlacementMode({
          active: true
        })
      )
    },
    system: () => {
      const isImmersive = getControlMode() === 'attached'
      if (!isImmersive) return
      if (!xrState.scenePlacementMode.value) return
      const buttonInput =
        avatarInputSettings.preferredHand.value === 'left'
          ? world.inputState.get(GamepadButtons.X)
          : world.inputState.get(GamepadButtons.A)
      if (buttonInput) {
        dispatchAction(
          XRAction.changePlacementMode({
            active: false
          })
        )
      }
    }
  }
  Widgets.registerWidget(world, ui.entity, widget)
}
