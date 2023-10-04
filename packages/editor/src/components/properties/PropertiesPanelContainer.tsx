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

import { useHookstate } from '@hookstate/core'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Object3D } from 'three'

import { useForceUpdate } from '@etherealengine/common/src/utils/useForceUpdate'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import {
  ComponentMap,
  getAllComponents,
  hasComponent,
  setComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { MaterialComponentType } from '@etherealengine/engine/src/renderer/materials/components/MaterialComponent'
import { MaterialLibraryState } from '@etherealengine/engine/src/renderer/materials/MaterialLibrary'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import { dispatchAction, getMutableState, getState } from '@etherealengine/hyperflux'

import { useDrop } from 'react-dnd'
import { ItemTypes } from '../../constants/AssetTypes'
import { EntityNodeEditor } from '../../functions/ComponentEditors'
import { EditorState } from '../../services/EditorServices'
import { SelectionAction, SelectionState } from '../../services/SelectionServices'
import MaterialEditor from '../materials/MaterialEditor'
import { CoreNodeEditor } from './CoreNodeEditor'
import Object3DNodeEditor from './Object3DNodeEditor'

/**
 * PropertiesPanelContent used as container element contains content of editor view.
 * @type {Style}
 */
const propertiesPanelContentStyle: React.CSSProperties = {
  overflowY: 'auto',
  height: '100%'
}
/**
 * NoNodeSelectedMessage used to show the message when no selected no is there.
 *
 * @type {Style}
 */
const noNodeSelectedMessageStyle: React.CSSProperties = {
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: 'var(--textColor)'
}

/**
 * PropertiesPanelContainer used to render editor view to customize property of selected element.
 *
 * @extends Component
 */
export const PropertiesPanelContainer = () => {
  const selectionState = useHookstate(getMutableState(SelectionState))
  const editorState = useHookstate(getMutableState(EditorState))
  const selectedEntities = selectionState.selectedEntities.value
  const { t } = useTranslation()

  const forceUpdate = useForceUpdate()

  // force react to re-render upon any object changing
  useEffect(() => {
    forceUpdate()
  }, [selectionState.objectChangeCounter])

  const materialLibrary = getState(MaterialLibraryState)
  //rendering editor views for customization of element properties
  let content
  const lockedNode = editorState.lockPropertiesPanel.value
  const multiEdit = selectedEntities.length > 1
  let nodeEntity = lockedNode
    ? UUIDComponent.entitiesByUUID[lockedNode] ?? lockedNode
    : selectedEntities[selectedEntities.length - 1]
  const isMaterial =
    typeof nodeEntity === 'string' &&
    (!!materialLibrary.materials[nodeEntity] ||
      Object.values(materialLibrary.materials)
        .map(({ material }) => material.uuid)
        .includes(nodeEntity))
  const isObject3D = typeof nodeEntity === 'string' && !isMaterial
  const node = isMaterial
    ? materialLibrary.materials[nodeEntity as string] ??
      Object.values(materialLibrary.materials).find(({ material }) => material.uuid === nodeEntity)
    : isObject3D
    ? Engine.instance.scene.getObjectByProperty('uuid', nodeEntity as string)
    : nodeEntity

  const [{ isDragging }, dropRef] = useDrop({
    accept: [ItemTypes.Component],
    drop: (item: { componentName: string }) => {
      if (isObject3D) return
      const component = ComponentMap.get(item.componentName)
      const entity = node as Entity
      if (!component || hasComponent(entity, component)) return
      setComponent(entity, component)
      dispatchAction(SelectionAction.forceUpdate({}))
    },
    collect: (monitor) => {
      if (isObject3D) return { isDragging: false }

      if (monitor.getItem() === null || !monitor.canDrop() || !monitor.isOver()) return { isDragging: false }

      const component = ComponentMap.get(monitor.getItem().componentName)
      if (!component) return { isDragging: false }

      const entity = node as Entity

      return {
        isDragging: !hasComponent(entity, component)
      }
    }
  })

  if (!nodeEntity || !node) {
    content = <div style={noNodeSelectedMessageStyle}>{t('editor:properties.noNodeSelected')}</div>
  } else if (isObject3D) {
    content = (
      <div>
        {/* @todo these types are incorrect */}
        <Object3DNodeEditor multiEdit={multiEdit} obj3d={node as Object3D} />
      </div>
    )
  } else if (isMaterial) {
    content = (
      <div>
        <MaterialEditor key={`${nodeEntity}-MaterialEditor`} material={(node as MaterialComponentType).material} />
      </div>
    )
  } else {
    nodeEntity = nodeEntity as Entity
    const components = getAllComponents(nodeEntity as Entity).filter((c) => EntityNodeEditor.has(c))

    content = (
      <div
        ref={dropRef}
        style={{
          pointerEvents: 'all',
          border: isDragging ? '2px solid lightgrey' : 'none'
        }}
      >
        <CoreNodeEditor entity={node as Entity} key={node as Entity} />
        {components.map((c, i) => {
          const Editor = EntityNodeEditor.get(c)!
          // nodeEntity is used as key here to signal to React when the entity has changed,
          // and to prevent state from being recycled between editor instances, which
          // can cause hookstate to throw errors.
          return (
            <Editor key={`${nodeEntity}-${Editor.name}`} multiEdit={multiEdit} entity={node as Entity} component={c} />
          )
        })}
      </div>
    )
  }

  return <div style={propertiesPanelContentStyle}>{content}</div>
}

export default PropertiesPanelContainer
