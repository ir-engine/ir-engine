import { WebLayer3D } from '@etherealjs/web-layer/three'
import { Not } from 'bitecs'
import { Vector3 } from 'three'

import { createState } from '@xrengine/hyperflux/functions/StateFunctions'

import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { getAvatarBoneWorldPosition } from '../../avatar/functions/avatarFunctions'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
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
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRUIComponent } from '../../xrui/components/XRUIComponent'
import { createTransitionState } from '../../xrui/functions/createTransitionState'
import { createXRUI } from '../../xrui/functions/createXRUI'
import { BoundingBoxComponent } from '../components/BoundingBoxComponent'
import { InteractableComponent } from '../components/InteractableComponent'
import { InteractorComponent } from '../components/InteractorComponent'
import { createBoxComponent } from '../functions/createBoxComponent'
import { interactBoxRaycast } from '../functions/interactBoxRaycast'
import { createInteractUI } from '../functions/interactUI'

type InteractiveType = {
  xrui: ReturnType<typeof createXRUI>
  update: (entity: Entity, xrui: ReturnType<typeof createXRUI>) => void
}

const InteractiveUI = new Map<Entity, InteractiveType>()
const Transitions = new Map<Entity, ReturnType<typeof createTransitionState>>()

const vec3 = new Vector3()

const onUpdate = (entity: Entity, mountPoint: ReturnType<typeof createInteractUI>) => {
  const world = Engine.instance.currentWorld
  const xrui = getComponent(mountPoint.entity, XRUIComponent)
  const transform = getComponent(mountPoint.entity, TransformComponent)
  if (!transform || !getComponent(world.localClientEntity, TransformComponent)) return
  transform.position.copy(getComponent(entity, TransformComponent).position)
  transform.rotation.copy(getComponent(entity, TransformComponent).rotation)
  transform.position.y += 1
  const transition = Transitions.get(entity)!
  getAvatarBoneWorldPosition(world.localClientEntity, 'Hips', vec3)
  const distance = vec3.distanceToSquared(transform.position)
  const inRange = distance < 5
  if (transition.state === 'OUT' && inRange) {
    transition.setState('IN')
  }
  if (transition.state === 'IN' && !inRange) {
    transition.setState('OUT')
  }
  transition.update(world.deltaSeconds, (opacity) => {
    xrui.container.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
      const mat = layer.contentMesh.material as THREE.MeshBasicMaterial
      mat.opacity = opacity
    })
  })
}

export const getInteractiveUI = (entity) => InteractiveUI.get(entity)
export const removeInteractiveUI = (entity) => {
  if (hasComponent(entity, InteractableComponent)) {
    removeComponent(entity, InteractableComponent)
  }
}

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

  if (!update) {
    update = onUpdate
    const transition = createTransitionState(0.25)
    transition.setState('OUT')
    Transitions.set(entity, transition)
  }

  InteractiveUI.set(entity, { xrui, update })

  return xrui
}

export default async function InteractiveSystem(world: World) {
  const interactorsQuery = defineQuery([InteractorComponent])

  // Included Object3DComponent in query because Object3DComponent might be added with delay for network spawned objects
  const interactableQuery = defineQuery([InteractableComponent, Object3DComponent, Not(AvatarComponent)])

  return () => {
    for (const entity of interactableQuery.exit()) {
      if (Transitions.has(entity)) Transitions.delete(entity)
      if (InteractiveUI.has(entity)) InteractiveUI.delete(entity)
      if (hasComponent(entity, HighlightComponent)) removeComponent(entity, HighlightComponent)
    }

    const interactives = interactableQuery()

    for (const entity of interactives) {
      if (InteractiveUI.has(entity)) {
        const { update, xrui } = InteractiveUI.get(entity)!
        update(entity, xrui)
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
