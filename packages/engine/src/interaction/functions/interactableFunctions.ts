/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Frustum, Matrix4, Vector3 } from 'three'

import { defineState, getMutableState } from '@etherealengine/hyperflux'

import { Engine, getComponent } from '@etherealengine/ecs'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { TransformComponent } from '@etherealengine/spatial'
import { CameraComponent } from '@etherealengine/spatial/src/camera/components/CameraComponent'
import { createTransitionState } from '@etherealengine/spatial/src/common/functions/createTransitionState'
import { InputSourceComponent } from '@etherealengine/spatial/src/input/components/InputSourceComponent'
import {
  compareDistanceToLocalClient,
  DistanceFromLocalClientComponent
} from '@etherealengine/spatial/src/transform/components/DistanceComponents'
import { InteractableComponent } from '../components/InteractableComponent'

const worldPosVec3 = new Vector3()
const mat4 = new Matrix4()
const frustum = new Frustum()

const mat4_InputSource = new Matrix4()
const frustum_InputSource = new Frustum()

/**
 * Checks if entity is in range based on its own threshold
 * @param entity
 * @constructor
 */
const inRangeAndFrustumToInteract = (entity: Entity): boolean => {
  const interactable = getComponent(entity, InteractableComponent)
  const maxDistanceSquare = interactable.activationDistance * interactable.activationDistance
  let inRangeAndFrustum = DistanceFromLocalClientComponent.squaredDistance[entity] < maxDistanceSquare
  if (inRangeAndFrustum) {
    inRangeAndFrustum = inFrustum(entity)
  }
  return inRangeAndFrustum
}

export const InteractableState = defineState({
  name: 'InteractableState',
  initial: () => {
    return {
      /**
       * all interactables within threshold range, in view of the camera, sorted by distance
       */
      available: [] as Entity[]
    }
  }
})

export const inFrustum = (entity: Entity): boolean => {
  TransformComponent.getWorldPosition(entity, worldPosVec3)
  return frustum.containsPoint(worldPosVec3)
}

/**
 * Checks if entity can interact with any of entities listed in 'interactable' array, checking distance, guards and raycast
 * sorts the interactables by closest to the player
 * @param {Entity[]} interactables
 * @param inputSourceEntity optional input source entity to base the raycast from
 */
export const gatherAvailableInteractables = (interactables: Entity[], inputSourceEntity: Entity) => {
  /*
  TODO split camera frustum culling of xrUI show/hide into its own process.
  each input source should have its own distance sorted list of interactables
  each pointer should have a raycaster that will update the selected interactable per input source if relevant  
  
  TODO remove the radius check, replace with a managed separate entity with a collider set to the interactable layer, give that an input component, rather than proximity
  can then remove the need to do sorting in interactable system vs just the sorted raycast in inputsystem 
  
  KEEP THE TOGGLE FOR CLICKABLE - or rename it. We probably want an option to use a built-in collider vs a generated spherical one
  
  TODO make inputSourceEntity required. Use the raycaster, but move it to the inputPointerComponent raycaster
   leave ray on inputSourceComponent, inputPointerComponent will update the ray via the raycaster
   (when in webxr the ray will be updated directly from the xr controller)
  
  TODO see if ClientInputSystem line 160 is the proper way to do the raycaster/ray updating.
  
  TODO add distance heuristic to input component
  
  TODO will need to split out camera frustum culling from this available
  
  TODO each input source will manage its own set of available interactables (by proximity and ray), and the currently selected one
   maybe have a tag per inputsource instead of having an array in the inputsource
   
  TODO also see if we're going to need an array of available arrays, or one per inputsource?
   currently makes no sense to be sorting a single array if we might have multiple input sources/pointers
   
  TODO need to double check if we should still cull based on camera frustum, or if we're 
  */

  const inputSource = getComponent(inputSourceEntity, InputSourceComponent)

  const camera =
    !inputSource || !inputSource.raycaster.camera
      ? getComponent(Engine.instance.viewerEntity, CameraComponent)
      : inputSource.raycaster.camera

  mat4.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
  frustum.setFromProjectionMatrix(mat4)

  const availableInteractable = getMutableState(InteractableState).available
  availableInteractable.set(
    [...interactables].filter((entity) => inRangeAndFrustumToInteract(entity)).sort(compareDistanceToLocalClient)
  )
}

export const InteractableTransitions = new Map<Entity, ReturnType<typeof createTransitionState>>()
