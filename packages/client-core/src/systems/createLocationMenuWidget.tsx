import { World } from '@xrengine/engine/src/ecs/classes/World'
import { removeComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { VisibleComponent } from '@xrengine/engine/src/scene/components/VisibleComponent'
import { WidgetName, Widgets } from '@xrengine/engine/src/xrui/Widgets'

import LocationOnIcon from '@mui/icons-material/LocationOn'

import { createLocationMenuView } from './ui/LocationMenuView'

export function createLocationMenuWidget(world: World) {
  const ui = createLocationMenuView()
  removeComponent(ui.entity, VisibleComponent)

  Widgets.registerWidget(world, ui.entity, {
    ui,
    label: WidgetName.LOCATION,
    icon: LocationOnIcon,
    system: () => {}
  })
}
