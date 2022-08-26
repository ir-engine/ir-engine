import React from 'react'
import { useTranslation } from 'react-i18next'

import { Map as _Map } from '@mui/icons-material'

import NodeEditor from './NodeEditor'
import { EditorComponentType } from './Util'

/** Just a placeholder for the navmesh editor, for now. */
export const NavMeshNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.navMesh.name')}
      description={t('editor:properties.navMesh.description')}
    ></NodeEditor>
  )
}

NavMeshNodeEditor.iconComponent = _Map

export default NavMeshNodeEditor
