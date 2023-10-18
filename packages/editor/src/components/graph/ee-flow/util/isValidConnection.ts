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

import { Connection, ReactFlowInstance } from 'reactflow'

import { NodeSpecGenerator } from '../hooks/useNodeSpecGenerator'
import { getSocketsByNodeTypeAndHandleType } from './getSocketsByNodeTypeAndHandleType'
import { isHandleConnected } from './isHandleConnected'

export const isValidConnection = (
  connection: Connection,
  instance: ReactFlowInstance,
  specGenerator: NodeSpecGenerator
) => {
  if (connection.source === null || connection.target === null) return false

  const sourceNode = instance.getNode(connection.source)
  const targetNode = instance.getNode(connection.target)
  const edges = instance.getEdges()

  if (sourceNode === undefined || targetNode === undefined) return false

  const sourceSockets = getSocketsByNodeTypeAndHandleType(
    specGenerator,
    sourceNode.type,
    sourceNode.data.configuration,
    'source'
  )

  const sourceSocket = sourceSockets?.find((socket) => socket.name === connection.sourceHandle)

  const targetSockets = getSocketsByNodeTypeAndHandleType(
    specGenerator,
    targetNode.type,
    targetNode.data.configuration,
    'target'
  )

  const targetSocket = targetSockets?.find((socket) => socket.name === connection.targetHandle)

  if (sourceSocket === undefined || targetSocket === undefined) return false

  // only flow sockets can have two inputs
  if (targetSocket.valueType !== 'flow' && isHandleConnected(edges, targetNode.id, targetSocket.name, 'target')) {
    return false
  }

  return sourceSocket.valueType === targetSocket.valueType
}
