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
import { HeirarchyTreeCollapsedNodeType } from '../hierarchy/HeirarchyTreeWalker'
import styles from '../hierarchy/styles.module.scss'
import MaterialLibraryEntry, { MaterialLibraryEntryType } from './MaterialLibraryEntry'

export default function MaterialLibraryPanel() {
  const { t } = useTranslation()
  const materials = MaterialLibrary.materials
  const editorState = useEditorState()
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
        <Grid container spacing={1}>
          <Grid item xs={1}></Grid>
          <Grid item xs={3}>
            <b>Name</b>
          </Grid>
          <Grid item xs={3}>
            <b>Prototype</b>
          </Grid>
          <Grid item xs={3}>
            <b>Uuid</b>
          </Grid>
        </Grid>
        <div className={styles.divider} />
        <AutoSizer>
          {({ width, height }) => (
            <FixedSizeList
              height={height}
              width={width}
              itemSize={32}
              itemCount={materials.size}
              itemData={{
                nodes: [...MaterialLibrary.materials.values()].map(({ material, prototype }) => ({
                  material,
                  prototype
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
