import React, { memo, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import AutoSizer from 'react-virtualized-auto-sizer'
import { areEqual, FixedSizeList } from 'react-window'
import { MeshBasicMaterial } from 'three'

import exportMaterialsGLTF from '@xrengine/engine/src/assets/functions/exportMaterialsGLTF'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { SourceType } from '@xrengine/engine/src/renderer/materials/components/MaterialSource'
import { LibraryEntryType } from '@xrengine/engine/src/renderer/materials/constants/LibraryEntry'
import {
  entryId,
  hashMaterialSource,
  materialFromId,
  registerMaterial
} from '@xrengine/engine/src/renderer/materials/functions/Utilities'
import { MaterialLibrary, MaterialLibraryActions } from '@xrengine/engine/src/renderer/materials/MaterialLibrary'
import { createActionQueue, removeActionQueue, useHookEffect, useHookstate, useState } from '@xrengine/hyperflux'

import { Divider, Grid, Stack } from '@mui/material'

import { executeCommandWithHistory } from '../../classes/History'
import EditorCommands from '../../constants/EditorCommands'
import { uploadProjectFiles } from '../../functions/assetFunctions'
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
  const srcs = [...MaterialLibrary.sources.values()]
  const collapsedNodes = useHookstate(
    new Set<string>(srcs.map((src) => entryId(src, LibraryEntryType.MATERIAL_SOURCE)))
  )
  const createNodes = useCallback((): MaterialLibraryEntryType[] => {
    const result = srcs.flatMap((srcComp) => {
      const uuid = entryId(srcComp, LibraryEntryType.MATERIAL_SOURCE)
      const isCollapsed = collapsedNodes.value.has(uuid)
      return [
        {
          uuid,
          type: LibraryEntryType.MATERIAL_SOURCE,
          entry: srcComp,
          selected: selectionState.selectedEntities.value.some(
            (entity) => typeof entity === 'string' && entity === uuid
          ),
          active: selectionState.selectedEntities.value.at(-1) === uuid,
          isCollapsed
        },
        ...(isCollapsed
          ? []
          : srcComp.entries
              .filter((uuid) => MaterialLibrary.materials.has(uuid))
              .map((uuid) => {
                return {
                  uuid,
                  type: LibraryEntryType.MATERIAL,
                  entry: materialFromId(uuid),
                  selected: selectionState.selectedEntities.value.some(
                    (entity) => typeof entity === 'string' && entity === uuid
                  ),
                  active: selectionState.selectedEntities.value.at(-1) === uuid
                }
              }))
      ]
    })
    return result
  }, [])

  const nodes = useHookstate(createNodes())

  const onClick = useCallback((e: MouseEvent, node: MaterialLibraryEntryType) => {
    if (!editorState.lockPropertiesPanel.get()) {
      executeCommandWithHistory({
        type: EditorCommands.REPLACE_SELECTION,
        affectedNodes: [entryId(node.entry, node.type)]
      })
    }
  }, [])

  const onCollapse = useCallback((e: MouseEvent, node: MaterialLibraryEntryType) => {
    const isCollapsed = collapsedNodes.value.has(node.uuid)
    if (isCollapsed) {
      collapsedNodes.merge((_collapsedNodes) => {
        _collapsedNodes.delete(node.uuid)
        return _collapsedNodes
      })
    } else {
      collapsedNodes.merge((_collapsedNodes) => {
        _collapsedNodes.add(node.uuid)
        return _collapsedNodes
      })
    }
    nodeChanges.set(nodeChanges.get() + 1)
  }, [])

  useHookEffect(() => {
    nodes.set(createNodes())
  }, [nodeChanges, selectionState.selectedEntities])

  return (
    <>
      <div className={styles.panelContainer}>
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
                  onClick,
                  onCollapse
                }}
                itemKey={(index, _) => index}
                innerElementType="ul"
              >
                {MemoMatLibEntry}
              </FixedSizeList>
            )}
          </AutoSizer>
        </div>
        <div className={styles.panelSection} style={{ height: 'auto', padding: '8px' }}>
          <div className={styles.divider} />
          <Stack direction={'column'} spacing={2}>
            <Button
              onClick={() => {
                registerMaterial(new MeshBasicMaterial(), { path: '', type: SourceType.EDITOR_SESSION })
                nodeChanges.set(nodeChanges.get() + 1)
              }}
            >
              New
            </Button>
            <Button
              onClick={async () => {
                const projectName = editorState.projectName.value!
                const materials = selectionState.selectedEntities
                  .filter(
                    (selected) => typeof selected.value === 'string' && MaterialLibrary.materials.has(selected.value)
                  )
                  .map((selected) => materialFromId(selected.value as string))
                const libraryName = 'material-test.gltf'
                const path = `${Engine.instance.publicPath}/projects/${projectName}/assets/${libraryName}`
                const gltf = (await exportMaterialsGLTF(materials, {
                  binary: false,
                  path
                })!) as /*ArrayBuffer*/ { [key: string]: any }

                const blob = [JSON.stringify(gltf)]
                const file = new File(blob, libraryName)
                /*const pName = editorState.projectName.value!
                const blob = [gltf]
                const file = new File(blob, "material-test.glb")*/
                const urls = await Promise.all(uploadProjectFiles(projectName, [file], true).promises)
                console.log('exported material data to ', ...urls)
              }}
            >
              Save
            </Button>
          </Stack>
        </div>
      </div>
    </>
  )
}
