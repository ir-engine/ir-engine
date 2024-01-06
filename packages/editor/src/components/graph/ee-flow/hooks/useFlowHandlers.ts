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

import { MouseEvent as ReactMouseEvent, useCallback, useEffect, useState } from 'react'
import { Connection, Node, OnConnectStartParams, XYPosition } from 'reactflow'
import { v4 as uuidv4 } from 'uuid'

import { calculateNewEdge } from '../util/calculateNewEdge'
import { getNodePickerFilters } from '../util/getPickerFilters'
import { useBehaveGraphFlow } from './useBehaveGraphFlow'
import { NodeSpecGenerator } from './useNodeSpecGenerator'

type BehaveGraphFlow = ReturnType<typeof useBehaveGraphFlow>

const useNodePickFilters = ({
  nodes,
  lastConnectStart,
  specGenerator
}: {
  nodes: Node[]
  lastConnectStart: OnConnectStartParams | undefined
  specGenerator: NodeSpecGenerator | undefined
}) => {
  const [nodePickFilters, setNodePickFilters] = useState(getNodePickerFilters(nodes, lastConnectStart, specGenerator))

  useEffect(() => {
    setNodePickFilters(getNodePickerFilters(nodes, lastConnectStart, specGenerator))
  }, [nodes, lastConnectStart, specGenerator])

  return nodePickFilters
}

export const useFlowHandlers = ({
  onEdgesChange,
  onNodesChange,
  nodes,
  specGenerator
}: Pick<BehaveGraphFlow, 'onEdgesChange' | 'onNodesChange'> & {
  nodes: Node[]
  specGenerator: NodeSpecGenerator | undefined
}) => {
  const [lastConnectStart, setLastConnectStart] = useState<OnConnectStartParams>()
  const [nodePickerVisibility, setNodePickerVisibility] = useState<XYPosition>()
  const [nodePickerLastOpened, setNodePickerLastOpened] = useState<number | undefined>()

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source === null) return
      if (connection.target === null) return

      const newEdge = {
        id: uuidv4(),
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle
      }
      onEdgesChange([
        {
          type: 'add',
          item: newEdge
        }
      ])
    },
    [onEdgesChange]
  )

  const closeNodePicker = useCallback(() => {
    if (nodePickerLastOpened && Date.now() - nodePickerLastOpened < 100) return
    setLastConnectStart(undefined)
    setNodePickerVisibility(undefined)
  }, [nodePickerLastOpened])

  const handleAddNode = useCallback(
    (nodeType: string, position: XYPosition) => {
      closeNodePicker()
      const newNode = {
        id: uuidv4(),
        type: nodeType,
        position,
        data: { configuration: {}, values: {} } //fill with default values here
      }
      onNodesChange([
        {
          type: 'add',
          item: newNode
        }
      ])

      if (lastConnectStart === undefined) return

      // add an edge if we started on a socket
      const originNode = nodes.find((node) => node.id === lastConnectStart.nodeId)
      if (originNode === undefined) return
      if (!specGenerator) return
      onEdgesChange([
        {
          type: 'add',
          item: calculateNewEdge(originNode, nodeType, newNode.id, lastConnectStart, specGenerator)
        }
      ])
    },
    [closeNodePicker, lastConnectStart, nodes, onEdgesChange, onNodesChange, specGenerator]
  )

  const handleStartConnect = useCallback((e: ReactMouseEvent, params: OnConnectStartParams) => {
    setLastConnectStart(params)
  }, [])

  const handleStopConnect = useCallback((e: MouseEvent) => {
    const element = e.target as HTMLElement
    if (element.classList.contains('react-flow__pane')) {
      const targetBounds = element.getBoundingClientRect()
      setNodePickerVisibility({ x: e.clientX - targetBounds.left, y: e.clientY - targetBounds.top })
      setNodePickerLastOpened(Date.now())
    } else {
      setLastConnectStart(undefined)
    }
  }, [])

  const handlePaneClick = useCallback(() => closeNodePicker(), [closeNodePicker])

  const handlePaneContextMenu = useCallback((e: ReactMouseEvent) => {
    e.preventDefault()
    const targetElement = e.target as HTMLElement
    const targetBounds = targetElement.getBoundingClientRect()
    setNodePickerVisibility({ x: e.clientX - targetBounds.left, y: e.clientY - targetBounds.top })
    setNodePickerLastOpened(Date.now())
  }, [])

  const nodePickFilters = useNodePickFilters({
    nodes,
    lastConnectStart,
    specGenerator
  })

  return {
    onConnect,
    handleStartConnect,
    handleStopConnect,
    handlePaneClick,
    handlePaneContextMenu,
    lastConnectStart,
    nodePickerVisibility,
    handleAddNode,
    closeNodePicker,
    nodePickFilters
  }
}
