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

import React, { MouseEvent, StyleHTMLAttributes, useCallback } from 'react'
import { useDrag } from 'react-dnd'

import { EntityUUID, getOptionalComponent, useOptionalComponent, UUIDComponent } from '@etherealengine/ecs'
import { MaterialSelectionState } from '@etherealengine/engine/src/scene/materials/MaterialLibraryState'
import { getMutableState, useHookstate, useMutableState } from '@etherealengine/hyperflux'

import { ItemTypes } from '@etherealengine/editor/src/constants/AssetTypes'
import { SelectionState } from '@etherealengine/editor/src/services/SelectionServices'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { MaterialStateComponent } from '@etherealengine/spatial/src/renderer/materials/MaterialComponent'
import { HiOutlineArchiveBox } from 'react-icons/hi2'
import { SiRoundcube } from 'react-icons/si'
import { twMerge } from 'tailwind-merge'

export type MaterialLibraryEntryData = {
  nodes: string[]
  onClick: (e: MouseEvent, node: EntityUUID) => void
  onCollapse: (e: MouseEvent, node: EntityUUID) => void
}

export type MaterialLibraryEntryProps = {
  index: number
  data: MaterialLibraryEntryData
  style: StyleHTMLAttributes<HTMLElement>
}

const nodeDisplayName = (uuid: EntityUUID) => {
  return getOptionalComponent(UUIDComponent.getEntityByUUID(uuid), MaterialStateComponent)?.material?.name ?? ''
}

export default function MaterialLibraryEntry(props: MaterialLibraryEntryProps) {
  const data = props.data
  const node = data.nodes[props.index]

  const selectionState = useMutableState(SelectionState)

  /**@todo use asset source decoupled from uuid to make this less brittle */
  const source = node.includes('/') ? node.split('/')?.pop()?.split('?')[0] : null
  const name = useOptionalComponent(UUIDComponent.getEntityByUUID(node as EntityUUID), NameComponent)

  const onClickNode = (e) => {
    if (!source) data.onClick(e, node as EntityUUID)
  }

  const onCollapseNode = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation()
      //data.onCollapse(e, node)
    },
    [node, data.onCollapse]
  )

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

  const materialSelection = useHookstate(getMutableState(MaterialSelectionState).selectedMaterial)
  return (
    <li
      style={props.style}
      ref={drag}
      id={node[0]}
      className={twMerge(
        `bg-${props.index % 2 ? 'theme-surfaceInput' : 'zinc-800'}`,
        materialSelection.value === node ? 'border border-gray-100' : 'border-none'
      )}
      onClick={onClickNode}
    >
      <div ref={drag} id={node[0]} tabIndex={0} className={``} onClick={onClickNode}>
        {source ? (
          <div className={'flex items-center pl-3.5 pr-2'}>
            <div className="flex flex-1 items-center bg-inherit py-0.5 pl-0 pr-1">
              <HiOutlineArchiveBox className="h-5 w-5 flex-shrink-0 text-white dark:text-[#A3A3A3]" />
              <div className="flex flex-1 items-center">
                <div className="ml-2 min-w-0 flex-1 text-nowrap rounded bg-transparent px-0.5 py-0 text-inherit text-white dark:text-[#A3A3A3]">
                  <span className="text-nowrap text-sm leading-4">{source}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={'flex items-center pl-9 pr-6'}>
            <div className="flex flex-1 items-center bg-inherit py-0.5 pl-0 pr-1">
              <SiRoundcube className="h-5 w-5 flex-shrink-0 text-white dark:text-[#A3A3A3]" />
              <div className="flex flex-1 items-center">
                <div className="ml-2 min-w-0 flex-1 text-nowrap rounded bg-transparent px-0.5 py-0 text-inherit text-white dark:text-[#A3A3A3]">
                  <span className="text-nowrap text-sm leading-4">{name?.value || ''}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </li>
  )
}
