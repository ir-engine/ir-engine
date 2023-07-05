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

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { removeComponent, setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { ReferenceSpace, XRState } from '@etherealengine/engine/src/xr/XRState'
import { createXRUI } from '@etherealengine/engine/src/xrui/functions/createXRUI'
import { WidgetAppActions } from '@etherealengine/engine/src/xrui/WidgetAppService'
import { Widget, Widgets } from '@etherealengine/engine/src/xrui/Widgets'
import { dispatchAction, getMutableState } from '@etherealengine/hyperflux'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

export function createHeightAdjustmentWidget() {
  const ui = createXRUI(() => null)
  removeComponent(ui.entity, VisibleComponent)

  const xrState = getMutableState(XRState)

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

  const id = Widgets.registerWidget(ui.entity, widget)
  /** @todo better API to disable */
  dispatchAction(WidgetAppActions.enableWidget({ id, enabled: false }))
}
