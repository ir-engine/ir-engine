import React, { useEffect, useState } from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import StringInput from '../inputs/StringInput'
import { useTranslation } from 'react-i18next'
import { CommandManager } from '../../managers/CommandManager'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun'
import { TriggerVolumeComponent } from '@xrengine/engine/src/scene/components/TriggerVolumeComponent'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EditorComponentType, updateProperty } from './Util'

export const TriggerVolumeNodeEditor: EditorComponentType = (props) => {
  //initializing props and state
  let [options, setOptions] = useState<any[]>([])
  const { t } = useTranslation()

  useEffect(() => {
    const options: any[] = []
    const sceneNode = Engine.scene
    sceneNode.traverse((o: any) => {
      if (o.isNode && o !== sceneNode) {
        options.push({ label: o.name, value: o.uuid, nodeName: o.nodeName })
      }
    })
    setOptions(options)
  }, [])

  //function to handle the changes in target
  const onChangeTarget = (target) => {
    CommandManager.instance.setPropertyOnSelectionEntities({
      component: TriggerVolumeComponent,
      properties: {
        target,
        onEnter: '',
        onExit: ''
      }
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
        <StringInput
          value={triggerVolumeComponent.onEnter}
          onChange={updateProperty(TriggerVolumeComponent, 'onEnter')}
          disabled={props.multiEdit || !target}
        />
      </InputGroup>
      <InputGroup name="On Exit" label={t('editor:properties.triggereVolume.lbl-onexit')}>
        <StringInput
          value={triggerVolumeComponent.onExit}
          onChange={updateProperty(TriggerVolumeComponent, 'onExit')}
          disabled={props.multiEdit || !target}
        />
      </InputGroup>
    </NodeEditor>
  )
}

TriggerVolumeNodeEditor.iconComponent = DirectionsRunIcon

export default TriggerVolumeNodeEditor
