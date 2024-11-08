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

import { useHookstate } from '@hookstate/core'
import { EntityUUID, getComponent, getOptionalComponent, hasComponent, useQuery, UUIDComponent } from '@ir-engine/ecs'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { getMaterialsFromScene } from '@ir-engine/engine/src/scene/materials/functions/materialSourcingFunctions'
import { getMutableState } from '@ir-engine/hyperflux'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import InputGroup from '@ir-engine/ui/src/components/editor/input/Group'
import StringInput from '@ir-engine/ui/src/components/editor/input/String'
import { PanelDragContainer, PanelTitle } from '@ir-engine/ui/src/components/editor/layout/Panel'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import { TabData } from 'rc-dock'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiFilter, HiGlobeAlt } from 'react-icons/hi'
import { SelectionState } from '../../services/SelectionServices'
import { FixedSizeListWrapper, MATERIALS_PANEL_ID, saveMaterial } from './helpers'
import MaterialLayerNode from './layernode'
import { MaterialPreviewer } from './materialpreviewer'

const MaterialsPanelTitle = () => {
  const { t } = useTranslation()
  return (
    <div>
      <PanelDragContainer>
        <PanelTitle>
          <span>{t('editor:materialLibrary.tab-materials')}</span>
        </PanelTitle>
      </PanelDragContainer>
    </div>
  )
}

export const MaterialsPanelTab: TabData = {
  id: MATERIALS_PANEL_ID,
  closable: true,
  title: <MaterialsPanelTitle />,
  content: <MaterialsLibrary />
}

function MaterialsLibrary() {
  const { t } = useTranslation()
  const srcPath = useHookstate('/mat/material-test')
  const materialQuery = useQuery([MaterialStateComponent])
  const nodes = useHookstate<EntityUUID[]>([])
  const selectedEntities = useHookstate(getMutableState(SelectionState).selectedEntities)
  const showLayers = useHookstate(false)

  useEffect(() => {
    const materials =
      selectedEntities.value.length && showLayers.value
        ? getMaterialsFromScene(UUIDComponent.getEntityByUUID(selectedEntities.value[0]))
        : materialQuery
            .map((entity) => getComponent(entity, UUIDComponent))
            .filter((uuid) => uuid !== MaterialStateComponent.fallbackMaterial)

    const materialsBySource = {} as Record<string, string[]>
    for (const uuid of materials) {
      const source = getOptionalComponent(UUIDComponent.getEntityByUUID(uuid as EntityUUID), SourceComponent) ?? ''
      if (!hasComponent(UUIDComponent.getEntityByUUID(uuid as EntityUUID), MaterialStateComponent)) continue
      materialsBySource[source] = materialsBySource[source] ? [...materialsBySource[source], uuid] : [uuid]
    }
    const materialsBySourceArray = Object.entries(materialsBySource)
    const flattenedMaterials = materialsBySourceArray.reduce(
      (acc: (EntityUUID | string)[], [source, uuids]) => acc.concat([source], uuids),
      []
    ) as EntityUUID[]
    nodes.set(flattenedMaterials)
  }, [materialQuery.length, selectedEntities, showLayers])

  return (
    <div className="h-full overflow-scroll">
      <div className="w-full rounded-md p-3">
        <MaterialPreviewer />
        <div className="mt-4 flex h-5 items-center gap-2">
          <InputGroup name="File Path" label="Save to" className="flex-grow">
            <StringInput value={srcPath.value} onChange={srcPath.set} />
          </InputGroup>
          <Button
            className="flex w-5 flex-grow items-center justify-center text-xs"
            variant="outline"
            onClick={() => saveMaterial(srcPath.value)}
          >
            {t('common:components.save')}
          </Button>
          <div className="mx-2 h-full border-l" />
          <Button
            className="flex w-10 flex-grow items-center justify-center text-xs"
            variant="outline"
            onClick={() => {
              showLayers.set((prevValue) => !prevValue)
            }}
          >
            {showLayers.value ? <HiFilter /> : <HiGlobeAlt />}
          </Button>
        </div>
      </div>
      <FixedSizeListWrapper nodes={nodes.value}>{MaterialLayerNode}</FixedSizeListWrapper>
    </div>
  )
}
