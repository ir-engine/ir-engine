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

import { EntityUUID, UUIDComponent, getOptionalComponent, hasComponent } from '@ir-engine/ecs'
import { ItemTypes } from '@ir-engine/editor/src/constants/AssetTypes'
import { SelectionState } from '@ir-engine/editor/src/services/SelectionServices'
import { MaterialSelectionState } from '@ir-engine/engine/src/scene/materials/MaterialLibraryState'
import { getMutableState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import React from 'react'
import { useDrag } from 'react-dnd'
import { HiOutlineArchiveBox } from 'react-icons/hi2'
import { SiRoundcube } from 'react-icons/si'
import { ListChildComponentProps } from 'react-window'
import { twMerge } from 'tailwind-merge'

const getNodeDisplayName = (uuid: EntityUUID) => {
  const entity = UUIDComponent.getEntityByUUID(uuid)
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

  /**@todo use asset source decoupled from uuid to make this less brittle */
  const source = !hasComponent(UUIDComponent.getEntityByUUID(node), MaterialStateComponent)

  const onClickNode = () => {
    if (!source) {
      materialSelection.set(node)
      console.log(node)
      console.log(UUIDComponent.getEntityByUUID(node))
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
    <li
      style={props.style}
      ref={drag}
      id={node[0]}
      className={twMerge(
        props.index % 2 ? 'bg-theme-surfaceInput' : 'bg-zinc-800',
        materialSelection.value === node ? 'border border-gray-100' : 'border-none'
      )}
      onClick={onClickNode}
    >
      <div ref={drag} id={node[0]} tabIndex={0} onClick={onClickNode}>
        {source ? (
          <div className="flex items-center pl-3.5 pr-2">
            <div className="flex flex-1 items-center bg-inherit py-0.5 pl-0 pr-1">
              <HiOutlineArchiveBox className="h-5 w-5 flex-shrink-0 text-white dark:text-[#A3A3A3]" />
              <div className="flex flex-1 items-center">
                <div className="ml-2 min-w-0 flex-1 text-nowrap rounded bg-transparent px-0.5 py-0 text-inherit text-white dark:text-[#A3A3A3]">
                  <span className="text-nowrap text-sm leading-4">{node.split('/')?.pop()?.split('?')[0]}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center pl-9 pr-6">
            <div className="flex flex-1 items-center bg-inherit py-0.5 pl-0 pr-1">
              <SiRoundcube className="h-5 w-5 flex-shrink-0 text-white dark:text-[#A3A3A3]" />
              <div className="flex flex-1 items-center">
                <div className="ml-2 min-w-0 flex-1 text-nowrap rounded bg-transparent px-0.5 py-0 text-inherit text-white dark:text-[#A3A3A3]">
                  <span className="text-nowrap text-sm leading-4">{getNodeDisplayName(node)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </li>
  )
}
