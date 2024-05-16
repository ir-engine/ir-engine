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

import { useLayoutEffect } from 'react'

import { getMutableComponent, InputSystemGroup, useExecute } from '@etherealengine/ecs'
import {
  defineComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { Entity, EntityUUID, UndefinedEntity } from '@etherealengine/ecs/src/Entity'
import { useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { HighlightComponent } from '../../renderer/components/HighlightComponent'
import { useAncestorWithComponent } from '../../transform/components/EntityTree'
import { InputSinkComponent } from './InputSinkComponent'

export const InputComponent = defineComponent({
  name: 'InputComponent',
  jsonID: 'EE_input_component',

  onInit: () => {
    return {
      inputSinks: [] as EntityUUID[],
      activationDistance: 2,
      highlight: true,
      grow: false,

      //internal
      /** populated automatically by ClientInputSystem */
      inputSources: [] as Entity[],
      hasFocus: false
    }
  },

  onSet(entity, component, json) {
    if (!json) return

    if (typeof json.inputSinks === 'object') component.inputSinks.set(json.inputSinks)
    if (typeof json.highlight === 'boolean') component.highlight.set(json.highlight)
    if (json.activationDistance) component.activationDistance.set(json.activationDistance)
    if (typeof json.grow === 'boolean') component.grow.set(json.grow)
  },

  toJSON: (entity, component) => {
    return {
      inputSinks: component.inputSinks,
      activationDistance: component.activationDistance.value
    }
  },

  useInputs: (executeOnInput?: (inputEntity: Entity) => void) => {
    const entity = useEntityContext()
    const inputSinkEntity = useAncestorWithComponent(entity, InputSinkComponent)
    const inputEntity = useOptionalComponent(inputSinkEntity, InputSinkComponent)?.inputEntity.value ?? UndefinedEntity

    executeOnInput &&
      useExecute(
        () => {
          executeOnInput(inputEntity)
        },
        {
          with: InputSystemGroup
        }
      )

    return inputEntity
  },

  /** InputComponent is focused by the ClientInputSystem heuristics */
  useHasFocus() {
    const entity = InputComponent.useInput()
    const inputComponent = useComponent(entity, InputComponent)

    return inputComponent.hasFocus
  },

  reactor: () => {
    const entity = useEntityContext()
    const input = useComponent(entity, InputComponent)

    useLayoutEffect(() => {
      if (!input.inputSources.length || !input.highlight.value) return
      setComponent(entity, HighlightComponent)
      return () => {
        removeComponent(entity, HighlightComponent)
      }
    }, [input.inputSources, input.highlight])

    useExecute(
      () => {
        const inputComponent = getMutableComponent(entity, InputComponent)
        if (!inputComponent) return
        inputComponent.hasFocus.set(inputComponent.inputSources.value.length > 0)
      },
      { with: InputSystemGroup }
    )
    /** @todo - fix */
    // useLayoutEffect(() => {
    //   if (!input.inputSources.length || !input.grow.value) return
    //   setComponent(entity, AnimateScaleComponent)
    //   return () => {
    //     removeComponent(entity, AnimateScaleComponent)
    //   }
    // }, [input.inputSources, input.grow])

    return null
  }
})
