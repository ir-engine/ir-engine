/**
 * @author Mugen87 / https://github.com/Mugen87
 */
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  IcosahedronBufferGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  Quaternion
} from 'three'
import { NavEdge, NavNode, Path, Vector3 } from 'yuka'

import { NavMesh } from '../scene/classes/NavMesh'

function createGraphHelper(graph, nodeSize = 1, nodeColor = 0x4e84c4, edgeColor = 0xffffff) {
  const group = new Group()

  // nodes

  const nodeMaterial = new MeshBasicMaterial({ color: nodeColor, depthTest: false, depthWrite: false })
  const nodeGeometry = new IcosahedronBufferGeometry(nodeSize, 2)

  const nodes: NavNode[] = []

  graph.getNodes(nodes)

  for (let node of nodes) {
    const nodeMesh = new Mesh(nodeGeometry, nodeMaterial)
    nodeMesh.position.copy(node.position as any)
    nodeMesh.userData.nodeIndex = node.index

    nodeMesh.matrixAutoUpdate = false
    nodeMesh.updateMatrix()

    group.add(nodeMesh)
  }

  // edges

  const edgesGeometry = new BufferGeometry()
  const position: number[] = []

  const edgesMaterial = new LineBasicMaterial({ color: edgeColor, depthTest: false, depthWrite: false })

  const edges: NavEdge[] = []

  for (let node of nodes) {
    graph.getEdgesOfNode(node.index, edges)

    for (let edge of edges) {
      const fromNode = graph.getNode(edge.from)
      const toNode = graph.getNode(edge.to)

      position.push(fromNode.position.x, fromNode.position.y, fromNode.position.z)
      position.push(toNode.position.x, toNode.position.y, toNode.position.z)
    }
  }

  edgesGeometry.setAttribute('position', new Float32BufferAttribute(position, 3))

  const lines = new LineSegments(edgesGeometry, edgesMaterial)
  lines.matrixAutoUpdate = false

  group.add(lines)

  return group
}

let _debug = false

function getClosestRegion(point: Vector3) {
  const regions = this.regions
  let closesRegion = null
  let minDistance = Infinity

  for (let i = 0, l = regions.length; i < l; i++) {
    const region = regions[i]

    const distance = point.squaredDistanceTo(region.centroid)

    if (distance < minDistance) {
      minDistance = distance

      closesRegion = region
    }
  }

  _debug && console.log('closest region distance', minDistance)
  return closesRegion
}

function getClosestNavNode(navMesh: NavMesh, point: Vector3) {
  const region = getClosestRegion.call(navMesh, point)
  return navMesh.graph.getNode(navMesh.getNodeIndex(region))
}

function applyTransform(p: Vector3, r: Quaternion, s: Vector3) {
  return (vec: Vector3) => {
    const newVec = vec.clone()
    newVec.applyRotation(r as any)
    newVec.multiply(s)
    newVec.add(p)
    return newVec
  }
}

function createPathHelper(navMesh: NavMesh, path: number[], nodeSize: number, color = 0x00ff00) {
  const group = new Group()

  // nodes

  const startNodeMaterial = new MeshBasicMaterial({ color: new Color('purple'), depthTest: false, depthWrite: false })
  const endNodeMaterial = new MeshBasicMaterial({ color: new Color('orange'), depthTest: false, depthWrite: false })
  const nodeGeometry = new IcosahedronBufferGeometry(nodeSize, 2)

  const startNodeMesh = new Mesh(nodeGeometry, startNodeMaterial)
  const endNodeMesh = new Mesh(nodeGeometry, endNodeMaterial)

  const start = navMesh.regions[path[0]].centroid
  const end = navMesh.regions[path[path.length - 1]].centroid

  startNodeMesh.position.copy(start as any)
  endNodeMesh.position.copy(end as any)

  group.add(startNodeMesh)
  group.add(endNodeMesh)

  // edges

  const edgesGeometry = new BufferGeometry()
  const position: number[] = []

  const edgesMaterial = new LineBasicMaterial({ color: color, depthTest: false, depthWrite: false })

  for (let i = 0, l = path.length - 1; i < l; i++) {
    const from = navMesh.regions[path[i]].centroid
    const to = navMesh.regions[path[i + 1]].centroid

    position.push(from.x, from.y, from.z)
    position.push(to.x, to.y, to.z)
  }

  edgesGeometry.setAttribute('position', new Float32BufferAttribute(position, 3))

  const lines = new LineSegments(edgesGeometry, edgesMaterial)
  lines.matrixAutoUpdate = false

  group.add(lines)

  return group
}

function createSearchTreeHelper(graph, searchTree, color = 0xff0000) {
  const geometry = new BufferGeometry()
  const position: number[] = []

  const material = new LineBasicMaterial({ color: color })

  for (let edge of searchTree) {
    const fromNode = graph.getNode(edge.from)
    const toNode = graph.getNode(edge.to)

    position.push(fromNode.position.x, fromNode.position.y, fromNode.position.z)
    position.push(toNode.position.x, toNode.position.y, toNode.position.z)
  }

  geometry.setAttribute('position', new Float32BufferAttribute(position, 3))

  const lines = new LineSegments(geometry, material)
  lines.matrixAutoUpdate = false

  return lines
}

export { createGraphHelper, createPathHelper, createSearchTreeHelper }
