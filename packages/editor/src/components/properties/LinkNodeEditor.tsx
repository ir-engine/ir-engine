import { Link } from '@styled-icons/fa-solid/Link'
import React from 'react'
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
const LinkNodeEditor = (props: LinkNodeEditorProps) => {
  //function to handle change in href property of LinkNode
  const onChangeHref = (href) => {
    CommandManager.instance.setPropertyOnSelection('href', href)
  }

  //rendering view of editor for properties of LinkNode
  const node = props.node

  return (
    <NodeEditor description={LinkNodeEditor.description} {...props}>
      <InputGroup name="Url" label={props.t('editor:properties.link.lbl-url')}>
        <StringInput value={node.href} onChange={onChangeHref} />
      </InputGroup>
    </NodeEditor>
  )
}

LinkNodeEditor.iconComponent = Link
LinkNodeEditor.description = i18n.t('editor:properties.link.description')

export default withTranslation()(LinkNodeEditor)
