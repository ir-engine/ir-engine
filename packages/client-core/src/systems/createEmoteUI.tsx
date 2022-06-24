import { World } from '@xrengine/engine/src/ecs/classes/World'
import { addComponent, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { PersistTagComponent } from '@xrengine/engine/src/scene/components/PersistTagComponent'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { ObjectFitFunctions } from '@xrengine/engine/src/xrui/functions/ObjectFitFunctions'
import { Widgets } from '@xrengine/engine/src/xrui/Widgets'

import { EmoteIcon } from '../user/components/UserMenu'
import { createEmoteDetailView } from './ui/EmoteDetailView'

const widgetName = 'Emote Widget'

export function createEmoteUI(world: World) {
  const ui = createEmoteDetailView()

  addComponent(ui.entity, PersistTagComponent, {})

  ui.container.then(() => {
    const xrui = getComponent(ui.entity, XRUIComponent)
    ObjectFitFunctions.setUIVisible(xrui.container, false)
  })

  Widgets.registerWidget(world, ui.entity, {
    ui,
    label: widgetName,
    icon: EmoteIcon,
    system: () => {}
  })
}
