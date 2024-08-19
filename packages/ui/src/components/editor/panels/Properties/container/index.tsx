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

import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { UUIDComponent } from '@ir-engine/ecs'
import { Component, ComponentJSONIDMap, useOptionalComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { NO_PROXY, getMutableState, getState, useHookstate } from '@ir-engine/hyperflux'

import { calculateAndApplyYOffset } from '@ir-engine/common/src/utils/offsets'
import { EntityUUID } from '@ir-engine/ecs'
import { ComponentEditorsState } from '@ir-engine/editor/src/services/ComponentEditors'
import { EditorState } from '@ir-engine/editor/src/services/EditorServices'
import { SelectionState } from '@ir-engine/editor/src/services/SelectionServices'
import { GLTFNodeState } from '@ir-engine/engine/src/gltf/GLTFDocumentState'
import { MaterialSelectionState } from '@ir-engine/engine/src/scene/materials/MaterialLibraryState'
import { HiOutlinePlusCircle } from 'react-icons/hi'
import Button from '../../../../../primitives/tailwind/Button'
import { Popup } from '../../../../tailwind/Popup'
import TransformPropertyGroup from '../../../properties/transform'
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

  const entity = UUIDComponent.getEntityByUUID(entityUUID)
  const componentEditors = useHookstate(getMutableState(ComponentEditorsState)).get(NO_PROXY)
  const node = useHookstate(GLTFNodeState.getMutableNode(entity))
  const components: Component[] = []
  for (const jsonID of Object.keys(node.extensions.value!)) {
    const component = ComponentJSONIDMap.get(jsonID)!
    if (!componentEditors[component?.name]) continue
    components.push(component)
  }

  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleResize = () => {
      calculateAndApplyYOffset(popupRef.current)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const [isAddComponentMenuOpen, setIsAddComponentMenuOpen] = useState(false)

  return (
    <>
      <div className="flex w-full justify-end bg-theme-highlight" id="add-component-popover">
        <Popup
          keepInside
          position={'left center'}
          open={isAddComponentMenuOpen}
          onClose={() => setIsAddComponentMenuOpen(false)}
          trigger={
            <Button
              startIcon={<HiOutlinePlusCircle />}
              variant="transparent"
              rounded="none"
              className="ml-auto w-40 bg-[#2F3137] px-2"
              size="small"
              onClick={() => setIsAddComponentMenuOpen(true)}
            >
              {t('editor:properties.lbl-addComponent')}
            </Button>
          }
          onOpen={() => calculateAndApplyYOffset(popupRef.current)}
        >
          <div ref={popupRef} className="h-[600px] w-96 overflow-y-auto">
            <ElementList type="components" onSelect={() => setIsAddComponentMenuOpen(false)} />
          </div>
        </Popup>
      </div>
      <TransformPropertyGroup entity={entity} />
      {components.map((c) => (
        <EntityComponentEditor
          key={`${entityUUID + entity}-${c.name}`}
          multiEdit={multiEdit}
          entity={entity}
          component={c}
        />
      ))}
    </>
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
  const { t } = useTranslation()
  const materialUUID = useHookstate(getMutableState(MaterialSelectionState).selectedMaterial).value

  return (
    <div className="flex h-full flex-col gap-0.5 overflow-y-auto rounded-[5px] bg-neutral-900 px-1">
      {materialUUID ? (
        <MaterialEditor materialUUID={materialUUID} />
      ) : uuid ? (
        <NodeEditor entityUUID={uuid} key={uuid} multiEdit={multiEdit} />
      ) : (
        <div className="flex h-full items-center justify-center text-gray-500">
          {t('editor:properties.noNodeSelected')}
        </div>
      )}
    </div>
  )
}

export default PropertiesPanelContainer
