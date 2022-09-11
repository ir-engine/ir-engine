import React, { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import AutoSizer from 'react-virtualized-auto-sizer'
import { areEqual, FixedSizeList } from 'react-window'
import { MeshBasicMaterial } from 'three'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { registerMaterial } from '@xrengine/engine/src/renderer/materials/functions/Utilities'
import { MaterialLibrary } from '@xrengine/engine/src/renderer/materials/MaterialLibrary'
import { useHookEffect, useHookstate, useState } from '@xrengine/hyperflux'

import { Divider, Grid, Stack } from '@mui/material'

import { executeCommandWithHistory } from '../../classes/History'
import EditorCommands from '../../constants/EditorCommands'
import { useEditorState } from '../../services/EditorServices'
import { useSelectionState } from '../../services/SelectionServices'
import { HeirarchyTreeCollapsedNodeType } from '../hierarchy/HeirarchyTreeWalker'
import styles from '../hierarchy/styles.module.scss'
import { Button } from '../inputs/Button'
import MaterialLibraryEntry, { MaterialLibraryEntryType } from './MaterialLibraryEntry'

export default function MaterialLibraryPanel() {
  const { t } = useTranslation()
  const editorState = useEditorState()
  const selectionState = useSelectionState()
  const MemoMatLibEntry = memo(MaterialLibraryEntry, areEqual)

  const nodeChanges = useHookstate(0)
  const createNodes = useCallback(() => {
    const result = [...MaterialLibrary.materials.values()].map(({ material, prototype }) => ({
      uuid: material.uuid,
      material,
      prototype,
      selected: selectionState.selectedEntities.value.some(
        (selectedEntity) => typeof selectedEntity === 'string' && selectedEntity === material.uuid
      ),
      active: selectionState.selectedEntities.value.at(selectionState.selectedEntities.length - 1) === material.uuid
    }))
    return result
  }, [])

  const nodes = useHookstate(createNodes())

  const onClick = useCallback((e: MouseEvent, node: MaterialLibraryEntryType) => {
    if (!editorState.lockPropertiesPanel.get()) {
      executeCommandWithHistory({
        type: EditorCommands.REPLACE_SELECTION,
        affectedNodes: [node.material.uuid]
      })
    }
  }, [])

  useHookEffect(() => {
    nodes.set(createNodes())
  }, [nodeChanges, selectionState.selectedEntities])

  return (
    <>
      <div className={styles.panelContainer}>
        <div className={styles.panelSection} style={{ height: 'auto' }}>
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
        </div>
        <div className={styles.panelSection}>
          <AutoSizer>
            {({ width, height }) => (
              <FixedSizeList
                height={height}
                width={width}
                itemSize={32}
                itemCount={nodes.length}
                itemData={{
                  nodes: nodes.get(),
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
        <div className={styles.panelSection} style={{ height: 'auto' }}>
          <div className={styles.divider} />
          <Stack direction={'column'} spacing={1}>
            <Button
              onClick={() => {
                registerMaterial(new MeshBasicMaterial(), { type: 'EDITOR_SESSION' })
                nodeChanges.set(nodeChanges.get() + 1)
              }}
            >
              New
            </Button>
          </Stack>
        </div>
      </div>
    </>
  )
}
