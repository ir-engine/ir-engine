import React from 'react'
import { useTranslation } from 'react-i18next'

import GridViewIcon from '@mui/icons-material/GridView'

import NodeEditor from './NodeEditor'
import { EditorComponentType } from './Util'

/**
 * GroupNodeEditor used to render group of multiple objects.
 *
 * @type {class component}
 */
export const GroupNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.group.name')}
      description={t('editor:properties.group.description')}
    ></NodeEditor>
  )
}

GroupNodeEditor.iconComponent = GridViewIcon

export default GroupNodeEditor
