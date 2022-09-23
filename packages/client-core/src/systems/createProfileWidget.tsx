import { World } from '@xrengine/engine/src/ecs/classes/World'
import { removeComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { VisibleComponent } from '@xrengine/engine/src/scene/components/VisibleComponent'
import { WidgetName, Widgets } from '@xrengine/engine/src/xrui/Widgets'

import PersonIcon from '@mui/icons-material/Person'

import { createProfileDetailView } from './ui/ProfileDetailView'

export function createProfileWidget(world: World) {
  const ui = createProfileDetailView()
  removeComponent(ui.entity, VisibleComponent)
  Widgets.registerWidget(world, ui.entity, {
    ui,
    label: WidgetName.PROFILE,
    icon: PersonIcon,
    system: () => {}
  })
}
