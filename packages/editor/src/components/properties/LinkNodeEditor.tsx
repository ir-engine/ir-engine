import { Link } from '@styled-icons/fa-solid/Link'
import React, { Component } from 'react'
import InputGroup from '../inputs/InputGroup'
import StringInput from '../inputs/StringInput'
import NodeEditor from './NodeEditor'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
import { CommandManager } from '../../managers/CommandManager'

//declaring properties for LinkNodeEditor
type LinkNodeEditorProps = {
  node?: any
  t: Function
}

/**
 * LinkNodeEditor provides the editor for properties of LinkNode.
 *
 * @author Robert Long
 * @type {class component}
 */
export class LinkNodeEditor extends Component<LinkNodeEditorProps, {}> {
  // initializing iconComponent image name
  static iconComponent = Link

  //initializing description and will appears on LinkNodeEditor view
  static description = i18n.t('editor:properties.link.description')

  //function to handle change in href property of LinkNode
  onChangeHref = (href) => {
    CommandManager.instance.setPropertyOnSelection('href', href)
  }

  //rendering view of editor for properties of LinkNode
  render() {
    LinkNodeEditor.description = this.props.t('editor:properties.link.description')
    const node = this.props.node
    return (
      <NodeEditor description={LinkNodeEditor.description} {...this.props}>
        <InputGroup name="Url" label={this.props.t('editor:properties.link.lbl-url')}>
          <StringInput value={node.href} onChange={this.onChangeHref} />
        </InputGroup>
      </NodeEditor>
    )
  }
}

export default withTranslation()(LinkNodeEditor)
