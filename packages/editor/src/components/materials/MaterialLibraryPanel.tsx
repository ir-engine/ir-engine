import React, { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import AutoSizer from 'react-virtualized-auto-sizer'
import { areEqual, FixedSizeList } from 'react-window'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { MaterialLibrary } from '@xrengine/engine/src/renderer/materials/MaterialLibrary'
import { useState } from '@xrengine/hyperflux'

import { Divider, Grid } from '@mui/material'

import { executeCommandWithHistory } from '../../classes/History'
import EditorCommands from '../../constants/EditorCommands'
import { useEditorState } from '../../services/EditorServices'
import { useSelectionState } from '../../services/SelectionServices'
import { HeirarchyTreeCollapsedNodeType } from '../hierarchy/HeirarchyTreeWalker'
import styles from '../hierarchy/styles.module.scss'
import MaterialLibraryEntry, { MaterialLibraryEntryType } from './MaterialLibraryEntry'

export default function MaterialLibraryPanel() {
  const { t } = useTranslation()
  const materials = MaterialLibrary.materials
  const editorState = useEditorState()
  const selectionState = useSelectionState()
  const MemoMatLibEntry = memo(MaterialLibraryEntry, areEqual)
  const onClick = useCallback((e: MouseEvent, node: MaterialLibraryEntryType) => {
    !editorState.lockPropertiesPanel.get() &&
      executeCommandWithHistory({
        type: EditorCommands.REPLACE_SELECTION,
        affectedNodes: [node.material.uuid]
      })
  }, [])
  return (
    <>
      <div className={styles.panelContainer}>
        <AutoSizer>
          {({ width, height }) => (
            <FixedSizeList
              height={height}
              width={width}
              itemSize={32}
              itemCount={materials.size}
              itemData={{
                nodes: [...MaterialLibrary.materials.values()].map(({ material, prototype }) => ({
                  uuid: material.uuid,
                  material,
                  prototype,
                  selected: selectionState.selectedEntities.value.some(
                    (selectedEntity) => typeof selectedEntity === 'string' && selectedEntity === material.uuid
                  ),
                  active:
                    selectionState.selectedEntities.value.at(selectionState.selectedEntities.length - 1) ===
                    material.uuid
                })),
                onClick
              }}
              itemKey={(index, _) => index}
              innerElementType="ul"
            >
              {MemoMatLibEntry}
            </FixedSizeList>
          )}
        </AutoSizer>
      </div>
    </>
  )
}
