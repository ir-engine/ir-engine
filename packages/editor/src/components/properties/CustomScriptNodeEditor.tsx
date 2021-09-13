import React, { Component } from 'react'
import NodeEditor from './NodeEditor'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
import { Description } from '@material-ui/icons'
import SelectInput from '../inputs/SelectInput'
import InputGroup from '../inputs/InputGroup'
import Editor from '../Editor'
import CustomScriptNode from '../../nodes/CustomScriptNode'

/**
 * Define properties for CustomScriptNode component.
 *
 * @author Abhishek Pathak
 * @type {Object}
 */
type CustomScriptNodeEditorProps = {
  editor?: Editor
  node?: object
  t: Function
}

/**
 * CustomScriptNode used for custom scripts.
 *
 * @author Abhishek Pathak
 * @param       {Object} props
 * @constructor
 */

export class CustomScriptNodeEditor extends Component<CustomScriptNodeEditorProps, {}> {
  static iconComponent = Description
  static description = i18n.t('editor:properties.customscriptnode.description')

  getScriptOptions = () => {
    const options = []
    const files = {}
    Object.assign(files, globalThis.Editor.currentOwnedFileIds)
    Object.assign(files, globalThis.Editor.ownedFileIds)
    Object.keys(files).forEach((element, index) => {
      options.push({ label: element, value: index })
    })
    return options
  }

  onChangeScriptSelected = (scriptSelected) => {
    this.props.editor.setPropertySelected('scriptSelected', scriptSelected)
  }

  render() {
    const node = this.props.node as CustomScriptNode
    CustomScriptNodeEditor.description = this.props.t('editor:properties.customscriptnode.description')
    return (
      <NodeEditor description={CustomScriptNodeEditor.description} {...this.props}>
        {/**@ts-ignore */}
        <InputGroup name="Select Script" label={this.props.t('editor:properties.customscriptnode.lbl-selectscript')}>
          {/**@ts-ignore */}
          <SelectInput
            onChange={this.onChangeScriptSelected}
            options={this.getScriptOptions()}
            value={node.scriptSelected}
          >
            {this.props.t('editor:properties.customscriptnode.lbl-attachscript')}
          </SelectInput>
        </InputGroup>
      </NodeEditor>
    )
  }
}

export default withTranslation()(CustomScriptNodeEditor)
