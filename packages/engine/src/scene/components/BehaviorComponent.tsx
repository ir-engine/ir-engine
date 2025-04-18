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

import {
  ComponentJSONIDMap,
  ComponentMap,
  Easing,
  Entity,
  EntityUUID,
  S,
  Static,
  TransitionComponent,
  UUIDComponent,
  defineComponent,
  deserializeComponent,
  getComponent,
  matchesEntityUUID,
  removeComponent,
  removeEntity,
  useComponent,
  useEntityContext
} from '@ir-engine/ecs'
import {
  NO_PROXY,
  StateDefinitions,
  defineAction,
  defineState,
  dispatchAction,
  getMutableState,
  getNestedObject,
  getState,
  matches,
  useImmediateEffect,
  useMutableState
} from '@ir-engine/hyperflux'
import { NetworkTopics } from '@ir-engine/network'
import { getCallback, removeCallback, setCallback } from '@ir-engine/spatial/src/common/CallbackComponent'
import React, { useEffect } from 'react'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { NodeID, NodeIDComponent, NodeIDSchema } from '../../gltf/NodeIDComponent'
import { SourceComponent, SourceID } from './SourceComponent'

export const BehaviorActions = {
  called: defineAction({
    type: 'ir.engine.behavior.CALLED' as const,
    entityUUID: matchesEntityUUID,
    indices: matches.arrayOf(matches.number)
  })
}

type BehaviorCalled = {
  entityUUID: EntityUUID
  indices: number[]
}

export const BehaviorState = defineState({
  name: 'ir.engine.BehaviorState',
  initial: [] as Array<BehaviorCalled>,

  receptors: {
    onCalled: BehaviorActions.called.receive((action) => {
      const state = getMutableState(BehaviorState)
      state.merge([
        {
          entityUUID: action.entityUUID,
          indices: action.indices
        }
      ])
    })
  },
  reactor: () => {
    const calls = useMutableState(BehaviorState).get(NO_PROXY)
    return calls.map((item: BehaviorCalled, i) => <BehaviorCalledReactor key={i} item={item} />)
  }
})

const BehaviorCalledReactor = (props: { item: { entityUUID: EntityUUID; indices: number[] } }) => {
  const { item } = props

  useImmediateEffect(() => {
    const entity = UUIDComponent.getEntityByUUID(item.entityUUID)
    const sourceID = getComponent(entity, SourceComponent)
    for (const index of item.indices) {
      const behavior = getComponent(entity, BehaviorComponent).behaviors[index]
      if (!behavior) continue
      for (const effect of behavior.effects) {
        const targetSource = effect.sourceNodeID ? getSourceIDFromNodeID(sourceID, effect.sourceNodeID) : sourceID

        // setComponent
        if (effect.type === 'setComponent') {
          const componentDefinition = ComponentJSONIDMap.get(effect.jsonID)
          if (!componentDefinition) continue
          const targetEntity = UUIDComponent.getEntityByUUID(
            NodeIDComponent.getUUIDBySourceAndNodeID(targetSource, effect.nodeID)
          )
          deserializeComponent(targetEntity, componentDefinition, effect.values)
        }
        // removeComponent
        else if (effect.type === 'removeComponent') {
          const componentDefinition = ComponentJSONIDMap.get(effect.jsonID)
          if (!componentDefinition) continue
          const targetEntity = UUIDComponent.getEntityByUUID(
            NodeIDComponent.getUUIDBySourceAndNodeID(targetSource, effect.nodeID)
          )
          removeComponent(targetEntity, componentDefinition)
        }
        // createEntity
        else if (effect.type === 'createEntity') {
          const parentEntity = UUIDComponent.getEntityByUUID(
            NodeIDComponent.getUUIDBySourceAndNodeID(targetSource, effect.parentID)
          )
          const newEntity = NodeIDComponent.create(getComponent(parentEntity, SourceComponent), effect.nodeID)
          for (const [jsonID, values] of Object.entries(effect.components)) {
            const componentDefinition = ComponentJSONIDMap.get(jsonID)
            if (!componentDefinition) continue
            deserializeComponent(newEntity, componentDefinition, values)
          }
        }
        // removeEntity
        else if (effect.type === 'removeEntity') {
          const targetEntity = UUIDComponent.getEntityByUUID(
            NodeIDComponent.getUUIDBySourceAndNodeID(targetSource, effect.nodeID)
          )
          removeEntity(targetEntity)
        } else if (effect.type === 'transition') {
          const targetEntity = UUIDComponent.getEntityByUUID(
            NodeIDComponent.getUUIDBySourceAndNodeID(targetSource, effect.nodeID)
          )
          TransitionComponent.setTarget(targetEntity, {
            componentJsonID: effect.jsonID,
            propertyPath: effect.propertyPath,
            value: effect.value,
            duration: effect.duration,
            easing: Easing.fromPath(effect.easing)
          })
        }
        // callback
        else if (effect.type === 'callback') {
          const targetEntity = effect.nodeID
            ? UUIDComponent.getEntityByUUID(NodeIDComponent.getUUIDBySourceAndNodeID(targetSource, effect.nodeID))
            : entity
          const callback = getCallback(targetEntity, effect.callback)
          if (!callback) continue
          const parameters = effect.parameters.map((parameter) => {
            if (typeof parameter === 'string') {
              return parameter
            } else if (typeof parameter === 'number') {
              return parameter
            } else if (typeof parameter === 'boolean') {
              return parameter
            }
          })
          callback(...parameters)
        }
      }
    }
  }, [])

  return null
}

export const ConditionSchema = S.LiteralUnion([
  'largerThan',
  'smallerThan',
  'equal',
  'notEqual',
  'contains',
  'notContains'
])

export const EntityConditionSchema = S.Object({
  type: S.Literal('entity'),
  nodeID: NodeIDSchema(),
  sourceNodeID: S.Optional(NodeIDSchema()),
  component: S.String(),
  property: S.String(),
  value: S.Any(),
  condition: ConditionSchema
})

export const StateConditionSchema = S.Object({
  type: S.Literal('state'),
  state: S.String(),
  property: S.Any(),
  value: S.Any(),
  condition: ConditionSchema
})

export const CallbackConditionSchema = S.Object({
  type: S.Literal('callback'),
  callback: S.String(),
  nodeID: NodeIDSchema(),
  sourceNodeID: S.Optional(NodeIDSchema())
})

export const ConditionsSchema = S.Array(S.Union([EntityConditionSchema, StateConditionSchema, CallbackConditionSchema]))

export const PrimitiveSchema = S.Union([S.String(), S.Number(), S.Bool(), S.Null()])

export const ValueSchema = S.Union([PrimitiveSchema, S.Array(PrimitiveSchema), S.Any()])

// Component properties use period separated paths for nested properties, which is handled by deserializeComponent
export const ComponentSchema = S.Record(S.String(), ValueSchema)

export const SetComponentSchema = S.Object({
  type: S.Literal('setComponent'),
  nodeID: NodeIDSchema(),
  sourceNodeID: S.Optional(NodeIDSchema()),
  jsonID: S.String(),
  values: S.Any()
})

export const RemoveComponentSchema = S.Object({
  type: S.Literal('removeComponent'),
  nodeID: NodeIDSchema(),
  sourceNodeID: S.Optional(NodeIDSchema()),
  jsonID: S.String()
})

export const CreateEntitySchema = S.Object({
  type: S.Literal('createEntity'),
  nodeID: NodeIDSchema(),
  sourceNodeID: S.Optional(NodeIDSchema()),
  parentID: NodeIDSchema(),
  components: S.Record(S.String(), ComponentSchema)
})

export const RemoveEntitySchema = S.Object({
  type: S.Literal('removeEntity'),
  sourceNodeID: S.Optional(NodeIDSchema()),
  nodeID: NodeIDSchema()
})

export const TransitionSchema = S.Object({
  type: S.Literal('transition'),
  sourceNodeID: S.Optional(NodeIDSchema()),
  nodeID: NodeIDSchema(),
  jsonID: S.String(),
  propertyPath: S.String(),
  value: S.Any(),
  duration: S.Number(),
  easing: S.String()
})

export const CallbackSchema = S.Object({
  type: S.Literal('callback'),
  callback: S.String(),
  nodeID: NodeIDSchema(),
  sourceNodeID: S.Optional(NodeIDSchema()),
  parameters: S.Array(S.Any())
})

export const EffectSchema = S.Union([
  SetComponentSchema,
  RemoveComponentSchema,
  CreateEntitySchema,
  RemoveEntitySchema,
  TransitionSchema,
  CallbackSchema
])

export const BehaviorSchema = S.Object({
  conditions: ConditionsSchema,
  effects: S.Array(EffectSchema),
  networked: S.Bool(true)
})

const validCondition = (
  condition:
    | Static<typeof EntityConditionSchema>
    | Static<typeof StateConditionSchema>
    | Static<typeof CallbackConditionSchema>
) => {
  if (condition.type === 'entity') {
    return condition.nodeID !== '' && condition.component !== '' && condition.property !== ''
  } else if (condition.type === 'state') {
    return condition.state !== '' && condition.property !== ''
  } else if (condition.type === 'callback') {
    return condition.callback !== '' && condition.nodeID !== ''
  }
}

const validEffect = (
  effect:
    | Static<typeof SetComponentSchema>
    | Static<typeof RemoveComponentSchema>
    | Static<typeof CreateEntitySchema>
    | Static<typeof RemoveEntitySchema>
    | Static<typeof TransitionSchema>
    | Static<typeof CallbackSchema>
) => {
  if (effect.type === 'setComponent' || effect.type === 'removeComponent') {
    // SetComponentSchema | RemoveComponentSchema
    return effect.nodeID !== '' && effect.jsonID !== '' && ComponentJSONIDMap.has(effect.jsonID)
  } else if (effect.type === 'createEntity') {
    // CreateEntitySchema
    return effect.nodeID !== '' && effect.parentID !== ''
  } else if (effect.type === 'removeEntity') {
    // RemoveEntitySchema
    return effect.nodeID !== ''
  } else if (effect.type === 'transition') {
    // TransitionSchema
    return effect.nodeID !== '' && effect.jsonID !== '' && effect.propertyPath !== ''
  } else if (effect.type === 'callback') {
    // CallbackSchema
    return effect.callback !== '' && effect.parameters.length > 0
  }
}

const conditionsMet = (selfEntity: Entity, sourceID: SourceID, conditions: Static<typeof ConditionsSchema>) => {
  for (const condition of conditions) {
    if (condition.type === 'entity') {
      const componentDefinition = ComponentJSONIDMap.get(condition.component)
      if (!componentDefinition) return false
      const targetSource = condition.sourceNodeID ? getSourceIDFromNodeID(sourceID, condition.sourceNodeID) : sourceID
      const uuid = condition.nodeID
        ? NodeIDComponent.getUUIDBySourceAndNodeID(targetSource, condition.nodeID)
        : getComponent(selfEntity, UUIDComponent)
      const observedEntity = UUIDComponent.getEntityByUUID(uuid)
      const component = getComponent(observedEntity, componentDefinition)
      const property = getNestedObject(component, condition.property).result
      const result = compare(property, condition)
      if (!result) return false
    } else if (condition.type === 'state') {
      const stateDefinition = StateDefinitions.get(condition.state)
      if (!stateDefinition) return false
      const state = getState(stateDefinition)
      const property = getNestedObject(state, condition.property).result
      const result = compare(property, condition)
      if (!result) return false
    }
  }
  return true
}

const getSourceIDFromNodeID = (sourceID: SourceID, nodeID: NodeID) => {
  const uuid = NodeIDComponent.getUUIDBySourceAndNodeID(sourceID, nodeID)
  const entity = UUIDComponent.getEntityByUUID(uuid)
  return GLTFComponent.getInstanceID(entity)
}

const validBehavior = (behavior: Static<typeof BehaviorSchema>) =>
  behavior.conditions.length &&
  behavior.effects.length &&
  behavior.conditions.every(validCondition) &&
  behavior.effects.every(validEffect)

export const BehaviorComponent = defineComponent({
  name: 'BehaviorComponent',
  jsonID: 'IR_behavior',

  schema: S.Object({
    behaviors: S.Array(BehaviorSchema)
  }),

  reactor: () => {
    const entity = useEntityContext()
    const behaviors = useComponent(entity, BehaviorComponent).behaviors

    return (
      <>
        {behaviors.value.filter(validBehavior).map((behavior, index) => {
          return (
            <BehaviorReactor
              key={JSON.stringify(behaviors[index].get(NO_PROXY))}
              entity={entity}
              behaviorIndex={index}
            />
          )
        })}
      </>
    )
  }
})

const BehaviorReactor = (props: { entity: Entity; behaviorIndex: number }) => {
  const { entity, behaviorIndex } = props
  const behavior = useComponent(entity, BehaviorComponent).behaviors[behaviorIndex]
  const conditions = behavior.conditions.value

  const sourceID = getComponent(entity, SourceComponent)

  useEffect(() => {
    // add callbacks to the entity
    const callbacks = [] as { targetEntity: Entity; callback: string }[]
    for (const condition of conditions as any as Static<typeof CallbackConditionSchema>[]) {
      if (condition.type === 'callback') {
        const targetSource = condition.sourceNodeID ? getSourceIDFromNodeID(sourceID, condition.sourceNodeID) : sourceID
        const targetEntity = condition.nodeID
          ? UUIDComponent.getEntityByUUID(NodeIDComponent.getUUIDBySourceAndNodeID(targetSource, condition.nodeID))
          : entity

        setCallback(targetEntity, condition.callback, () => {
          console.log('callback', condition.callback)
          // Check conditions
          const success = conditionsMet(entity, sourceID, conditions as Static<typeof ConditionsSchema>)
          if (!success) return

          const networkParams = behavior.networked.value ? { $cached: true, $topic: NetworkTopics.world } : {}
          dispatchAction(
            BehaviorActions.called({
              entityUUID: getComponent(entity, UUIDComponent),
              indices: [behaviorIndex],
              ...networkParams
            })
          )
        })
      }
    }
    return () => {
      for (const callback of callbacks) {
        removeCallback(callback.targetEntity, callback.callback)
      }
    }
  }, [])

  //if any effects have a callback, we don't want to trigger it here
  if (conditions.some((condition) => condition.type === 'callback')) return null

  // Get dependencies
  const dependencies = conditions.map((condition) => {
    if (condition.type === 'entity') {
      const componentDefinition = ComponentMap.get(condition.component)
      if (!componentDefinition) return null
      // todo this might need to be made reactive
      const targetSource = condition.sourceNodeID ? getSourceIDFromNodeID(sourceID, condition.sourceNodeID) : sourceID
      const uuid = condition.nodeID
        ? NodeIDComponent.getUUIDBySourceAndNodeID(targetSource, condition.nodeID)
        : getComponent(entity, UUIDComponent)
      const observedEntity = UUIDComponent.useEntityByUUID(uuid)
      const component = useComponent(observedEntity, componentDefinition).value
      const value = getNestedObject(component, condition.property).result
      return value
    } else if (condition.type === 'state') {
      const stateDefinition = StateDefinitions.get(condition.state)
      if (!stateDefinition) return null
      return useMutableState(stateDefinition, condition.property).value
    }
  })

  useEffect(() => {
    const sourceID = getComponent(entity, SourceComponent)

    // Check conditions
    const success = conditionsMet(entity, sourceID, conditions as Static<typeof ConditionsSchema>)
    if (!success) return

    const networkParams = behavior.networked.value ? { $cached: true, $topic: NetworkTopics.world } : {}
    dispatchAction(
      BehaviorActions.called({
        entityUUID: getComponent(entity, UUIDComponent),
        indices: [behaviorIndex],
        ...networkParams
      })
    )
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
