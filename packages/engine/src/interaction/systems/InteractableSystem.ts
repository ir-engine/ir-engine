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
import { MathUtils, Vector3 } from 'three'

import { defineState } from '@etherealengine/hyperflux'
import { WebLayer3D } from '@etherealengine/xrui'

import { isClient } from '@etherealengine/common/src/utils/getEnvironment'
import {
  getMutableComponent,
  hasComponent,
  InputSystemGroup,
  removeComponent,
  UndefinedEntity,
  UUIDComponent
} from '@etherealengine/ecs'
import { getComponent, getOptionalComponent, setComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { defineQuery } from '@etherealengine/ecs/src/QueryFunctions'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { createUI } from '@etherealengine/engine/src/interaction/functions/createUI'
import { getState } from '@etherealengine/hyperflux'
import { CallbackComponent } from '@etherealengine/spatial/src/common/CallbackComponent'
import { createTransitionState } from '@etherealengine/spatial/src/common/functions/createTransitionState'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { InputComponent } from '@etherealengine/spatial/src/input/components/InputComponent'
import { InputPointerComponent } from '@etherealengine/spatial/src/input/components/InputPointerComponent'
import { InputSourceComponent } from '@etherealengine/spatial/src/input/components/InputSourceComponent'
import { XRStandardGamepadButton } from '@etherealengine/spatial/src/input/state/ButtonState'
import { InputState } from '@etherealengine/spatial/src/input/state/InputState'
import { RigidBodyComponent } from '@etherealengine/spatial/src/physics/components/RigidBodyComponent'
import { HighlightComponent } from '@etherealengine/spatial/src/renderer/components/HighlightComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { BoundingBoxComponent } from '@etherealengine/spatial/src/transform/components/BoundingBoxComponents'
import {
  DistanceFromCameraComponent,
  DistanceFromLocalClientComponent
} from '@etherealengine/spatial/src/transform/components/DistanceComponents'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'
import { TransformSystem } from '@etherealengine/spatial/src/transform/systems/TransformSystem'
import { XRUIComponent } from '@etherealengine/spatial/src/xrui/components/XRUIComponent'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { InteractableComponent, XRUIActivationType, XRUIVisibilityOverride } from '../components/InteractableComponent'
import { gatherAvailableInteractables, inFrustum } from '../functions/interactableFunctions'

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

//TODO get rid of the query.exit and put it in component as unmount useEffect return
//TODO get rid of this map eventually and store on the component instead
export const InteractableTransitions = new Map<Entity, ReturnType<typeof createTransitionState>>()

const xrDistVec3 = new Vector3()

const updateXrDistVec3 = (selfAvatarEntity: Entity) => {
  //TODO change from using rigidbody to use the transform position (+ height of avatar)
  const selfAvatarRigidBodyComponent = getComponent(selfAvatarEntity, RigidBodyComponent)
  const avatar = getComponent(selfAvatarEntity, AvatarComponent)
  xrDistVec3.copy(selfAvatarRigidBodyComponent.position)
  xrDistVec3.y += avatar.avatarHeight
}

export const onInteractableUpdate = (entity: Entity) => {
  const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
  if (!selfAvatarEntity) return

  const interactable = getComponent(entity, InteractableComponent)
  const xrui = getOptionalComponent(interactable.uiEntity, XRUIComponent)
  const xruiTransform = getOptionalComponent(interactable.uiEntity, TransformComponent)
  if (!xrui || !xruiTransform) return

  const boundingBox = getOptionalComponent(entity, BoundingBoxComponent)

  updateXrDistVec3(selfAvatarEntity)

  const hasVisibleComponent = hasComponent(interactable.uiEntity, VisibleComponent)
  if (hasVisibleComponent) {
    TransformComponent.getWorldPosition(entity, xruiTransform.position)

    //open to changing default height, 0.5 seems too small an offset (on default geo cube the xrui is half inside the cube if offset it just 0.5 from position)
    xruiTransform.position.y += boundingBox ? 0.5 + boundingBox.box.max.y : 1

    const cameraTransform = getComponent(Engine.instance.cameraEntity, TransformComponent)
    xruiTransform.rotation.copy(cameraTransform.rotation)

    xruiTransform.scale.set(1, 1, 1)
  }

  const distance = xrDistVec3.distanceToSquared(xruiTransform.position)

  //slightly annoying to check this condition twice, but keeps distance calc on same frame
  if (hasVisibleComponent) {
    xruiTransform.scale.addScalar(MathUtils.clamp(distance * 0.01, 1, 5))
  }

  const transition = InteractableTransitions.get(entity)!
  let activateUI = false

  const inCameraFrustum = inFrustum(entity)
  let hovering = false

  if (inCameraFrustum) {
    if (interactable.uiVisibilityOverride === XRUIVisibilityOverride.none) {
      if (interactable.uiActivationType === XRUIActivationType.proximity) {
        //proximity
        let thresh = interactable.activationDistance
        thresh *= thresh //squared for dist squared comparison
        activateUI = distance < thresh
      } else if (interactable.uiActivationType === XRUIActivationType.hover || interactable.clickInteract) {
        //hover
        const input = getOptionalComponent(entity, InputComponent)
        if (input) {
          hovering = input.inputSources.length > 0
          activateUI = hovering
        }
      }
    } else {
      activateUI = interactable.uiVisibilityOverride !== XRUIVisibilityOverride.off //could be more explicit, needs to be if we add more enum options
    }
  }

  //highlight if hovering OR if closest, otherwise turn off highlight
  const mutableInteractable = getMutableComponent(entity, InteractableComponent)
  mutableInteractable.highlighted.set(hovering || entity === getState(InteractableState).available[0])

  if (transition.state === 'OUT' && activateUI) {
    transition.setState('IN')
    setComponent(interactable.uiEntity, VisibleComponent)
  }
  if (transition.state === 'IN' && !activateUI) {
    transition.setState('OUT')
  }
  const deltaSeconds = getState(ECSState).deltaSeconds
  transition.update(deltaSeconds, (opacity) => {
    if (opacity === 0) {
      removeComponent(interactable.uiEntity, VisibleComponent)
    }
    xrui.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
      const mat = layer.contentMesh.material as THREE.MeshBasicMaterial
      mat.opacity = opacity
    })
  })
}

/**
 * Adds an interactable UI to the entity if it has label text
 * @param entity
 */
const addInteractableUI = (entity: Entity) => {
  if (!isClient || getState(EngineState).isEditor) return //no xrui in editor
  const interactable = getComponent(entity, InteractableComponent)
  if (!interactable.label || interactable.label === '') return //null or empty label = no ui

  interactable.uiEntity = createUI(entity, interactable.label, interactable.uiInteractable).entity
  setComponent(interactable.uiEntity, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })

  const transition = createTransitionState(0.25)
  transition.setState('OUT')
  InteractableTransitions.set(entity, transition)
}

const allInteractablesQuery = defineQuery([InteractableComponent])
const interactableQuery = defineQuery([InteractableComponent, Not(AvatarComponent), DistanceFromCameraComponent])
const hoverInputInteractablesQuery = defineQuery([InteractableComponent, InputComponent])

let gatherAvailableInteractablesTimer = 0

const execute = () => {
  gatherAvailableInteractablesTimer += getState(ECSState).deltaSeconds
  // update every 0.1 seconds
  if (gatherAvailableInteractablesTimer > 0.1) gatherAvailableInteractablesTimer = 0

  // ensure distance component is set on all interactables
  for (const entity of allInteractablesQuery.enter()) {
    setComponent(entity, DistanceFromCameraComponent)
    setComponent(entity, DistanceFromLocalClientComponent)

    addInteractableUI(entity)
  }

  for (const entity of interactableQuery.exit()) {
    if (InteractableTransitions.has(entity)) InteractableTransitions.delete(entity)
    if (hasComponent(entity, HighlightComponent)) removeComponent(entity, HighlightComponent)
  }

  const interactables = interactableQuery()

  if (gatherAvailableInteractablesTimer === 0) {
    gatherAvailableInteractables(interactables)
  }

  for (const entity of interactables) {
    onInteractableUpdate(entity)
  }
}

export const InteractableSystem = defineSystem({
  uuid: 'ee.engine.InteractableSystem',
  insert: { before: TransformSystem },
  execute
})

const executeInput = () => {
  if (getState(EngineState).isEditor) return

  const inputPointerEntity = InputPointerComponent.getPointerForCanvas(Engine.instance.viewerEntity)
  if (!inputPointerEntity) return

  const buttons = InputSourceComponent.getMergedButtons()

  const nonCapturedInputSource = InputSourceComponent.nonCapturedInputSources()
  for (const entity of nonCapturedInputSource) {
    const inputSource = getComponent(entity, InputSourceComponent)
    if (buttons.KeyE?.down || inputSource.buttons[XRStandardGamepadButton.Trigger]?.down) {
      interactWithClosestInteractable()
    }
  }

  for (const entity of hoverInputInteractablesQuery()) {
    const capturingEntity = getState(InputState).capturingEntity
    const inputComponent = getComponent(entity, InputComponent)
    const inputSourceEntity = inputComponent?.inputSources[0]

    if (inputSourceEntity) {
      const inputSource = getOptionalComponent(inputSourceEntity, InputSourceComponent)
      if (capturingEntity !== UndefinedEntity) {
        // return

        const clickButtons = inputSource?.buttons
        clicking = !!clickButtons //clicking on our boundingbox this frame

        //TODO firing play on video each click, but for some reason only plays first time
        //TODO refactor this, changing the execute timing is the only thing that makes this logic work, otherwise timings are different
        //between PrimaryClick.up and capturingEntity being undefined or not
        if (clicking && clickButtons) {
          if (
            clickButtons.PrimaryClick?.touched /*&& clickButtons.PrimaryClick.up*/ ||
            clickButtons[XRStandardGamepadButton.Trigger]?.down
          ) {
            clickInteract(entity)
          }
        }
      }
    }

    if (clicking && !inputSourceEntity && capturingEntity === UndefinedEntity) {
      clicking = false
    }
  }
}
//TODO only activate the one interactable closest to the camera center and within range or hovered
//TODO look into the design language (opacity, font size, etc) to differentiate between UI on and targeted for activation

let clicking = false

const clickInteract = (entity: Entity) => {
  const interactable = getComponent(entity, InteractableComponent)
  for (const callback of interactable.callbacks) {
    if (callback.target && !UUIDComponent.getEntityByUUID(callback.target)) continue
    const targetEntity = callback.target ? UUIDComponent.getEntityByUUID(callback.target) : entity
    if (targetEntity && callback.callbackID) {
      const callbacks = getOptionalComponent(targetEntity, CallbackComponent)
      if (!callbacks) continue
      callbacks.get(callback.callbackID)?.(entity, targetEntity)
    }
  }
}

const interactWithClosestInteractable = () => {
  const interactableEntity = getState(InteractableState).available[0]
  if (interactableEntity) {
    const interactable = getOptionalComponent(interactableEntity, InteractableComponent)
    if (interactable) {
      for (const callback of interactable.callbacks) {
        if (callback.target && !UUIDComponent.getEntityByUUID(callback.target)) continue
        const targetEntity = callback.target ? UUIDComponent.getEntityByUUID(callback.target) : interactableEntity
        if (targetEntity && callback.callbackID) {
          const callbacks = getOptionalComponent(targetEntity, CallbackComponent)
          if (!callbacks) continue
          callbacks.get(callback.callbackID)?.(interactableEntity, targetEntity)
        }
      }
    }
  }
}

export const InteractableInputSystem = defineSystem({
  uuid: 'ee.engine.InteractableInputSystem',
  insert: { after: InputSystemGroup },
  execute: executeInput
})
