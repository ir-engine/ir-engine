import {
  ComponentMap,
  Entity,
  S,
  Static,
  UUIDComponent,
  defineComponent,
  getComponent,
  useComponent,
  useEntityContext
} from '@ir-engine/ecs'
import { NO_PROXY, StateDefinitions, getNestedObject, getState, useMutableState } from '@ir-engine/hyperflux'
import { getCallback } from '@ir-engine/spatial/src/common/CallbackComponent'
import React, { useEffect } from 'react'

const ConditionSchema = S.LiteralUnion(['largerThan', 'smallerThan', 'equal', 'notEqual', 'contains', 'notContains'])

const EntityConditionSchema = S.Object({
  entityUUID: S.EntityUUID(),
  component: S.String(),
  property: S.String(),
  value: S.Any(),
  condition: ConditionSchema
})

const StateConditionSchema = S.Object({
  state: S.String(),
  property: S.Any(),
  value: S.Any(),
  condition: ConditionSchema
})

const ObserverSchema = S.Object({
  conditions: S.Array(S.Union([EntityConditionSchema, StateConditionSchema])),
  target: S.EntityUUID(),
  callback: S.String()
  /** @todo add schematized parameters to the CallbackComponent */
  // parameters: S.Array(S.Any())
})

const validCondition = (condition: Static<typeof EntityConditionSchema> | Static<typeof StateConditionSchema>) => {
  if ('entityUUID' in condition) {
    return condition.entityUUID !== '' && condition.component !== '' && condition.property !== ''
  } else {
    return condition.state !== '' && condition.property !== ''
  }
}

const validObserver = (observer: Static<typeof ObserverSchema>) =>
  observer.conditions.length > 0 && observer.callback !== '' && observer.conditions.every(validCondition)

export const ObservableComponent = defineComponent({
  name: 'ObservableComponent',
  jsonID: 'IR_observable',

  schema: S.Object({
    observers: S.Array(ObserverSchema)
  }),

  reactor: () => {
    const entity = useEntityContext()
    const observers = useComponent(entity, ObservableComponent).observers

    return (
      <>
        {observers.value.filter(validObserver).map((observer, index) => {
          return (
            <ObserverReactor
              key={JSON.stringify(observers[index].get(NO_PROXY))}
              entity={entity}
              observerIndex={index}
            />
          )
        })}
      </>
    )
  }
})

const ObserverReactor = (props: { entity: Entity; observerIndex: number }) => {
  const { entity, observerIndex } = props
  const observer = useComponent(entity, ObservableComponent).observers[observerIndex]
  const conditions = observer.conditions.value

  // Get dependencies
  const dependencies = conditions.map((condition) => {
    if ('entityUUID' in condition) {
      const componentDefinition = ComponentMap.get(condition.component)
      if (!componentDefinition) return null
      const observedEntity = UUIDComponent.useEntityByUUID(condition.entityUUID)
      const component = useComponent(observedEntity, componentDefinition).value
      const value = getNestedObject(component, condition.property).result
      return value
    } else {
      const stateDefinition = StateDefinitions.get(condition.state)
      if (!stateDefinition) return null
      return useMutableState(stateDefinition, condition.property).value
    }
  })

  useEffect(() => {
    // Check conditions
    for (const condition of conditions) {
      if ('entityUUID' in condition) {
        const componentDefinition = ComponentMap.get(condition.component)
        if (!componentDefinition) return
        const observedEntity = UUIDComponent.getEntityByUUID(condition.entityUUID)
        const component = getComponent(observedEntity, componentDefinition)
        const property = getNestedObject(component, condition.property).result
        const result = compare(property, condition)
        if (!result) return
      } else {
        const stateDefinition = StateDefinitions.get(condition.state)
        if (!stateDefinition) return
        const state = getState(stateDefinition)
        const property = getNestedObject(state, condition.property).result

        const result = compare(property, condition)
        if (!result) return
      }
    }

    // Execute callback
    const targetEntity = observer.target.value === '' ? entity : UUIDComponent.getEntityByUUID(observer.target.value)
    const callback = getCallback(targetEntity, observer.callback.value)
    if (!callback) return
    callback(entity, targetEntity)
  }, dependencies)

  return null
}

const compare = (
  a: number | boolean | string | Array<any>,
  condition: Static<typeof EntityConditionSchema> | Static<typeof StateConditionSchema>
) => {
  switch (condition.condition) {
    case 'largerThan':
      if (typeof a !== 'number') return false
      if (a >= condition.value) return true
      break
    case 'smallerThan':
      if (typeof a !== 'number') return false
      if (a <= condition.value) return true
      break
    case 'equal':
      if (a === condition.value) return true
      break
    case 'notEqual':
      if (a !== condition.value) return true
      break
    case 'contains':
      if (typeof a !== 'string' || Array.isArray(a) || typeof a.includes !== 'function') return false
      if (a.includes(condition.value)) return true
      break
    case 'notContains':
      if (typeof a !== 'string' || Array.isArray(a) || typeof a.includes !== 'function') return false
      if (!a.includes(condition.value)) return true
      break
  }
  return false
}
