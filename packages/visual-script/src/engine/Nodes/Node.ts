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

import { IGraph } from '../Graphs/Graph'
import { Socket } from '../Sockets/Socket'
import { INode, NodeType } from './NodeInstance'
import { readInputFromSockets, writeOutputsToSocket } from './NodeSockets'
import { INodeDescription } from './Registry/NodeDescription'

export type NodeConfiguration = {
  [key: string]: any
}

export abstract class Node<TNodeType extends NodeType> implements INode {
  public readonly inputs: Socket[]
  public readonly outputs: Socket[]
  public readonly description: INodeDescription
  // public typeName: string;
  public nodeType: TNodeType
  public readonly otherTypeNames: string[] | undefined
  public graph: IGraph
  public label?: string
  public metadata: any
  public readonly configuration: NodeConfiguration

  constructor(node: Omit<INode, 'nodeType' | 'id'> & { nodeType: TNodeType }) {
    this.inputs = node.inputs
    this.outputs = node.outputs
    this.description = node.description
    this.nodeType = node.nodeType
    this.graph = node.graph
    this.configuration = node.configuration
    this.metadata = node.metadata || {}
  }

  readInput = <T>(inputName: string): T => {
    return readInputFromSockets(this.inputs, inputName, this.description.typeName)
  }

  writeOutput = <T>(outputName: string, value: T) => {
    writeOutputsToSocket(this.outputs, outputName, value, this.description.typeName)
  }
}
