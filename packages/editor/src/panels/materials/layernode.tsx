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

import { EntityUUID, Layers, UUIDComponent, getOptionalComponent, hasComponent } from '@ir-engine/ecs'
import { ItemTypes } from '@ir-engine/editor/src/constants/AssetTypes'
import { SelectionState } from '@ir-engine/editor/src/services/SelectionServices'
import { MaterialSelectionState } from '@ir-engine/engine/src/scene/materials/MaterialLibraryState'
import { getMutableState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { ContainerLg, Image05, MaterialsLg } from '@ir-engine/ui/src/icons'
import React from 'react'
import { useDrag } from 'react-dnd'
import { ListChildComponentProps } from 'react-window'
import { twMerge } from 'tailwind-merge'

const getNodeDisplayName = (uuid: EntityUUID) => {
  const entity = UUIDComponent.getEntityByUUID(uuid, Layers.Authoring)
  return (
    getOptionalComponent(entity, MaterialStateComponent)?.material?.name ||
    getOptionalComponent(entity, NameComponent) ||
    ''
  )
}

export default function MaterialLayerNode(props: ListChildComponentProps<{ nodes: EntityUUID[] }>) {
  const data = props.data
  const node = data.nodes[props.index]
  const materialSelection = useHookstate(getMutableState(MaterialSelectionState).selectedMaterial)
  const selectionState = useMutableState(SelectionState)

  const materialEntity = UUIDComponent.getEntityByUUID(node, Layers.Authoring)
  /**@todo use asset source decoupled from uuid to make this less brittle */
  const source = !hasComponent(materialEntity, MaterialStateComponent)

  const onClickNode = () => {
    if (!source) {
      materialSelection.set(node)
    }
  }

  const [_dragProps, drag] = useDrag({
    type: ItemTypes.Material,
    item() {
      const selectedEntities = selectionState.selectedEntities.value
      const multiple = selectedEntities.length > 1
      return {
        type: ItemTypes.Material,
        multiple,
        value: node[0]
      }
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  })

  return (
    <li style={props.style} ref={drag} onClick={onClickNode}>
      <div ref={drag} tabIndex={0} onClick={onClickNode}>
        {source ? (
          <div className="flex w-full items-center justify-start gap-x-1 bg-ui-background py-0.5 pl-3.5 pr-3">
            <ContainerLg className="text-base text-text-primary" />
            <Image05 className="text-base text-text-primary" />
            <div className="flex items-center">
              <div className="ml-2 min-w-0 text-nowrap rounded px-0.5 py-0 text-text-primary">
                <span className="text-nowrap text-sm leading-4">{node.split('/')?.pop()?.split('?')[0]}</span>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={twMerge(
              'flex w-full cursor-pointer items-center justify-start bg-ui-background pl-9 pr-6 text-text-secondary hover:bg-ui-hover-background hover:text-text-primary',
              materialSelection.value === node ? 'text-text-primary' : '',
              materialSelection.value === node ? 'rounded border border-ui-select-primary' : 'border-none'
            )}
          >
            <MaterialsLg className="text-base" />
            <div className="flex items-center">
              <div className="ml-2 min-w-0 text-nowrap rounded bg-transparent px-0.5 py-0">
                <span className="text-nowrap text-sm leading-4">{getNodeDisplayName(node)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </li>
  )
}
