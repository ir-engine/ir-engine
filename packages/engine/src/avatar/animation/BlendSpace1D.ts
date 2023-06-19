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

import { AnimationAction } from 'three'

// BlendSpace 1D allow any number of animations to be blended between based on a input value
export type BlendSpace1D = {
  minValue: number
  maxValue: number
  //Note: Nodes should only updated by related functions
  nodes: any[]
}

function zeroOtherNodesWeight(currentNodes: any[], nodes: any[]) {
  nodes.filter((x) => !currentNodes.includes(x)).forEach((x) => (x.action.weight = 0))
}

/** Binary search, needs at least 2 nodes to work */
function findNearestNodes(nodes: any[], value) {
  let first = 1,
    last = nodes.length - 1,
    count = last - first

  while (count > 0) {
    const step = Math.floor(count / 2)
    const middle = first + step

    if (value > nodes[middle].position) {
      first = middle + 1
      count -= step + 1
    } else {
      count = step
    }
  }

  return [nodes[first - 1], nodes[first]]
}

function sortNodes(nodes: any[]) {
  nodes.sort((a, b) => a.position - b.position)
}

/**
 * Adds a node to the graph the position must be between min/max values
 *
 * @param action Animation action of the node
 * @param position Position of the animation action
 * @param data Optional user data
 */
export function addBlendSpace1DNode(
  blendSpace: BlendSpace1D,
  action: AnimationAction,
  position: number,
  data: any = null
) {
  // Test position against min/max values
  if (position < blendSpace.minValue || position > blendSpace.maxValue) {
    console.warn(
      'BlendSpace1D: Added action position is out of range.',
      position,
      blendSpace.minValue,
      blendSpace.maxValue
    )
  }

  blendSpace.nodes.push({ action, weight: 0, position, data })
  sortNodes(blendSpace.nodes)
}

export function updateBlendSpace1D(blendSpace: BlendSpace1D, value: number) {
  const { nodes } = blendSpace
  // At least two nodes should be present
  if (nodes.length < 2) {
    return []
  }

  value = Math.max(Math.min(blendSpace.maxValue, value), blendSpace.minValue)

  const foundNodes = findNearestNodes(nodes, value)
  const [nodeA, nodeB] = foundNodes

  zeroOtherNodesWeight(foundNodes, nodes)

  const diff = nodeB.position - nodeA.position,
    alpha = diff < 0.00001 ? 0 : (value - nodeA.position) / diff

  nodeA.action.weight = nodeA.weight = 1 - alpha
  nodeB.action.weight = nodeB.weight = alpha

  return foundNodes
}
