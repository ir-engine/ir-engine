import { WebLayer3D } from '@etherealjs/web-layer/three'
import { Not } from 'bitecs'
import { AxesHelper, Vector3 } from 'three'
import { Quaternion } from 'yuka'

import { setObjectLayers } from '@xrengine/engine/src/scene/functions/setObjectLayers'
import { defineState, getState } from '@xrengine/hyperflux'

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
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import {
  DistanceFromLocalClientComponent,
  setDistanceFromLocalClientComponent
} from '../../transform/components/DistanceComponents'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { createTransitionState } from '../../xrui/functions/createTransitionState'
import { createXRUI } from '../../xrui/functions/createXRUI'
import { ObjectFitFunctions } from '../../xrui/functions/ObjectFitFunctions'
import { BoundingBoxComponent } from '../components/BoundingBoxComponents'
import { InteractableComponent, setInteractableComponent } from '../components/InteractableComponent'
import { gatherAvailableInteractables } from '../functions/gatherAvailableInteractables'
import { createInteractUI } from '../functions/interactUI'

export const InteractState = defineState({
  name: 'InteractState',
  initial: () => {
    return {
      /**
       * closest interactable to the player, in view of the camera, sorted by distance
       */
      available: [] as Entity[]
    }
  }
})

export type InteractiveType = {
  xrui: ReturnType<typeof createXRUI>
  update: (entity: Entity, xrui: ReturnType<typeof createXRUI>) => void
}

export const InteractiveUI = new Map<Entity, InteractiveType>()
export const InteractableTransitions = new Map<Entity, ReturnType<typeof createTransitionState>>()

const vec3 = new Vector3()

export const onInteractableUpdate = (entity: Entity, xrui: ReturnType<typeof createInteractUI>) => {
  const world = Engine.instance.currentWorld
  const transform = getComponent(xrui.entity, TransformComponent)
  if (!transform || !getComponent(world.localClientEntity, TransformComponent)) return
  transform.position.copy(getComponent(entity, TransformComponent).position)
  transform.rotation.copy(getComponent(entity, TransformComponent).rotation)
  transform.position.y += 1
  const transition = InteractableTransitions.get(entity)!
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
  ObjectFitFunctions.lookAtCameraFromPosition(xrui.container, transform.position)
}

export const getInteractiveUI = (entity: Entity) => InteractiveUI.get(entity)
export const removeInteractiveUI = (entity: Entity) => InteractiveUI.delete(entity)

export const addInteractableUI = (
  entity: Entity,
  xrui: ReturnType<typeof createXRUI>,
  update?: (entity: Entity, xrui: ReturnType<typeof createXRUI>) => void
) => {
  setInteractableComponent(entity)

  if (!update) {
    update = onInteractableUpdate
    const transition = createTransitionState(0.25)
    transition.setState('OUT')
    InteractableTransitions.set(entity, transition)
  }

  InteractiveUI.set(entity, { xrui, update })
}

export default async function InteractiveSystem(world: World) {
  const allInteractablesQuery = defineQuery([InteractableComponent])

  // Included Object3DComponent in query because Object3DComponent might be added with delay for network spawned objects
  const interactableQuery = defineQuery([
    InteractableComponent,
    Object3DComponent,
    Not(AvatarComponent),
    DistanceFromLocalClientComponent
  ])

  return () => {
    // ensure distance component is set on all interactables
    for (const entity of allInteractablesQuery.enter()) {
      setDistanceFromLocalClientComponent(entity)
    }

    // TODO: refactor InteractiveUI to be ui-centric rather than interactable-centeric
    for (const entity of interactableQuery.exit()) {
      if (InteractableTransitions.has(entity)) InteractableTransitions.delete(entity)
      if (InteractiveUI.has(entity)) InteractiveUI.delete(entity)
      if (hasComponent(entity, HighlightComponent)) removeComponent(entity, HighlightComponent)
    }

    // for (const entity of interactableQuery.enter()) {
    //   const interactable = getComponent(entity, InteractableComponent)
    //   const transform = getComponent(entity, TransformComponent)
    //   const obj = getComponent(entity, Object3DComponent).value
    //   const boundingBoxComponent = getComponent(entity, BoundingBoxComponent)

    //   // center the model within it's bounding box
    //   boundingBoxComponent.box.setFromObject(obj)
    //   const offset = boundingBoxComponent.box.getCenter(obj.children[0].position).sub(transform.position).negate()
    //   obj.position.sub(offset)

    //   // put the model on the UI layer
    //   setObjectLayers(obj, ObjectLayers.UI)

    //   interactable.anchorPosition.copy(transform.position)
    //   interactable.anchorRotation.copy(transform.rotation)

    //   // const helper = new AxesHelper(1)
    //   // obj.add(helper)
    // }

    if (Engine.instance.currentWorld.localClientEntity) {
      const interactables = interactableQuery()

      for (const entity of interactables) {
        // const interactable = getComponent(entity, InteractableComponent)
        // interactable.distance = interactable.anchorPosition.distanceTo(
        //   getComponent(world.localClientEntity, TransformComponent).position
        // )
        if (InteractiveUI.has(entity)) {
          const { update, xrui } = InteractiveUI.get(entity)!
          update(entity, xrui)
        }
      }

      gatherAvailableInteractables(interactables)
      const closestInteractable = getState(InteractState).available.value[0]
      for (const interactiveEntity of interactables) {
        if (interactiveEntity === closestInteractable) {
          if (!hasComponent(interactiveEntity, HighlightComponent)) {
            addComponent(interactiveEntity, HighlightComponent, {})
          }
        } else {
          if (hasComponent(interactiveEntity, HighlightComponent)) {
            removeComponent(interactiveEntity, HighlightComponent)
          }
        }
      }
    }
  }
}
