import { RigidBodyType, ShapeType } from '@dimforge/rapier3d-compat'
import { hookstate, StateMethods, useHookstate } from '@hookstate/core'
import { clone, cloneDeep } from 'lodash'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Vector3 } from 'three'

import { camelCaseToSpacedString } from '@xrengine/common/src/utils/camelCaseToSpacedString'
import { number } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { defineQuery, getComponent, updateComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { CallbackComponent, EmptyCallback } from '@xrengine/engine/src/scene/components/CallbackComponent'
import { ColliderComponent } from '@xrengine/engine/src/scene/components/ColliderComponent'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { supportedColliderShapes, updateCollider } from '@xrengine/engine/src/scene/functions/loaders/ColliderFunctions'

import PanToolIcon from '@mui/icons-material/PanTool'

import { setPropertyOnSelectionEntities } from '../../classes/History'
import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import NumericInput from '../inputs/NumericInput'
import SelectInput from '../inputs/SelectInput'
import StringInput from '../inputs/StringInput'
import Vector3Input from '../inputs/Vector3Input'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

const bodyTypeOptions = Object.entries(RigidBodyType)
  .filter(([value]) => (value as string).length > 1)
  .map(([label, value]) => {
    return { label: camelCaseToSpacedString(label as string), value: Number(value) }
  })

const shapeTypeOptions = Object.entries(ShapeType)
  .filter(([label, value]) => supportedColliderShapes.includes(value as ShapeType))
  .map(([label, value]) => {
    return { label: camelCaseToSpacedString(label as string), value: Number(value) }
  })

type OptionsType = Array<{
  callbacks: Array<{
    label: string
    value: string
  }>
  label: string
  value: string
}>

const callbackQuery = defineQuery([CallbackComponent])

export const ColliderNodeEditor: EditorComponentType = (props) => {
  const [options, setOptions] = useState<OptionsType>([{ label: 'Self', value: '', callbacks: [] }])

  const colliderComponent = getComponent(props.node.entity, ColliderComponent)

  const { t } = useTranslation()

  useEffect(() => {
    if (colliderComponent.triggerCount.value > 0 && !props.multiEdit)
      updateIsTrigger(colliderComponent.triggerCount.value)

    const options = [] as OptionsType
    options.push({
      label: 'Self',
      value: 'Self',
      callbacks: []
    })

    for (const entity of callbackQuery()) {
      if (entity === props.node.entity) continue
      const callbacks = getComponent(entity, CallbackComponent)
      const coptions = Object.keys(callbacks)
      coptions.push(EmptyCallback)
      options.push({
        label: getComponent(entity, NameComponent)?.name,
        value: Engine.instance.currentWorld.entityTree.entityNodeMap.get(entity)!.uuid,
        callbacks: coptions.map((cb) => {
          return { label: cb, value: cb }
        })
      })
    }
    setOptions(options)
  }, [])

  const [events, setEvents] = useState<eventType>([])

  const updateIsTrigger = (events: number) => {
    const props = { triggerCount: events } as Partial<typeof colliderComponent.value>
    if (events > 0) {
      const triggerEvents = [] as eventType
      const _enters = [] as string[]
      const _exits = [] as string[]
      const _targets = [] as string[]
      for (let i = 0; i < events; i++) {
        _enters[i] = colliderComponent.onEnter.value[i] ?? EmptyCallback
        _exits[i] = colliderComponent.onExit.value[i] ?? EmptyCallback
        _targets[i] = colliderComponent.target.value[i] ?? 'Self'

        triggerEvents[i] = {
          target: _targets[i],
          onEnter: _enters[i],
          onExit: _exits[i]
        }
      }
      setEvents(triggerEvents)

      props.target = _targets
      props.onEnter = _enters
      props.onExit = _exits
    }
    setPropertyOnSelectionEntities(
      {
        component: ColliderComponent,
        properties: [props]
      },
      false
    )
  }

  type eventType = Array<{
    target: string
    onEnter: string
    onExit: string
  }>

  const triggerProps = (e: typeof events[0], i: number) => {
    //function to handle the changes in target

    const onChangeTarget = (target: string) => {
      const newTarget = options.find((o) => o.value === target)
      const targetArray = cloneDeep(colliderComponent.target.value)
      targetArray[i] = newTarget ? newTarget.value : ''

      const enterCallback = colliderComponent.onEnter.value[i]
      const exitCallback = colliderComponent.onExit.value[i]

      const onEnterArray = cloneDeep(colliderComponent.onEnter.value)
      onEnterArray[i] = newTarget?.callbacks.some((c) => c.label == enterCallback) ? enterCallback : EmptyCallback

      const onExitArray = cloneDeep(colliderComponent.onExit.value)
      onExitArray[i] = newTarget?.callbacks.some((c) => c.label == exitCallback) ? exitCallback : EmptyCallback

      setPropertyOnSelectionEntities(
        {
          component: ColliderComponent,
          properties: [
            {
              target: targetArray,
              onEnter: onEnterArray,
              onExit: onExitArray
            }
          ]
        },
        false
      )
    }

    const onChangeEnter = (newEvent: string) => {
      const onEnterArray = cloneDeep(colliderComponent.onEnter.value)
      onEnterArray[i] = newEvent
      setPropertyOnSelectionEntities(
        {
          component: ColliderComponent,
          properties: [
            {
              onEnter: onEnterArray
            }
          ]
        },
        false
      )
    }

    const onChangeExit = (newEvent: string) => {
      const onExitArray = cloneDeep(colliderComponent.onExit.value)
      onExitArray[i] = newEvent
      setPropertyOnSelectionEntities(
        {
          component: ColliderComponent,
          properties: [
            {
              onExit: onExitArray
            }
          ]
        },
        false
      )
    }

    const targetOption = options.find((o) => o.value === colliderComponent.target.value[i])
    const target = targetOption ? targetOption.value : 'Self'

    return (
      <NodeEditor {...props} description={t('editor:properties.triggereVolume.eventDescription')}>
        <InputGroup name="Target" label={t('editor:properties.triggereVolume.lbl-target')}>
          <SelectInput
            key={props.node.entity}
            value={colliderComponent.target.value[i] == '' ? 'Self' : colliderComponent.target.value[i]}
            onChange={onChangeTarget}
            options={options}
            disabled={props.multiEdit}
          />
        </InputGroup>
        <InputGroup name="OnEnter" label={t('editor:properties.triggereVolume.lbl-onenter')}>
          {targetOption?.callbacks.length == 0 || colliderComponent.target.value[i] == '' ? (
            <StringInput
              value={colliderComponent.onEnter.value[i]}
              onChange={onChangeEnter}
              disabled={props.multiEdit}
            />
          ) : (
            <SelectInput
              key={props.node.entity}
              value={colliderComponent.onEnter.value[i]}
              onChange={onChangeEnter}
              options={targetOption?.callbacks ? targetOption.callbacks : []}
              disabled={props.multiEdit || !target}
            />
          )}
        </InputGroup>

        <InputGroup name="On Exit" label={t('editor:properties.triggereVolume.lbl-onexit')}>
          {targetOption?.callbacks.length == 0 || colliderComponent.target.value[i] == '' ? (
            <StringInput value={colliderComponent.onExit.value[i]} onChange={onChangeExit} disabled={props.multiEdit} />
          ) : (
            <SelectInput
              key={props.node.entity}
              value={colliderComponent.onExit.value[i]}
              onChange={onChangeExit}
              options={targetOption?.callbacks ? targetOption.callbacks : []}
              disabled={props.multiEdit || !target}
            />
          )}
        </InputGroup>
      </NodeEditor>
    )
  }

  const onChangeScale = (scale: Vector3) => {
    setPropertyOnSelectionEntities(
      {
        component: ColliderComponent,
        properties: [
          {
            scaleMultiplier: { x: scale.x, y: scale.y, z: scale.z } as Vector3
          }
        ]
      },
      false
    )
    updateCollider(props.node.entity)
  }

  return (
    <NodeEditor {...props} description={t('editor:properties.collider.description')}>
      <InputGroup name="Type" label={t('editor:properties.collider.lbl-type')}>
        <SelectInput
          options={bodyTypeOptions}
          value={colliderComponent.bodyType.value}
          onChange={updateProperty(ColliderComponent, 'bodyType')}
        />
      </InputGroup>
      <InputGroup name="Shape" label={t('editor:properties.collider.lbl-shape')}>
        <SelectInput
          options={shapeTypeOptions}
          value={colliderComponent.shapeType.value}
          onChange={updateProperty(ColliderComponent, 'shapeType')}
        />
      </InputGroup>
      <InputGroup name="Scale" label={t('editor:properties.collider.lbl-scale')}>
        <Vector3Input
          key={props.node.entity}
          value={colliderComponent.scaleMultiplier.value}
          onChange={onChangeScale}
        />
      </InputGroup>
      <InputGroup name="Trigger" label={t('editor:properties.collider.lbl-events')}>
        <NumericInput
          value={colliderComponent.triggerCount.value}
          onChange={updateIsTrigger}
          smallStep={1}
          mediumStep={1}
          largeStep={1}
          min={0}
          max={9}
          precision={1}
          displayPrecision={1}
        />
      </InputGroup>
      {colliderComponent.triggerCount.value > 0 && React.Children.toArray(events.map((e, i) => triggerProps(e, i)))}
    </NodeEditor>
  )
}

ColliderNodeEditor.iconComponent = PanToolIcon

export default ColliderNodeEditor
