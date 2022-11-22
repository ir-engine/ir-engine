import React from 'react'

import GraphIcon from '@mui/icons-material/AutoGraph'

import { PanelDragContainer, PanelIcon, PanelTitle } from '../layout/Panel'
import styles from '../styles.module.scss'

export const GraphPanelTitle = () => {
  return (
    <div className={styles.dockableTab}>
      <PanelDragContainer>
        <PanelIcon as={GraphIcon} size={12} />
        <PanelTitle>Graph</PanelTitle>
      </PanelDragContainer>
    </div>
  )
}
