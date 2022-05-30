import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { traverseEntityNode } from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
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

export const TriggerVolumeNodeEditor: EditorComponentType = (props) => {
  //initializing props and state
  let [options, setOptions] = useState<any[]>([])
  const { t } = useTranslation()

  useEffect(() => {
    const options: any[] = []
    const entityTree = useWorld().entityTree

    traverseEntityNode(entityTree.rootNode, (o) => {
      if (o === entityTree.rootNode) return
      if (hasComponent(o.entity, Object3DComponent)) {
        const obj3d = getComponent(o.entity, Object3DComponent).value as any
        const callbacks = obj3d.callbacks ? obj3d.callbacks() : []
        options.push({ label: getComponent(o.entity, NameComponent)?.name, value: o.uuid, callbacks })
      }
    })
    setOptions(options)
  }, [])

  //function to handle the changes in target
  const onChangeTarget = (target) => {
    setPropertyOnSelectionEntities({
      component: TriggerVolumeComponent,
      properties: [
        {
          target,
          onEnter: '',
          onExit: ''
        }
      ]
    })
  }

  const triggerVolumeComponent = getComponent(props.node.entity, TriggerVolumeComponent)
  const targetOption = options.find((o) => o.value === triggerVolumeComponent.target)
  const target = targetOption ? targetOption.value : null
  const targetNotFound = triggerVolumeComponent.target && target === null

  return (
    <NodeEditor description={t('editor:properties.triggereVolume.description')} {...props}>
      <InputGroup name="Target" label={t('editor:properties.triggereVolume.lbl-target')}>
        <SelectInput
          key={props.node.entity}
          error={targetNotFound}
          placeholder={
            targetNotFound
              ? t('editor:properties.triggereVolume.ph-errorNode')
              : t('editor:properties.triggereVolume.ph-selectNode')
          }
          value={triggerVolumeComponent.target}
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
