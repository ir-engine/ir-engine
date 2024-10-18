/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { API } from '@ir-engine/common'
import { staticResourcePath } from '@ir-engine/common/src/schema.type.module'
import { EntityUUID, UUIDComponent } from '@ir-engine/ecs'
import exportMaterialsGLTF from '@ir-engine/engine/src/assets/functions/exportMaterialsGLTF'
import { pathJoin } from '@ir-engine/engine/src/assets/functions/miscUtils'
import { MaterialSelectionState } from '@ir-engine/engine/src/scene/materials/MaterialLibraryState'
import { getState, useHookstate } from '@ir-engine/hyperflux'
import React, { useEffect, useRef } from 'react'
import { FixedSizeList, ListProps } from 'react-window'
import { uploadProjectFiles } from '../../functions/assetFunctions'
import { EditorState } from '../../services/EditorServices'
import { ImportSettingsState } from '../../services/ImportSettingsState'

export const MATERIALS_PANEL_ID = 'materialsPanel'

export function FixedSizeListWrapper({
  nodes,
  children
}: {
  nodes: readonly EntityUUID[]
  children: ListProps<{ nodes: EntityUUID[] }>['children']
}) {
  const ref = useRef<HTMLDivElement>(null)
  const listDimensions = useHookstate({
    height: 0,
    width: 0
  })

  useEffect(() => {
    if (!ref.current) return
    const handleResize = () => {
      const { height, width } = ref.current!.getBoundingClientRect()
      listDimensions.set({ height, width })
    }
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(ref.current)
    return () => resizeObserver.disconnect()
  }, [])

  return (
    <div ref={ref} className="h-full overflow-hidden">
      <FixedSizeList
        height={listDimensions.height.value}
        width={listDimensions.width.value}
        itemSize={32}
        itemCount={nodes.length}
        itemData={{
          nodes
        }}
        itemKey={(index) => index}
        innerElementType="ul"
      >
        {children}
      </FixedSizeList>
    </div>
  )
}

export async function saveMaterial(sourcePath: string) {
  const projectName = getState(EditorState).projectName!
  const materialUUID = getState(MaterialSelectionState).selectedMaterial ?? ('' as EntityUUID)
  if (!sourcePath.endsWith('.material.gltf')) {
    sourcePath += '.material.gltf'
  }
  const relativePath = pathJoin('assets', sourcePath)
  const gltf = (await exportMaterialsGLTF([UUIDComponent.getEntityByUUID(materialUUID)], {
    binary: false,
    relativePath,
    projectName
  })!) as { [key: string]: any }
  const blob = [JSON.stringify(gltf)]
  const file = new File(blob, sourcePath)
  const importSettings = getState(ImportSettingsState)
  const urls = await Promise.all(
    uploadProjectFiles(projectName, [file], [`projects/${projectName}${importSettings.importFolder}`]).promises
  )
  const adjustedLibraryName = sourcePath.length > 0 ? sourcePath.substring(1) : ''
  const key = `projects/${projectName}${importSettings.importFolder}${adjustedLibraryName}`
  const resources = await API.instance.service(staticResourcePath).find({
    query: { key: key }
  })
  if (resources.data.length === 0) {
    throw new Error('User not found')
  }
  const resource = resources.data[0]
  const tags = ['Material']
  await API.instance.service(staticResourcePath).patch(resource.id, { tags: tags, project: projectName })
  console.log('exported material data to ', ...urls)
}
