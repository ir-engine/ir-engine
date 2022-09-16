import { RigidBodyType, ShapeType } from '@dimforge/rapier3d-compat'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { camelCaseToSpacedString } from '@xrengine/common/src/utils/camelCaseToSpacedString'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { defineQuery, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { CallbackComponent } from '@xrengine/engine/src/scene/components/CallbackComponent'
import { ColliderComponent, ColliderComponentType } from '@xrengine/engine/src/scene/components/ColliderComponent'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { supportedColliderShapes } from '@xrengine/engine/src/scene/functions/loaders/ColliderFunctions'

import PanToolIcon from '@mui/icons-material/PanTool'

import { setPropertyOnSelectionEntities } from '../../classes/History'
import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import StringInput from '../inputs/StringInput'
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
  const { t } = useTranslation()
  const [options, setOptions] = useState<OptionsType>([{ label: 'Self', value: 'Self', callbacks: [] }])

  const colliderComponent = getComponent(props.node.entity, ColliderComponent)

  useEffect(() => {
    const options = [] as OptionsType
    options.push({
      label: 'Self',
      value: 'Self',
      callbacks: []
    })
    for (const entity of callbackQuery()) {
      if (entity === props.node.entity) continue
      const callbacks = getComponent(entity, CallbackComponent)
      options.push({
        label: getComponent(entity, NameComponent)?.name,
        value: Engine.instance.currentWorld.entityTree.entityNodeMap.get(entity)!.uuid,
        callbacks: Object.keys(callbacks).map((cb) => {
          return { label: cb, value: cb }
        })
      })
    }
    setOptions(options)
  }, [])

  const updateIsTrigger = (val) => {
    const props = { isTrigger: val } as Partial<ColliderComponentType>
    if (val) {
      props.target = colliderComponent.target ?? 'Self'
      props.onEnter = colliderComponent.onEnter ?? ''
      props.onExit = colliderComponent.onExit ?? ''
    }
    setPropertyOnSelectionEntities({
      component: ColliderComponent,
      properties: [props]
    })
  }

  const triggerProps = () => {
    //function to handle the changes in target
    const onChangeTarget = (target) => {
      setPropertyOnSelectionEntities({
        component: ColliderComponent,
        properties: [
          {
            target: target === 'Self' ? '' : target,
            onEnter: '',
            onExit: ''
          }
        ]
      })
    }

    const targetOption = options.find((o) => o.value === colliderComponent.target)
    const target = targetOption ? targetOption.value : 'Self'

    return (
      <>
        <InputGroup name="Target" label={t('editor:properties.triggereVolume.lbl-target')}>
          <SelectInput
            key={props.node.entity}
            value={colliderComponent.target ?? 'Self'}
            onChange={onChangeTarget}
            options={options}
            disabled={props.multiEdit}
          />
        </InputGroup>
        <InputGroup name="On Enter" label={t('editor:properties.triggereVolume.lbl-onenter')}>
          {targetOption?.callbacks.length == 0 ? (
            <StringInput
              value={colliderComponent.onEnter}
              onChange={updateProperty(ColliderComponent, 'onEnter')}
              disabled={props.multiEdit || !target}
            />
          ) : (
            <SelectInput
              key={props.node.entity}
              value={colliderComponent.onEnter}
              onChange={updateProperty(ColliderComponent, 'onEnter')}
              options={targetOption?.callbacks ? targetOption.callbacks : []}
              disabled={props.multiEdit || !target}
            />
          )}
        </InputGroup>

        <InputGroup name="On Exit" label={t('editor:properties.triggereVolume.lbl-onexit')}>
          {targetOption?.callbacks.length == 0 ? (
            <StringInput
              value={colliderComponent.onExit}
              onChange={updateProperty(ColliderComponent, 'onExit')}
              disabled={props.multiEdit || !target}
            />
          ) : (
            <SelectInput
              key={props.node.entity}
              value={colliderComponent.onExit}
              onChange={updateProperty(ColliderComponent, 'onExit')}
              options={targetOption?.callbacks ? targetOption.callbacks : []}
              disabled={props.multiEdit || !target}
            />
          )}
        </InputGroup>
      </>
    )
  }

  return (
    <NodeEditor {...props} description={t('editor:properties.collider.description')}>
      <InputGroup name="Type" label={t('editor:properties.collider.lbl-type')}>
        <SelectInput
          options={bodyTypeOptions}
          value={colliderComponent.bodyType}
          onChange={updateProperty(ColliderComponent, 'bodyType')}
        />
      </InputGroup>
      <InputGroup name="Shape" label={t('editor:properties.collider.lbl-shape')}>
        <SelectInput
          options={shapeTypeOptions}
          value={colliderComponent.shapeType}
          onChange={updateProperty(ColliderComponent, 'shapeType')}
        />
      </InputGroup>
      <InputGroup name="Trigger" label={t('editor:properties.collider.lbl-isTrigger')}>
        <BooleanInput value={colliderComponent.isTrigger} onChange={updateIsTrigger} />
      </InputGroup>
      {colliderComponent.isTrigger && triggerProps()}
    </NodeEditor>
  )
}

ColliderNodeEditor.iconComponent = PanToolIcon

export default ColliderNodeEditor
