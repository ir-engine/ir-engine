// @ts-nocheck
import React, { useEffect, useState } from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import BooleanInput from '../inputs/BooleanInput'
import StringInput from '../inputs/StringInput'
import { Running } from '@styled-icons/fa-solid/Running'
import { useTranslation } from 'react-i18next'
import { CommandManager } from '../../managers/CommandManager'
import EditorCommands from '../../constants/EditorCommands'
import { SceneManager } from '../../managers/SceneManager'

//Declaring TriggerVolumeNodeEditor properties
type TriggerVolumeNodeEditorProps = {
  node?: object
  multiEdit?: boolean
}

//Declaring TriggerVolumeNodeEditor state
type TriggerVolumeNodeEditorState = {
  options: any[]
}

/**
 * TriggerVolumeNodeEditor provides the editor view to customize properties.
 *
 * @author Robert Long
 * @type {class component}
 */
export const TriggerVolumeNodeEditor = (props: TriggerVolumeNodeEditorProps) => {
  //initializing props and state
  let [options, setOptions] = useState([])
  const { t } = useTranslation()

  useEffect(() => {
    const options = []
    const sceneNode = SceneManager.instance.scene
    sceneNode.traverse((o) => {
      if (o.isNode && o !== sceneNode) {
        options.push({ label: o.name, value: o.uuid, nodeName: o.nodeName })
      }
    })
    setOptions(options)
  }, [])

  //function to handle the changes in showHelper property
  const onChangeShowHelperValue = (value) => {
    CommandManager.instance.setPropertyOnSelection('showHelper', value)
  }

  //function to handle the changes in target
  const onChangeTarget = (target) => {
    CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.MODIFY_PROPERTY, {
      properties: {
        target,
        onEnter: '',
        onExit: '',
        showHelper: false
      }
    })
  }

  //function to handle the changes in enterValue property
  const onChangeOnEnter = (value) => {
    CommandManager.instance.setPropertyOnSelection('onEnter', value)
  }

  // function to handle the changes in leaveValue
  const onChangeOnExit = (value) => {
    CommandManager.instance.setPropertyOnSelection('onExit', value)
  }

  //rendering editor view for property customization
  const { node, multiEdit } = props
  const targetOption = options.find((o) => o.value === node.target)
  const target = targetOption ? targetOption.value : null
  const targetNotFound = node.target && target === null

  return (
    <NodeEditor description={t('editor:properties.triggereVolume.description')} {...props}>
      <InputGroup name="Show Helper" label={t('editor:properties.triggereVolume.lbl-showHelper')}>
        <BooleanInput value={node.showHelper} onChange={onChangeShowHelperValue} disabled={false} />
      </InputGroup>
      <InputGroup name="Target" label={t('editor:properties.triggereVolume.lbl-target')}>
        <SelectInput
          error={targetNotFound}
          placeholder={
            targetNotFound
              ? t('editor:properties.triggereVolume.ph-errorNode')
              : t('editor:properties.triggereVolume.ph-selectNode')
          }
          value={node.target}
          onChange={onChangeTarget}
          options={options}
          disabled={multiEdit}
        />
      </InputGroup>
      <InputGroup name="On Enter" label={t('editor:properties.triggereVolume.lbl-onenter')}>
        <StringInput value={node.onEnter} onChange={onChangeOnEnter} disabled={multiEdit || !target} />
      </InputGroup>
      <InputGroup name="On Exit" label={t('editor:properties.triggereVolume.lbl-onexit')}>
        <StringInput value={node.onExit} onChange={onChangeOnExit} disabled={multiEdit || !target} />
      </InputGroup>
    </NodeEditor>
  )
}

TriggerVolumeNodeEditor.iconComponent = Running

export default TriggerVolumeNodeEditor
