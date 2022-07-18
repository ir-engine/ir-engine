import { Not } from 'bitecs'

import { createState } from '@xrengine/hyperflux/functions/StateFunctions'

import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { Entity } from '../../ecs/classes/Entity'
import {
  addComponent,
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent
} from '../../ecs/functions/ComponentFunctions'
import { HighlightComponent } from '../../renderer/components/HighlightComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { SCENE_COMPONENT_INTERACTABLE_DEFAULT_VALUES } from '../../scene/functions/loaders/InteractableFunctions'
import { createXRUI } from '../../xrui/functions/createXRUI'
import { BoundingBoxComponent } from '../components/BoundingBoxComponent'
import { InteractableComponent } from '../components/InteractableComponent'
import { InteractorComponent } from '../components/InteractorComponent'
import { createBoxComponent } from '../functions/createBoxComponent'
import { interactBoxRaycast } from '../functions/interactBoxRaycast'

type InteractiveType = {
  xrui: ReturnType<typeof createXRUI>
  update?: (entity: Entity, xrui: ReturnType<typeof createXRUI>) => void
}

const InteractiveUI = new Map<Entity, InteractiveType>()

export const getInteractiveUI = (entity) => InteractiveUI.get(entity)
export const removeInteractiveUI = (entity) => InteractiveUI.delete(entity)

export const addInteractableUI = (
  entity: Entity,
  xrui: ReturnType<typeof createXRUI>,
  update?: (entity: Entity, xrui: ReturnType<typeof createXRUI>) => void
) => {
  if (!hasComponent(entity, BoundingBoxComponent)) {
    createBoxComponent(entity)
  }
  if (!hasComponent(entity, InteractableComponent)) {
    addComponent(entity, InteractableComponent, SCENE_COMPONENT_INTERACTABLE_DEFAULT_VALUES)
  }
  InteractiveUI.set(entity, { xrui, update })
}

export default async function InteractiveSystem() {
  const interactorsQuery = defineQuery([InteractorComponent])

  // Included Object3DComponent in query because Object3DComponent might be added with delay for network spawned objects
  const interactableQuery = defineQuery([InteractableComponent, Object3DComponent, Not(AvatarComponent)])

  return () => {
    for (const entity of interactableQuery.exit()) {
      if (InteractiveUI.has(entity)) InteractiveUI.delete(entity)
      if (hasComponent(entity, HighlightComponent)) removeComponent(entity, HighlightComponent)
    }

    const interactives = interactableQuery()

    for (const entity of interactives) {
      if (InteractiveUI.has(entity)) {
        const { update, xrui } = InteractiveUI.get(entity)!
        if (update) update(entity, xrui)
      }
      if (hasComponent(entity, HighlightComponent)) removeComponent(entity, HighlightComponent)
    }

    for (const entity of interactorsQuery()) {
      interactBoxRaycast(entity, interactives)
      const interactor = getComponent(entity, InteractorComponent)
      if (interactor.focusedInteractive) {
        if (!hasComponent(interactor.focusedInteractive, HighlightComponent)) {
          addComponent(interactor.focusedInteractive, HighlightComponent, {})
        }
      }
    }
  }
}
