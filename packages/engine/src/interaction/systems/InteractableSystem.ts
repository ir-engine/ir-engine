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

import { Not } from 'bitecs'
import { Euler, Quaternion, Vector3 } from 'three'

import { defineState } from '@etherealengine/hyperflux'
import { WebLayer3D } from '@etherealengine/xrui'

import { isClient } from '@etherealengine/common/src/utils/getEnvironment'
import { UUIDComponent } from '@etherealengine/ecs'
import { getComponent, getOptionalComponent, setComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { removeEntity } from '@etherealengine/ecs/src/EntityFunctions'
import { defineQuery } from '@etherealengine/ecs/src/QueryFunctions'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { getState } from '@etherealengine/hyperflux'
import { ClientInputSystem } from '@etherealengine/spatial'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { CallbackComponent } from '@etherealengine/spatial/src/common/CallbackComponent'
import { createTransitionState } from '@etherealengine/spatial/src/common/functions/createTransitionState'
import { InputPointerComponent } from '@etherealengine/spatial/src/input/components/InputPointerComponent'
import { InputSourceComponent } from '@etherealengine/spatial/src/input/components/InputSourceComponent'
import { XRStandardGamepadButton } from '@etherealengine/spatial/src/input/state/ButtonState'
import { RigidBodyComponent } from '@etherealengine/spatial/src/physics/components/RigidBodyComponent'
import {
  DistanceFromCameraComponent,
  DistanceFromLocalClientComponent
} from '@etherealengine/spatial/src/transform/components/DistanceComponents'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'
import { TransformSystem } from '@etherealengine/spatial/src/transform/systems/TransformSystem'
import { createXRUI } from '@etherealengine/spatial/src/xrui/functions/createXRUI'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { InteractableComponent } from '../components/InteractableComponent'
import { gatherAvailableInteractables } from '../functions/gatherAvailableInteractables'
import { createInteractUI } from '../functions/interactUI'

export const InteractableState = defineState({
  name: 'InteractableState',
  initial: () => {
    return {
      /**
       * closest interactable to the player, in view of the camera, sorted by distance
       */
      maxDistance: 2,
      available: [] as Entity[]
    }
  }
})

export type InteractableType = {
  xrui: ReturnType<typeof createXRUI>
  update: (entity: Entity, xrui: ReturnType<typeof createXRUI>) => void
}

export const InteractableUI = new Map<Entity, InteractableType>()
export const InteractableTransitions = new Map<Entity, ReturnType<typeof createTransitionState>>()

const vec3 = new Vector3()
const flip = new Quaternion().setFromEuler(new Euler(0, Math.PI, 0))

export const onInteractableUpdate = (entity: Entity, xrui: ReturnType<typeof createInteractUI>) => {
  const xruiTransform = getComponent(xrui.entity, TransformComponent)
  TransformComponent.getWorldPosition(entity, xruiTransform.position)
  xruiTransform.position.y += 1

  const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
  if (!selfAvatarEntity) return

  const cameraTransform = getComponent(Engine.instance.cameraEntity, TransformComponent)
  xruiTransform.rotation.copy(cameraTransform.rotation)

  const transition = InteractableTransitions.get(entity)!

  //TODO change from using rigidbody to use the transform position (+ height of avatar)
  const selfAvatarRigidBodyComponent = getComponent(selfAvatarEntity, RigidBodyComponent)
  const avatar = getComponent(selfAvatarEntity, AvatarComponent)

  vec3.copy(selfAvatarRigidBodyComponent.position)
  vec3.y += avatar.avatarHeight
  // getAvatarBoneWorldPosition(selfAvatarEntity, VRMHumanBoneName.Chest, vec3) //uses normalizedRig which does not update at this time - Apr 12 2024

  const distance = vec3.distanceToSquared(xruiTransform.position)
  let thresh = getState(InteractableState).maxDistance
  thresh *= thresh //squared for dist squared comparison
  const inRange = distance < thresh
  if (transition.state === 'OUT' && inRange) {
    transition.setState('IN')
  }
  if (transition.state === 'IN' && !inRange) {
    transition.setState('OUT')
  }
  const deltaSeconds = getState(ECSState).deltaSeconds
  transition.update(deltaSeconds, (opacity) => {
    xrui.container.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
      const mat = layer.contentMesh.material as THREE.MeshBasicMaterial
      mat.opacity = opacity
    })
  })
}

export const getInteractableUI = (entity: Entity) => InteractableUI.get(entity)
export const removeInteractableUI = (entity: Entity) => {
  if (InteractableUI.has(entity)) {
    const { update, xrui } = getInteractableUI(entity)!
    removeEntity(xrui.entity)
    InteractableUI.delete(entity)
  }
}

export const addInteractableUI = (
  entity: Entity,
  xrui: ReturnType<typeof createXRUI>,
  update?: (entity: Entity, xrui: ReturnType<typeof createXRUI>) => void
) => {
  setComponent(entity, InteractableComponent)
  setComponent(xrui.entity, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })

  if (!update) {
    update = onInteractableUpdate
  }
  const transition = createTransitionState(0.25)
  transition.setState('OUT')
  InteractableTransitions.set(entity, transition)
  InteractableUI.set(entity, { xrui, update })
}

const allInteractablesQuery = defineQuery([InteractableComponent])
const interactableQuery = defineQuery([InteractableComponent, Not(AvatarComponent), DistanceFromCameraComponent])

let gatherAvailableInteractablesTimer = 0

const execute = () => {
  gatherAvailableInteractablesTimer += getState(ECSState).deltaSeconds
  // update every 0.1 seconds
  if (gatherAvailableInteractablesTimer > 0.1) gatherAvailableInteractablesTimer = 0

  // ensure distance component is set on all interactables
  for (const entity of allInteractablesQuery.enter()) {
    setComponent(entity, DistanceFromCameraComponent)
    setComponent(entity, DistanceFromLocalClientComponent)

    // add interactable UI if it has a label
    if (isClient && !getState(EngineState).isEditor) {
      const interactable = getComponent(entity, InteractableComponent)
      if (interactable.label && interactable.label !== '') {
        addInteractableUI(entity, createInteractUI(entity, interactable.label))
      }
    }
  }

  // TODO: refactor InteractableUI to be ui-centric rather than interactable-centeric
  for (const entity of interactableQuery.exit()) {
    if (InteractableTransitions.has(entity)) InteractableTransitions.delete(entity)
    if (InteractableUI.has(entity)) InteractableUI.delete(entity)
    // if (hasComponent(entity, HighlightComponent)) removeComponent(entity, HighlightComponent)
  }

  const interactables = interactableQuery()

  for (const entity of interactables) {
    // const interactable = getComponent(entity, InteractableComponent)
    // interactable.distance = interactable.anchorPosition.distanceTo(
    //   getComponent(AvatarComponent.getSelfAvatarEntity(), TransformComponent).position
    // )
    if (InteractableUI.has(entity)) {
      const { update, xrui } = InteractableUI.get(entity)!
      update(entity, xrui)
    }
  }

  if (gatherAvailableInteractablesTimer === 0) {
    gatherAvailableInteractables(interactables)
    // const closestInteractable = getState(InteractState).available[0]
    // for (const interactableEntity of interactables) {
    //   if (interactableEntity === closestInteractable) {
    //     if (!hasComponent(interactableEntity, HighlightComponent)) {
    //       addComponent(interactableEntity, HighlightComponent)
    //     }
    //   } else {
    //     if (hasComponent(interactableEntity, HighlightComponent)) {
    //       removeComponent(interactableEntity, HighlightComponent)
    //     }
    //   }
    // }
  }
}

export const InteractableSystem = defineSystem({
  uuid: 'ee.engine.InteractableSystem',
  insert: { before: TransformSystem },
  execute
})

const executeInput = () => {
  const inputPointerEntity = InputPointerComponent.getPointerForCanvas(Engine.instance.viewerEntity)
  if (!inputPointerEntity) return

  const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
  const buttons = InputSourceComponent.getMergedButtons()

  const nonCapturedInputSource = InputSourceComponent.nonCapturedInputSources()
  for (const entity of nonCapturedInputSource) {
    const inputSource = getComponent(entity, InputSourceComponent)
    if (buttons.KeyE?.down || inputSource.buttons[XRStandardGamepadButton.Trigger]?.down) {
      interactWithClosestInteractable()
    }
  }
}

const interactWithClosestInteractable = () => {
  const closestInteractableEntity = getState(InteractableState).available[0]
  if (closestInteractableEntity) {
    const interactable = getOptionalComponent(closestInteractableEntity, InteractableComponent)
    if (interactable) {
      for (const callback of interactable.callbacks) {
        if (callback.target && !UUIDComponent.getEntityByUUID(callback.target)) continue
        const targetEntity = callback.target
          ? UUIDComponent.getEntityByUUID(callback.target)
          : closestInteractableEntity
        if (targetEntity && callback.callbackID) {
          const callbacks = getOptionalComponent(targetEntity, CallbackComponent)
          if (!callbacks) continue
          callbacks.get(callback.callbackID)?.(closestInteractableEntity, targetEntity)
        }
      }
    }
  }
}

export const InteractableInputSystem = defineSystem({
  uuid: 'ee.engine.InteractableInputSystem',
  insert: { after: ClientInputSystem },
  execute: executeInput
})
