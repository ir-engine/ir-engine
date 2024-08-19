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

import { GraphNodes } from '../Graph'

export function validateGraphLinks(nodes: GraphNodes): string[] {
  const errorList: string[] = []
  // for each node
  Object.values(nodes).forEach((node) => {
    // for each input socket
    node.inputs.forEach((inputSocket) => {
      // ensure that connected output sockets are the same type
      inputSocket.links.forEach((link) => {
        // check if the node id is correct
        if (!(link.nodeId in nodes)) {
          errorList.push(
            `node ${node.description.typeName}.${inputSocket.name} has link using invalid nodeId: ${link.nodeId}`
          )
          return
        }

        // check if the socketName is correct
        const upstreamNode = nodes[link.nodeId]
        const outputSocket = upstreamNode.outputs.find((socket) => socket.name === link.socketName)
        if (outputSocket === undefined) {
          errorList.push(
            `node ${node.description.typeName}.${inputSocket.name} has link using a non-existent socket name: ` +
              `${link.socketName}, it can not be found on upstream output node: ${upstreamNode.description.typeName}`
          )
          return
        }

        // check if the socket types align
        if (inputSocket.valueTypeName !== outputSocket.valueTypeName) {
          errorList.push(
            `type mismatch between ${node.description.typeName}.${inputSocket.name} [${inputSocket.valueTypeName}] ` +
              `and ${upstreamNode.description.typeName}.${outputSocket.name} [${outputSocket.valueTypeName}]`
          )
        }
      })
    })
  })
  return errorList
}
