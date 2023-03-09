import { removeComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { WidgetName, Widgets } from '@etherealengine/engine/src/xrui/Widgets'

import { createUploadAvatarMenu } from './ui/ProfileDetailView/UploadAvatarMenu'

export function createUploadAvatarWidget() {
  const ui = createUploadAvatarMenu()
  removeComponent(ui.entity, VisibleComponent)

  Widgets.registerWidget(ui.entity, {
    ui,
    label: WidgetName.UPLOAD_AVATAR,
    system: () => {}
  })
}
