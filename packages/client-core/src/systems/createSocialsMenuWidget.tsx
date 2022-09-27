import { World } from '@xrengine/engine/src/ecs/classes/World'
import { removeComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { VisibleComponent } from '@xrengine/engine/src/scene/components/VisibleComponent'
import { WidgetName, Widgets } from '@xrengine/engine/src/xrui/Widgets'

import GroupsIcon from '@mui/icons-material/Groups'

import { createSocialsMenuView } from './ui/SocialsMenuView'

export function createSocialsMenuWidget(world: World) {
  const ui = createSocialsMenuView()
  removeComponent(ui.entity, VisibleComponent)

  Widgets.registerWidget(world, ui.entity, {
    ui,
    label: WidgetName.SOCIALS,
    icon: GroupsIcon,
    system: () => {}
  })
}
