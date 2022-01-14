import React from 'react'
import LanguageIcon from '@mui/icons-material/Language'
import NodeEditor from './NodeEditor'
import { EditorComponentType } from './Util'

/**
 * DefaultNodeEditor  used to render view when no element is selected
 *
 * @author Robert Long
 */
export const DefaultNodeEditor: EditorComponentType = (props) => {
  return <NodeEditor {...props} />
}

DefaultNodeEditor.iconComponent = LanguageIcon
