import React from 'react'
import NodeEditor from './NodeEditor'
import GridViewIcon from '@mui/icons-material/GridView'
import { useTranslation } from 'react-i18next'
import { EditorComponentType } from './Util'

/**
 * GroupNodeEditor used to render group of multiple objects.
 *
 * @author Robert Long
 * @type {class component}
 */
export const GroupNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  return <NodeEditor {...props} description={t('editor:properties.group.description')} />
}

GroupNodeEditor.iconComponent = GridViewIcon

export default GroupNodeEditor
