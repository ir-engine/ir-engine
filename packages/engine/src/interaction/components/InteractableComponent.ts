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
import {
  Engine,
  EntityUUID,
  getComponent,
  removeComponent,
  removeEntity,
  setComponent,
  UndefinedEntity,
  useComponent,
  useEntityContext,
  useOptionalComponent
} from '@etherealengine/ecs'
import { defineComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { getState, NO_PROXY } from '@etherealengine/hyperflux'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { InputComponent } from '@etherealengine/spatial/src/input/components/InputComponent'
import { HighlightComponent } from '@etherealengine/spatial/src/renderer/components/HighlightComponent'
import { RendererComponent } from '@etherealengine/spatial/src/renderer/WebGLRendererSystem'
import { BoundingBoxComponent } from '@etherealengine/spatial/src/transform/components/BoundingBoxComponents'
import { useEffect } from 'react'
import matches from 'ts-matches'

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
export const InteractableComponent = defineComponent({
  name: 'InteractableComponent',
  jsonID: 'EE_interactable',
  onInit: () => {
    return {
      //TODO reimpliment the frustum culling for interactables

      //TODO check if highlight works properly on init and with non clickInteract
      //TODO simplify button logic in inputUpdate

      //TODO after that is done, get rid of custom updates and add a state bool for "interactable" or "showUI"...think about best name

      //TODO canInteract for grabbed state on grabbable?
      uiInteractable: true,
      uiEntity: UndefinedEntity,
      label: null as string | null,
      uiVisibilityOverride: XRUIVisibilityOverride.none as XRUIVisibilityOverride,
      uiActivationType: XRUIActivationType.proximity as XRUIActivationType,
      activationDistance: 2,
      clickInteract: false,
      highlighted: false,
      callbacks: [] as Array<{
        /**
         * The function to call on the CallbackComponent of the targetEntity when the trigger volume is entered.
         */
        callbackID: null | string
        /**
         * empty string represents self
         */
        target: null | EntityUUID
      }>
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (json.label) component.label.set(json.label)
    if (typeof json.uiActivationType === 'number' && component.uiActivationType.value !== json.uiActivationType)
      component.uiActivationType.set(json.uiActivationType)
    if (typeof json.clickInteract === 'boolean' && component.clickInteract.value !== json.clickInteract)
      component.clickInteract.set(json.clickInteract)
    if (typeof json.uiInteractable === 'boolean' && component.uiInteractable.value !== json.uiInteractable)
      component.uiInteractable.set(json.uiInteractable)
    if (json.activationDistance) component.activationDistance.set(json.activationDistance)
    if (
      matches
        .arrayOf(
          matches.shape({
            callbackID: matches.nill.orParser(matches.string),
            target: matches.nill.orParser(matches.string)
          })
        )
        .test(json.callbacks)
    ) {
      component.callbacks.set(json.callbacks)
    }

    if (component.uiActivationType.value === XRUIActivationType.hover || component.clickInteract.value) {
      setComponent(entity, InputComponent)
      setComponent(entity, BoundingBoxComponent)
    }
  },

  onRemove: (entity, component) => {
    if (component.uiEntity.value !== UndefinedEntity) {
      removeEntity(component.uiEntity.value)
    }
  },

  toJSON: (entity, component) => {
    return {
      label: component.label.value,
      clickInteract: component.clickInteract.value,
      activationDistance: component.activationDistance.value,
      uiActivationType: component.uiActivationType.value,
      uiInteractable: component.uiInteractable.value,
      callbacks: component.callbacks.get(NO_PROXY)
    }
  },

  reactor: () => {
    if (!isClient) return null
    const entity = useEntityContext()
    const interactable = useComponent(entity, InteractableComponent)
    const input = useOptionalComponent(entity, InputComponent)

    useEffect(() => {
      if (getState(EngineState).isEditor || !input) return
      const canvas = getComponent(Engine.instance.viewerEntity, RendererComponent).canvas
      if (input.inputSources.length > 0) {
        canvas.style.cursor = 'pointer'
      }
      return () => {
        canvas.style.cursor = 'auto'
      }
    }, [input?.inputSources.length])

    //handle highlighting when state is set
    useEffect(() => {
      if (!interactable.highlighted.value) return
      setComponent(entity, HighlightComponent)
      return () => {
        removeComponent(entity, HighlightComponent)
      }
    }, [interactable.highlighted])
    return null
  }
})
