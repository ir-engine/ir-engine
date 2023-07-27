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

import { NodeSpecJSON } from 'behave-graph'
import rawSpecJson from 'behave-graph/dist/node-spec.json'
import React, { useState } from 'react'
import { useReactFlow, XYPosition } from 'reactflow'

import { useOnPressKey } from '../hooks/useOnPressKey'
import styles from '../styles.module.scss'

const specJSON = rawSpecJson as NodeSpecJSON[]

const nodes = specJSON

export type NodePickerFilters = {
  handleType: 'source' | 'target'
  valueType: string
}

type NodePickerProps = {
  position: XYPosition
  filters?: NodePickerFilters
  onPickNode: (type: string, position: XYPosition) => void
  onClose: () => void
}

const NodePicker = ({ position, onPickNode, onClose, filters }: NodePickerProps) => {
  const [search, setSearch] = useState('')
  const instance = useReactFlow()

  useOnPressKey('Escape', onClose)

  let filtered = nodes
  if (filters !== undefined) {
    filtered = filtered.filter((node) => {
      const sockets = filters?.handleType === 'source' ? node.outputs : node.inputs
      return sockets.some((socket) => socket.valueType === filters?.valueType)
    })
  }

  filtered = filtered.filter((node) => {
    const term = search.toLowerCase()
    return node.type.toLowerCase().includes(term)
  })

  return (
    !!position && (
      <div className={styles.nodePicker} style={{ top: position.y, left: position.x }}>
        <div className={styles.addNode}>Add Node</div>
        <div className={styles.search}>
          <input
            type="text"
            autoFocus
            placeholder="Type to filter"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.options}>
          {filtered.map(({ type }) => (
            <div key={type} className={styles.option} onClick={() => onPickNode(type, instance.project(position))}>
              {type}
            </div>
          ))}
        </div>
      </div>
    )
  )
}

export default NodePicker
