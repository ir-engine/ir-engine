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

import { createNode, makeGraphApi } from '../../Graphs/Graph'
import { IRegistry } from '../../Registry'

const nodeTypeNameRegex = /^\w+(\/\w+)*$/
const socketNameRegex = /^\w+$/

export function validateNodeRegistry(registry: IRegistry): string[] {
  const errorList: string[] = []
  // const graph = new Graph(registry);
  const graph = makeGraphApi({
    ...registry
  })
  Object.keys(registry.nodes).forEach((nodeTypeName) => {
    const node = createNode({ graph, registry, nodeTypeName })

    // ensure node is registered correctly.
    if (node.description.typeName !== nodeTypeName) {
      if (!node.description.otherTypeNames?.includes(nodeTypeName)) {
        errorList.push(
          `node with typeName '${node.description.typeName}' is registered under a different name '${nodeTypeName}'`
        )
      }
    }

    if (!nodeTypeNameRegex.test(node.description.typeName)) {
      errorList.push(`invalid node type name on node ${node.description.typeName}`)
    }

    node.inputs.forEach((socket) => {
      if (!socketNameRegex.test(socket.name)) {
        errorList.push(`invalid socket name for input socket ${socket.name} on node ${node.description.typeName}`)
      }

      if (socket.valueTypeName === 'flow') {
        return
      }
      const valueType = registry.values[socket.valueTypeName]
      // check to ensure all value types are supported.
      if (valueType === undefined) {
        errorList.push(
          `node '${node.description.typeName}' has on input socket '${socket.name}' an unregistered value type '${socket.valueTypeName}'`
        )
      }
    })

    node.outputs.forEach((socket) => {
      if (!socketNameRegex.test(socket.name)) {
        errorList.push(`invalid socket name for output socket ${socket.name} on node ${node.description.typeName}`)
      }
      if (socket.valueTypeName === 'flow') {
        return
      }
      const valueType = registry.values[socket.valueTypeName]
      // check to ensure all value types are supported.
      if (valueType === undefined) {
        errorList.push(
          `node '${node.description.typeName}' has on output socket '${socket.name}' an unregistered value type '${socket.valueTypeName}'`
        )
      }
    })
  })
  return errorList
}
