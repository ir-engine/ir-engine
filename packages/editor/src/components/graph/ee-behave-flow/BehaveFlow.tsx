import { GraphJSON } from 'behave-graph'
import React, { MouseEvent as ReactMouseEvent, useCallback, useEffect, useMemo, useState } from 'react'
import ReactFlow, {
  Background,
  BackgroundVariant,
  Connection,
  OnConnectStartParams,
  useEdgesState,
  useNodesState,
  XYPosition
} from 'reactflow'
import { v4 as uuidv4 } from 'uuid'

import Controls from './components/Controls'
import NodePicker from './components/NodePicker'
import { behaveToFlow } from './transformers/behaveToFlow'
import { calculateNewEdge } from './util/calculateNewEdge'
import { customNodeTypes } from './util/customNodeTypes'
import { getNodePickerFilters } from './util/getPickerFilters'

import 'reactflow/dist/style.css'

import styles from './styles.module.scss'
import { flowToBehave } from './transformers/flowToBehave'

export type FlowInputType = {
  graphJSON: GraphJSON
  onChangeGraph?: (nuGraph: GraphJSON) => void
}

const Flow = ({ graphJSON, onChangeGraph }: FlowInputType) => {
  const [initialNodes, initialEdges] = behaveToFlow(graphJSON)
  const [nodePickerVisibility, setNodePickerVisibility] = useState<XYPosition>()
  const [lastConnectStart, setLastConnectStart] = useState<OnConnectStartParams>()
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

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

  const handleAddNode = useCallback(
    (nodeType: string, position: XYPosition) => {
      closeNodePicker()
      const newNode = {
        id: uuidv4(),
        type: nodeType,
        position,
        data: {}
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
      onEdgesChange([
        {
          type: 'add',
          item: calculateNewEdge(originNode, nodeType, newNode.id, lastConnectStart)
        }
      ])
    },
    [lastConnectStart, nodes, onEdgesChange, onNodesChange]
  )

  const handleStartConnect = (e: ReactMouseEvent, params: OnConnectStartParams) => {
    setLastConnectStart(params)
  }

  const handleStopConnect = (e: MouseEvent) => {
    const element = e.target as HTMLElement
    if (element.classList.contains('react-flow__pane')) {
      setNodePickerVisibility({ x: e.clientX, y: e.clientY })
    } else {
      setLastConnectStart(undefined)
    }
  }

  const closeNodePicker = () => {
    setLastConnectStart(undefined)
    setNodePickerVisibility(undefined)
  }

  const handlePaneClick = () => closeNodePicker()

  const handlePaneContextMenu = (e: ReactMouseEvent) => {
    e.preventDefault()
    setNodePickerVisibility({ x: e.clientX, y: e.clientY })
  }

  const memoChanged = useMemo(() => flowToBehave(nodes, edges), [nodes, edges])

  useEffect(() => {
    onChangeGraph?.(memoChanged)
  }, [nodes, edges])

  return (
    <React.StrictMode>
      <ReactFlow
        nodeTypes={customNodeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={handleStartConnect}
        onConnectEnd={handleStopConnect}
        fitView
        fitViewOptions={{ maxZoom: 1 }}
        onPaneClick={handlePaneClick}
        onPaneContextMenu={handlePaneContextMenu}
        className={styles.GraphEditor}
      >
        <Controls />
        <Background variant={BackgroundVariant.Lines} color="#2a2b2d" style={{ backgroundColor: '#1E1F22' }} />
        {nodePickerVisibility && (
          <NodePicker
            position={nodePickerVisibility}
            filters={getNodePickerFilters(nodes, lastConnectStart)}
            onPickNode={handleAddNode}
            onClose={closeNodePicker}
          />
        )}
      </ReactFlow>
    </React.StrictMode>
  )
}

export default Flow
