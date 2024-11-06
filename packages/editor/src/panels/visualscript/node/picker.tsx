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

import { Input } from '@ir-engine/ui'
import { NodeSpecJSON } from '@ir-engine/visual-script'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GoDotFill } from 'react-icons/go'
import { HiMagnifyingGlass, HiOutlineChevronDown, HiOutlineChevronRight } from 'react-icons/hi2'
import { XYPosition, useReactFlow } from 'reactflow'
import { twMerge } from 'tailwind-merge'
import { VisualScriptPanelTab } from '..'
import { useOnPressKey } from '../hooks'
import { categoryColorMap, colors } from '../util/colors'

const createPickerNodes = (tree, onPickNode, position, instance) => {
  if (tree?.type !== undefined && typeof tree?.type === 'string') return null
  return Object.entries(tree)
    .filter(([key, value]) => key !== 'group')
    .map(([key, value]) => {
      return (
        <PickerItem
          key={key}
          label={key}
          node={value}
          onPickNode={onPickNode}
          position={position}
          instance={instance}
          color={categoryColorMap[key] ?? categoryColorMap.None}
        />
      )
    })
}

const PickerItem = ({ label, node, onPickNode, position, instance, color }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [childNodes, setChildNodes] = useState(null)
  const [isLeafNode, setIsLeafNode] = useState(false)
  useEffect(() => {
    if (!isExpanded && !childNodes) {
      const children = createPickerNodes(node, onPickNode, position, instance) as any
      setChildNodes(children)
      if (children === null) {
        setIsLeafNode(true)
      }
    }
  }, [isExpanded])

  const handleNodeClick = () => {
    if (isLeafNode) {
      const paneBounds = document.getElementById(VisualScriptPanelTab.id!)!.getBoundingClientRect()

      const newPosition = { x: position.x + paneBounds.x, y: position.y + paneBounds.y }

      onPickNode(node.type, instance.screenToFlowPosition(newPosition))
    }
    setIsExpanded(!isExpanded)
  }
  const finalColor = (colors[color][0] as string).slice(2)

  return (
    <>
      <div onClick={handleNodeClick} className="flex w-full items-center justify-between py-1 pl-2">
        <span className="flex flex-row items-center gap-3 text-center text-white">
          <GoDotFill className={`text${finalColor}`} />
          {label}
        </span>
        {node && !isLeafNode && (
          <button className="bg-transparent pr-2 text-white">
            {isExpanded ? <HiOutlineChevronDown /> : <HiOutlineChevronRight />}
          </button>
        )}
      </div>
      {isExpanded && childNodes && <div className="pl-4">{childNodes}</div>}
    </>
  )
}

const NodePickerNode = ({ nodes, onPickNode, position, instance }) => {
  const nodeTree = {}
  nodes.forEach((node) => {
    const parts = node.type.split('/')
    let current = nodeTree
    parts.forEach((part) => {
      if (!current[part]) {
        current[part] = {}
      }
      current = current[part]
    })
    current['type'] = node.type
  })

  const initialTreeNodes = createPickerNodes(nodeTree, onPickNode, position, instance)

  return <div className="flex h-48 flex-col overflow-x-hidden overflow-y-scroll">{initialTreeNodes}</div>
}

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

const pickerStyle = {
  width: '240px',
  height: '280px'
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

  const paneBounds = document.getElementById(VisualScriptPanelTab.id!)!.getBoundingClientRect()
  const width = parseInt(pickerStyle.width)
  const height = parseInt(pickerStyle.height)

  position.x =
    position.x - width > 0 ? (position.x + width > paneBounds.width ? (position.x -= width) : position.x) : position.x
  position.y =
    position.y - height > 0
      ? position.y + height > paneBounds.height
        ? (position.y -= height)
        : position.y
      : position.y

  return (
    <div
      className={twMerge('absolute z-10 rounded border-zinc-800 bg-neutral-900 text-sm')}
      style={{ ...{ top: position.y, left: position.x, ...pickerStyle } }}
    >
      <div className="flex justify-center p-2 text-white">{t('editor:visualScript.picker.title')}</div>
      <Input
        placeholder={'Type to filter'}
        value={search}
        onChange={(event) => {
          setSearch(event.target.value)
        }}
        startComponent={<HiMagnifyingGlass className="text-white" />}
      />
      <NodePickerNode nodes={filtered} onPickNode={onPickNode} position={position} instance={instance} />
    </div>
  )
}
