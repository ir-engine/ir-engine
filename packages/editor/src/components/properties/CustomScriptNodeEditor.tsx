import React, { Component } from 'react'
import NodeEditor from './NodeEditor'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
import { Description } from '@material-ui/icons'
import SelectInput from '../inputs/SelectInput'
import InputGroup from '../inputs/InputGroup'
import Editor from '../Editor'
import CustomScriptNode from '../../nodes/CustomScriptNode'
import { getUrlFromId } from '@xrengine/engine/src/scene/functions/getUrlFromId'
import StringInput from '../inputs/StringInput'

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

  onChangeScript = (val) => {
    this.props.editor.setPropertySelected('scriptUrl', val)
  }

  render() {
    const node = this.props.node
    CustomScriptNodeEditor.description = this.props.t('editor:properties.customscriptnode.description')
    return (
      <NodeEditor description={CustomScriptNodeEditor.description} {...this.props}>
        {/**@ts-ignore */}
        <InputGroup name="Code URL" label={this.props.t('editor:properties.customscriptnode.lbl-scripturl')}>
          {/**@ts-ignore */}
          <StringInput onChange={this.onChangeScript} value={node.scriptUrl} />
        </InputGroup>
      </NodeEditor>
    )
  }
}

export default withTranslation()(CustomScriptNodeEditor)
