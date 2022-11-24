import { NodeSpecJSON } from 'behave-graph'
import rawSpecJson from 'behave-graph/dist/node-spec.json'
import { useState } from 'react'
import React from 'react'
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
