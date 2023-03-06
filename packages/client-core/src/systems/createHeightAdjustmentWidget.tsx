import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { World } from '@etherealengine/engine/src/ecs/classes/World'
import { removeComponent, setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { ReferenceSpace, XRState } from '@etherealengine/engine/src/xr/XRState'
import { XRUIInteractableComponent } from '@etherealengine/engine/src/xrui/components/XRUIComponent'
import { createXRUI } from '@etherealengine/engine/src/xrui/functions/createXRUI'
import { WidgetAppActions } from '@etherealengine/engine/src/xrui/WidgetAppService'
import { Widget, Widgets } from '@etherealengine/engine/src/xrui/Widgets'
import { dispatchAction, getState } from '@etherealengine/hyperflux'
import Icon from '@etherealengine/ui/src/Icon'

export function createHeightAdjustmentWidget(world: World) {
  const ui = createXRUI(() => null)
  removeComponent(ui.entity, VisibleComponent)
  setComponent(ui.entity, XRUIInteractableComponent)

  const xrState = getState(XRState)

  const widget: Widget = {
    ui,
    label: 'Height Adjustment',
    icon: 'Accessibility',
    onOpen: () => {
      dispatchAction(WidgetAppActions.showWidget({ id, shown: false }))
      const xrFrame = Engine.instance.xrFrame
      if (!xrFrame) return
      // set user height from viewer pose relative to local floor
      const viewerPose = xrFrame.getViewerPose(ReferenceSpace.localFloor!)
      if (viewerPose) {
        xrState.userEyeLevel.set(viewerPose.transform.position.y)
      }
    }
  }

  const id = Widgets.registerWidget(world, ui.entity, widget)
  /** @todo better API to disable */
  dispatchAction(WidgetAppActions.enableWidget({ id, enabled: false }))
}
