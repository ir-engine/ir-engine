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

import { Edge, Node } from 'reactflow'

import { GraphJSON, NodeJSON, ValueJSON } from '@behave-graph/core'
import { NodeSpecGenerator } from '../hooks/useNodeSpecGenerator'

const isNullish = (value: any): value is null | undefined => value === undefined || value === null

export const flowToBehave = (nodes: Node[], edges: Edge[], specGenerator: NodeSpecGenerator): GraphJSON => {
  const graph: GraphJSON = { nodes: [], variables: [], customEvents: [] }

  nodes.forEach((node) => {
    if (node.type === undefined) return

    const nodeSpec = specGenerator.getNodeSpec(node.type, node.data.configuration)
    if (nodeSpec === undefined) return
    const behaveNode: NodeJSON = {
      id: node.id,
      type: node.type,
      metadata: {
        positionX: String(node.position.x),
        positionY: String(node.position.y)
      }
    }
    Object.entries(node.data.configuration).forEach(([key, value]) => {
      if (behaveNode.configuration === undefined) {
        behaveNode.configuration = {}
      }
      behaveNode.configuration[key] = value as ValueJSON
    })

    Object.entries(node.data.values).forEach(([key, value]) => {
      if (behaveNode.parameters === undefined) {
        behaveNode.parameters = {}
      }
      behaveNode.parameters[key] = { value: value as string }
    })
    if (node.parentNode) {
      behaveNode.metadata!.parentNode = node.parentNode
    }
    if (node.style) {
      behaveNode.metadata!.style = node.style as any
    }
    if (node.data.label) {
      behaveNode.metadata!.label = node.data.label as any
    }
    // check for
    edges
      .filter((edge) => edge.target === node.id)
      .forEach((edge) => {
        const inputSpec = nodeSpec.inputs.find((input) => input.name === edge.targetHandle)
        if (inputSpec && inputSpec.valueType === 'flow') {
          // skip flows
          return
        }
        if (behaveNode.parameters === undefined) {
          behaveNode.parameters = {}
        }
        if (isNullish(edge.targetHandle)) return
        if (isNullish(edge.sourceHandle)) return

        // TODO: some of these are flow outputs, and should be saved differently.  -Ben, Oct 11, 2022
        behaveNode.parameters[edge.targetHandle] = {
          link: { nodeId: edge.source, socket: edge.sourceHandle }
        }
      })

    edges
      .filter((edge) => edge.source === node.id)
      .forEach((edge) => {
        const outputSpec = nodeSpec.outputs.find((output) => output.name === edge.sourceHandle)
        if (outputSpec && outputSpec.valueType !== 'flow') {
          return
        }
        if (behaveNode.flows === undefined) {
          behaveNode.flows = {}
        }
        if (isNullish(edge.targetHandle)) return
        if (isNullish(edge.sourceHandle)) return

        // TODO: some of these are flow outputs, and should be saved differently.  -Ben, Oct 11, 2022
        behaveNode.flows[edge.sourceHandle] = {
          nodeId: edge.target,
          socket: edge.targetHandle
        }
      })

    graph.nodes?.push(behaveNode)
  })

  return graph
}
