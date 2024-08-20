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

import { Edge, Node } from 'reactflow'
import { v4 as uuidv4 } from 'uuid'

import { GraphJSON, NodeConfigurationJSON } from '@ir-engine/visual-script'

export const visualToFlow = (visualScript: GraphJSON): [Node[], Edge[]] => {
  const nodes: Node[] = []
  const edges: Edge[] = []

  visualScript.nodes?.forEach((nodeJSON) => {
    const node: Node = {
      id: nodeJSON.id,
      type: nodeJSON.type,
      position: {
        x: nodeJSON.metadata?.positionX ? Number(nodeJSON.metadata?.positionX) : 0,
        y: nodeJSON.metadata?.positionY ? Number(nodeJSON.metadata?.positionY) : 0
      },
      data: {
        configuration: {} as NodeConfigurationJSON,
        values: {} as { [key: string]: any }
      }
    }
    if (nodeJSON.metadata?.parentNode) {
      node.parentNode = nodeJSON.metadata.parentNode
    }
    if (nodeJSON.metadata?.style) {
      node.style = nodeJSON.metadata.style as any
    }
    if (nodeJSON.metadata?.label) {
      node.data.label = nodeJSON.metadata.label
    }
    nodes.push(node)

    if (nodeJSON.configuration) {
      for (const [inputKey, input] of Object.entries(nodeJSON.configuration)) {
        node.data.configuration[inputKey] = input
      }
    }

    if (nodeJSON.parameters) {
      for (const [inputKey, input] of Object.entries(nodeJSON.parameters)) {
        if ('link' in input && input.link !== undefined) {
          edges.push({
            id: uuidv4(),
            source: input.link.nodeId,
            sourceHandle: input.link.socket,
            target: nodeJSON.id,
            targetHandle: inputKey
          })
        }
        if ('value' in input) {
          node.data.values[inputKey] = input.value
        }
      }
    }

    if (nodeJSON.flows) {
      for (const [inputKey, link] of Object.entries(nodeJSON.flows)) {
        edges.push({
          id: uuidv4(),
          source: nodeJSON.id,
          sourceHandle: inputKey,
          target: link.nodeId,
          targetHandle: link.socket
        })
      }
    }
  })

  return [nodes, edges]
}
