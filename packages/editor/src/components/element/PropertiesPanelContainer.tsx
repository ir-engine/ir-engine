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

import { Popover } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { EntityUUID, UUIDComponent } from '@etherealengine/ecs'
import { Component, ComponentJSONIDMap, useOptionalComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { MaterialSelectionState } from '@etherealengine/engine/src/scene/materials/MaterialLibraryState'
import { NO_PROXY, getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import { GLTFNodeState } from '@etherealengine/engine/src/gltf/GLTFDocumentState'
import { ComponentEditorsState } from '../../functions/ComponentEditors'
import { EditorState } from '../../services/EditorServices'
import { SelectionState } from '../../services/SelectionServices'
import { PropertiesPanelButton } from '../inputs/Button'
import MaterialEditor from '../materials/MaterialEditor'
import { CoreNodeEditor } from '../properties/CoreNodeEditor'
import ElementList from './ElementList'
import { PopoverContext } from './PopoverContext'

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
  const { entityUUID, multiEdit } = props
  const anchorEl = useHookstate<HTMLButtonElement | null>(null)
  const { t } = useTranslation()

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

  return (
    <PopoverContext.Provider
      value={{
        handlePopoverClose: () => {
          anchorEl.set(null)
        }
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
        <PropertiesPanelButton onClick={(event) => anchorEl.set(event.currentTarget)}>
          {t('editor:properties.lbl-addComponent')}
        </PropertiesPanelButton>
      </div>
      <Popover
        id={open ? 'add-component-popover' : undefined}
        open={open}
        anchorEl={anchorEl.value as HTMLButtonElement}
        onClose={() => anchorEl.set(null)}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'right'
        }}
      >
        <ElementList />
      </Popover>
      <CoreNodeEditor entity={entity} key={entityUUID + entity} />
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

const NodeEditor = (props: { entityUUID: EntityUUID; multiEdit: boolean }) => {
  const entity = UUIDComponent.useEntityByUUID(props.entityUUID)
  const node = GLTFNodeState.useMutableNode(entity)
  if (!node) return null
  return <EntityEditor entityUUID={props.entityUUID} multiEdit={props.multiEdit} />
}

/**
 * PropertiesPanelContainer used to render editor view to customize property of selected element.
 */
export const PropertiesPanelContainer = () => {
  const selectedEntities = useHookstate(getMutableState(SelectionState).selectedEntities).value
  const lockedNode = useHookstate(getMutableState(EditorState).lockPropertiesPanel)
  const multiEdit = selectedEntities.length > 1
  const uuid = lockedNode.value ? lockedNode.value : selectedEntities[selectedEntities.length - 1]

  const entity = UUIDComponent.useEntityByUUID(uuid)

  const { t } = useTranslation()
  const materialUUID = useHookstate(getMutableState(MaterialSelectionState).selectedMaterial).value

  return (
    <div
      style={{
        overflowY: 'auto',
        height: '100%'
      }}
    >
      {entity ? (
        materialUUID ? (
          <MaterialEditor materialUUID={materialUUID} />
        ) : (
          <NodeEditor entityUUID={uuid} key={uuid} multiEdit={multiEdit} />
        )
      ) : (
        <div
          style={{
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'var(--textColor)'
          }}
        >
          {t('editor:properties.noNodeSelected')}
        </div>
      )}
    </div>
  )
}

export default PropertiesPanelContainer
