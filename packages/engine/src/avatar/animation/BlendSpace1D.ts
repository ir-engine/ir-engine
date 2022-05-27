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
