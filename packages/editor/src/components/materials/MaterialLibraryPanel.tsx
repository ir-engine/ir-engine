/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React, { memo, useCallback, useEffect } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import { areEqual, FixedSizeList } from 'react-window'
import { MeshBasicMaterial } from 'three'

import exportMaterialsGLTF from '@etherealengine/engine/src/assets/functions/exportMaterialsGLTF'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { SourceType } from '@etherealengine/engine/src/renderer/materials/components/MaterialSource'
import { LibraryEntryType } from '@etherealengine/engine/src/renderer/materials/constants/LibraryEntry'
import {
  entryId,
  materialFromId,
  registerMaterial
} from '@etherealengine/engine/src/renderer/materials/functions/MaterialLibraryFunctions'
import { MaterialLibraryState } from '@etherealengine/engine/src/renderer/materials/MaterialLibrary'
import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import { Stack } from '@mui/material'

import { uploadProjectFiles } from '../../functions/assetFunctions'
import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { EditorState } from '../../services/EditorServices'
import { SelectionState } from '../../services/SelectionServices'
import styles from '../hierarchy/styles.module.scss'
import { Button } from '../inputs/Button'
import MaterialLibraryEntry, { MaterialLibraryEntryType } from './MaterialLibraryEntry'

export default function MaterialLibraryPanel() {
  const editorState = useHookstate(getMutableState(EditorState))
  const selectionState = useHookstate(getMutableState(SelectionState))
  const materialLibrary = useHookstate(getMutableState(MaterialLibraryState))
  const MemoMatLibEntry = memo(MaterialLibraryEntry, areEqual)
  const nodeChanges = useHookstate(0)
  const publicPath = getState(EngineState).publicPath

  const createSrcs = useCallback(() => Object.values(materialLibrary.sources.value), [materialLibrary.sources])
  const srcs = useHookstate(createSrcs())
  useEffect(srcs.set.bind({}, createSrcs), [materialLibrary.sources])

  const collapsedSrcs = useCallback(
    () => new Set<string>(srcs.value.map((src) => entryId(src, LibraryEntryType.MATERIAL_SOURCE))),
    [srcs]
  )

  const collapsedNodes = useHookstate(collapsedSrcs())
  const createNodes = useCallback(
    (): MaterialLibraryEntryType[] =>
      srcs.value.flatMap((srcComp) => {
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
                .filter((uuid) => !!materialLibrary.materials[uuid].value)
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
      }),
    [nodeChanges, srcs, selectionState.selectedEntities]
  )

  const nodes = useHookstate(createNodes())

  const onClick = useCallback((e: MouseEvent, node: MaterialLibraryEntryType) => {
    if (!editorState.lockPropertiesPanel.get()) {
      EditorControlFunctions.replaceSelection([entryId(node.entry, node.type)])
      selectionState.objectChangeCounter.set(selectionState.objectChangeCounter.value + 1)
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

  useEffect(() => {
    nodes.set(createNodes())
  }, [nodeChanges, selectionState.selectedEntities, srcs])

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
                    (selected) => typeof selected.value === 'string' && !!materialLibrary.materials[selected.value]
                  )
                  .map((selected) => materialFromId(selected.value as string))
                const libraryName = 'material-test.gltf'
                const path = `${publicPath}/projects/${projectName}/assets/${libraryName}`
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
