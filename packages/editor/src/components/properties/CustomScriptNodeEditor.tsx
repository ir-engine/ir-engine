import React, { Component } from 'react'
import NodeEditor from './NodeEditor'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
import { Description } from '@material-ui/icons'
import SelectInput from '../inputs/SelectInput'

/**
 * Define properties for CustomScriptNode component.
 *
 * @author Abhishek Pathak
 * @type {Object}
 */
type CustomScriptNodeEditorProps = {
  editor?: object
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
  optionSelected = 0
  onChange = () => {
    console.log('On change')
  }

  getScriptOptions = () => {
    const options = []
    const files = {}
    Object.assign(files, globalThis.Editor.currentOwnedFileIds)
    Object.assign(files, globalThis.Editor.ownedFileIds)
    Object.keys(files).forEach((element) => {
      options.push({ label: 'Label', value: 'Value' })
    })
    options.push({ label: 'Label', value: 'Value' })

    return []
  }

  render() {
    CustomScriptNodeEditor.description = this.props.t('editor:properties.customscriptnode.description')
    return (
      <NodeEditor description={CustomScriptNodeEditor.description} {...this.props}>
        {/**@ts-ignore */}
        <SelectInput onChange={this.onChange} options={this.getScriptOptions()} value={this.optionSelected}>
          {this.props.t('editor:properties.customscriptnode.lbl-attachscript')}
        </SelectInput>
      </NodeEditor>
    )
  }
}

export default withTranslation()(CustomScriptNodeEditor)
