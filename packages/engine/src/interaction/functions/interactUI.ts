import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../ecs/functions/ComponentFunctions'
import { NameComponent } from '../../scene/components/NameComponent'
import { createInteractiveModalView } from '../ui/InteractiveModalView'

export function createInteractUI(entity: Entity, interactMessage: string) {
  const ui = createInteractiveModalView(entity, interactMessage)
  const nameComponent = getComponent(entity, NameComponent)
  addComponent(ui.entity, NameComponent, { name: 'interact-ui-' + nameComponent.name })
  return ui
}

export const updateInteractUI = (entity: Entity, xrui: ReturnType<typeof createInteractUI>) => {}
