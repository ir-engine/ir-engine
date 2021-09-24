import React, { Component } from 'react'
import NodeEditor from './NodeEditor'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
import { Description } from '@material-ui/icons'
import InputGroup from '../inputs/InputGroup'
import Editor from '../Editor'
import CustomScriptNode from '../../nodes/CustomScriptNode'
import StringInput from '../inputs/StringInput'
import realitypacks from '@xrengine/realitypacks/manifest.json'
import SelectInput from '../inputs/SelectInput'

/**
 * Define properties for CustomScriptNode component.
 *
 * @author Abhishek Pathak
 * @type {Object}
 */
type CustomScriptNodeEditorProps = {
  editor?: Editor
  node?: CustomScriptNode
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

  constructor(props) {
    super(props)
  }
  onChangeScript = (val) => {
    this.props.editor.setPropertySelected('scriptUrl', val)
  }

  getRealityPacks = () => {
    console.log('Condfasdf:' + JSON.stringify(realitypacks))
    const packs = realitypacks.packs
    const options = []
    packs.forEach((value, index) => {
      options.push({
        label: value,
        value: index
      })
    })
    return options
  }

  render() {
    const node = this.props.node
    {
      this.getRealityPacks()
    }
    CustomScriptNodeEditor.description = i18n.t('editor:properties.customscriptnode.description')
    return (
      <InputGroup name="RealityPack" label="Reality Pack">
        <SelectInput options={this.getRealityPacks()} onChange={this.onChangeScript} value={node.scriptUrl} />
      </InputGroup>
    )
  }
}

export default withTranslation()(CustomScriptNodeEditor)
