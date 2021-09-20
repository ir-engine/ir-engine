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

//Array containing component options
const componentOptions = [
  {
    label: 'video',
    value: 'video',
    nodeNames: ['Video'],
    propertyOptions: [
      {
        label: 'paused',
        value: 'paused',
        component: 'video',
        input: BooleanInput,
        default: false
      }
    ]
  },
  {
    label: 'volumetric',
    value: 'volumetric',
    nodeNames: ['Volumetric'],
    propertyOptions: [
      {
        label: 'paused',
        value: 'paused',
        component: 'volumetric',
        input: BooleanInput,
        default: false
      }
    ]
  },
  {
    label: 'loop-animation',
    value: 'loop-animation',
    nodeNames: ['Model'],
    propertyOptions: [
      {
        label: 'paused',
        value: 'paused',
        component: 'loop-animation',
        input: BooleanInput,
        default: false
      }
    ]
  }
]

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
    ;(this.props.editor as any).setPropertySelected('showHelper', value)
  }

  //function to handle the changes in target
  onChangeTarget = (target) => {
    CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.MODIFY_PROPERTY, {
      properties: {
        target,
        enterComponent: null,
        enterProperty: null,
        enterValue: null,
        leaveComponent: null,
        leaveProperty: null,
        leaveValue: null
      }
    })
  }

  // function to handle changes in enterComponent
  onChangeEnterComponent = (value) => {
    CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.MODIFY_PROPERTY, {
      properties: {
        enterComponent: value,
        enterProperty: null,
        enterValue: null
      }
    })
  }

  // function to handle changes in enter property
  onChangeEnterProperty = (value, option) => {
    CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.MODIFY_PROPERTY, {
      properties: {
        enterProperty: value,
        enterValue: option.default !== undefined ? option.default : null
      }
    })
  }

  //function to handle the changes in enterValue property
  onChangeEnterValue = (value) => {
    CommandManager.instance.setPropertyOnSelection('enterValue', value)
  }

  // function to handle the changes leaveComponent
  onChangeLeaveComponent = (value) => {
    CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.MODIFY_PROPERTY, {
      properties: {
        leaveComponent: value,
        leaveProperty: null,
        leaveValue: null
      }
    })
  }

  // function to handle the changes in leave property
  onChangeLeaveProperty = (value, option) => {
    CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.MODIFY_PROPERTY, {
      properties: {
        leaveProperty: value,
        leaveValue: option.default !== undefined ? option.default : null
      }
    })
  }

  // function to handle the changes in leaveValue
  onChangeLeaveValue = (value) => {
    CommandManager.instance.setPropertyOnSelection('leaveValue', value)
  }

  //rendering editor view for property customization
  render() {
    TriggerVolumeNodeEditor.description = this.props.t('editor:properties.triggereVolume.description')
    const { node, multiEdit } = this.props as any
    const targetOption = this.state.options.find((o) => o.value === node.target)
    const target = targetOption ? targetOption.value : null
    const targetNotFound = node.target && target === null
    const filteredComponentOptions = targetOption
      ? componentOptions.filter((o) => o.nodeNames.indexOf(targetOption.nodeName) !== -1)
      : []
    const enterComponentOption = filteredComponentOptions.find((o) => o.value === node.enterComponent)
    const enterComponent = enterComponentOption ? enterComponentOption.value : null
    const leaveComponentOption = filteredComponentOptions.find((o) => o.value === node.leaveComponent)
    const leaveComponent = leaveComponentOption ? leaveComponentOption.value : null
    const filteredEnterPropertyOptions = enterComponentOption
      ? enterComponentOption.propertyOptions.filter((o) => o.component === node.enterComponent)
      : []
    const enterPropertyOption = filteredEnterPropertyOptions.find((o) => o.value === node.enterProperty)
    const enterProperty = enterPropertyOption ? enterPropertyOption.value : null
    const filteredLeavePropertyOptions = leaveComponentOption
      ? leaveComponentOption.propertyOptions.filter((o) => o.component === node.leaveComponent)
      : []
    const leavePropertyOption = filteredLeavePropertyOptions.find((o) => o.value === node.leaveProperty)
    const leaveProperty = leavePropertyOption ? leavePropertyOption.value : null
    const EnterInput = enterPropertyOption && enterPropertyOption.input
    const LeaveInput = leavePropertyOption && leavePropertyOption.input
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
        <InputGroup name="Enter Component" label={this.props.t('editor:properties.triggereVolume.lbl-enterComponent')}>
          <SelectInput
            placeholder={node.enterComponent || this.props.t('editor:properties.triggereVolume.ph-selectComponent')}
            value={node.enterComponent}
            onChange={this.onChangeEnterComponent}
            options={filteredComponentOptions}
            disabled={multiEdit || !target}
          />
        </InputGroup>
        <InputGroup name="Enter Property" label={this.props.t('editor:properties.triggereVolume.lbl-enterProperty')}>
          <SelectInput
            placeholder={node.enterProperty || this.props.t('editor:properties.triggereVolume.ph-selectProperty')}
            value={node.enterProperty}
            onChange={this.onChangeEnterProperty}
            options={filteredEnterPropertyOptions}
            disabled={multiEdit || !enterComponent}
          />
        </InputGroup>
        <InputGroup name="Enter Value" label={this.props.t('editor:properties.triggereVolume.lbl-entervalue')}>
          {EnterInput ? (
            <EnterInput
              value={node.enterValue}
              onChange={this.onChangeEnterValue}
              disabled={multiEdit || !(target && enterComponent && enterProperty)}
            />
          ) : (
            <StringInput disabled />
          )}
        </InputGroup>
        <InputGroup name="Leave Component" label={this.props.t('editor:properties.triggereVolume.lbl-leaveComponent')}>
          <SelectInput
            placeholder={node.leaveComponent || this.props.t('editor:properties.triggereVolume.ph-selectComponent')}
            value={node.leaveComponent}
            onChange={this.onChangeLeaveComponent}
            options={filteredComponentOptions}
            disabled={multiEdit || !target}
          />
        </InputGroup>
        <InputGroup name="Leave Property" label={this.props.t('editor:properties.triggereVolume.lbl-leaveProperty')}>
          <SelectInput
            placeholder={node.leaveProperty || this.props.t('editor:properties.triggereVolume.ph-selectProperty')}
            value={node.leaveProperty}
            onChange={this.onChangeLeaveProperty}
            options={filteredLeavePropertyOptions}
            disabled={multiEdit || !leaveComponent}
          />
        </InputGroup>
        <InputGroup name="Leave Value" label={this.props.t('editor:properties.triggereVolume.lbl-leaveValue')}>
          {LeaveInput ? (
            <LeaveInput
              value={node.leaveValue}
              onChange={this.onChangeLeaveValue}
              disabled={multiEdit || !(target && leaveComponent && leaveProperty)}
            />
          ) : (
            <StringInput disabled />
          )}
        </InputGroup>
      </NodeEditor>
    )
  }
}

export default withTranslation()(TriggerVolumeNodeEditor)
