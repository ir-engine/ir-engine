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
import { NodeConfiguration } from './Node'
import {
  INodeDefinition,
  NodeCategory,
  SocketDefinition,
  SocketsDefinition,
  SocketsList,
  SocketsMap
} from './NodeDefinitions'
import { INode, NodeType } from './NodeInstance'

const makeSocketFromDefinition = (key: string, { valueType, defaultValue, choices }: SocketDefinition) =>
  new Socket(valueType, key as string, defaultValue, undefined, choices)

const makeSocketsFromMap = <TSockets extends SocketsMap>(
  socketConfig: TSockets,
  keys: (keyof TSockets)[],
  configuration: NodeConfiguration,
  graphApi: IGraph
): Socket[] => {
  return keys.map((key) => {
    const definition = socketConfig[key]
    if (typeof definition === 'string') {
      return new Socket(definition, key as string)
    }
    if (typeof definition === 'function') {
      const socketDef = definition(configuration, graphApi)

      return makeSocketFromDefinition(key as string, socketDef)
    }
    return makeSocketFromDefinition(key as string, definition)
  })
}

const makeSocketsFromArray = (sockets: SocketsList) =>
  sockets.map((socket) => {
    return new Socket(socket.valueType, socket.key, socket.defaultValue, undefined, socket.choices)
  })

export function makeOrGenerateSockets(
  socketConfigOrFactory: SocketsDefinition,
  nodeConfig: NodeConfiguration,
  graph: IGraph
): Socket[] {
  // if sockets definition is dynamic, then use the node config to generate it;
  // otherwise, use the static definition
  if (typeof socketConfigOrFactory === 'function') {
    const socketsConfig = socketConfigOrFactory(nodeConfig, graph)

    return makeSocketsFromArray(socketsConfig)
  }

  return makeSocketsFromMap(socketConfigOrFactory, Object.keys(socketConfigOrFactory), nodeConfig, graph)
}

export const makeCommonProps = (
  nodeType: NodeType,
  {
    typeName,
    in: inputs,
    out,
    otherTypeNames = [],
    category = NodeCategory.None,
    configuration: nodeDefinitionConfiguration,
    helpDescription = '',
    label = ''
  }: Pick<
    INodeDefinition,
    'typeName' | 'in' | 'out' | 'otherTypeNames' | 'category' | 'configuration' | 'helpDescription' | 'label'
  >,
  configuration: NodeConfiguration,
  graph: IGraph
): INode => ({
  description: {
    typeName: typeName,
    configuration: nodeDefinitionConfiguration || {},
    category,
    otherTypeNames,
    helpDescription,
    label
  },
  nodeType: nodeType,
  inputs: makeOrGenerateSockets(inputs, configuration, graph),
  outputs: makeOrGenerateSockets(out, configuration, graph),
  configuration,
  graph
})
