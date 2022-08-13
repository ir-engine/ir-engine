import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { defineQuery, getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { traverseEntityNode } from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'
import { CallbackComponent, CallbackComponentType } from '@xrengine/engine/src/scene/components/CallbackComponent'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { TriggerVolumeComponent } from '@xrengine/engine/src/scene/components/TriggerVolumeComponent'

import DirectionsRunIcon from '@mui/icons-material/DirectionsRun'

import { setPropertyOnSelectionEntities } from '../../classes/History'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import StringInput from '../inputs/StringInput'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

type OptionsType = Array<{
  callbacks: Array<{
    label: string
    value: string
  }>
  label: string
  value: string
}>

const callbackQuery = defineQuery([CallbackComponent])

export const TriggerVolumeNodeEditor: EditorComponentType = (props) => {
  //initializing props and state
  const [options, setOptions] = useState<OptionsType>([{ label: 'Self', value: 'Self', callbacks: [] }])
  const { t } = useTranslation()

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

  //function to handle the changes in target
  const onChangeTarget = (target) => {
    setPropertyOnSelectionEntities({
      component: TriggerVolumeComponent,
      properties: [
        {
          target: target === 'Self' ? '' : target,
          onEnter: '',
          onExit: ''
        }
      ]
    })
  }

  const triggerVolumeComponent = getComponent(props.node.entity, TriggerVolumeComponent)
  const targetOption = options.find((o) => o.value === triggerVolumeComponent.target)
  const target = targetOption ? targetOption.value : ''

  return (
    <NodeEditor description={t('editor:properties.triggereVolume.description')} {...props}>
      <InputGroup name="Target" label={t('editor:properties.triggereVolume.lbl-target')}>
        <SelectInput
          key={props.node.entity}
          value={triggerVolumeComponent.target === '' ? 'Self' : triggerVolumeComponent.target}
          onChange={onChangeTarget}
          options={options}
          disabled={props.multiEdit}
        />
      </InputGroup>
      <InputGroup name="On Enter" label={t('editor:properties.triggereVolume.lbl-onenter')}>
        {targetOption?.callbacks.length == 0 ? (
          <StringInput
            value={triggerVolumeComponent.onEnter}
            onChange={updateProperty(TriggerVolumeComponent, 'onEnter')}
            disabled={props.multiEdit || !target}
          />
        ) : (
          <SelectInput
            key={props.node.entity}
            value={triggerVolumeComponent.onEnter}
            onChange={updateProperty(TriggerVolumeComponent, 'onEnter')}
            options={targetOption?.callbacks ? targetOption.callbacks : []}
            disabled={props.multiEdit || !target}
          />
        )}
      </InputGroup>

      <InputGroup name="On Exit" label={t('editor:properties.triggereVolume.lbl-onexit')}>
        {targetOption?.callbacks.length == 0 ? (
          <StringInput
            value={triggerVolumeComponent.onExit}
            onChange={updateProperty(TriggerVolumeComponent, 'onExit')}
            disabled={props.multiEdit || !target}
          />
        ) : (
          <SelectInput
            key={props.node.entity}
            value={triggerVolumeComponent.onExit}
            onChange={updateProperty(TriggerVolumeComponent, 'onExit')}
            options={targetOption?.callbacks ? targetOption.callbacks : []}
            disabled={props.multiEdit || !target}
          />
        )}
      </InputGroup>
    </NodeEditor>
  )
}

TriggerVolumeNodeEditor.iconComponent = DirectionsRunIcon

export default TriggerVolumeNodeEditor
