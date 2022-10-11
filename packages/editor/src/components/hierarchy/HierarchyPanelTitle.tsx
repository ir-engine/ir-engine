import { t } from 'i18next'
import React from 'react'

import { dispatchAction } from '@xrengine/hyperflux'

import AccountTreeIcon from '@mui/icons-material/AccountTree'
import { Checkbox } from '@mui/material'

import { EditorAction, useEditorState } from '../../services/EditorServices'
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
