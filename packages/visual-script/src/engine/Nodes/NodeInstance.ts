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

import { Fiber } from '../Execution/Fiber'
import { VisualScriptEngine } from '../Execution/VisualScriptEngine'
import { IGraph } from '../Graphs/Graph'
import { Socket } from '../Sockets/Socket'
import { NodeConfiguration } from './Node'
import { readInputFromSockets, writeOutputsToSocket } from './NodeSockets'
import { INodeDescription } from './Registry/NodeDescription'

export enum NodeType {
  Event = 'Event',
  Flow = 'Flow',
  Async = 'Async',
  Function = 'Function'
}

export interface INode {
  readonly inputs: Socket[]
  readonly outputs: Socket[]
  readonly graph: IGraph
  description: INodeDescription
  configuration: NodeConfiguration
  nodeType: NodeType
  label?: string
  metadata?: any
}

export interface IFunctionNode extends INode {
  nodeType: NodeType.Function
  exec: (node: INode) => void
}

export interface IEventNode extends INode {
  nodeType: NodeType.Event
  init: (engine: VisualScriptEngine) => void
  dispose: (engine: VisualScriptEngine) => void
}

export interface IFlowNode extends INode {
  nodeType: NodeType.Flow
  triggered: (fiber: Fiber, triggeringSocketName: string) => void
}

export interface IAsyncNode extends INode {
  nodeType: NodeType.Async
  triggered: (engine: VisualScriptEngine, triggeringSocketName: string, finished: () => void) => void
  dispose: () => void
}

export const isFlowNode = (node: INode): node is IFlowNode => node.nodeType === NodeType.Flow

export const isEventNode = (node: INode): node is IEventNode => node.nodeType === NodeType.Event

export const isAsyncNode = (node: INode): node is IAsyncNode => node.nodeType === NodeType.Async

export const isFunctionNode = (node: INode): node is IFunctionNode => node.nodeType === NodeType.Function

export const makeNodeInstance = (node: INode) => {
  const readInput = <T>(inputName: string): T => {
    return readInputFromSockets(node.inputs, inputName, node.description.typeName)
  }

  const writeOutput = <T>(outputName: string, value: T) => {
    writeOutputsToSocket(node.outputs, outputName, value, node.description.typeName)
  }

  return {
    ...node,
    readInput,
    writeOutput
  }
}
