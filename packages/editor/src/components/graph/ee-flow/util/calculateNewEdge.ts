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

import { Node, OnConnectStartParams } from 'reactflow'
import { v4 as uuidv4 } from 'uuid'

import { NodeSpecGenerator } from '../hooks/useNodeSpecGenerator'
import { getSocketsByNodeTypeAndHandleType } from './getSocketsByNodeTypeAndHandleType'

export const calculateNewEdge = (
  originNode: Node,
  destinationNodeType: string,
  destinationNodeId: string,
  connection: OnConnectStartParams,
  specGenerator: NodeSpecGenerator
) => {
  const sockets = getSocketsByNodeTypeAndHandleType(
    specGenerator,
    originNode.type,
    originNode.data.configuration,
    connection.handleType
  )
  const originSocket = sockets?.find((socket) => socket.name === connection.handleId)

  const newSockets = getSocketsByNodeTypeAndHandleType(
    specGenerator,
    destinationNodeType,
    {},
    connection.handleType === 'source' ? 'target' : 'source'
  )
  const newSocket = newSockets?.find((socket) => socket.valueType === originSocket?.valueType)

  if (connection.handleType === 'source') {
    return {
      id: uuidv4(),
      source: connection.nodeId ?? '',
      sourceHandle: connection.handleId,
      target: destinationNodeId,
      targetHandle: newSocket?.name
    }
  }

  return {
    id: uuidv4(),
    target: connection.nodeId ?? '',
    targetHandle: connection.handleId,
    source: destinationNodeId,
    sourceHandle: newSocket?.name
  }
}
