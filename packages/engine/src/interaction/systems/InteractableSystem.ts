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

import { getMutableComponent, hasComponent, InputSystemGroup, removeComponent } from '@etherealengine/ecs'
import { getComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { defineQuery } from '@etherealengine/ecs/src/QueryFunctions'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { getState } from '@etherealengine/hyperflux'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { InputComponent } from '@etherealengine/spatial/src/input/components/InputComponent'
import { InputPointerComponent } from '@etherealengine/spatial/src/input/components/InputPointerComponent'
import { InputSourceComponent } from '@etherealengine/spatial/src/input/components/InputSourceComponent'
import { XRStandardGamepadButton } from '@etherealengine/spatial/src/input/state/ButtonState'
import { HighlightComponent } from '@etherealengine/spatial/src/renderer/components/HighlightComponent'
import { DistanceFromCameraComponent } from '@etherealengine/spatial/src/transform/components/DistanceComponents'
import { TransformSystem } from '@etherealengine/spatial/src/transform/systems/TransformSystem'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { InteractableComponent } from '../components/InteractableComponent'
import {
  gatherAvailableInteractables,
  InteractableState,
  InteractableTransitions
} from '../functions/interactableFunctions'

//TODO get rid of the query.exit and put it in component as unmount useEffect return
//TODO get rid of this map eventually and store on the component instead

const interactableQuery = defineQuery([InteractableComponent, Not(AvatarComponent), DistanceFromCameraComponent])
const hoverInputInteractablesQuery = defineQuery([InteractableComponent, InputComponent])
const inputSourceQuery = defineQuery([InputSourceComponent])

let gatherAvailableInteractablesTimer = 0

const execute = () => {
  gatherAvailableInteractablesTimer += getState(ECSState).deltaSeconds
  // update every 0.1 seconds
  if (gatherAvailableInteractablesTimer > 0.1) gatherAvailableInteractablesTimer = 0

  for (const entity of interactableQuery.exit()) {
    if (InteractableTransitions.has(entity)) InteractableTransitions.delete(entity)
    if (hasComponent(entity, HighlightComponent)) removeComponent(entity, HighlightComponent)
  }

  const interactables = interactableQuery()

  if (gatherAvailableInteractablesTimer === 0) {
    for (const inputSourceEntity of inputSourceQuery()) {
      gatherAvailableInteractables(interactables, inputSourceEntity)
    }
  }
}

export const InteractableSystem = defineSystem({
  uuid: 'ee.engine.InteractableSystem',
  insert: { before: TransformSystem },
  execute
})

const executeInput = () => {
  if (getState(EngineState).isEditing) return

  const inputPointerEntity = InputPointerComponent.getPointerForCanvas(Engine.instance.viewerEntity)
  if (!inputPointerEntity) return

  for (const entity of InputSourceComponent.nonCapturedInputSources()) {
    const inputSource = getComponent(entity, InputSourceComponent)
    if (inputSource.buttons.KeyE?.down) {
      interactWithClosestInteractable()
    }
  }

  for (const entity of hoverInputInteractablesQuery()) {
    // const capturingEntity = getState(InputState).capturingEntity
    const inputComponent = getComponent(entity, InputComponent)
    const buttons = InputSourceComponent.getMergedButtons(inputComponent.inputSources)
    if (
      buttons.PrimaryClick?.down /*&& clickButtons.PrimaryClick.up*/ ||
      buttons[XRStandardGamepadButton.Trigger]?.down
    ) {
      clickInteract(entity)
    }
  }
}
//TODO only activate the one interactable closest to the camera center and within range or hovered
//TODO look into the design language (opacity, font size, etc) to differentiate between UI on and targeted for activation

// let clicking = false

const clickInteract = (entity: Entity) => {
  const interactable = getMutableComponent(entity, InteractableComponent)
  interactable.active.set(true)
  // for (const callback of interactable.callbacks) {
  //   if (callback.target && !UUIDComponent.getEntityByUUID(callback.target)) continue
  //   const targetEntity = callback.target ? UUIDComponent.getEntityByUUID(callback.target) : entity
  //   if (targetEntity && callback.callbackID) {
  //     const callbacks = getOptionalComponent(targetEntity, CallbackComponent)
  //     if (!callbacks) continue
  //     callbacks.get(callback.callbackID)?.(entity, targetEntity)
  //   }
  // }
}

const interactWithClosestInteractable = () => {
  //TODO use other method for gathering candidate interactable, available is going away
  const interactableEntity = getState(InteractableState).available[0]
  if (interactableEntity) {
    const interactable = getMutableComponent(interactableEntity, InteractableComponent)
    interactable.active.set(true)

    // const interactable = getOptionalComponent(interactableEntity, InteractableComponent)
    // if (interactable) {
    //   for (const callback of interactable.callbacks) {
    //     if (callback.target && !UUIDComponent.getEntityByUUID(callback.target)) continue
    //     const targetEntity = callback.target ? UUIDComponent.getEntityByUUID(callback.target) : interactableEntity
    //     if (targetEntity && callback.callbackID) {
    //       const callbacks = getOptionalComponent(targetEntity, CallbackComponent)
    //       if (!callbacks) continue
    //       callbacks.get(callback.callbackID)?.(interactableEntity, targetEntity)
    //     }
    //   }
    // }
  }
}

export const InteractableInputSystem = defineSystem({
  uuid: 'ee.engine.InteractableInputSystem',
  insert: { after: InputSystemGroup },
  execute: executeInput
})
