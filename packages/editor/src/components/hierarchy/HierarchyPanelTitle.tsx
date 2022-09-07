import { t } from 'i18next'
import React from 'react'

import { dispatchAction } from '@xrengine/hyperflux'

import AccountTreeIcon from '@mui/icons-material/AccountTree'
import { Checkbox } from '@mui/material'

import { EditorAction, useEditorState } from '../../services/EditorServices'
import { PanelDragContainer, PanelIcon, PanelTitle } from '../layout/Panel'
import Search from '../Search/Search'
import styles from '../styles.module.scss'

type Props = {
  setSearchElement: (input: any) => void
  setSearchHierarchy: (input: any) => void
}

export const HierarchyPanelTitle = ({ setSearchElement, setSearchHierarchy }: Props) => {
  const editorState = useEditorState()

  const handleInputChangeHierarchy = (searchInput) => {
    setSearchHierarchy(searchInput)
  }
  const handleInputChangeElement = (searchInput) => {
    setSearchElement(searchInput)
  }

  return (
    <div className={styles.dockableTab}>
      <PanelDragContainer>
        <PanelIcon as={AccountTreeIcon} size={12} />
        <PanelTitle>Hierarchy</PanelTitle>
      </PanelDragContainer>
      <div className={styles.dockableTabButtons}>
        {editorState.advancedMode.value && (
          <>
            {t('editor:hierarchy.lbl-explode')}
            <Checkbox
              style={{ padding: '0px' }}
              value={editorState.showObject3DInHierarchy.value}
              onChange={(e, value) =>
                dispatchAction(EditorAction.showObject3DInHierarchy({ showObject3DInHierarchy: value }))
              }
            />
          </>
        )}
        <Search elementsName="hierarchy" handleInputChange={handleInputChangeHierarchy} />
      </div>
    </div>
  )
}
