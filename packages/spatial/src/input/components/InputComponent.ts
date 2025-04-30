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
  EngineState,
  getComponent,
  InputSystemGroup,
  UndefinedEntity,
  useEntityContext,
  useExecute
} from '@ir-engine/ecs'
import {
  defineComponent,
  getMutableComponent,
  getOptionalComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { getState, NO_PROXY_STEALTH, useHookstate } from '@ir-engine/hyperflux'

import { getAncestorWithComponents, isAncestor } from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { NameComponent } from '../../common/NameComponent'
import { HighlightComponent } from '../../renderer/components/HighlightComponent'
import {
  AnyAxis,
  AnyButton,
  AxisMapping,
  AxisValueMap,
  ButtonState,
  ButtonStateMap,
  createInitialButtonState,
  KeyboardButton,
  MouseButton,
  MouseScroll,
  StandardGamepadButton,
  XRStandardGamepadAxes,
  XRStandardGamepadButton
} from '../state/ButtonState'
import { InputState } from '../state/InputState'
import { InputSinkComponent } from './InputSinkComponent'
import { InputSourceComponent } from './InputSourceComponent'
// Types for input bindings
export type ButtonBinding = AnyButton | AnyButton[]
export type AxisBinding = AnyAxis
export type InputButtonBindings = Record<string, ButtonBinding[]>
export type InputAxisBindings = Record<string, AxisBinding[]>

export const DefaultButtonBindings = {
  Interact: [MouseButton.PrimaryClick, XRStandardGamepadButton.XRStandardGamepadTrigger, KeyboardButton.KeyE],
  FollowCameraModeCycle: [KeyboardButton.KeyV],
  FollowCameraFirstPerson: [KeyboardButton.KeyF],
  FollowCameraShoulderCam: [KeyboardButton.KeyC]
} satisfies InputButtonBindings

export const DefaultAxisBindings = {
  FollowCameraZoomScroll: [MouseScroll.VerticalScroll, XRStandardGamepadAxes.XRStandardGamepadTouchpadY],
  FollowCameraShoulderCamScroll: [MouseScroll.HorizontalScroll]
} satisfies InputAxisBindings

const ButtonSchema = S.Union([
  S.Enum(KeyboardButton),
  S.Enum(MouseButton),
  S.Enum(StandardGamepadButton),
  S.Enum(XRStandardGamepadButton)
])

/**
 * Execute a function based on input with configurable order and edit mode behavior
 * @param executeOnInput Function to execute
 * @param order Order of execution relative to the input system group
 * @param executeWhenEditing Whether to execute when in edit mode
 */
function useExecuteWithInput(executeOnInput: () => void, order?: InputExecutionOrder, executeWhenEditing?: boolean)

/**
 * @deprecated Use the new parameter order: (executeOnInput, order, executeWhenEditing)
 */
function useExecuteWithInput(executeOnInput: () => void, executeWhenEditing: boolean, order: InputExecutionOrder)

// Implementation
function useExecuteWithInput(
  executeOnInput: () => void,
  orderOrExecuteWhenEditing?: InputExecutionOrder | boolean,
  executeWhenEditingOrOrder?: boolean | InputExecutionOrder
) {
  const entity = useEntityContext()

  // Determine if we're using the deprecated parameter order
  let order: InputExecutionOrder = InputExecutionOrder.With
  let executeWhenEditing = false

  if (typeof orderOrExecuteWhenEditing === 'boolean') {
    // Old parameter order
    executeWhenEditing = orderOrExecuteWhenEditing
    order = executeWhenEditingOrOrder as InputExecutionOrder
  } else {
    // New parameter order
    order = (orderOrExecuteWhenEditing as InputExecutionOrder) ?? InputExecutionOrder.With
    executeWhenEditing = (executeWhenEditingOrOrder as boolean) ?? false
  }

  useExecute(() => {
    const isEditing = getState(EngineState).isEditing
    const capturingEntity = getState(InputState).capturingEntity

    // Don't execute if:
    // 1. We don't want to execute when editing and we are editing
    // 2. The entity is not an ancestor of the capturing entity
    if ((!executeWhenEditing && isEditing) || (capturingEntity && !isAncestor(capturingEntity, entity, true))) {
      return
    }

    executeOnInput()
  }, getInputExecutionInsert(order))
}

export const InputComponent = defineComponent({
  name: 'InputComponent',
  jsonID: 'EE_input',

  schema: S.Object({
    inputSinks: S.Array(S.EntityUUID(), ['Self']),
    activationDistance: S.Number(2),
    highlight: S.Bool(false),
    grow: S.Bool(false),
    buttonBindings: S.Record(S.String(), S.Array(S.Union([ButtonSchema, S.Array(ButtonSchema)])), {
      ...DefaultButtonBindings
    }),
    //internal
    /** populated automatically by ClientInputSystem */
    inputSources: S.NonSerialized(S.Array(S.Entity())),
    cachedButtons: S.NonSerialized(S.Type<ButtonStateMap<any>>({})),

    /** if true, the input component will automatically capture input when a button is consumed */
    autoCapture: S.Bool(false),

    buttons: S.NonSerialized(
      S.SerializedClass((entity) => {
        // Helper function to find first unconsumed button state
        const findButtonState = (button: AnyButton): ButtonState | undefined => {
          const inputComponent = getComponent(entity, InputComponent)
          for (const sourceEntity of inputComponent.inputSources) {
            const inputSourceComponent = getOptionalComponent(sourceEntity, InputSourceComponent)
            if (!inputSourceComponent) continue
            const state = inputSourceComponent.buttons[button] as ButtonState
            if (state?.consumed)
              console.warn(
                `button ${button} checked by ${entity} - ${getComponent(entity, NameComponent)} consumed by ${
                  state.consumed
                } - ${getComponent(state.consumed, NameComponent)}`
              )
            if (state && !state.consumed) {
              return state
            }
          }
          return undefined
        }

        return new Proxy(
          {},
          {
            get: (target: ButtonStateMap<any>, prop: string) => {
              if (typeof prop === 'symbol') {
                return target[prop]
              }

              // Check cache first
              const inputComponent = getComponent(entity, InputComponent)
              const cachedButtons = inputComponent.cachedButtons
              if (Object.hasOwn(cachedButtons, prop)) {
                if (!cachedButtons[prop]) return undefined
                if (cachedButtons[prop] && cachedButtons[prop].consumed) {
                  if (inputComponent.autoCapture && cachedButtons[prop].pressed) {
                    InputState.setCapturingEntity(entity)
                  }
                  return cachedButtons[prop]
                }
              }

              let result = cachedButtons[prop]

              // First check mapped button states since they define the mapping from alias to actual buttons
              const buttonBindings = inputComponent.buttonBindings
              if (buttonBindings && prop in buttonBindings) {
                const bindings = buttonBindings[prop]
                for (const b of bindings) {
                  if (Array.isArray(b)) {
                    // For combo buttons, check if all buttons in the combo are available
                    const states = b.map(findButtonState).filter((s): s is ButtonState => s !== undefined)

                    const isActive = states.length === b.length

                    if (!result && isActive) {
                      // All buttons in combo are active and not consumed, consume them and set the result
                      states.forEach((s) => (s.consumed = entity))
                      result = cachedButtons[prop] = createInitialButtonState(states[0].inputSourceEntity)
                    }

                    if (result && isActive) {
                      result.down = states.some((s) => s.down)
                      result.pressed = states.every((s) => s.pressed)
                      result.touched = states.every((s) => s.touched)
                      result.value = Math.max(...states.map((s) => s.value))
                      result.dragging = states.some((s) => s.dragging)
                      result.rotating = states.some((s) => s.rotating)
                      result.up = false
                      result.consumed = entity
                      if (inputComponent.autoCapture && result?.pressed) {
                        InputState.setCapturingEntity(entity)
                      }
                      return result
                    } else if (result) {
                      result.up = true
                      result.consumed = entity
                    }
                  } else {
                    // For single button bindings, just return that button
                    result = cachedButtons[prop] = findButtonState(b)
                    if (result) result.consumed = entity
                    if (inputComponent.autoCapture && result?.pressed) {
                      InputState.setCapturingEntity(entity)
                    }
                    return result
                  }

                  // If we get here, the button in the binding is not available, so set the state to undefined
                  return (cachedButtons[prop] = undefined)
                }
              }

              // Otherwise check if this exact button exists and is not consumed
              const rawState = (cachedButtons[prop] = findButtonState(prop as AnyButton))
              if (rawState) rawState.consumed = entity
              if (rawState && inputComponent.autoCapture && rawState.pressed) {
                InputState.setCapturingEntity(entity)
              }
              return rawState
            }
          }
        )
      }, {})
    )
  }),

  getInputEntity(entityContext: Entity): Entity {
    const closestInputEntity = getAncestorWithComponents(entityContext, [InputComponent], true, true)
    if (closestInputEntity) return closestInputEntity
    const inputSinkEntity = getAncestorWithComponents(entityContext, [InputSinkComponent], true, true)
    const inputSinkInputEntity = getOptionalComponent(inputSinkEntity, InputSinkComponent)?.inputEntity
    return inputSinkInputEntity ?? UndefinedEntity
  },

  getInputSourceEntities(entityContext: Entity) {
    const inputEntity = InputComponent.getInputEntity(entityContext)
    if (inputEntity === UndefinedEntity) return []
    return getComponent(inputEntity, InputComponent).inputSources
  },

  getButtons<BindingsType extends InputButtonBindings = typeof DefaultButtonBindings>(
    entityContext: Entity,
    inputBindings: BindingsType = DefaultButtonBindings as unknown as BindingsType,
    autoCapture = true
  ) {
    const inputEntity = InputComponent.getInputEntity(entityContext)
    if (inputEntity === UndefinedEntity) return {} as ButtonStateMap<BindingsType>
    const input = getMutableComponent(inputEntity, InputComponent)
    if (inputBindings) {
      for (const binding of Object.keys(inputBindings)) {
        if (!input.buttonBindings[binding].value) input.buttonBindings[binding].set(inputBindings[binding] as any)
      }
    }
    input.autoCapture.set(autoCapture)
    return input.buttons.get(NO_PROXY_STEALTH) as ButtonStateMap<BindingsType & typeof DefaultButtonBindings>
  },

  getAxes<BindingsType extends InputAxisBindings = typeof DefaultAxisBindings>(
    entityContext: Entity,
    inputBindings: BindingsType = DefaultAxisBindings as unknown as BindingsType
  ) {
    const inputSourceEntities = InputComponent.getInputSourceEntities(entityContext)

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

    for (const key of Object.keys(inputBindings)) {
      const bindings = inputBindings[key]
      axes[key] = bindings.reduce<number>((prev, binding) => {
        return getLargestMagnitudeNumber(prev, axes[binding] ?? 0)
      }, 0)
    }

    return axes as AxisValueMap<BindingsType>
  },

  // @deprecated use getButtons instead
  getMergedButtons<BindingsType extends InputButtonBindings = typeof DefaultButtonBindings>(
    entityContext: Entity,
    inputBindings: BindingsType = DefaultButtonBindings as unknown as BindingsType
  ) {
    return InputComponent.getButtons(entityContext, inputBindings)
  },

  // @deprecated use getAxes instead
  getMergedAxes<BindingsType extends InputAxisBindings = typeof DefaultAxisBindings>(
    entityContext: Entity,
    inputBindings: BindingsType = DefaultAxisBindings as unknown as BindingsType
  ) {
    return InputComponent.getAxes(entityContext, inputBindings)
  },

  useExecuteWithInput,

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

function filterInputEntities(entity: Entity, index: number, arr: Entity[]) {
  return arr.indexOf(entity) === index && entity !== UndefinedEntity
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

const mapInputButtons = (eid: Entity) => getComponent(eid, InputSourceComponent).buttons

const inputSinkComponentQueryComponents = [InputSinkComponent]
const inputComponentQueryComponents = [InputComponent]

const reduceInputEntities = (prev: Entity[], eid: Entity) => {
  prev.push(...getComponent(eid, InputComponent).inputSources)
  return prev
}
