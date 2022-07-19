import React from 'react'
import { useTranslation } from 'react-i18next'

import NodeEditor from './NodeEditor'
import { EditorPropType } from './Util'

export const MountPointNodeEditor: React.FC<EditorPropType> = (props) => {
  const { t } = useTranslation()
  return <NodeEditor description={t('editor:properties.mountPoint.description')} {...props} />
}

export default MountPointNodeEditor
