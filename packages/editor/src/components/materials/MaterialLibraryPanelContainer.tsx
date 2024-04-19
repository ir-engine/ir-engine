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

import React, { useEffect } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList } from 'react-window'
import { MeshBasicMaterial } from 'three'

import { MaterialSelectionState } from '@etherealengine/engine/src/scene/materials/MaterialLibraryState'
import { LibraryEntryType } from '@etherealengine/engine/src/scene/materials/constants/LibraryEntry'
import { getMutableState, getState, useState } from '@etherealengine/hyperflux'

import { Stack } from '@mui/material'
import { Not } from 'bitecs'

import { pathJoin } from '@etherealengine/common/src/utils/miscUtils'
import { EntityUUID, UUIDComponent, getComponent, useQuery } from '@etherealengine/ecs'
import { SourceComponent } from '@etherealengine/engine/src/scene/components/SourceComponent'
import { createMaterial } from '@etherealengine/engine/src/scene/materials/functions/materialSourcingFunctions'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { MaterialComponent } from '@etherealengine/spatial/src/renderer/materials/MaterialComponent'
import { uploadProjectFiles } from '../../functions/assetFunctions'
import { EditorState } from '../../services/EditorServices'
import styles from '../hierarchy/styles.module.scss'
import { Button } from '../inputs/Button'
import InputGroup from '../inputs/InputGroup'
import StringInput from '../inputs/StringInput'
import MaterialLibraryEntry, { MaterialLibraryEntryType } from './MaterialLibraryEntry'

import exportMaterialsGLTF from '@etherealengine/engine/src/scene/materials/functions/exportMaterialsGLTF'

export default function MaterialLibraryPanel() {
  const nodeChanges = useState(0)
  const srcPath = useState('/mat/material-test')

  const materialQuery = useQuery([MaterialComponent, UUIDComponent, SourceComponent, Not(VisibleComponent)])
  const nodes = useState([] as MaterialLibraryEntryType[])

  useEffect(() => {
    const materials = Object.values(MaterialComponent.materialByHash)
    const result = materials.flatMap((uuid): MaterialLibraryEntryType[] => {
      const source = getComponent(UUIDComponent.getEntityByUUID(uuid as EntityUUID), SourceComponent)
      return [
        {
          uuid: uuid,
          path: source,
          type: LibraryEntryType.MATERIAL
        }
      ]
    })
    nodes.set(result)
  }, [nodeChanges, materialQuery])

  const onClick = (e: MouseEvent, node: MaterialLibraryEntryType) => {
    getMutableState(MaterialSelectionState).selectedMaterial.set(node.uuid)
  }

  // const onCollapse = useCallback((e: MouseEvent, node: MaterialLibraryEntryType) => {
  //   const isCollapsed = collapsedNodes.value.has(node.uuid)
  //   if (isCollapsed) {
  //     collapsedNodes.merge((_collapsedNodes) => {
  //       _collapsedNodes.delete(node.uuid)
  //       return _collapsedNodes
  //     })
  //   } else {
  //     collapsedNodes.merge((_collapsedNodes) => {
  //       _collapsedNodes.add(node.uuid)
  //       return _collapsedNodes
  //     })
  //   }
  //   nodeChanges.set(nodeChanges.get() + 1)
  // }, [])
  const MemoMatLibEntry = MaterialLibraryEntry

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
                  nodes: nodes.value,
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
        <div className={styles.panelSection} style={{ height: 'auto', padding: '8px' }}>
          <div className={styles.divider} />
          <Stack direction={'column'} spacing={2}>
            <Button
              onClick={() => {
                createMaterial(new MeshBasicMaterial(), '')
                nodeChanges.set(nodeChanges.get() + 1)
              }}
            >
              New
            </Button>
            <InputGroup name="File Path" label="File Path">
              <StringInput value={srcPath.value} onChange={srcPath.set} />
            </InputGroup>
            <Button
              onClick={async () => {
                const projectName = getState(EditorState).projectName!
                const materials = getState(MaterialSelectionState).selectedMaterial ?? ('' as EntityUUID)
                let libraryName = srcPath.value
                if (!libraryName.endsWith('.material.gltf')) {
                  libraryName += '.material.gltf'
                }
                const relativePath = pathJoin('assets', libraryName)
                const gltf = (await exportMaterialsGLTF(materials, {
                  binary: false,
                  relativePath
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
