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

import { isClient } from '@etherealengine/common/src/utils/getEnvironment'
import { Engine, getComponent, useComponent, useEntityContext, useOptionalComponent } from '@etherealengine/ecs'
import { defineComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { useMutableState } from '@etherealengine/hyperflux'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { InputComponent } from '@etherealengine/spatial/src/input/components/InputComponent'
import {
  KeyboardButton,
  MouseButton,
  XRStandardGamepadButton
} from '@etherealengine/spatial/src/input/state/ButtonState'
import { RendererComponent } from '@etherealengine/spatial/src/renderer/WebGLRendererSystem'
import { useAncestorWithComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { useEffect } from 'react'

// const xrDistVec3 = new Vector3()

// const updateXrDistVec3 = (selfAvatarEntity: Entity) => {
//   //TODO change from using rigidbody to use the transform position (+ height of avatar)
//   const selfAvatarRigidBodyComponent = getComponent(selfAvatarEntity, RigidBodyComponent)
//   const avatar = getComponent(selfAvatarEntity, AvatarComponent)
//   xrDistVec3.copy(selfAvatarRigidBodyComponent.position)
//   xrDistVec3.y += avatar.avatarHeight
// }

// export const updateInteractableUI = (entity: Entity) => {
//   const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
//   const interactable = getComponent(entity, InteractableComponent)
//
//   if (!selfAvatarEntity || !interactable || interactable.uiEntity == UndefinedEntity) return
//
//   const xrui = getOptionalComponent(interactable.uiEntity, XRUIComponent)
//   const xruiTransform = getOptionalComponent(interactable.uiEntity, TransformComponent)
//   if (!xrui || !xruiTransform) return
//
//   const boundingBox = getOptionalComponent(entity, BoundingBoxComponent)
//
//   updateXrDistVec3(selfAvatarEntity)
//
//   const hasVisibleComponent = hasComponent(interactable.uiEntity, VisibleComponent)
//   if (hasVisibleComponent) {
//     TransformComponent.getWorldPosition(entity, xruiTransform.position)
//
//     //open to changing default height, 0.5 seems too small an offset (on default geo cube the xrui is half inside the cube if offset it just 0.5 from position)
//     xruiTransform.position.y += boundingBox ? 0.5 + boundingBox.box.max.y : 1
//
//     const cameraTransform = getComponent(Engine.instance.viewerEntity, TransformComponent)
//     xruiTransform.rotation.copy(cameraTransform.rotation)
//     xruiTransform.scale.set(1, 1, 1)
//   }
//
//   const distance = xrDistVec3.distanceToSquared(xruiTransform.position)
//
//   //slightly annoying to check this condition twice, but keeps distance calc on same frame
//   if (hasVisibleComponent) {
//     xruiTransform.scale.addScalar(MathUtils.clamp(distance * 0.01, 1, 5))
//   }
//
//   const transition = InteractableTransitions.get(entity)!
//   let activateUI = false
//
//   const inCameraFrustum = inFrustum(entity)
//   let hovering = false
//
//   if (inCameraFrustum) {
//     if (interactable.uiVisibilityOverride === XRUIVisibilityOverride.none) {
//       if (interactable.uiActivationType === XRUIActivationType.proximity) {
//         //proximity
//         let thresh = interactable.activationDistance
//         thresh *= thresh //squared for dist squared comparison
//         activateUI = distance < thresh
//       } else if (interactable.uiActivationType === XRUIActivationType.hover || interactable.clickInteract) {
//         //hover
//         const input = getOptionalComponent(entity, InputComponent)
//         if (input) {
//           hovering = input.inputSources.length > 0
//           activateUI = hovering
//         }
//       }
//     } else {
//       activateUI = interactable.uiVisibilityOverride !== XRUIVisibilityOverride.off //could be more explicit, needs to be if we add more enum options
//     }
//   }
//
//   //highlight if hovering OR if closest, otherwise turn off highlight
//   const mutableInteractable = getMutableComponent(entity, InteractableComponent)
//   mutableInteractable.highlighted.set(hovering || entity === getState(InteractableState).available[0])
//
//   if (transition.state === 'OUT' && activateUI) {
//     transition.setState('IN')
//     setComponent(interactable.uiEntity, VisibleComponent)
//   }
//   if (transition.state === 'IN' && !activateUI) {
//     transition.setState('OUT')
//   }
//   const deltaSeconds = getState(ECSState).deltaSeconds
//   transition.update(deltaSeconds, (opacity) => {
//     if (opacity === 0) {
//       removeComponent(interactable.uiEntity, VisibleComponent)
//     }
//     xrui.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
//       const mat = layer.contentMesh.material as THREE.MeshBasicMaterial
//       mat.opacity = opacity
//     })
//   })
// }

/**
 * Adds an interactable UI to the entity if it has label text
 * @param entity
 */
// const addInteractableUI = (entity: Entity) => {
//TODO create interactable label component
// const interactable = getMutableComponent(entity, InteractableComponent)
// if (!interactable.label.value || interactable.label.value === '' || interactable.uiEntity.value != UndefinedEntity)
//   return //null or empty label = no ui
//
// interactable.uiEntity.set(createUI(entity, interactable.label.value, interactable.uiInteractable.value).entity)
// setComponent(interactable.uiEntity.value, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })
// setComponent(interactable.uiEntity.value, ComputedTransformComponent, {
//   referenceEntities: [entity, Engine.instance.viewerEntity],
//   computeFunction: () => updateInteractableUI(entity)
// })
//
// const transition = createTransitionState(0.25)
// transition.setState('OUT')
// InteractableTransitions.set(entity, transition)
// }

// const removeInteractableUI = (entity: Entity) => {
//TODO remove interactable label component
// const interactable = getMutableComponent(entity, InteractableComponent)
// if (!interactable.label || interactable.label.value === '' || interactable.uiEntity.value == UndefinedEntity) return //null or empty label = no ui
//
// removeEntity(interactable.uiEntity.value)
// interactable.uiEntity.set(UndefinedEntity)
// }

export const InteractableComponent = defineComponent({
  name: 'InteractableComponent',
  jsonID: 'EE_interactable',

  interactButtons: [MouseButton.PrimaryClick, XRStandardGamepadButton.Trigger, KeyboardButton.KeyE],

  onInit: () => {
    return {
      active: false
    }
  },

  toJSON: (entity, component) => {
    return {}
  },

  useIsActive: () => {
    const entity = useAncestorWithComponent(useEntityContext(), InteractableComponent)
    return useComponent(entity, InteractableComponent).active
  },

  reactor: () => {
    if (!isClient) return null
    const entity = useEntityContext()
    const input = useOptionalComponent(entity, InputComponent)
    const isEditing = useMutableState(EngineState).isEditing

    //TODO check if this is happening in InputComponent/system, unify it wherever makes sense
    useEffect(() => {
      if (isEditing.value || !input) return
      const canvas = getComponent(Engine.instance.viewerEntity, RendererComponent).canvas
      if (input.inputSources.length > 0) {
        canvas.style.cursor = 'pointer'
      }
      return () => {
        canvas.style.cursor = 'auto'
      }
    }, [input?.inputSources.length, isEditing.value])

    return null
  }
})
