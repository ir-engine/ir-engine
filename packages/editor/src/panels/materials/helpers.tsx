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
    relativePath
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
