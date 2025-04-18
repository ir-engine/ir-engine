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
  deserializeComponent,
  getAllComponents,
  getComponent,
  hasComponent,
  Layers,
  removeComponent,
  useComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMiniPuzzlePiece, HiMinus, HiPlus } from 'react-icons/hi2'

import {
  commitProperties,
  commitProperty,
  EditorComponentType,
  updateProperty
} from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'

import {
  Entity,
  flattenSchema,
  GenerateJSONSchema,
  JSONSchema,
  Static,
  useAncestorWithComponents,
  useChildrenWithComponents,
  UUIDComponent
} from '@ir-engine/ecs'
import { EditorHistoryFunctions } from '@ir-engine/editor/src/services/EditorHistoryState'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { NodeID, NodeIDComponent } from '@ir-engine/engine/src/gltf/NodeIDComponent'
import {
  BehaviorComponent,
  BehaviorSchema,
  CallbackConditionSchema,
  CallbackSchema,
  CreateEntitySchema,
  EffectSchema,
  EntityConditionSchema,
  RemoveComponentSchema,
  RemoveEntitySchema,
  SetComponentSchema,
  StateConditionSchema,
  TransitionSchema
} from '@ir-engine/engine/src/scene/components/BehaviorComponent'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { TriggerCallbackComponent } from '@ir-engine/engine/src/scene/components/TriggerCallbackComponent'
import { getState, NO_PROXY, none, StateDefinitions, useHookstate } from '@ir-engine/hyperflux'
import { CallbackComponent } from '@ir-engine/spatial/src/common/CallbackComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import Button from '../../../../primitives/tailwind/Button'
import Checkbox from '../../../../primitives/tailwind/Checkbox'
import { OptionType } from '../../../../primitives/tailwind/Select'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'
import SelectInput from '../../input/Select'
import StringInput from '../../input/String'

function isClass(obj) {
  const isCtorClass = obj.constructor && obj.constructor.toString().substring(0, 5) === 'class'
  if (obj.prototype === undefined) {
    return isCtorClass
  }
  const isPrototypeCtorClass =
    obj.prototype.constructor &&
    obj.prototype.constructor.toString &&
    obj.prototype.constructor.toString().substring(0, 5) === 'class'
  return isCtorClass || isPrototypeCtorClass
}
/**
 * Use this function to infer the preset based on the entity's behaviors.
 */
const inferPreset = (entity: Entity) => {
  if (hasComponent(entity, BehaviorComponent)) {
    const behaviors = getComponent(entity, BehaviorComponent).behaviors
    if (
      behaviors.length === 2 &&
      behaviors[0].conditions.length === 1 &&
      'type' in behaviors[0].conditions[0] &&
      behaviors[0].conditions[0].type === 'callback' &&
      behaviors[1].conditions.length === 1 &&
      'type' in behaviors[1].conditions[0] &&
      behaviors[1].conditions[0].type === 'callback'
    ) {
      return 'trigger'
    } else if (
      behaviors.length === 1 &&
      behaviors[0].conditions.length === 1 &&
      'type' in behaviors[0].conditions[0] &&
      behaviors[0].conditions[0].type === 'callback'
    ) {
      return 'callback'
    }
  }
  return 'none'
}

const presetOptions = [
  { label: 'Trigger', value: 'trigger' },
  { label: 'Callback', value: 'callback' },
  { label: 'None', value: 'none' }
]

const ConditionOptions = [
  { label: 'Larger Than', value: 'largerThan' },
  { label: 'Smaller Than', value: 'smallerThan' },
  { label: 'Equal', value: 'equal' },
  { label: 'Not Equal', value: 'notEqual' },
  { label: 'Contains', value: 'contains' },
  { label: 'Not Contains', value: 'notContains' }
]

// todo, add a dedicated easing input component
const EasingOptions = [
  { label: 'Linear', value: 'linear' },
  { label: 'Quadratic', value: 'quadratic' },
  { label: 'Cubic', value: 'cubic' },
  { label: 'Quartic', value: 'quartic' },
  { label: 'Quintic', value: 'quintic' },
  { label: 'Sinusoidal', value: 'sine' },
  { label: 'Exponential', value: 'exponential' },
  { label: 'Circular', value: 'circle' },
  { label: 'Elastic', value: 'elastic' },
  { label: 'Back', value: 'back' },
  { label: 'Bounce', value: 'bounce' }
]

const EasingModeOptions = [
  { label: 'In', value: 'in' },
  { label: 'Out', value: 'out' },
  { label: 'InOut', value: 'inOut' }
]

/**
 * BehaviorNodeEditor used to render editor view for property customization.
 */
export const BehaviorNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const selectedPreset = useHookstate<'trigger' | 'callback' | 'none'>(inferPreset(props.entity))

  const onChangePreset = useCallback((value: 'trigger' | 'callback' | 'none') => {
    selectedPreset.set(value)
    if (value === 'trigger') {
      deserializeComponent(props.entity, BehaviorComponent, {
        behaviors: [
          {
            conditions: [
              {
                type: 'callback',
                callback: 'onEnter',
                nodeID: '' as NodeID,
                sourceNodeID: '' as NodeID
              }
            ],
            effects: [],
            networked: true
          },
          {
            conditions: [
              {
                type: 'callback',
                callback: 'onExit',
                nodeID: '' as NodeID,
                sourceNodeID: '' as NodeID
              }
            ],
            effects: [],
            networked: true
          }
        ]
      })
      deserializeComponent(props.entity, TriggerCallbackComponent, {
        triggers: [
          {
            onEnter: 'onEnter',
            onExit: 'onExit',
            target: '' as NodeID // self
          }
        ]
      })
      EditorHistoryFunctions.snapshot()
      return
    } else if (value === 'callback') {
      deserializeComponent(props.entity, BehaviorComponent, {
        behaviors: [
          {
            conditions: [{ type: 'callback', callback: '', nodeID: '' as NodeID, sourceNodeID: '' as NodeID }],
            effects: [],
            networked: true
          }
        ]
      })
      removeComponent(props.entity, TriggerCallbackComponent)
      removeComponent(props.entity, ColliderComponent)
      removeComponent(props.entity, RigidBodyComponent)
      EditorHistoryFunctions.snapshot()
      return
    }
  }, [])

  const behavior = useComponent(props.entity, BehaviorComponent)

  const handleChangeBehavior = useCallback((value: string, index: number, addRemove?: 'add' | 'remove') => {
    const behaviors = behavior.behaviors
    if (addRemove === 'add') {
      behaviors.merge([
        {
          conditions: [],
          effects: [],
          networked: true
        }
      ])
    } else if (addRemove === 'remove') {
      behaviors[index].set(none)
    }
    commitProperties(
      BehaviorComponent,
      { behaviors: structuredClone(behaviors.get(NO_PROXY)) as Static<typeof BehaviorSchema>[] },
      [props.entity]
    )
  }, [])

  const assetContextEntity = useAncestorWithComponents(props.entity, [GLTFComponent])
  const assetContextSource = GLTFComponent.useInstanceID(assetContextEntity)
  const sameSourceEntities = useChildrenWithComponents(assetContextEntity, [GLTFComponent])

  const sourceNodeIDOptions: OptionType[] = sameSourceEntities.map((entity) => ({
    label: getComponent(entity, NameComponent),
    // secondaryText: getComponent(entity, GLTFComponent).src,
    value: getComponent(entity, NodeIDComponent)
  }))
  sourceNodeIDOptions.unshift({ label: 'Self', value: '' })

  const CallbackConditionInput = ({
    behaviorIndex,
    condition,
    index
  }: {
    behaviorIndex: number
    condition: Static<typeof CallbackConditionSchema>
    index: number
  }) => {
    const sourceNodeEntity = condition.sourceNodeID
      ? UUIDComponent.getEntityByUUID(
          NodeIDComponent.getUUIDBySourceAndNodeID(assetContextSource, condition.sourceNodeID),
          Layers.Authoring
        )
      : assetContextEntity
    const sourceID = GLTFComponent.useInstanceID(sourceNodeEntity)
    const nodeIDOptions = SourceComponent.useEntitiesBySource(sourceID).map((entity) => ({
      label: getComponent(entity, NameComponent),
      value: getComponent(entity, NodeIDComponent)
    }))

    const nodeID = condition.nodeID
    const nodeEntityUUID = NodeIDComponent.getUUIDBySourceAndNodeID(sourceID, nodeID)
    const nodeEntity = UUIDComponent.useEntityByUUID(nodeEntityUUID, Layers.Authoring)
    const callbackOptions =
      nodeEntity && hasComponent(nodeEntity, CallbackComponent)
        ? [...getComponent(nodeEntity, CallbackComponent).keys()].map((callback) => ({
            label: callback,
            value: callback
          }))
        : []

    return (
      <>
        <InputGroup
          name="Callback"
          label={t('editor:properties.behavior.lbl-callback')}
          info={t('editor:properties.behavior.lbl-callback-info')}
        >
          <SelectInput
            value={condition.sourceNodeID}
            onChange={commitProperty(
              BehaviorComponent,
              `behaviors.${behaviorIndex}.conditions.${index}.sourceNodeID` as any
            )}
            options={sourceNodeIDOptions}
          />
          <SelectInput
            value={condition.nodeID}
            onChange={commitProperty(BehaviorComponent, `behaviors.${behaviorIndex}.conditions.${index}.nodeID` as any)}
            options={nodeIDOptions}
          />
          <SelectInput
            value={condition.callback}
            onChange={commitProperty(
              BehaviorComponent,
              `behaviors.${behaviorIndex}.conditions.${index}.callback` as any
            )}
            options={callbackOptions}
          />
        </InputGroup>
      </>
    )
  }

  const EntityConditionInput = ({
    behaviorIndex,
    condition,
    index
  }: {
    behaviorIndex: number
    condition: Static<typeof EntityConditionSchema>
    index: number
  }) => {
    const sourceNodeEntity = condition.sourceNodeID
      ? UUIDComponent.getEntityByUUID(
          NodeIDComponent.getUUIDBySourceAndNodeID(assetContextSource, condition.sourceNodeID),
          Layers.Authoring
        )
      : assetContextEntity
    const sourceID = GLTFComponent.useInstanceID(sourceNodeEntity)
    const nodeIDOptions = SourceComponent.useEntitiesBySource(sourceID).map((entity) => ({
      label: getComponent(entity, NameComponent),
      value: getComponent(entity, NodeIDComponent)
    }))

    const selectedEntityUUID = NodeIDComponent.getUUIDBySourceAndNodeID(sourceID, condition.nodeID)
    const selectedEntity = UUIDComponent.useEntityByUUID(selectedEntityUUID, Layers.Authoring)

    const componentOptions = getAllComponents(selectedEntity)
      .filter((c) => !!c.jsonID)
      .map((component) => ({
        label: component.name,
        value: component.jsonID!
      }))

    const selectedComponent = ComponentJSONIDMap.get(condition.component)

    // just one level deep for now
    // @todo support nested properties
    const componentProperties = selectedComponent ? Object.keys(getComponent(selectedEntity, selectedComponent)) : []
    const propertyOptions = componentProperties.map((property) => ({
      label: property,
      value: property
    }))

    /**
     * @todo use the component schema to drive the acceptable values
     * - for now, just support strings
     */

    return (
      <InputGroup
        name="Entity"
        label={t('editor:properties.behavior.lbl-entity')}
        info={t('editor:properties.behavior.lbl-entity-info')}
      >
        <SelectInput
          labelProps={{ text: 'Source Node', position: 'left' }}
          value={condition.sourceNodeID}
          onChange={commitProperty(
            BehaviorComponent,
            `behaviors.${behaviorIndex}.conditions.${index}.sourceNodeID` as any
          )}
          options={sourceNodeIDOptions}
        />
        <SelectInput
          labelProps={{ text: 'Node', position: 'left' }}
          value={condition.nodeID}
          onChange={commitProperty(BehaviorComponent, `behaviors.${behaviorIndex}.conditions.${index}.nodeID` as any)}
          options={nodeIDOptions}
        />
        <SelectInput
          labelProps={{ text: 'Component', position: 'left' }}
          value={condition.component}
          onChange={commitProperty(
            BehaviorComponent,
            `behaviors.${behaviorIndex}.conditions.${index}.component` as any
          )}
          options={componentOptions}
        />
        <SelectInput
          labelProps={{ text: 'Property', position: 'left' }}
          value={condition.property}
          onChange={commitProperty(BehaviorComponent, `behaviors.${behaviorIndex}.conditions.${index}.property` as any)}
          options={propertyOptions}
        />
        <StringInput
          labelProps={{ text: 'Assertion Value', position: 'left' }}
          value={condition.value}
          onChange={commitProperty(BehaviorComponent, `behaviors.${behaviorIndex}.conditions.${index}.value` as any)}
        />
        <SelectInput
          labelProps={{ text: 'Condition', position: 'left' }}
          value={condition.condition}
          onChange={commitProperty(
            BehaviorComponent,
            `behaviors.${behaviorIndex}.conditions.${index}.condition` as any
          )}
          options={ConditionOptions}
        />
      </InputGroup>
    )
  }

  const StateConditionInput = ({
    behaviorIndex,
    condition,
    index
  }: {
    behaviorIndex: number
    condition: Static<typeof StateConditionSchema>
    index: number
  }) => {
    // ignore all event sourced states
    const stateList = Object.fromEntries([...StateDefinitions.entries()].filter(([key, val]) => !val.receptors))

    const stateOptions = Object.keys(stateList)
      .map((state) => ({
        label: state.includes('.') ? state.split('.').pop()! : state,
        value: state
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
    const selectedState = condition.state ? getState(stateList[condition.state]) : undefined
    const propertyOptions = selectedState
      ? Object.keys(selectedState).map((property) => ({
          label: property,
          value: property
        }))
      : []

    return (
      <InputGroup
        name="State"
        label={t('editor:properties.behavior.lbl-state')}
        info={t('editor:properties.behavior.lbl-state-info')}
      >
        <SelectInput
          labelProps={{ text: 'State', position: 'left' }}
          value={condition.state}
          onChange={commitProperty(BehaviorComponent, `behaviors.${behaviorIndex}.conditions.${index}.state` as any)}
          options={stateOptions}
        />
        <SelectInput
          labelProps={{ text: 'Property', position: 'left' }}
          value={condition.property}
          onChange={commitProperty(BehaviorComponent, `behaviors.${behaviorIndex}.conditions.${index}.property` as any)}
          options={propertyOptions}
        />
        <StringInput
          labelProps={{ text: 'Assertion Value', position: 'left' }}
          value={condition.value}
          onChange={commitProperty(BehaviorComponent, `behaviors.${behaviorIndex}.conditions.${index}.value` as any)}
        />
        <SelectInput
          labelProps={{ text: 'Condition', position: 'left' }}
          value={condition.condition}
          onChange={commitProperty(
            BehaviorComponent,
            `behaviors.${behaviorIndex}.conditions.${index}.condition` as any
          )}
          options={ConditionOptions}
        />
      </InputGroup>
    )
  }

  const ConditionInput = ({
    index,
    condition,
    behaviorIndex
  }: {
    index: number
    condition: Static<typeof CallbackConditionSchema | typeof EntityConditionSchema | typeof StateConditionSchema>
    behaviorIndex: number
  }) => {
    return (
      <>
        <SelectInput
          value={condition.type}
          onChange={(val) =>
            commitProperties(BehaviorComponent, {
              [`behaviors.${behaviorIndex}.conditions.${index}` as any]:
                val === 'callback'
                  ? {
                      type: 'callback',
                      callback: '',
                      nodeID: '',
                      sourceNodeID: ''
                    }
                  : val === 'entity'
                  ? {
                      type: 'entity',
                      sourceNodeID: '',
                      nodeID: '',
                      component: '',
                      property: '',
                      value: '',
                      condition: 'equal'
                    }
                  : {
                      type: 'state',
                      state: '',
                      property: '',
                      value: '',
                      condition: 'equal'
                    }
            })
          }
          options={[
            { label: 'Callback', value: 'callback' },
            { label: 'State', value: 'state' },
            { label: 'Entity', value: 'entity' }
          ]}
        />
        {condition.type === 'callback' ? (
          <CallbackConditionInput behaviorIndex={behaviorIndex} index={index} condition={condition} />
        ) : condition.type === 'entity' ? (
          <EntityConditionInput behaviorIndex={behaviorIndex} index={index} condition={condition} />
        ) : (
          <StateConditionInput behaviorIndex={behaviorIndex} index={index} condition={condition} />
        )}
        <Button onClick={() => handleChangeCondition(behaviorIndex, index, 'remove')}>Remove Condition</Button>
      </>
    )
  }

  const getSchemaFromPath = (schema: JSONSchema, path: string) => {
    const pathParts = path.split('.')
    let currentSchema = schema
    for (const part of pathParts) {
      if (currentSchema && currentSchema.properties) {
        currentSchema = currentSchema.properties[part]
      }
    }
    return currentSchema
  }

  /**
   * schema: JSONSchema
   * values: data represented by the schema
   * path: period separated path to the data
   */
  const ObjectEditor = (props: { schema: JSONSchema; values: any; path: string; pathContext: string }) => {
    const { schema, values, path, pathContext } = props
    const newValueOptions = Object.keys(flattenSchema(schema)).map((key) => ({
      label: key,
      value: key
    }))
    newValueOptions.unshift({ label: 'Select Property', value: '' })
    const newValue = useHookstate('')
    if (typeof values !== 'object' || schema.type === 'array') return <></> // todo: handle arrays
    return (
      <>
        {Object.keys(values)
          .filter((key) => values[key] && !isClass(values[key]))
          .map((key: any, index: number) => {
            const currentPath = path ? `${pathContext}.${path}.${key}` : (`${pathContext}.${key}` as any)
            const subSchema = getSchemaFromPath(schema, key)
            const schemaType = subSchema?.type
            let Editor = <></>
            if (schemaType === 'object') {
              Editor = (
                <ObjectEditor schema={subSchema} values={values[key]} path={currentPath} pathContext={pathContext} />
              )
            } else if (schemaType === 'boolean') {
              Editor = (
                <Checkbox
                  key={index}
                  variantTextPlacement={'right'}
                  checked={values[key]}
                  onChange={commitProperty(BehaviorComponent, currentPath)}
                />
              )
            } else if (schemaType === 'string') {
              Editor = (
                <StringInput
                  key={index}
                  labelProps={{ text: index.toString(), position: 'left' }}
                  value={values[key]}
                  onRelease={commitProperty(BehaviorComponent, currentPath)}
                />
              )
            } else if (schemaType === 'number') {
              Editor = (
                <NumericInput
                  key={index}
                  value={values[key]}
                  onChange={updateProperty(BehaviorComponent, currentPath)}
                  onRelease={commitProperty(BehaviorComponent, currentPath)}
                />
              )
            }
            return (
              <InputGroup key={key} name={key.toString()} label={key.toString()}>
                {Editor}
                <button
                  className="h-8 w-9 cursor-pointer rounded-md bg-surface-2 text-text-primary-button"
                  onClick={() => {
                    const newValues = { ...values }
                    delete newValues[key]
                    commitProperties(BehaviorComponent, { [path ? `${pathContext}.${path}` : pathContext]: newValues })
                  }}
                >
                  <HiMinus className="m-auto" />
                </button>
              </InputGroup>
            )
          })}
        {/* dropdown for new text value key */}
        <SelectInput
          labelProps={{ text: 'New Property', position: 'left' }}
          value={newValue.value}
          onChange={(val: string) => {
            newValue.set(val)
          }}
          options={newValueOptions}
        />
        {newValue.value && (
          <button
            className="h-8 w-9 cursor-pointer rounded-md bg-surface-2 text-text-primary-button"
            onClick={commitProperty(
              BehaviorComponent,
              path ? `${pathContext}.${path}.${newValue.value}` : (`${pathContext}.${newValue.value}` as any)
            )}
          >
            <HiPlus className="m-auto" />
          </button>
        )}
      </>
    )
  }

  const handleChangeCondition = useCallback(
    (behaviorIndex: number, index: number, addRemove?: 'add' | 'remove') => {
      const behaviors = behavior.behaviors
      if (addRemove === 'add') {
        behaviors[behaviorIndex].conditions.merge([
          {
            type: 'callback',
            callback: '',
            nodeID: '' as NodeID,
            sourceNodeID: '' as NodeID
          }
        ])
      } else if (addRemove === 'remove') {
        behaviors[behaviorIndex].conditions[index].set(none)
      }
      commitProperties(
        BehaviorComponent,
        { behaviors: structuredClone(behaviors.get(NO_PROXY)) as Static<typeof BehaviorSchema>[] },
        [props.entity]
      )
    },
    [behavior]
  )
  const handleChangeEffect = useCallback(
    (behaviorIndex: number, index: number, addRemove?: 'add' | 'remove') => {
      const behaviors = behavior.behaviors
      if (addRemove === 'add') {
        behaviors[behaviorIndex].effects.merge([
          {
            type: 'setComponent',
            nodeID: '' as NodeID,
            jsonID: '',
            values: {}
          }
        ])
      } else if (addRemove === 'remove') {
        behaviors[behaviorIndex].effects[index].set(none)
      }
      commitProperties(
        BehaviorComponent,
        { behaviors: structuredClone(behaviors.get(NO_PROXY)) as Static<typeof BehaviorSchema>[] },
        [props.entity]
      )
    },
    [behavior]
  )

  const SetComponentInput = ({
    index,
    effect,
    behaviorIndex
  }: {
    index: number
    effect: Static<typeof SetComponentSchema>
    behaviorIndex: number
  }) => {
    const sourceNodeEntity = effect.sourceNodeID
      ? UUIDComponent.getEntityByUUID(
          NodeIDComponent.getUUIDBySourceAndNodeID(assetContextSource, effect.sourceNodeID),
          Layers.Authoring
        )
      : assetContextEntity
    const sourceID = GLTFComponent.useInstanceID(sourceNodeEntity)
    const nodeIDOptions = SourceComponent.useEntitiesBySource(sourceID).map((entity) => ({
      label: getComponent(entity, NameComponent),
      value: getComponent(entity, NodeIDComponent)
    }))

    const selectedEntityUUID = NodeIDComponent.getUUIDBySourceAndNodeID(sourceID, effect.nodeID)
    const selectedEntity = UUIDComponent.useEntityByUUID(selectedEntityUUID, Layers.Authoring)

    const componentOptions = getAllComponents(selectedEntity)
      .filter((c) => !!c.jsonID)
      .map((component) => ({
        label: component.name,
        value: component.jsonID!
      }))
    const selectedComponent = componentOptions.find((option) => option.value === effect.jsonID)

    const selectedComponentDef = selectedComponent?.value ? ComponentJSONIDMap.get(selectedComponent.value) : undefined

    // serialiableProperties is a JSONSchema document
    const serialiableProperties =
      selectedComponentDef && selectedComponentDef.schema ? GenerateJSONSchema(selectedComponentDef.schema) : undefined

    return (
      <InputGroup
        name="Set Component"
        label={t('editor:properties.behavior.lbl-setComponent')}
        info={t('editor:properties.behavior.lbl-setComponent-info')}
      >
        <SelectInput
          labelProps={{ text: 'Source Node', position: 'left' }}
          value={effect.sourceNodeID}
          onChange={commitProperty(
            BehaviorComponent,
            `behaviors.${behaviorIndex}.effects.${index}.sourceNodeID` as any
          )}
          options={sourceNodeIDOptions}
        />
        <SelectInput
          labelProps={{ text: 'Node', position: 'left' }}
          value={effect.nodeID}
          onChange={commitProperty(BehaviorComponent, `behaviors.${behaviorIndex}.effects.${index}.nodeID` as any)}
          options={nodeIDOptions}
        />
        <SelectInput
          labelProps={{ text: 'Component', position: 'left' }}
          value={effect.jsonID}
          onChange={commitProperty(BehaviorComponent, `behaviors.${behaviorIndex}.effects.${index}.jsonID` as any)}
          options={componentOptions}
        />
        {serialiableProperties && serialiableProperties.type === 'object' && (
          <ObjectEditor
            key={index}
            schema={serialiableProperties}
            pathContext={`behaviors.${behaviorIndex}.effects.${index}.values`}
            path={''}
            values={effect.values}
          />
        )}
      </InputGroup>
    )
  }

  const RemoveComponentInput = ({
    index,
    effect,
    behaviorIndex
  }: {
    index: number
    effect: Static<typeof RemoveComponentSchema>
    behaviorIndex: number
  }) => {
    const sourceNodeEntity = effect.sourceNodeID
      ? UUIDComponent.getEntityByUUID(
          NodeIDComponent.getUUIDBySourceAndNodeID(assetContextSource, effect.sourceNodeID),
          Layers.Authoring
        )
      : assetContextEntity
    const sourceID = GLTFComponent.useInstanceID(sourceNodeEntity)
    const nodeIDOptions = SourceComponent.useEntitiesBySource(sourceID).map((entity) => ({
      label: getComponent(entity, NameComponent),
      value: getComponent(entity, NodeIDComponent)
    }))
    const selectedEntityUUID = NodeIDComponent.getUUIDBySourceAndNodeID(sourceID, effect.nodeID)
    const selectedEntity = UUIDComponent.useEntityByUUID(selectedEntityUUID, Layers.Authoring)
    const componentOptions = getAllComponents(selectedEntity)
      .filter((c) => !!c.jsonID)
      .map((component) => ({
        label: component.name,
        value: component.jsonID!
      }))
    return (
      <InputGroup
        name="Remove Component"
        label={t('editor:properties.behavior.lbl-removeComponent')}
        info={t('editor:properties.behavior.lbl-removeComponent-info')}
      >
        <SelectInput
          labelProps={{ text: 'Source Node', position: 'left' }}
          value={effect.sourceNodeID}
          onChange={commitProperty(
            BehaviorComponent,
            `behaviors.${behaviorIndex}.effects.${index}.sourceNodeID` as any
          )}
          options={sourceNodeIDOptions}
        />
        <SelectInput
          labelProps={{ text: 'Node', position: 'left' }}
          value={effect.nodeID}
          onChange={commitProperty(BehaviorComponent, `behaviors.${behaviorIndex}.effects.${index}.nodeID` as any)}
          options={nodeIDOptions}
        />
        <SelectInput
          labelProps={{ text: 'Component', position: 'left' }}
          value={effect.jsonID}
          onChange={commitProperty(BehaviorComponent, `behaviors.${behaviorIndex}.effects.${index}.jsonID` as any)}
          options={componentOptions}
        />
      </InputGroup>
    )
  }

  /**
   *
   * CreateEntityInput:
   *    type: S.Literal('createEntity'),
   *    nodeID: NodeIDSchema(),
   *    sourceNodeID: S.Optional(NodeIDSchema()),
   *    parentID: NodeIDSchema(),
   *    components: S.Array(ComponentSchema)
   * @param param0
   * @returns
   */
  const CreateEntityInput = ({
    index,
    effect,
    behaviorIndex
  }: {
    index: number
    effect: Static<typeof CreateEntitySchema>
    behaviorIndex: number
  }) => {
    const sourceNodeEntity = effect.sourceNodeID
      ? UUIDComponent.getEntityByUUID(
          NodeIDComponent.getUUIDBySourceAndNodeID(assetContextSource, effect.sourceNodeID),
          Layers.Authoring
        )
      : assetContextEntity
    const sourceID = GLTFComponent.useInstanceID(sourceNodeEntity)
    const nodeIDOptions = SourceComponent.useEntitiesBySource(sourceID).map((entity) => ({
      label: getComponent(entity, NameComponent),
      value: getComponent(entity, NodeIDComponent)
    }))

    const componentOptions = [...ComponentJSONIDMap.entries()].map(([jsonID, Component]) => ({
      label: Component.name,
      value: jsonID
    }))

    const handleAddComponent = useCallback(
      (jsonID: string) => {
        commitProperties(
          BehaviorComponent,
          {
            [`behaviors.${behaviorIndex}.effects.${index}.components.${jsonID}` as any]: {}
          },
          [props.entity]
        )
      },
      [effect.components]
    )

    const handleRemoveComponent = useCallback(
      (jsonID: string) => {
        const componentsClone = structuredClone(effect.components)
        delete componentsClone[jsonID]
        commitProperties(
          BehaviorComponent,
          {
            [`behaviors.${behaviorIndex}.effects.${index}.components` as any]: componentsClone
          },
          [props.entity]
        )
      },
      [effect.components]
    )

    const selectedComponent = useHookstate('')

    return (
      <InputGroup
        name="Create Entity"
        label={t('editor:properties.behavior.lbl-createEntity')}
        info={t('editor:properties.behavior.lbl-createEntity-info')}
      >
        <SelectInput
          labelProps={{ text: 'Source Node', position: 'left' }}
          value={effect.sourceNodeID}
          onChange={commitProperty(
            BehaviorComponent,
            `behaviors.${behaviorIndex}.effects.${index}.sourceNodeID` as any
          )}
          options={sourceNodeIDOptions}
        />
        <StringInput
          labelProps={{ text: 'Node ID', position: 'left' }}
          value={effect.nodeID}
          onChange={commitProperty(BehaviorComponent, `behaviors.${behaviorIndex}.effects.${index}.nodeID` as any)}
        />
        <SelectInput
          labelProps={{ text: 'Parent', position: 'left' }}
          value={effect.parentID}
          onChange={commitProperty(BehaviorComponent, `behaviors.${behaviorIndex}.effects.${index}.parentID` as any)}
          options={nodeIDOptions}
        />
        {Object.entries(effect.components).map(([jsonID, values]) => (
          <InputGroup
            key={jsonID}
            name="Component"
            label={t('editor:properties.behavior.lbl-components') + (jsonID as string)}
            info={t('editor:properties.behavior.lbl-components-info')}
          >
            <ObjectEditor
              key={index}
              schema={GenerateJSONSchema(ComponentJSONIDMap.get(jsonID)!.schema)!}
              pathContext={`behaviors.${behaviorIndex}.effects.${index}.components.${index}`}
              path={''}
              values={values}
            />
            <button
              className="h-8 w-9 cursor-pointer rounded-md bg-surface-2 text-text-primary-button"
              onClick={() => handleRemoveComponent(jsonID)}
            >
              <HiMinus className="m-auto" />
            </button>
          </InputGroup>
        ))}
        <SelectInput
          labelProps={{ text: 'Add Component', position: 'left' }}
          value={selectedComponent.value}
          onChange={(val: string) => {
            selectedComponent.set(val)
          }}
          options={componentOptions}
        />
        {selectedComponent.value && (
          <button
            className="h-8 w-9 cursor-pointer rounded-md bg-surface-2 text-text-primary-button"
            onClick={() => {
              handleAddComponent(selectedComponent.value)
              selectedComponent.set('')
            }}
          >
            <HiPlus className="m-auto" />
          </button>
        )}
      </InputGroup>
    )
  }

  const RemoveEntityInput = ({
    index,
    effect,
    behaviorIndex
  }: {
    index: number
    effect: Static<typeof RemoveEntitySchema>
    behaviorIndex: number
  }) => {
    return (
      <InputGroup
        name="Remove Entity"
        label={t('editor:properties.behavior.lbl-removeEntity')}
        info={t('editor:properties.behavior.lbl-removeEntity-info')}
      >
        <SelectInput
          labelProps={{ text: 'Source Node', position: 'left' }}
          value={effect.sourceNodeID}
          onChange={commitProperty(
            BehaviorComponent,
            `behaviors.${behaviorIndex}.effects.${index}.sourceNodeID` as any
          )}
          options={sourceNodeIDOptions}
        />
        <StringInput
          labelProps={{ text: 'Node ID', position: 'left' }}
          value={effect.nodeID}
          onChange={commitProperty(BehaviorComponent, `behaviors.${behaviorIndex}.effects.${index}.nodeID` as any)}
        />
      </InputGroup>
    )
  }

  const CallbackInput = ({
    index,
    effect,
    behaviorIndex
  }: {
    index: number
    effect: Static<typeof CallbackSchema>
    behaviorIndex: number
  }) => {
    const sourceNodeEntity = effect.sourceNodeID
      ? UUIDComponent.getEntityByUUID(
          NodeIDComponent.getUUIDBySourceAndNodeID(assetContextSource, effect.sourceNodeID),
          Layers.Authoring
        )
      : assetContextEntity
    const sourceID = GLTFComponent.useInstanceID(sourceNodeEntity)
    const nodeIDOptions = SourceComponent.useEntitiesBySource(sourceID).map((entity) => ({
      label: getComponent(entity, NameComponent),
      value: getComponent(entity, NodeIDComponent)
    }))

    const nodeID = effect.nodeID
    const nodeEntityUUID = NodeIDComponent.getUUIDBySourceAndNodeID(sourceID, nodeID)
    const nodeEntity = UUIDComponent.useEntityByUUID(nodeEntityUUID, Layers.Authoring)
    const callbackOptions =
      nodeEntity && hasComponent(nodeEntity, CallbackComponent)
        ? [...getComponent(nodeEntity, CallbackComponent).keys()].map((callback) => ({
            label: callback,
            value: callback
          }))
        : []

    // State to manage parameters
    const handleAddParameter = useCallback(() => {
      const parameters = [...effect.parameters, '']
      commitProperties(BehaviorComponent, {
        [`behaviors.${behaviorIndex}.effects.${index}.parameters`]: parameters
      })
    }, [effect.parameters])

    const handleRemoveParameter = useCallback(
      (paramIndex: number) => {
        const parameters = [...effect.parameters]
        parameters.splice(paramIndex, 1)
        commitProperties(BehaviorComponent, {
          [`behaviors.${behaviorIndex}.effects.${index}.parameters`]: parameters
        })
      },
      [effect.parameters]
    )

    const handleChangeParameter = useCallback(
      (value: string, paramIndex: number) => {
        const parameters = [...effect.parameters]
        parameters[paramIndex] = value
        commitProperties(BehaviorComponent, {
          [`behaviors.${behaviorIndex}.effects.${index}.parameters`]: parameters
        })
      },
      [effect.parameters]
    )

    return (
      <InputGroup
        name="Callback"
        label={t('editor:properties.behavior.lbl-callback')}
        info={t('editor:properties.behavior.lbl-callback-info')}
      >
        <SelectInput
          labelProps={{ text: 'Source Node', position: 'left' }}
          value={effect.sourceNodeID}
          onChange={commitProperty(
            BehaviorComponent,
            `behaviors.${behaviorIndex}.effects.${index}.sourceNodeID` as any
          )}
          options={sourceNodeIDOptions}
        />
        <SelectInput
          labelProps={{ text: 'Node', position: 'left' }}
          value={effect.nodeID}
          onChange={commitProperty(BehaviorComponent, `behaviors.${behaviorIndex}.effects.${index}.nodeID` as any)}
          options={nodeIDOptions}
        />
        <SelectInput
          labelProps={{ text: 'Callback', position: 'left' }}
          value={effect.callback}
          onChange={commitProperty(BehaviorComponent, `behaviors.${behaviorIndex}.effects.${index}.callback` as any)}
          options={callbackOptions}
        />
        <div className="mt-2">
          <h4 className="mb-2 text-sm font-medium">Parameters</h4>
          {effect.parameters.map((param, paramIndex) => (
            <div key={paramIndex} className="mb-2 flex items-center gap-2">
              <StringInput value={param as string} onChange={(value) => handleChangeParameter(value, paramIndex)} />
              <button
                className="h-8 w-9 cursor-pointer rounded-md bg-surface-2 text-text-primary-button"
                onClick={() => handleRemoveParameter(paramIndex)}
              >
                <HiMinus className="m-auto" />
              </button>
            </div>
          ))}
          <button
            className="h-8 w-9 cursor-pointer rounded-md bg-surface-2 text-text-primary-button"
            onClick={handleAddParameter}
          >
            <HiPlus className="m-auto" />
          </button>
        </div>
      </InputGroup>
    )
  }

  const TransitionInput = ({
    index,
    effect,
    behaviorIndex
  }: {
    index: number
    effect: Static<typeof TransitionSchema>
    behaviorIndex: number
  }) => {
    const sourceNodeEntity = effect.sourceNodeID
      ? UUIDComponent.getEntityByUUID(
          NodeIDComponent.getUUIDBySourceAndNodeID(assetContextSource, effect.sourceNodeID),
          Layers.Authoring
        )
      : assetContextEntity
    const sourceID = GLTFComponent.useInstanceID(sourceNodeEntity)
    const nodeIDOptions = SourceComponent.useEntitiesBySource(sourceID).map((entity) => ({
      label: getComponent(entity, NameComponent),
      value: getComponent(entity, NodeIDComponent)
    }))

    const componentOptions = [...ComponentJSONIDMap.entries()].map(([jsonID, Component]) => ({
      label: Component.name,
      value: jsonID
    }))

    const [easingType, easingMode] = effect.easing.split('.')

    const onChangeEasing = (type: string, mode: string) => {
      commitProperties(BehaviorComponent, {
        [`behaviors.${behaviorIndex}.effects.${index}.easing` as any]: `${type}.${mode}`
      })
    }

    return (
      <InputGroup
        name="Transition"
        label={t('editor:properties.behavior.lbl-transition')}
        info={t('editor:properties.behavior.lbl-transition-info')}
      >
        <SelectInput
          labelProps={{ text: 'Source Node', position: 'left' }}
          value={effect.sourceNodeID}
          onChange={commitProperty(
            BehaviorComponent,
            `behaviors.${behaviorIndex}.effects.${index}.sourceNodeID` as any
          )}
          options={sourceNodeIDOptions}
        />
        <SelectInput
          labelProps={{ text: 'Node', position: 'left' }}
          value={effect.nodeID}
          onChange={commitProperty(BehaviorComponent, `behaviors.${behaviorIndex}.effects.${index}.nodeID` as any)}
          options={nodeIDOptions}
        />
        <SelectInput
          labelProps={{ text: 'Component', position: 'left' }}
          value={effect.jsonID}
          onChange={commitProperty(BehaviorComponent, `behaviors.${behaviorIndex}.effects.${index}.jsonID` as any)}
          options={componentOptions}
        />
        <StringInput
          labelProps={{ text: 'Property Path', position: 'left' }}
          value={effect.propertyPath}
          onChange={commitProperty(
            BehaviorComponent,
            `behaviors.${behaviorIndex}.effects.${index}.propertyPath` as any
          )}
        />
        <StringInput
          labelProps={{ text: 'Value', position: 'left' }}
          value={effect.value}
          onChange={commitProperty(BehaviorComponent, `behaviors.${behaviorIndex}.effects.${index}.value` as any)}
        />
        <NumericInput
          value={effect.duration}
          onChange={updateProperty(BehaviorComponent, `behaviors.${behaviorIndex}.effects.${index}.duration` as any)}
          onRelease={commitProperty(BehaviorComponent, `behaviors.${behaviorIndex}.effects.${index}.duration` as any)}
        />
        <SelectInput
          labelProps={{ text: 'Easing', position: 'left' }}
          value={effect.easing.split('.')[0]}
          onChange={(val: string) => {
            onChangeEasing(val, easingMode)
          }}
          options={EasingOptions}
        />
        <SelectInput
          labelProps={{ text: 'Easing Mode', position: 'left' }}
          value={effect.easing.split('.')[1]}
          onChange={(val: string) => {
            onChangeEasing(easingType, val)
          }}
          options={EasingModeOptions}
        />
      </InputGroup>
    )
  }

  const EffectInput = ({
    index,
    effect,
    behaviorIndex
  }: {
    index: number
    effect: Static<typeof EffectSchema>
    behaviorIndex: number
  }) => {
    const effectOptions = [
      { label: 'Callback', value: 'callback' },
      { label: 'Set Component', value: 'setComponent' },
      { label: 'Remove Component', value: 'removeComponent' },
      { label: 'Create Entity', value: 'createEntity' },
      { label: 'Remove Entity', value: 'removeEntity' },
      { label: 'Transition', value: 'transition' }
    ]

    let Editor = <></>
    if (effect.type === 'setComponent') {
      Editor = (
        <SetComponentInput
          index={index}
          behaviorIndex={behaviorIndex}
          effect={effect as Static<typeof SetComponentSchema>}
        />
      )
    } else if (effect.type === 'removeComponent') {
      Editor = (
        <RemoveComponentInput
          index={index}
          behaviorIndex={behaviorIndex}
          effect={effect as Static<typeof RemoveComponentSchema>}
        />
      )
    } else if (effect.type === 'callback') {
      Editor = (
        <CallbackInput index={index} behaviorIndex={behaviorIndex} effect={effect as Static<typeof CallbackSchema>} />
      )
    } else if (effect.type === 'createEntity') {
      Editor = (
        <CreateEntityInput
          index={index}
          behaviorIndex={behaviorIndex}
          effect={effect as Static<typeof CreateEntitySchema>}
        />
      )
    } else if (effect.type === 'removeEntity') {
      Editor = (
        <RemoveEntityInput
          index={index}
          behaviorIndex={behaviorIndex}
          effect={effect as Static<typeof RemoveEntitySchema>}
        />
      )
    } else if (effect.type === 'transition') {
      Editor = (
        <TransitionInput
          index={index}
          behaviorIndex={behaviorIndex}
          effect={effect as Static<typeof TransitionSchema>}
        />
      )
    }

    return (
      <InputGroup
        name="Effect"
        label={t('editor:properties.behavior.lbl-effects')}
        info={t('editor:properties.behavior.lbl-effects-info')}
      >
        <SelectInput
          labelProps={{ text: 'Effect', position: 'left' }}
          value={effect.type}
          onChange={(type) => {
            switch (type) {
              case 'setComponent':
                commitProperties(BehaviorComponent, {
                  [`behaviors.${behaviorIndex}.effects.${index}` as any]: {
                    type: 'setComponent',
                    nodeID: '' as NodeID,
                    jsonID: '',
                    values: {}
                  }
                })
                break
              case 'removeComponent':
                commitProperties(BehaviorComponent, {
                  [`behaviors.${behaviorIndex}.effects.${index}` as any]: {
                    type: 'removeComponent',
                    nodeID: '' as NodeID,
                    jsonID: ''
                  }
                })
                break
              case 'callback':
                commitProperties(BehaviorComponent, {
                  [`behaviors.${behaviorIndex}.effects.${index}` as any]: {
                    type: 'callback',
                    nodeID: '' as NodeID,
                    sourceNodeID: '' as NodeID,
                    callback: '',
                    parameters: []
                  }
                })
                break
              case 'createEntity':
                commitProperties(BehaviorComponent, {
                  [`behaviors.${behaviorIndex}.effects.${index}` as any]: {
                    type: 'createEntity',
                    nodeID: '' as NodeID,
                    parentID: '' as NodeID,
                    components: {}
                  }
                })
                break
              case 'removeEntity':
                commitProperties(BehaviorComponent, {
                  [`behaviors.${behaviorIndex}.effects.${index}` as any]: {
                    type: 'removeEntity',
                    nodeID: '' as NodeID,
                    sourceNodeID: '' as NodeID
                  }
                })
                break
              case 'transition':
                commitProperties(BehaviorComponent, {
                  [`behaviors.${behaviorIndex}.effects.${index}` as any]: {
                    type: 'transition',
                    nodeID: '' as NodeID,
                    sourceNodeID: '' as NodeID,
                    jsonID: '',
                    propertyPath: '',
                    value: '',
                    duration: 0,
                    easing: 'linear.inOut'
                  }
                })
                break
            }
          }}
          options={effectOptions}
        />
        {Editor}
        <Button onClick={() => handleChangeEffect(behaviorIndex, index, 'remove')}>Remove Effect</Button>
      </InputGroup>
    )
  }

  /**
   * Simpler UI for trigger
   */
  const TriggerUI = () => {
    const enterBehavior = behavior.get(NO_PROXY).behaviors[0]
    const exitBehavior = behavior.get(NO_PROXY).behaviors[1]

    if (!enterBehavior || !exitBehavior) return <></>

    return (
      <>
        <InputGroup
          name="Enter Trigger Effects"
          label={t('editor:properties.behavior.lbl-enterTrigger')}
          info={t('editor:properties.behavior.lbl-enterTrigger-info')}
        >
          {/* Effect editor */}
          {enterBehavior?.effects?.map((effect, index) => (
            <EffectInput
              key={'enter' + index}
              behaviorIndex={0}
              index={index}
              effect={effect as Static<typeof EffectSchema>}
            />
          ))}
          <Button onClick={() => handleChangeEffect(0, 0, 'add')}>Add Effect</Button>
        </InputGroup>
        <InputGroup
          name="Exit Trigger Effects"
          label={t('editor:properties.behavior.lbl-exitTrigger')}
          info={t('editor:properties.behavior.lbl-exitTrigger-info')}
        >
          {exitBehavior?.effects?.map((effect, index) => (
            <EffectInput
              key={'exit' + index}
              behaviorIndex={1}
              index={index}
              effect={effect as Static<typeof EffectSchema>}
            />
          ))}
          <Button onClick={() => handleChangeEffect(1, 0, 'add')}>Add Effect</Button>
        </InputGroup>
      </>
    )
  }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.behavior.name')}
      description={t('editor:properties.behavior.description')}
      Icon={BehaviorNodeEditor.iconComponent}
    >
      <InputGroup
        name="Preset"
        label={t('editor:properties.behavior.lbl-preset')}
        info={t('editor:properties.behavior.lbl-preset-info')}
      >
        <SelectInput value={selectedPreset.value} onChange={onChangePreset} options={presetOptions} />
      </InputGroup>
      {selectedPreset.value === 'none' && (
        <>
          {behavior.behaviors.get(NO_PROXY).map((behavior, index) => (
            <InputGroup
              key={index}
              name="Behavior"
              label={t('editor:properties.behavior.lbl-behaviors') + (index + 1)}
              info={t('editor:properties.behavior.lbl-behaviors-info')}
            >
              {behavior.conditions.map((condition, conditionIndex) => (
                <InputGroup
                  key={conditionIndex}
                  name="Condition"
                  label={t('editor:properties.behavior.lbl-conditions') + (conditionIndex + 1)}
                  info={t('editor:properties.behavior.lbl-conditions-info')}
                >
                  <ConditionInput condition={condition} index={conditionIndex} behaviorIndex={index} />
                </InputGroup>
              ))}
              <Button onClick={() => handleChangeCondition(index, 0, 'add')}>Add Condition</Button>
              {behavior.effects.map((effect, effectIndex) => (
                <InputGroup
                  key={index}
                  name="Effect"
                  label={t('editor:properties.behavior.lbl-effects') + (index + 1)}
                  info={t('editor:properties.behavior.lbl-effects-info')}
                >
                  <EffectInput
                    behaviorIndex={index}
                    index={effectIndex}
                    effect={effect as Static<typeof EffectSchema>}
                  />
                </InputGroup>
              ))}
              <Button onClick={() => handleChangeEffect(index, 0, 'add')}>Add Effect</Button>
              <Checkbox
                label={t('editor:properties.media.lbl-muteEditor')}
                variantTextPlacement={'right'}
                checked={behavior.networked}
                onChange={commitProperty(BehaviorComponent, `behaviors.${index}.networked` as any)}
              />
              <Button onClick={() => handleChangeBehavior('', index, 'remove')}>
                Remove Behavior
                <HiMinus className="m-auto" />
              </Button>
            </InputGroup>
          ))}
        </>
      )}
      {/* Assume one behavior, one callback condition and one effect */}
      {selectedPreset.value === 'callback' && (
        <>
          <InputGroup
            name="Callback Condition"
            label={t('editor:properties.behavior.lbl-callbackCondition')}
            info={t('editor:properties.behavior.lbl-callbackCondition-info')}
          >
            {behavior.behaviors[0]?.conditions[0] && (
              <CallbackConditionInput
                behaviorIndex={0}
                index={0}
                condition={behavior.behaviors[0].conditions[0].get(NO_PROXY) as Static<typeof CallbackConditionSchema>}
              />
            )}
          </InputGroup>
          <InputGroup
            name="Callback Effects"
            label={t('editor:properties.behavior.lbl-callbackEffects')}
            info={t('editor:properties.behavior.lbl-callbackEffects-info')}
          >
            {behavior.behaviors[0]?.effects.map((effect, index) => (
              <EffectInput
                key={index}
                behaviorIndex={0}
                index={index}
                effect={effect.get(NO_PROXY) as Static<typeof EffectSchema>}
              />
            ))}
            <Button onClick={() => handleChangeEffect(0, behavior.behaviors[0]?.effects.length || 0, 'add')}>
              Add Effect
            </Button>
          </InputGroup>
        </>
      )}
      {/* Assume two behaviors, one callback condition, and any number of effects */}
      {selectedPreset.value === 'trigger' && <TriggerUI />}
      <div className="my-1 flex w-full justify-end gap-1">
        <button onClick={() => handleChangeBehavior('', 0, 'add')}>Add Behavior</button>
      </div>
    </NodeEditor>
  )
}

BehaviorNodeEditor.iconComponent = HiMiniPuzzlePiece

export default BehaviorNodeEditor
