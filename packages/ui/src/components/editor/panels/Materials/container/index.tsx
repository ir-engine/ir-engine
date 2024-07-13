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

import { pathJoin } from '@etherealengine/common/src/utils/miscUtils'
import { EntityUUID, getComponent, UndefinedEntity, useQuery, UUIDComponent } from '@etherealengine/ecs'
import { ImportSettingsState } from '@etherealengine/editor/src/components/assets/ImportSettingsPanel'
import { uploadProjectFiles } from '@etherealengine/editor/src/functions/assetFunctions'
import { EditorState } from '@etherealengine/editor/src/services/EditorServices'
import { SelectionState } from '@etherealengine/editor/src/services/SelectionServices'
import exportMaterialsGLTF from '@etherealengine/engine/src/assets/functions/exportMaterialsGLTF'
import { SourceComponent } from '@etherealengine/engine/src/scene/components/SourceComponent'
import { getMaterialsFromScene } from '@etherealengine/engine/src/scene/materials/functions/materialSourcingFunctions'
import { MaterialSelectionState } from '@etherealengine/engine/src/scene/materials/MaterialLibraryState'
import { getMutableState, getState, useHookstate, useState } from '@etherealengine/hyperflux'
import { MaterialStateComponent } from '@etherealengine/spatial/src/renderer/materials/MaterialComponent'
import { createAndAssignMaterial } from '@etherealengine/spatial/src/renderer/materials/materialFunctions'
import { useTranslation } from 'react-i18next'
import Button from '../../../../../primitives/tailwind/Button'
import InputGroup from '../../../input/Group'
import StringInput from '../../../input/String'
import { MaterialPreviewPanel } from '../../preview/material'
import MaterialLibraryEntry, { MaterialLibraryEntryType } from '../node'

export default function MaterialLibraryPanel() {
  const { t } = useTranslation()
  const srcPath = useState('/mat/material-test')
  const materialPreviewPanelRef = React.useRef()

  const materialQuery = useQuery([MaterialStateComponent])
  const nodes = useHookstate([] as MaterialLibraryEntryType[])
  const selected = useHookstate(getMutableState(SelectionState).selectedEntities)

  useEffect(() => {
    const materials = selected.value.length
      ? getMaterialsFromScene(UUIDComponent.getEntityByUUID(selected.value[0]))
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

  const MaterialList = ({ height, width }) => (
    <FixedSizeList
      height={height - 32}
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
  )

  return (
    <div className="h-full overflow-scroll">
      <div className="w-full rounded-[5px] p-3">
        <div className="rounded-lg bg-zinc-800 p-2">
          <MaterialPreviewPanel ref={materialPreviewPanelRef} />
        </div>
        <div className="w-full">
          <InputGroup name="File Path" label="File Path">
            <StringInput value={srcPath.value} onChange={srcPath.set} />
          </InputGroup>
          <div className="flex-between flex h-7 gap-3">
            <Button
              className="w-full text-xs"
              variant="outline"
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
                  relativePath
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
            <Button
              className="w-full text-xs"
              onClick={() => {
                const selectedEntities = getState(SelectionState).selectedEntities
                createAndAssignMaterial(
                  UUIDComponent.getEntityByUUID(selectedEntities[selectedEntities.length - 1] ?? UndefinedEntity),
                  new MeshBasicMaterial({ name: 'New Material' })
                )
              }}
            >
              New
            </Button>
          </div>
        </div>
      </div>
      <div id="material-panel" className="h-full overflow-hidden">
        <AutoSizer onResize={MaterialList}>{MaterialList}</AutoSizer>
      </div>
    </div>
  )
}
