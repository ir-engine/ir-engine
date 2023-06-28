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
import React, { useEffect } from 'react'
import { useLayoutEffect } from 'react'

import { defineState, getMutableState, none, State, useHookstate } from '@etherealengine/hyperflux'

import { Entity, UndefinedEntity } from '../../ecs/classes/Entity'
import {
  defineComponent,
  defineQuery,
  getComponent,
  getOptionalComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { XRSpaceComponent } from '../../xr/XRComponents'
import { ButtonStateMap } from '../state/ButtonState'
import { InputComponent } from './InputComponent'

export const InputSourceCaptureState = defineState({
  name: 'InputSourceCaptureState',
  initial: {
    buttons: {} as Record<XRHandedness, boolean>,
    axes: {} as Record<XRHandedness, boolean>
  }
})

const handednesses = ['left', 'right', 'none'] as XRHandedness[]

export const InputSourceButtonsCapturedComponent = defineComponent({
  name: 'InputSourceButtonsCapturedComponent'
})

export const InputSourceAxesCapturedComponent = defineComponent({
  name: 'InputSourceAxesCapturedComponent'
})

export const InputSourceComponent = defineComponent({
  name: 'InputSourceComponent',

  onInit: () => {
    return {
      source: null! as XRInputSource,
      buttons: {} as Readonly<ButtonStateMap>,
      capturedButtonEntity: UndefinedEntity as Entity,
      capturedAxesEntity: UndefinedEntity as Entity
    }
  },

  onSet: (
    entity,
    component,
    args: { source: XRInputSource; capturedButtonEntity?: Entity; capturedAxesEntity?: Entity }
  ) => {
    const { source, capturedButtonEntity, capturedAxesEntity } = args
    component.source.set(source)
    component.capturedButtonEntity.set(capturedButtonEntity ?? UndefinedEntity)
    component.capturedAxesEntity.set(capturedAxesEntity ?? UndefinedEntity)
    InputSourceComponent.entitiesByInputSource.set(args.source, entity)
    setComponent(entity, XRSpaceComponent, source.targetRaySpace)
  },

  entitiesByInputSource: new WeakMap<XRInputSource>(),

  captureButtons: (handedness = handednesses) => {
    const state = getMutableState(InputSourceCaptureState)
    for (const hand of handedness) state.buttons[hand].set(true)
  },

  releaseButtons: (handedness = handednesses) => {
    const state = getMutableState(InputSourceCaptureState)
    for (const hand of handedness) state.buttons[hand].set(false)
  },

  captureAxes: (handedness = handednesses) => {
    const state = getMutableState(InputSourceCaptureState)
    for (const hand of handedness) state.axes[hand].set(true)
  },

  releaseAxes: (handedness = handednesses) => {
    const state = getMutableState(InputSourceCaptureState)
    for (const hand of handedness) state.axes[hand].set(false)
  },

  isAssignedButtons: (targetEntity: Entity) => {
    const sourceEntities = getOptionalComponent(targetEntity, InputComponent)?.inputSources
    return !!sourceEntities?.find((sourceEntity) => {
      const inputSourceComponent = getComponent(sourceEntity, InputSourceComponent)
      return inputSourceComponent.capturedButtonEntity === targetEntity
    })
  },

  isAssignedAxes: (targetEntity: Entity) => {
    const sourceEntities = getOptionalComponent(targetEntity, InputComponent)?.inputSources
    return !!sourceEntities?.find((sourceEntity) => {
      const inputSourceComponent = getComponent(sourceEntity, InputSourceComponent)
      return inputSourceComponent.capturedAxesEntity === targetEntity
    })
  },

  nonCapturedInputSourceQuery: () => {
    return nonCapturedInputSourceQuery()
  },

  reactor: () => {
    const sourceEntity = useEntityContext()
    const inputSource = useComponent(sourceEntity, InputSourceComponent)
    const capturedButtons = useHookstate(getMutableState(InputSourceCaptureState).buttons)
    const capturedAxes = useHookstate(getMutableState(InputSourceCaptureState).axes)

    useEffect(() => {
      if (!inputSource.source.value) return
      const captured = capturedButtons[inputSource.source.value.handedness].value
      if (captured) {
        setComponent(sourceEntity, InputSourceButtonsCapturedComponent)
      } else {
        removeComponent(sourceEntity, InputSourceButtonsCapturedComponent)
      }
    }, [capturedButtons, inputSource.source])

    useEffect(() => {
      if (!inputSource.source.value) return
      const captured = capturedAxes[inputSource.source.value.handedness].value
      if (captured) {
        setComponent(sourceEntity, InputSourceAxesCapturedComponent)
      } else {
        removeComponent(sourceEntity, InputSourceAxesCapturedComponent)
      }
    }, [capturedAxes, inputSource.source])

    console.log(inputSource.capturedButtonEntity.value, inputSource.capturedAxesEntity.value)

    return (
      <>
        <InputSourceAssignmentReactor
          key={`button-${inputSource.capturedButtonEntity.value}`}
          assignedEntity={inputSource.capturedButtonEntity}
        />
        <InputSourceAssignmentReactor
          key={`axes-${inputSource.capturedAxesEntity.value}`}
          assignedEntity={inputSource.capturedAxesEntity}
        />
      </>
    )
  }
})

const InputSourceAssignmentReactor = React.memo((props: { assignedEntity: State<Entity> }) => {
  const sourceEntity = useEntityContext()
  const input = useOptionalComponent(props.assignedEntity.value, InputComponent)

  useLayoutEffect(() => {
    if (!input) return
    const idx = input.inputSources.value.indexOf(sourceEntity)
    idx === -1 && input.inputSources.merge([sourceEntity])
    return () => {
      const idx = input.inputSources.value.indexOf(sourceEntity)
      idx > -1 && input.inputSources[idx].set(none)
    }
  }, [props.assignedEntity.value])

  return null
})

const nonCapturedInputSourceQuery = defineQuery([
  InputSourceComponent,
  Not(InputSourceButtonsCapturedComponent),
  Not(InputSourceAxesCapturedComponent)
])
