/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { MathUtils, Vector2, Vector3 } from 'three'

import {
  ECSState,
  Entity,
  getComponent,
  getMutableComponent,
  removeComponent,
  removeEntity,
  setComponent,
  UndefinedEntity,
  useEntityContext,
  UUIDComponent
} from '@ir-engine/ecs'
import {
  defineComponent,
  getOptionalComponent,
  hasComponent,
  useComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { getState, isClient, useImmediateEffect, useMutableState } from '@ir-engine/hyperflux'
import { CallbackComponent } from '@ir-engine/spatial/src/common/CallbackComponent'
import { createTransitionState } from '@ir-engine/spatial/src/common/functions/createTransitionState'
import { InputComponent, InputExecutionOrder } from '@ir-engine/spatial/src/input/components/InputComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import {
  BoundingBoxComponent,
  updateBoundingBox
} from '@ir-engine/spatial/src/transform/components/BoundingBoxComponents'
import { ComputedTransformComponent } from '@ir-engine/spatial/src/transform/components/ComputedTransformComponent'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { XRUIComponent } from '@ir-engine/spatial/src/xrui/components/XRUIComponent'
import { WebLayer3D } from '@ir-engine/xrui'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { inFrustum } from '@ir-engine/spatial/src/camera/functions/CameraFunctions'
import { smootheLerpAlpha } from '@ir-engine/spatial/src/common/functions/MathLerpFunctions'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { InputState } from '@ir-engine/spatial/src/input/state/InputState'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import {
  DistanceFromCameraComponent,
  DistanceFromLocalClientComponent
} from '@ir-engine/spatial/src/transform/components/DistanceComponents'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { useXRUIState } from '@ir-engine/spatial/src/xrui/functions/useXRUIState'
import { useEffect } from 'react'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { createUI } from '../functions/createUI'
import { InteractableState, InteractableTransitions } from '../functions/interactableFunctions'
import { InteractiveModalState } from '../ui/InteractiveModalView'

/**
 * Visibility override for XRUI, none is default behavior, on or off forces that state
 *
 * NOTE - if more states are added we need to modify logic in InteractableSystem.ts for state other than "none"
 */
export enum XRUIVisibilityOverride {
  none = 0,
  on = 1,
  off = 2
}
export enum XRUIActivationType {
  proximity = 0,
  hover = 1
}

const xrDistVec3 = new Vector3()
const inputPointerPosition = new Vector2()
let inputPointerEntity = UndefinedEntity

const updateXrDistVec3 = (selfAvatarEntity: Entity) => {
  //TODO change from using rigidbody to use the transform position (+ height of avatar)
  const selfAvatarRigidBodyComponent = getComponent(selfAvatarEntity, RigidBodyComponent)
  const avatar = getComponent(selfAvatarEntity, AvatarComponent)
  xrDistVec3.copy(selfAvatarRigidBodyComponent.position)
  xrDistVec3.y += avatar.avatarHeight
}

const _center = new Vector3()
const _size = new Vector3()

export const updateInteractableUI = (entity: Entity) => {
  const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
  const interactable = getOptionalComponent(entity, InteractableComponent)

  if (!selfAvatarEntity || !interactable || interactable.uiEntity == UndefinedEntity) return

  const xrui = getOptionalComponent(interactable.uiEntity, XRUIComponent)
  const xruiTransform = getOptionalComponent(interactable.uiEntity, TransformComponent)
  if (!xrui || !xruiTransform) return

  const boundingBox = getOptionalComponent(entity, BoundingBoxComponent)

  updateXrDistVec3(selfAvatarEntity)

  const hasVisibleComponent = hasComponent(interactable.uiEntity, VisibleComponent)
  if (hasVisibleComponent) {
    if (boundingBox) updateBoundingBox(entity)
    if (boundingBox && boundingBox.box && !boundingBox.box.isEmpty()) {
      const center = boundingBox.box.getCenter(_center)
      const size = boundingBox.box.getSize(_size)
      if (!size.y) size.y = 1
      const alpha = smootheLerpAlpha(0.01, getState(ECSState).deltaSeconds)
      xruiTransform.position.x = center.x
      xruiTransform.position.z = center.z
      xruiTransform.position.y = MathUtils.lerp(xruiTransform.position.y, center.y + 0.7 * size.y, alpha)

      const cameraTransform = getComponent(getState(EngineState).viewerEntity, TransformComponent)
      xruiTransform.rotation.copy(cameraTransform.rotation)
    } else {
      TransformComponent.getWorldPosition(entity, _center)
      const alpha = smootheLerpAlpha(0.01, getState(ECSState).deltaSeconds)
      xruiTransform.position.x = _center.x
      xruiTransform.position.z = _center.z
      xruiTransform.position.y = MathUtils.lerp(xruiTransform.position.y, _center.y + 0.5, alpha)

      const cameraTransform = getComponent(getState(EngineState).viewerEntity, TransformComponent)
      xruiTransform.rotation.copy(cameraTransform.rotation)
    }
  }

  const distance = xrDistVec3.distanceToSquared(xruiTransform.position)

  //slightly annoying to check this condition twice, but keeps distance calc on same frame
  if (hasVisibleComponent) {
    xruiTransform.scale.setScalar(MathUtils.clamp(distance * 0.01, 1, 5))
  }

  const transition = InteractableTransitions.get(entity)!
  let activateUI = false

  const inCameraFrustum = inFrustum(interactable.uiEntity)
  let hovering = false

  if (inCameraFrustum) {
    if (interactable.uiVisibilityOverride === XRUIVisibilityOverride.none) {
      if (interactable.uiActivationType === XRUIActivationType.proximity) {
        //proximity
        let thresh = interactable.activationDistance
        thresh *= thresh //squared for dist squared comparison
        activateUI = distance < thresh
      }
      if (!activateUI && (interactable.uiActivationType === XRUIActivationType.hover || interactable.clickInteract)) {
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
    getMutableComponent(entity, InteractableComponent).canInteract.set(activateUI)
  }

  //highlight if hovering OR if closest, otherwise turn off highlight
  const mutableInteractable = getMutableComponent(entity, InteractableComponent)
  const newHighlight = hovering || entity === getState(InteractableState).available[0]
  if (mutableInteractable.highlighted.value !== newHighlight) {
    mutableInteractable.highlighted.set(newHighlight)
  }

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
  const interactable = getComponent(entity, InteractableComponent)
  if (!interactable.label || interactable.label === '' || interactable.uiEntity != UndefinedEntity) return //null or empty label = no ui

  const uiEntity = createUI(entity, interactable.label, interactable.uiInteractable).entity

  const uiTransform = getComponent(uiEntity, TransformComponent)
  const boundingBox = getOptionalComponent(entity, BoundingBoxComponent)
  if (boundingBox && boundingBox.box && !boundingBox.box.isEmpty()) {
    updateBoundingBox(entity)
    boundingBox.box.getCenter(uiTransform.position)
  } else {
    TransformComponent.getWorldPosition(entity, _center)
    uiTransform.position.copy(_center)
  }
  getMutableComponent(entity, InteractableComponent).uiEntity.set(uiEntity)
  setComponent(uiEntity, EntityTreeComponent, { parentEntity: getState(EngineState).originEntity })
  setComponent(uiEntity, ComputedTransformComponent, {
    referenceEntities: [entity, getState(EngineState).viewerEntity],
    computeFunction: () => updateInteractableUI(entity)
  })

  const transition = createTransitionState(0.25)
  transition.setState('OUT')
  InteractableTransitions.set(entity, transition)
  return uiEntity
}

export const InteractableComponent = defineComponent({
  name: 'InteractableComponent',
  jsonID: 'EE_interactable',

  schema: S.Object({
    canInteract: S.NonSerialized(S.Bool(false)),
    uiInteractable: S.NonSerialized(S.Bool(true)),
    uiEntity: T.Entity(),
    label: S.String('E'),
    uiVisibilityOverride: S.NonSerialized(S.Enum(XRUIVisibilityOverride, XRUIVisibilityOverride.none)),
    uiActivationType: S.NonSerialized(S.Enum(XRUIActivationType, XRUIActivationType.proximity)),
    activationDistance: S.Number(2),
    clickInteract: S.Bool(false),
    highlighted: S.NonSerialized(S.Bool(false)),
    callbacks: S.Array(
      S.Object({
        /**
         * The function to call on the CallbackComponent of the targetEntity when the trigger volume is entered.
         */
        callbackID: S.String(),
        /**
         * empty string represents self
         */
        target: T.EntityUUID()
      })
    )
  }),

  reactor: () => {
    if (!isClient) return null
    const entity = useEntityContext()
    const interactableComponent = useComponent(entity, InteractableComponent)
    const isEditing = useMutableState(EngineState).isEditing
    const modalState = useXRUIState<InteractiveModalState>()

    useImmediateEffect(() => {
      setComponent(entity, DistanceFromCameraComponent)
      setComponent(entity, DistanceFromLocalClientComponent)
      setComponent(entity, BoundingBoxComponent)
      return () => {
        removeComponent(entity, DistanceFromCameraComponent)
        removeComponent(entity, DistanceFromLocalClientComponent)
        removeComponent(entity, BoundingBoxComponent)
      }
    }, [])

    InputComponent.useExecuteWithInput(
      () => {
        const buttons = InputComponent.getMergedButtons(entity)
        if (!interactableComponent.clickInteract.value && buttons.PrimaryClick?.pressed) return
        if (
          buttons.Interact?.pressed &&
          !buttons.Interact?.dragging &&
          getState(InputState).capturingEntity === UndefinedEntity
        ) {
          InputState.setCapturingEntity(entity)

          if (buttons.Interact?.up) {
            callInteractCallbacks(entity)
          }
        }
      },
      true,
      InputExecutionOrder.After
    )

    useEffect(() => {
      if (!isEditing.value) {
        const uiEntity = addInteractableUI(entity)
        return () => {
          if (uiEntity) {
            removeEntity(uiEntity)
          }
        }
      }
    }, [isEditing.value])

    useEffect(() => {
      const msg = interactableComponent.label?.value ?? ''
      modalState.interactMessage?.set(msg)
    }, [interactableComponent.label]) //TODO just nuke the whole XRUI and recreate....
    return null
  }
})

const callInteractCallbacks = (entity: Entity) => {
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
