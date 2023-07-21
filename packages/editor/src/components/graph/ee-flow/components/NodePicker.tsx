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

import React, { useState } from 'react'
import { useReactFlow, XYPosition } from 'reactflow'

import { NodeSpecJSON } from '@etherealengine/engine/src/behave-graph/core'

import { useOnPressKey } from '../hooks/useOnPressKey.js'

export type NodePickerFilters = {
  handleType: 'source' | 'target'
  valueType: string
}

type NodePickerProps = {
  position: XYPosition
  filters?: NodePickerFilters
  onPickNode: (type: string, position: XYPosition) => void
  onClose: () => void
  specJSON: NodeSpecJSON[] | undefined
}

export const NodePicker: React.FC<NodePickerProps> = ({
  position,
  onPickNode,
  onClose,
  filters,
  specJSON
}: NodePickerProps) => {
  const [search, setSearch] = useState('')
  const instance = useReactFlow()

  useOnPressKey('Escape', onClose)

  if (!specJSON) return null
  let filtered = specJSON
  if (filters !== undefined) {
    filtered = filtered?.filter((node) => {
      const sockets = filters?.handleType === 'source' ? node.outputs : node.inputs
      return sockets.some((socket) => socket.valueType === filters?.valueType)
    })
  }

  filtered =
    filtered?.filter((node) => {
      const term = search.toLowerCase()
      return node.type.toLowerCase().includes(term)
    }) || []

  return (
    <div
      className="node-picker absolute z-10 text-sm text-white bg-gray-800 border rounded border-gray-500"
      style={{ top: position.y, left: position.x }}
    >
      <div className="bg-gray-500 p-2">Add Node</div>
      <div className="p-2">
        <input
          type="text"
          autoFocus
          placeholder="Type to filter"
          className=" bg-gray-600 disabled:bg-gray-700 w-full py-1 px-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="max-h-48 overflow-y-scroll">
        {filtered.map(({ type }) => (
          <div
            key={type}
            className="p-2 cursor-pointer border-b border-gray-600"
            onClick={() => onPickNode(type, instance.project(position))}
          >
            {type}
          </div>
        ))}
      </div>
    </div>
  )
}
