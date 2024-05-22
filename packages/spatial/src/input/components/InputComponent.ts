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

import {
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  InputSystemGroup,
  UndefinedEntity,
  useExecute
} from '@etherealengine/ecs'
import {
  defineComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { Entity, EntityUUID } from '@etherealengine/ecs/src/Entity'
import { useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { getState, useHookstate } from '@etherealengine/hyperflux'
import { EngineState } from '../../EngineState'

import { HighlightComponent } from '../../renderer/components/HighlightComponent'
import { getAncestorWithComponent, isAncestor } from '../../transform/components/EntityTree'
import { ButtonState, ButtonStateMap, KeyboardButton, MouseButton, XRStandardGamepadButton } from '../state/ButtonState'
import { InputState } from '../state/InputState'
import { InputSinkComponent } from './InputSinkComponent'
import { InputSourceComponent } from './InputSourceComponent'

export type InputAlias = Record<string, (string | number)[]>

export const DefaultInputAlias = {
  Interact: [MouseButton.PrimaryClick, XRStandardGamepadButton.Trigger, KeyboardButton.KeyE]
}

export const InputComponent = defineComponent({
  name: 'InputComponent',
  jsonID: 'EE_input',

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
      inputSinks: component.inputSinks.value,
      activationDistance: component.activationDistance.value
    }
  },

  useExecuteWithInput(executeOnInput: () => void, executeWhenEditing = false) {
    const entity = useEntityContext()
    return useExecute(
      () => {
        const capturingEntity = getState(InputState).capturingEntity
        if (
          !executeWhenEditing ||
          getState(EngineState).isEditing ||
          (capturingEntity && !isAncestor(capturingEntity, entity, true))
        )
          return
        executeOnInput()
      },
      { with: InputSystemGroup }
    )
  },

  getInputEntities(entityContext: Entity): Entity[] {
    const inputSinkEntity = getAncestorWithComponent(entityContext, InputSinkComponent)
    const closestInputEntity = getAncestorWithComponent(entityContext, InputComponent)
    const inputSinkInputEntities = getOptionalComponent(inputSinkEntity, InputSinkComponent)?.inputEntities ?? []
    const inputEntities = [closestInputEntity, ...inputSinkInputEntities]
    return inputEntities.filter(
      (entity, index) => inputEntities.indexOf(entity) === index && entity !== UndefinedEntity
    ) // remove duplicates
  },

  getInputSourceEntities(entityContext: Entity) {
    const inputEntities = InputComponent.getInputEntities(entityContext)
    return inputEntities.reduce<Entity[]>((prev, eid) => {
      return [...prev, ...getComponent(eid, InputComponent).inputSources]
    }, [])
  },

  getMergedButtons<AliasType extends InputAlias = typeof DefaultInputAlias>(
    entityContext: Entity,
    inputAlias: AliasType = DefaultInputAlias as unknown as AliasType
  ) {
    const inputSourceEntities = InputComponent.getInputSourceEntities(entityContext)
    return InputComponent.getMergedButtonsForInputSources(inputSourceEntities, inputAlias)
  },

  getMergedAxes<AliasType extends InputAlias = typeof DefaultInputAlias>(
    entityContext: Entity,
    inputAlias: AliasType = DefaultInputAlias as unknown as AliasType
  ) {
    const inputSourceEntities = InputComponent.getInputSourceEntities(entityContext)
    return InputComponent.getMergedAxesForInputSources(inputSourceEntities, inputAlias)
  },

  getMergedButtonsForInputSources<AliasType extends InputAlias = typeof DefaultInputAlias>(
    inputSourceEntities: Entity[],
    inputAlias: AliasType = DefaultInputAlias as unknown as AliasType
  ) {
    const buttons = Object.assign(
      {} as ButtonStateMap,
      ...inputSourceEntities.map((eid) => {
        return getComponent(eid, InputSourceComponent).buttons
      })
    ) as ButtonStateMap & Partial<Record<keyof AliasType, ButtonState>>

    for (const key of Object.keys(inputAlias)) {
      const k = key as keyof AliasType
      buttons[k] = inputAlias[key].reduce((acc: any, alias) => acc || buttons[alias], undefined)
    }

    return buttons
  },

  getMergedAxesForInputSources<AliasType extends InputAlias = typeof DefaultInputAlias>(
    inputSourceEntities: Entity[],
    inputAlias: AliasType = DefaultInputAlias as unknown as AliasType
  ) {
    const axes = {
      0: 0,
      1: 0,
      2: 0,
      3: 0
    } as Record<string | number, number>

    for (const eid of inputSourceEntities) {
      const inputSource = getComponent(eid, InputSourceComponent)
      if (inputSource.source.gamepad?.axes) {
        for (let i = 0; i < 4; i++) {
          const newAxis = inputSource.source.gamepad.axes[i] ?? 0
          axes[i] = getLargestMagnitudeNumber(axes[i], newAxis)
        }
      }
    }

    for (const key of Object.keys(inputAlias)) {
      axes[key] = inputAlias[key].reduce<number>((prev, alias) => {
        return getLargestMagnitudeNumber(prev, axes[alias])
      }, 0)
    }

    return axes
  },

  useHasFocus() {
    const entity = useEntityContext()
    const hasFocus = useHookstate(false)
    InputComponent.useExecuteWithInput(() => {
      const inputSources = InputComponent.getInputSourceEntities(entity)
      hasFocus.set(inputSources.length > 0)
    }, true)
    return hasFocus
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

    // useEffect(() => {
    //   // perhaps we don't need to create a rigidbody; we just want to be able to add anything in this tree to the `input` layer,
    //   // whether or not it's a rigidbody or a mesh
    //
    //   //then we might just need to abandon the Input layer raycast, leave that as-is, add the distance heuristic and call it a day
    //
    //   // the input system can still perform physics and mesh bvh raycasts on things that have an InputComponent as an entity ancestor
    //   // I think I know how this can work
    //   //awesome
    //
    //   //techincally if we add the distance heuristic a rigidbody / collider are not needed
    //
    //   // after entity tree has loaded (how do we check for this...)
    //   // create an input rigidbody if one doesn't exist
    //   // if (!hasComponent(entity, RigidBodyComponent)) {
    //   //   setComponent(entity, RigidBodyComponent, { type: BodyTypes.Fixed }) //assume kinematic if it had no rigidbody before
    //   // }
    //   // // create an input colliderComponent if one doesn't exist
    //   // if (!hasComponent(entity, ColliderComponent)) {
    //   //   //TODO - check if we have a mesh, if we do, use the mesh as a collider type....if not then generate a bounding sphere
    //   //   setComponent(entity, ColliderComponent)
    //   // }
    //   // const hasMesh = hasComponent(entity, MeshComponent)
    //   // const collider = getMutableComponent(entity, ColliderComponent)
    //   // collider.collisionLayer.set(collider.collisionLayer.value | CollisionGroups.Input)
    // }, [])

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

function getLargestMagnitudeNumber(a: number, b: number) {
  return Math.abs(a) > Math.abs(b) ? a : b
}
