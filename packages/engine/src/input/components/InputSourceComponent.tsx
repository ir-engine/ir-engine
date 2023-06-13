import React, { useEffect } from 'react'
import { useLayoutEffect } from 'react'

import { none, State, useHookstate } from '@etherealengine/hyperflux'

import { Entity, UndefinedEntity } from '../../ecs/classes/Entity'
import {
  defineComponent,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { HighlightComponent } from '../../renderer/components/HighlightComponent'
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
    const sourceEntity = useEntityContext()
    const inputSource = useComponent(sourceEntity, InputSourceComponent)
    return (
      <InputSourceAssignmentReactor
        key={inputSource.assignedEntity.value}
        assignedEntity={inputSource.assignedEntity}
      />
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
