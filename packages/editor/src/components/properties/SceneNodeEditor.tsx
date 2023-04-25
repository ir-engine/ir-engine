import React from 'react'
import { useTranslation } from 'react-i18next'

import LanguageIcon from '@mui/icons-material/Language'

import NodeEditor from './NodeEditor'
import { EditorComponentType } from './Util'

export const SceneNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.scene.name')}
      description={t('editor:properties.scene.description')}
    />
  )
}

SceneNodeEditor.iconComponent = LanguageIcon

export default SceneNodeEditor
