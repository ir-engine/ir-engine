import { RigidBodyType, ShapeType } from '@dimforge/rapier3d-compat'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { camelCaseToSpacedString } from '@etherealengine/common/src/utils/camelCaseToSpacedString'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import {
  ComponentType,
  defineQuery,
  getComponent,
  hasComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityTreeComponent } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { CallbackComponent } from '@etherealengine/engine/src/scene/components/CallbackComponent'
import {
  ColliderComponent,
  supportedColliderShapes
} from '@etherealengine/engine/src/scene/components/ColliderComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'

import PanToolIcon from '@mui/icons-material/PanTool'

import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import StringInput from '../inputs/StringInput'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperties, updateProperty } from './Util'

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

  const colliderComponent = getComponent(props.entity, ColliderComponent)

  useEffect(() => {
    const options = [] as OptionsType
    options.push({
      label: 'Self',
      value: 'Self',
      callbacks: []
    })
    for (const entity of callbackQuery()) {
      if (entity === props.entity || !hasComponent(entity, EntityTreeComponent)) continue
      const callbacks = getComponent(entity, CallbackComponent)
      options.push({
        label: getComponent(entity, NameComponent),
        value: getComponent(entity, UUIDComponent),
        callbacks: Object.keys(callbacks).map((cb) => {
          return { label: cb, value: cb }
        })
      })
    }
    setOptions(options)
  }, [])

  const updateIsTrigger = (val) => {
    const props = { isTrigger: val } as Partial<ComponentType<typeof ColliderComponent>>
    if (val) {
      props.target = colliderComponent.target ?? 'Self'
      props.onEnter = colliderComponent.onEnter ?? ''
      props.onExit = colliderComponent.onExit ?? ''
    }
    updateProperties(ColliderComponent, props)
  }

  const triggerProps = () => {
    //function to handle the changes in target
    const onChangeTarget = (target) => {
      updateProperties(ColliderComponent, {
        target: target === 'Self' ? '' : target,
        onEnter: '',
        onExit: ''
      })
    }

    const targetOption = options.find((o) => o.value === colliderComponent.target)
    const target = targetOption ? targetOption.value : 'Self'

    return (
      <>
        <InputGroup name="Target" label={t('editor:properties.triggereVolume.lbl-target')}>
          <SelectInput
            key={props.entity}
            value={colliderComponent.target ?? 'Self'}
            onChange={onChangeTarget}
            options={options}
            disabled={props.multiEdit}
          />
        </InputGroup>
        <InputGroup name="On Enter" label={t('editor:properties.triggereVolume.lbl-onenter')}>
          {targetOption?.callbacks.length == 0 ? (
            <StringInput
              value={colliderComponent.onEnter!}
              onChange={updateProperty(ColliderComponent, 'onEnter')}
              disabled={props.multiEdit || !target}
            />
          ) : (
            <SelectInput
              key={props.entity}
              value={colliderComponent.onEnter!}
              onChange={updateProperty(ColliderComponent, 'onEnter') as any}
              options={targetOption?.callbacks ? targetOption.callbacks : []}
              disabled={props.multiEdit || !target}
            />
          )}
        </InputGroup>

        <InputGroup name="On Exit" label={t('editor:properties.triggereVolume.lbl-onexit')}>
          {targetOption?.callbacks.length == 0 ? (
            <StringInput
              value={colliderComponent.onExit!}
              onChange={updateProperty(ColliderComponent, 'onExit')}
              disabled={props.multiEdit || !target}
            />
          ) : (
            <SelectInput
              key={props.entity}
              value={colliderComponent.onExit!}
              onChange={updateProperty(ColliderComponent, 'onExit') as any}
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
