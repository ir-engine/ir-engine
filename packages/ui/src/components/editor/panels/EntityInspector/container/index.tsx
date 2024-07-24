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

import React from 'react'
import { useTranslation } from 'react-i18next'
import { JSONTree } from 'react-json-tree'

import { UUIDComponent } from '@etherealengine/ecs'
import { getAllComponents, useComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { EntityUUID } from '@etherealengine/ecs'
import { EditorState } from '@etherealengine/editor/src/services/EditorServices'
import { SelectionState } from '@etherealengine/editor/src/services/SelectionServices'
import { MaterialSelectionState } from '@etherealengine/engine/src/scene/materials/MaterialLibraryState'
import PropertyGroup from '../../../properties/group'

const EntityComponentEditor = (props: { entity; component }) => {
  const { t } = useTranslation()
  const { entity, component } = props
  const data = useComponent(entity, component)
  return (
    <PropertyGroup name={`${component.name} - ${component.jsonID}`}>
      <JSONTree data={data.value} postprocessValue={(v: any) => v?.value ?? v} />
    </PropertyGroup>
  )
}

const ECSInspector = (props: { entityUUID: EntityUUID }) => {
  const { entityUUID } = props

  const entity = UUIDComponent.getEntityByUUID(entityUUID)
  const components = getAllComponents(entity)

  return (
    <>
      {components.map((c) => (
        <EntityComponentEditor key={`${entityUUID + entity}-${c.name}`} entity={entity} component={c} />
      ))}
    </>
  )
}

/**
 * PropertiesPanelContainer used to render editor view to customize property of selected element.
 */
export const PropertiesPanelContainer = () => {
  const selectedEntities = useHookstate(getMutableState(SelectionState).selectedEntities).value
  const lockedNode = useHookstate(getMutableState(EditorState).lockPropertiesPanel)
  const multiEdit = selectedEntities.length > 1
  const uuid = lockedNode.value ? lockedNode.value : selectedEntities[selectedEntities.length - 1]
  const { t } = useTranslation()
  const materialUUID = useHookstate(getMutableState(MaterialSelectionState).selectedMaterial).value

  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto rounded-[5px] bg-neutral-900 px-1">
      {materialUUID ? (
        <ECSInspector entityUUID={materialUUID} key={materialUUID} />
      ) : uuid ? (
        <ECSInspector entityUUID={uuid} key={uuid} />
      ) : (
        <div className="flex h-full items-center justify-center text-gray-500">
          {t('editor:properties.noNodeSelected')}
        </div>
      )}
    </div>
  )
}

export default PropertiesPanelContainer
