// @ts-nocheck
import React, { Component } from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import BooleanInput from '../inputs/BooleanInput'
import StringInput from '../inputs/StringInput'
import { Running } from '@styled-icons/fa-solid/Running'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
import { CommandManager } from '../../managers/CommandManager'
import EditorCommands from '../../constants/EditorCommands'
import { SceneManager } from '../../managers/SceneManager'

//Declaring TriggerVolumeNodeEditor properties
type TriggerVolumeNodeEditorProps = {
  node?: object
  multiEdit?: boolean
  t: Function
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
export class TriggerVolumeNodeEditor extends Component<TriggerVolumeNodeEditorProps, TriggerVolumeNodeEditorState> {
  //initializing props and state
  constructor(props) {
    super(props)
    this.state = {
      options: []
    }
  }

  //updating state when component get mounted
  componentDidMount() {
    const options = []
    const sceneNode = SceneManager.instance.scene
    sceneNode.traverse((o) => {
      if (o.isNode && o !== sceneNode) {
        options.push({ label: o.name, value: o.uuid, nodeName: o.nodeName })
      }
    })
    this.setState({ options })
  }

  //initializing iconComponent with icon name
  static iconComponent = Running

  //initializing description and will appears on editor view
  static description = i18n.t('editor:properties.triggereVolume.description')

  //function to handle the changes in showHelper property
  onChangeShowHelperValue = (value) => {
    CommandManager.instance.setPropertyOnSelection('showHelper', value)
  }

  //function to handle the changes in target
  onChangeTarget = (target) => {
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
  onChangeOnEnter = (value) => {
    CommandManager.instance.setPropertyOnSelection('onEnter', value)
  }

  // function to handle the changes in leaveValue
  onChangeOnExit = (value) => {
    CommandManager.instance.setPropertyOnSelection('onExit', value)
  }

  //rendering editor view for property customization
  render() {
    TriggerVolumeNodeEditor.description = this.props.t('editor:properties.triggereVolume.description')
    const { node, multiEdit } = this.props as any
    const targetOption = this.state.options.find((o) => o.value === node.target)
    const target = targetOption ? targetOption.value : null
    const targetNotFound = node.target && target === null
    return (
      <NodeEditor description={TriggerVolumeNodeEditor.description} {...this.props}>
        <InputGroup name="Show Helper" label={this.props.t('editor:properties.triggereVolume.lbl-showHelper')}>
          <BooleanInput value={node.showHelper} onChange={this.onChangeShowHelperValue} disabled={false} />
        </InputGroup>
        <InputGroup name="Target" label={this.props.t('editor:properties.triggereVolume.lbl-target')}>
          <SelectInput
            error={targetNotFound}
            placeholder={
              targetNotFound
                ? this.props.t('editor:properties.triggereVolume.ph-errorNode')
                : this.props.t('editor:properties.triggereVolume.ph-selectNode')
            }
            value={node.target}
            onChange={this.onChangeTarget}
            options={this.state.options}
            disabled={multiEdit}
          />
        </InputGroup>
        <InputGroup name="On Enter" label={this.props.t('editor:properties.triggereVolume.lbl-onenter')}>
          <StringInput value={node.onEnter} onChange={this.onChangeOnEnter} disabled={multiEdit || !target} />
        </InputGroup>
        <InputGroup name="On Exit" label={this.props.t('editor:properties.triggereVolume.lbl-onexit')}>
          <StringInput value={node.onExit} onChange={this.onChangeOnExit} disabled={multiEdit || !target} />
        </InputGroup>
      </NodeEditor>
    )
  }
}

export default withTranslation()(TriggerVolumeNodeEditor)
