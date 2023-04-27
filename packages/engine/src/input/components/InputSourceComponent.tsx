import React from 'react'
import { useLayoutEffect } from 'react'

import { none, State, useHookstate } from '@etherealengine/hyperflux'

import { Entity, UndefinedEntity } from '../../ecs/classes/Entity'
import {
  defineComponent,
  getComponent,
  getMutableComponent,
  getOptionalComponentState,
  setComponent,
  useComponent
} from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { XRSpaceComponent } from '../../xr/XRComponents'
import { ButtonInputStateType } from '../InputState'
import { InputComponent } from './InputComponent'

export const InputSourceComponent = defineComponent({
  name: 'InputSourceComponent',

  onInit: () => {
    return {
      source: null! as XRInputSource,
      buttons: {} as Readonly<ButtonInputStateType>,
      assignedEntity: UndefinedEntity as Entity
    }
  },

  onSet: (entity, component, args: { source: XRInputSource; assignedEntity?: Entity }) => {
    const { source, assignedEntity } = args
    component.source.set(source)
    component.assignedEntity.set(assignedEntity ?? UndefinedEntity)
    InputSourceComponent.entitiesByInputSource.set(args.source, entity)
    setComponent(entity, XRSpaceComponent, source.targetRaySpace)
  },

  entitiesByInputSource: new WeakMap<XRInputSource>(),

  reactor: () => {
    const entity = useEntityContext()
    const inputSource = useComponent(entity, InputSourceComponent)
    const assignedEntity = inputSource.assignedEntity
    return <InputSourceAssignmentReactor key={assignedEntity.value} assignedEntity={assignedEntity} />
  }
})

const InputSourceAssignmentReactor = (props: { assignedEntity: State<Entity> }) => {
  const assignedInputEntity = useHookstate(props.assignedEntity)
  const input = useComponent(assignedInputEntity.value, InputComponent)

  useLayoutEffect(() => {
    input.inputSources.merge([assignedInputEntity.value])
    return () => {
      const idx = input.inputSources.keys.indexOf(assignedInputEntity.value)
      idx > -1 && input.inputSources[idx].set(none)
    }
  }, [input])

  return null
}
