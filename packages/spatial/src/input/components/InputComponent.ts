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

import { useLayoutEffect } from 'react'

import {
  defineSystem,
  getComponent,
  getOptionalComponent,
  InputSystemGroup,
  UndefinedEntity,
  useExecute
} from '@ir-engine/ecs'
import { defineComponent, removeComponent, setComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { getState, useHookstate } from '@ir-engine/hyperflux'
import { EngineState } from '../../EngineState'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { HighlightComponent } from '../../renderer/components/HighlightComponent'
import { T } from '../../schema/schemaFunctions'
import { getAncestorWithComponents, isAncestor } from '../../transform/components/EntityTree'
import {
  AnyAxis,
  AnyButton,
  AxisMapping,
  AxisValueMap,
  ButtonStateMap,
  KeyboardButton,
  MouseButton,
  MouseScroll,
  XRStandardGamepadAxes,
  XRStandardGamepadButton
} from '../state/ButtonState'
import { InputState } from '../state/InputState'
import { InputSinkComponent } from './InputSinkComponent'
import { InputSourceComponent } from './InputSourceComponent'

export type InputAlias = Record<string, (string | number)[]>

export const DefaultButtonAlias = {
  Interact: [MouseButton.PrimaryClick, XRStandardGamepadButton.XRStandardGamepadTrigger, KeyboardButton.KeyE],
  FollowCameraModeCycle: [KeyboardButton.KeyV],
  FollowCameraFirstPerson: [KeyboardButton.KeyF],
  FollowCameraShoulderCam: [KeyboardButton.KeyC]
} satisfies Record<string, Array<AnyButton>>

export const DefaultAxisAlias = {
  FollowCameraZoomScroll: [
    MouseScroll.VerticalScroll,
    XRStandardGamepadAxes.XRStandardGamepadThumbstickY,
    XRStandardGamepadAxes.XRStandardGamepadTouchpadY
  ],
  FollowCameraShoulderCamScroll: [MouseScroll.HorizontalScroll]
} satisfies Record<string, Array<AnyAxis>>

export const InputComponent = defineComponent({
  name: 'InputComponent',
  jsonID: 'EE_input',

  schema: S.Object({
    inputSinks: S.Array(T.EntityUUID(), ['Self']),
    activationDistance: S.Number(2),
    highlight: S.Bool(false),
    grow: S.Bool(false),

    //internal
    /** populated automatically by ClientInputSystem */
    inputSources: S.NonSerialized(S.Array(T.Entity()))
  }),

  useExecuteWithInput(
    executeOnInput: () => void,
    executeWhenEditing = false,
    order: InputExecutionOrder = InputExecutionOrder.With
  ) {
    const entity = useEntityContext()

    return useExecute(() => {
      const capturingEntity = getState(InputState).capturingEntity
      if (
        (!executeWhenEditing && getState(EngineState).isEditing) ||
        (capturingEntity && !isAncestor(capturingEntity, entity, true))
      )
        return
      executeOnInput()
    }, getInputExecutionInsert(order))
  },

  getInputEntities(entityContext: Entity): Entity[] {
    const inputSinkEntity = getAncestorWithComponents(entityContext, [InputSinkComponent])
    const closestInputEntity = getAncestorWithComponents(entityContext, [InputComponent])
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

  getMergedButtons<AliasType extends InputAlias = typeof DefaultButtonAlias>(
    entityContext: Entity,
    inputAlias: AliasType = DefaultButtonAlias as unknown as AliasType
  ) {
    const inputSourceEntities = InputComponent.getInputSourceEntities(entityContext)
    return InputComponent.getMergedButtonsForInputSources(inputSourceEntities, inputAlias)
  },

  getMergedAxes<AliasType extends InputAlias = typeof DefaultAxisAlias>(
    entityContext: Entity,
    inputAlias: AliasType = DefaultAxisAlias as unknown as AliasType
  ) {
    const inputSourceEntities = InputComponent.getInputSourceEntities(entityContext)
    return InputComponent.getMergedAxesForInputSources(inputSourceEntities, inputAlias)
  },

  /**
   * @description Returns an object that:
   * - Contains all of the buttons described by the InputSourceComponent.buttons of all `@param inputSourceEntities`
   * - Has synchronized the state of the buttons described by all entries of `@param inputAlias` into fields of the same name.  */
  getMergedButtonsForInputSources<AliasType extends InputAlias = typeof DefaultButtonAlias>(
    inputSourceEntities: Entity[],
    inputAlias: AliasType = DefaultButtonAlias as unknown as AliasType
  ) {
    const buttons = Object.assign(
      {},
      ...inputSourceEntities.map((eid) => {
        return getComponent(eid, InputSourceComponent).buttons
      })
    ) as ButtonStateMap<AliasType>

    for (const key of Object.keys(inputAlias)) {
      const k = key as keyof AliasType
      buttons[k] = inputAlias[key].reduce((acc: any, alias) => acc || buttons[alias], undefined)
    }

    return buttons
  },

  getMergedAxesForInputSources<AliasType extends InputAlias = typeof DefaultAxisAlias>(
    inputSourceEntities: Entity[],
    inputAlias: AliasType = DefaultAxisAlias as unknown as AliasType
  ) {
    const axes = {
      0: 0,
      1: 0,
      2: 0,
      3: 0
    } as any

    for (const eid of inputSourceEntities) {
      const inputSource = getComponent(eid, InputSourceComponent)
      if (inputSource.source.gamepad?.axes) {
        const mapping = AxisMapping[inputSource.source.gamepad.mapping]
        for (let i = 0; i < 4; i++) {
          const newAxis = inputSource.source.gamepad.axes[i] ?? 0
          axes[i] = getLargestMagnitudeNumber(axes[i] ?? 0, newAxis)
          axes[mapping[i]] = axes[i]
        }
      }
    }

    for (const key of Object.keys(inputAlias)) {
      axes[key as any] = inputAlias[key].reduce<number>((prev, alias) => {
        return getLargestMagnitudeNumber(prev, axes[alias] ?? 0)
      }, 0)
    }

    return axes as AxisValueMap<AliasType>
  },

  useHasFocus() {
    const entity = useEntityContext()
    const hasFocus = useHookstate(() => {
      return InputComponent.getInputSourceEntities(entity).length > 0
    })
    useExecute(
      () => {
        const inputSources = InputComponent.getInputSourceEntities(entity)
        hasFocus.set(inputSources.length > 0)
      },
      // we want to evaluate input sources after the input system group has run, after all input systems
      // have had a chance to respond to input and/or capture input sources
      { after: InputSystemGroup }
    )
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

export const enum InputExecutionOrder {
  'Before' = -1,
  'With' = 0,
  'After' = 1
}

function getInputExecutionInsert(order: InputExecutionOrder) {
  switch (order) {
    case InputExecutionOrder.Before:
      return { before: InputExecutionSystemGroup }
    case InputExecutionOrder.After:
      return { after: InputExecutionSystemGroup }
    default:
      return { with: InputExecutionSystemGroup }
  }
}

/** System for inserting subsystems*/
export const InputExecutionSystemGroup = defineSystem({
  uuid: 'ee.engine.InputExecutionSystemGroup',
  insert: { with: InputSystemGroup }
})
