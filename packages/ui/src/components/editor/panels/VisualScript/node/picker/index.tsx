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
import { useTranslation } from 'react-i18next'
import { useReactFlow, XYPosition } from 'reactflow'

import { useOnPressKey } from '@etherealengine/editor/src/components/visualScript/VisualScriptUIModule'
import { NodeSpecJSON } from '@etherealengine/visual-script'

const nodePickerContainer: any = {
  position: 'absolute',
  zIndex: '10',
  fontSize: 'small',
  color: 'var(--textColor)',
  backgroundColor: 'var(--popupBackground)',
  borderStyle: 'round',
  borderColor: 'var(--borderStyle)'
}

/*const nodePicker::-webkit-scrollbar {
  width: 2px;
}*/

const nodePickerHeader = {
  backgroundColor: 'var(--tableHeaderBackground)',
  padding: '0.5rem 0.25rem'
}

const nodePickerSearchInput = {
  backgroundColor: 'var(--inputBackground)',
  color: 'var(--white)',
  width: '100%',
  padding: '0.25rem 0.5rem'
}

/*const nodePickerInput:disabled {
  backgroundColor: 'var(--dockBackground)' 
}*/

const nodePickerList: any = {
  maxHeight: '12rem',
  overflowY: 'scroll'
}

const nodePickerItem: any = {
  padding: '0.25rem 0.5rem',
  borderBottom: '1px solid var(--border)',
  cursor: 'pointer'
}

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

const pickerStyle = {
  overflow: 'hidden',
  width: '320px',
  height: '180px'
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
  const { t } = useTranslation()

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

  const paneBounds = flowRef.current!.getBoundingClientRect()
  const width = parseInt(pickerStyle.width)
  const height = parseInt(pickerStyle.height)
  position.x = position.x + width > paneBounds.width ? (position.x -= width) : position.x
  position.y = position.y + height > paneBounds.height ? (position.y -= height) : position.y

  return (
    <div style={{ ...nodePickerContainer, ...{ top: position.y, left: position.x, ...pickerStyle } }}>
      <div style={nodePickerHeader}>{t('editor:visualScript.picker.title')}</div>
      <div>
        <input
          type="text"
          autoFocus
          placeholder="Type to filter"
          style={nodePickerSearchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div style={nodePickerList}>
        {filtered.map(({ type }) => (
          <div
            key={type}
            style={nodePickerItem}
            onClick={() => onPickNode(type, instance.screenToFlowPosition(position))}
          >
            {type}
          </div>
        ))}
      </div>
    </div>
  )
}
