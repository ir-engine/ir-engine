import { World } from '@xrengine/engine/src/ecs/classes/World'
import { dispatchAction } from '@xrengine/hyperflux'

import { Entity } from '../ecs/classes/Entity'
import { createXRUI } from './functions/createXRUI'
import { WidgetAppActions } from './WidgetAppService'

export interface Widget {
  ui: ReturnType<typeof createXRUI>
  label: string
  icon: any
}

export const registerWidget = (world: World, xruiEntity: Entity, widget: Widget) => {
  const id = `${widget.label}-${xruiEntity}`
  dispatchAction(WidgetAppActions.registerWidget({ id }))
  world.widgets.set(id, widget)
}

export const Widgets = {
  registerWidget
}
