import React from 'react'

import LocalFlorist from '@mui/icons-material/LocalFlorist'

import { useEditorState } from '../../services/EditorServices'
import { PanelDragContainer, PanelIcon, PanelTitle } from '../layout/Panel'
import styles from '../styles.module.scss'

export const MaterialLibraryPanelTitle = () => {
  return (
    <div className={styles.dockableTab}>
      <PanelDragContainer>
        <PanelIcon as={LocalFlorist} size={12} />
        <PanelTitle>Material Library</PanelTitle>
      </PanelDragContainer>
    </div>
  )
}
