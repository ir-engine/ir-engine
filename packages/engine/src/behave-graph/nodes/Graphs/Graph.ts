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

import { CustomEvent } from '../Events/CustomEvent.js'
import { Logger } from '../index.js'
import { Metadata } from '../Metadata.js'
import { NodeConfiguration } from '../Nodes/Node.js'
import { Dependencies } from '../Nodes/NodeDefinitions.js'
import { INode } from '../Nodes/NodeInstance.js'
import { IRegistry } from '../Registry.js'
import { Socket } from '../Sockets/Socket.js'
import { ValueTypeMap } from '../Values/ValueTypeMap.js'
import { Variable } from '../Values/Variables/Variable.js'

// Purpose:
//  - stores the node graph

export interface IGraphApi {
  readonly variables: { [id: string]: Variable }
  readonly customEvents: { [id: string]: CustomEvent }
  readonly values: ValueTypeMap
  readonly getDependency: <T>(id: string) => T | undefined
}

export type GraphNodes = { [id: string]: INode }
export type GraphVariables = { [id: string]: Variable }
export type GraphCustomEvents = { [id: string]: CustomEvent }

export type GraphInstance = {
  name: string
  metadata: Metadata
  nodes: GraphNodes
  customEvents: GraphCustomEvents
  variables: GraphVariables
}

export const createNode = ({
  graph,
  registry,
  nodeTypeName,
  nodeConfiguration = {}
}: {
  graph: IGraphApi
  registry: IRegistry
  nodeTypeName: string
  nodeConfiguration?: NodeConfiguration
}) => {
  let nodeDefinition = undefined
  if (registry.nodes[nodeTypeName]) {
    nodeDefinition = registry.nodes[nodeTypeName]
  }
  if (nodeDefinition === undefined) {
    Logger.verbose('known nodes: ' + Object.keys(registry.nodes).join(', '))
    throw new Error(`no registered node descriptions with the typeName ${nodeTypeName}`)
  }

  const node = nodeDefinition.nodeFactory(graph, nodeConfiguration)

  node.inputs.forEach((socket: Socket) => {
    if (socket.valueTypeName !== 'flow' && socket.value === undefined) {
      socket.value = registry.values[socket.valueTypeName]?.creator()
    }
  })

  return node
}

export const makeGraphApi = ({
  variables = {},
  customEvents = {},
  values,
  dependencies = {}
}: {
  customEvents?: GraphCustomEvents
  variables?: GraphVariables
  values: ValueTypeMap
  dependencies: Dependencies
}): IGraphApi => ({
  variables,
  customEvents,
  values,
  getDependency: (id: string) => {
    const result = dependencies[id]
    if (!result)
      console.error(
        `Dependency not found ${id}.  Did you register it? Existing dependencies: ${Object.keys(dependencies)}`
      )
    return result
  }
})
