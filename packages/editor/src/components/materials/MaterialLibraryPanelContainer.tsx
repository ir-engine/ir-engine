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

import { Stack } from '@mui/material'
import React, { useEffect } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList } from 'react-window'
import { MeshBasicMaterial } from 'three'

import { pathJoin } from '@etherealengine/common/src/utils/miscUtils'
import { EntityUUID, getComponent, UndefinedEntity, useQuery, UUIDComponent } from '@etherealengine/ecs'
import exportMaterialsGLTF from '@etherealengine/engine/src/assets/functions/exportMaterialsGLTF'
import { SourceComponent } from '@etherealengine/engine/src/scene/components/SourceComponent'
import {
  createMaterialEntity,
  getMaterialsFromSource
} from '@etherealengine/engine/src/scene/materials/functions/materialSourcingFunctions'
import { MaterialSelectionState } from '@etherealengine/engine/src/scene/materials/MaterialLibraryState'
import { getMutableState, getState, useHookstate, useState } from '@etherealengine/hyperflux'
import { MaterialComponent, MaterialComponents } from '@etherealengine/spatial/src/renderer/materials/MaterialComponent'

import { uploadProjectFiles } from '../../functions/assetFunctions'
import { EditorState } from '../../services/EditorServices'
import { SelectionState } from '../../services/SelectionServices'
import { ImportSettingsState } from '../assets/ImportSettingsPanel'
import styles from '../hierarchy/styles.module.scss'
import { Button } from '../inputs/Button'
import InputGroup from '../inputs/InputGroup'
import StringInput from '../inputs/StringInput'
import MaterialLibraryEntry, { MaterialLibraryEntryType } from './MaterialLibraryEntry'

export default function MaterialLibraryPanel() {
  const srcPath = useState('/mat/material-test')

  const materialQuery = useQuery([MaterialComponent[MaterialComponents.State]])
  const nodes = useHookstate([] as MaterialLibraryEntryType[])
  const selected = useHookstate(getMutableState(SelectionState).selectedEntities)

  useEffect(() => {
    const materials = selected.value.length
      ? getMaterialsFromSource(UUIDComponent.getEntityByUUID(selected.value[0]))
      : materialQuery.map((entity) => getComponent(entity, UUIDComponent))
    const result = materials.flatMap((uuid): MaterialLibraryEntryType[] => {
      const source = getComponent(UUIDComponent.getEntityByUUID(uuid as EntityUUID), SourceComponent)
      return [
        {
          uuid: uuid,
          path: source
        }
      ]
    })
    nodes.set(result)
  }, [materialQuery.length, selected])

  const onClick = (e: MouseEvent, node: MaterialLibraryEntryType) => {
    getMutableState(MaterialSelectionState).selectedMaterial.set(node.uuid)
  }

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
                {MaterialLibraryEntry}
              </FixedSizeList>
            )}
          </AutoSizer>
        </div>
        <div className={styles.panelSection} style={{ height: 'auto', padding: '8px' }}>
          <div className={styles.divider} />
          <Stack direction={'column'} spacing={2}>
            <Button
              onClick={() => {
                const newMaterial = new MeshBasicMaterial({ name: 'New Material' })
                createMaterialEntity(newMaterial, '', UndefinedEntity)
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
                const materialUUID = getState(MaterialSelectionState).selectedMaterial ?? ('' as EntityUUID)
                let libraryName = srcPath.value
                if (!libraryName.endsWith('.material.gltf')) {
                  libraryName += '.material.gltf'
                }
                const relativePath = pathJoin('assets', libraryName)
                const gltf = (await exportMaterialsGLTF([UUIDComponent.getEntityByUUID(materialUUID)], {
                  binary: false,
                  relativePath,
                  projectName
                })!) as { [key: string]: any }
                const blob = [JSON.stringify(gltf)]
                const file = new File(blob, libraryName)
                const importSettings = getState(ImportSettingsState)
                const urls = await Promise.all(
                  uploadProjectFiles(projectName, [file], [`projects/${projectName}${importSettings.importFolder}`])
                    .promises
                )
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
