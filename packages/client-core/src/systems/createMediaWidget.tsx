import { removeComponent, setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { XRUIInteractableComponent } from '@etherealengine/engine/src/xrui/components/XRUIComponent'
import { createXRUI } from '@etherealengine/engine/src/xrui/functions/createXRUI'
import { Widget, Widgets } from '@etherealengine/engine/src/xrui/Widgets'

import GroupsIcon from '@mui/icons-material/Groups'

import { UserMediaWindowsWidget } from '../components/UserMediaWindows'

export function createMediaWidget() {
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

  const id = Widgets.registerWidget(ui.entity, widget)
}
