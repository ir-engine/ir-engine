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

import { NodeSpecJSON } from '@behave-graph/core'

import { useOnPressKey } from '../hooks/useOnPressKey.js'

import './NodePicker.css'

export type NodePickerFilters = {
  handleType: 'source' | 'target'
  valueType: string
}

type NodePickerProps = {
  flowRef: React.MutableRefObject<HTMLElement | null>
  position: XYPosition
  filters?: NodePickerFilters
  onPickNode: (type: string, position: XYPosition) => void
  onClose: () => void
  specJSON: NodeSpecJSON[] | undefined
}

export const NodePicker: React.FC<NodePickerProps> = ({
  flowRef,
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

  const bounds = flowRef.current!.getBoundingClientRect()
  // Adjust the position to fit within the available space
  const adjustedTop = position.y
  const adjustedLeft = position.x

  return (
    <div className="node-picker-container" style={{ top: adjustedTop, left: adjustedLeft }}>
      <div className="node-picker-header">Add Node</div>
      <div className="node-picker-search">
        <input
          type="text"
          autoFocus
          placeholder="Type to filter"
          className="node-picker-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="node-picker-list">
        {filtered.map(({ type }) => (
          <div key={type} className="node-picker-item" onClick={() => onPickNode(type, instance.project(position))}>
            {type}
          </div>
        ))}
      </div>
    </div>
  )
}
