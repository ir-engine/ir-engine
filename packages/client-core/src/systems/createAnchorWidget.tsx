import { World } from '@etherealengine/engine/src/ecs/classes/World'
import { removeComponent, setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { ReferenceSpace, XRAction, XRState } from '@etherealengine/engine/src/xr/XRState'
import { XRUIInteractableComponent } from '@etherealengine/engine/src/xrui/components/XRUIComponent'
import { createXRUI } from '@etherealengine/engine/src/xrui/functions/createXRUI'
import { WidgetAppActions, WidgetAppState } from '@etherealengine/engine/src/xrui/WidgetAppService'
import { Widget, Widgets } from '@etherealengine/engine/src/xrui/Widgets'
import { createActionQueue, dispatchAction, getState, removeActionQueue } from '@etherealengine/hyperflux'
import AnchorIcon from '@etherealengine/ui/src/Icon'

import { AnchorWidgetUI } from './ui/AnchorWidgetUI'

export function createAnchorWidget(world: World) {
  const ui = createXRUI(AnchorWidgetUI)
  removeComponent(ui.entity, VisibleComponent)
  setComponent(ui.entity, XRUIInteractableComponent)
  const xrState = getState(XRState)
  // const avatarInputSettings = getState(AvatarInputSettingsState)

  const widgetState = getState(WidgetAppState)

  const xrSessionQueue = createActionQueue(XRAction.sessionChanged.matches)

  const widget: Widget = {
    ui,
    label: 'World Anchor',
    icon: 'Anchor',
    onOpen: () => {
      const xrSession = xrState.session.value
      if (!xrSession || !ReferenceSpace.viewer) return
      xrState.scenePlacementMode.set('placing')
    },
    system: () => {
      for (const action of xrSessionQueue()) {
        const widgetEnabled = xrState.sessionMode.value === 'immersive-ar'
        if (widgetState.widgets[id].enabled.value !== widgetEnabled)
          dispatchAction(WidgetAppActions.enableWidget({ id, enabled: widgetEnabled }))
      }
      if (!xrState.scenePlacementMode.value) return
      // const flipped = avatarInputSettings.preferredHand.value === 'left'
      // const buttonInput = flipped ? world.buttons.ButtonX?.down : world.buttons.ButtonA?.down
      // if (buttonInput) {
      //   createAnchor().then((anchor: XRAnchor) => {
      //     setComponent(entity, XRAnchorComponent, { anchor })
      //   })
      //   removeComponent(xrState.scenePlacementEntity.value, XRHitTestComponent)
      // }
    },
    cleanup: async () => {
      removeActionQueue(xrSessionQueue)
    }
  }

  const id = Widgets.registerWidget(world, ui.entity, widget)
  /** @todo better API to disable */
  dispatchAction(WidgetAppActions.enableWidget({ id, enabled: false }))
}
