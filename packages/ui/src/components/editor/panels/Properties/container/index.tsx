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

import { UUIDComponent } from '@etherealengine/ecs'
import { Component, ComponentJSONIDMap, useOptionalComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { NO_PROXY, getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import { EntityUUID } from '@etherealengine/ecs'
import { ComponentEditorsState } from '@etherealengine/editor/src/services/ComponentEditors'
import { EditorState } from '@etherealengine/editor/src/services/EditorServices'
import { SelectionState } from '@etherealengine/editor/src/services/SelectionServices'
import { GLTFNodeState } from '@etherealengine/engine/src/gltf/GLTFDocumentState'
import { MaterialSelectionState } from '@etherealengine/engine/src/scene/materials/MaterialLibraryState'
import { PopoverPosition } from '@mui/material'
import { HiOutlinePlusCircle } from 'react-icons/hi'
import Button from '../../../../../primitives/tailwind/Button'
import Popover from '../../../layout/Popover'
import TransformPropertyGroup from '../../../properties/transform'
import { PopoverContext } from '../../../util/PopoverContext'
import ElementList from '../elementList'
import MaterialEditor from '../material'

const EntityComponentEditor = (props: { entity; component; multiEdit }) => {
  const { entity, component, multiEdit } = props
  const componentMounted = useOptionalComponent(entity, component)
  const Editor = getState(ComponentEditorsState)[component.name]!
  if (!componentMounted) return null
  // nodeEntity is used as key here to signal to React when the entity has changed,
  // and to prevent state from being recycled between editor instances, which
  // can cause hookstate to throw errors.
  return <Editor key={`${entity}-${Editor.name}`} multiEdit={multiEdit} entity={entity} component={component} />
}

const EntityEditor = (props: { entityUUID: EntityUUID; multiEdit: boolean }) => {
  const { t } = useTranslation()
  const { entityUUID, multiEdit } = props
  const anchorEl = useHookstate<HTMLButtonElement | null>(null)
  const [anchorPosition, setAnchorPosition] = React.useState<undefined | PopoverPosition>(undefined)

  const entity = UUIDComponent.getEntityByUUID(entityUUID)
  const componentEditors = useHookstate(getMutableState(ComponentEditorsState)).get(NO_PROXY)
  const node = useHookstate(GLTFNodeState.getMutableNode(entity))
  const components: Component[] = []
  for (const jsonID of Object.keys(node.extensions.value!)) {
    const component = ComponentJSONIDMap.get(jsonID)!
    if (!componentEditors[component.name]) continue
    components.push(component)
  }

  const open = !!anchorEl.value
  const panel = document.getElementById('propertiesPanel')

  return (
    <PopoverContext.Provider
      value={{
        handlePopoverClose: () => {
          anchorEl.set(null)
        }
      }}
    >
      <div className="ml-auto flex h-8 bg-zinc-900 " id="add-component-popover">
        <Button
          startIcon={<HiOutlinePlusCircle />}
          variant="transparent"
          rounded="none"
          className="ml-auto w-32 bg-theme-highlight px-2"
          size="small"
          onClick={(event) => {
            setAnchorPosition({ top: event.clientY - 10, left: panel?.getBoundingClientRect().left! + 10 })
            anchorEl.set(event.currentTarget)
          }}
        >
          {t('editor:properties.lbl-addComponent')}
        </Button>
      </div>
      <Popover
        open={open}
        anchorEl={anchorEl.value as any}
        onClose={() => {
          anchorEl.set(null)
          setAnchorPosition(undefined)
        }}
        panelId="propertiesPanel"
        anchorPosition={anchorPosition}
        className="h-[60%] w-[100%] min-w-[300px] overflow-y-auto"
      >
        {<ElementList />}
      </Popover>
      <TransformPropertyGroup entity={entity} />
      {components.map((c, i) => (
        <EntityComponentEditor
          key={`${entityUUID + entity}-${c.name}`}
          multiEdit={multiEdit}
          entity={entity}
          component={c}
        />
      ))}
    </PopoverContext.Provider>
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
        <MaterialEditor materialUUID={materialUUID} />
      ) : uuid ? (
        <EntityEditor entityUUID={uuid} key={uuid} multiEdit={multiEdit} />
      ) : (
        <div className="flex h-full items-center justify-center text-gray-500">
          {t('editor:properties.noNodeSelected')}
        </div>
      )}
    </div>
  )
}

export default PropertiesPanelContainer
