import React from 'react'
import { useLayoutEffect } from 'react'

import { none, State, useHookstate } from '@etherealengine/hyperflux'

import { Entity, UndefinedEntity } from '../../ecs/classes/Entity'
import {
  defineComponent,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent,
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
      assignedEntity: UndefinedEntity as Entity,
      captured: false
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

  capture: (sourceEntity: Entity, targetEntity?: Entity) => {
    if (!hasComponent(sourceEntity, InputSourceComponent))
      throw new Error('InputSourceComponent not found for entity ' + sourceEntity)

    const inputSourceComponent = getMutableComponent(sourceEntity, InputSourceComponent)
    if (targetEntity) inputSourceComponent.assignedEntity.set(targetEntity)
    inputSourceComponent.captured.set(true)
  },

  release: (sourceEntity: Entity) => {
    const inputSourceComponent = getMutableComponent(sourceEntity, InputSourceComponent)
    inputSourceComponent.captured.set(false)
  },

  isAssigned: (targetEntity: Entity) => {
    const sourceEntities = getOptionalComponent(targetEntity, InputComponent)?.inputSources
    return !!sourceEntities?.find((sourceEntity) => {
      const inputSourceComponent = getComponent(sourceEntity, InputSourceComponent)
      return inputSourceComponent.assignedEntity === targetEntity
    })
  },

  reactor: () => {
    const entity = useEntityContext()
    const inputSource = useComponent(entity, InputSourceComponent)
    const assignedEntity = inputSource.assignedEntity
    return <InputSourceAssignmentReactor key={assignedEntity.value} assignedEntity={assignedEntity} />
  }
})

/**
 *
 * @param props
 * @returns
 */
const InputSourceAssignmentReactor = (props: { assignedEntity: State<Entity> }) => {
  const assignedInputEntity = useHookstate(props.assignedEntity)
  const inputSink = useComponent(assignedInputEntity.value, InputComponent)

  useLayoutEffect(() => {
    inputSink.inputSources.merge([assignedInputEntity.value])
    const assignedInputEntityValue = assignedInputEntity.value
    return () => {
      const idx = inputSink.inputSources.keys.indexOf(assignedInputEntityValue)
      idx > -1 && inputSink.inputSources[idx].set(none)
    }
  }, [assignedInputEntity])

  return null
}
