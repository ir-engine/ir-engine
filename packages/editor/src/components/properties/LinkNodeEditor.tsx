import React from 'react'
import LinkIcon from '@mui/icons-material/Link'
import InputGroup from '../inputs/InputGroup'
import StringInput from '../inputs/StringInput'
import NodeEditor from './NodeEditor'
import { useTranslation } from 'react-i18next'
import { CommandManager } from '../../managers/CommandManager'

//declaring properties for LinkNodeEditor
type LinkNodeEditorProps = {
  node?: any
}

/**
 * LinkNodeEditor provides the editor for properties of LinkNode.
 *
 * @author Robert Long
 * @type {class component}
 */
export const LinkNodeEditor = (props: LinkNodeEditorProps) => {
  const { t } = useTranslation()
  //function to handle change in href property of LinkNode
  const onChangeHref = (href) => {
    CommandManager.instance.setPropertyOnSelection('href', href)
  }

  //rendering view of editor for properties of LinkNode
  const node = props.node

  return (
    <NodeEditor description={t('editor:properties.link.description')} {...props}>
      <InputGroup name="Url" label={t('editor:properties.link.lbl-url')}>
        <StringInput value={node.href} onChange={onChangeHref} />
      </InputGroup>
    </NodeEditor>
  )
}

LinkNodeEditor.iconComponent = LinkIcon

export default LinkNodeEditor
