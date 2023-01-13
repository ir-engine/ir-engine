import { AvatarInputSettingsState } from '@xrengine/engine/src/avatar/state/AvatarInputSettingsState'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { removeComponent, setComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { VisibleComponent } from '@xrengine/engine/src/scene/components/VisibleComponent'
import { getControlMode, XRAction, XRState } from '@xrengine/engine/src/xr/XRState'
import { XRUIInteractableComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { WidgetAppActions, WidgetAppState } from '@xrengine/engine/src/xrui/WidgetAppService'
import { Widget, Widgets } from '@xrengine/engine/src/xrui/Widgets'
import { createActionQueue, dispatchAction, getState, removeActionQueue } from '@xrengine/hyperflux'

import GroupsIcon from '@mui/icons-material/Groups'

import { UserMediaWindowsWidget } from '../components/UserMediaWindows'

export function createMediaWidget(world: World) {
  const ui = createXRUI(UserMediaWindowsWidget)
  removeComponent(ui.entity, VisibleComponent)
  setComponent(ui.entity, XRUIInteractableComponent)

  const widget: Widget = {
    ui,
    label: 'Media',
    icon: GroupsIcon,
    onOpen: () => {},
    system: () => {},
    cleanup: async () => {}
  }

  const id = Widgets.registerWidget(world, ui.entity, widget)
}
