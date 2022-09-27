import React from 'react'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { dispatchAction } from '@xrengine/hyperflux'

import LockIcon from '@mui/icons-material/Lock'
import UnlockIcon from '@mui/icons-material/LockOpen'
import TuneIcon from '@mui/icons-material/Tune'

import { EditorAction, useEditorState } from '../../services/EditorServices'
import { useSelectionState } from '../../services/SelectionServices'
import { PanelDragContainer, PanelIcon, PanelTitle } from '../layout/Panel'
import styles from '../styles.module.scss'

export const PropertiesPanelTitle = () => {
  const selectionState = useSelectionState()
  const editorState = useEditorState()

  return (
    <div className={styles.dockableTab}>
      <PanelDragContainer>
        <PanelIcon as={TuneIcon} size={12} />
        <PanelTitle>Properties</PanelTitle>
        <div className={styles.dockableTabButtons}>
          {editorState.advancedMode.value && (
            <button
              onClick={() => {
                const currentEntity = selectionState.selectedEntities.value[0]
                const currentState = editorState.lockPropertiesPanel.value
                if (currentState) {
                  dispatchAction(
                    EditorAction.lockPropertiesPanel({
                      lockPropertiesPanel: ''
                    })
                  )
                } else {
                  if (currentEntity) {
                    dispatchAction(
                      EditorAction.lockPropertiesPanel({
                        lockPropertiesPanel:
                          typeof currentEntity === 'string'
                            ? currentEntity
                            : Engine.instance.currentWorld.entityTree.entityNodeMap.get(currentEntity)!.uuid
                      })
                    )
                  }
                }
              }}
            >
              <PanelIcon as={editorState.lockPropertiesPanel.value ? LockIcon : UnlockIcon} size={10} />
              <PanelTitle>{editorState.lockPropertiesPanel.value ? 'Unlock' : 'Lock'}</PanelTitle>
            </button>
          )}
        </div>
      </PanelDragContainer>
    </div>
  )
}
