import React from 'react'

import AccountTreeIcon from '@mui/icons-material/AccountTree'

import { PanelDragContainer, PanelIcon, PanelTitle } from '../layout/Panel'
import styles from '../styles.module.scss'

export const HierarchyPanelTitle = () => {
  return (
    <div className={styles.dockableTab}>
      <PanelDragContainer>
        <PanelIcon as={AccountTreeIcon} size={12} />
        <PanelTitle>Hierarchy</PanelTitle>
      </PanelDragContainer>
    </div>
  )
}
