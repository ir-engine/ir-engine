/**
 * @author Mugen87 / https://github.com/Mugen87
 */
import {
  BufferGeometry,
  Color,
  ConeGeometry,
  Float32BufferAttribute,
  Group,
  IcosahedronBufferGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  Vector3
} from 'three'
import { NavEdge, NavNode, Vector3 as YukaVector3 } from 'yuka'

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

function getClosestRegion(point: YukaVector3) {
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

function getClosestNavNode(navMesh: NavMesh, point: YukaVector3) {
  const region = getClosestRegion.call(navMesh, point)
  return navMesh.graph.getNode(navMesh.getNodeIndex(region))
}

function applyTransform(p: YukaVector3, r: Quaternion, s: YukaVector3) {
  return (vec: YukaVector3) => {
    const newVec = vec.clone()
    newVec.applyRotation(r as any)
    newVec.multiply(s)
    newVec.add(p)
    return newVec
  }
}

function createPathHelper(navMesh: NavMesh, path: Vector3[], nodeSize: number, color = 0x00ff00) {
  const group = new Group()

  // nodes

  const nodeMaterial = new MeshBasicMaterial({ color: new Color('orange'), depthTest: false, depthWrite: false })
  const nodeGeometry = new IcosahedronBufferGeometry(nodeSize, 2)

  // edges

  const edgesGeometry = new BufferGeometry()
  const position: number[] = []

  const edgesMaterial = new LineBasicMaterial({ color: color, depthTest: false, depthWrite: false })

  for (let i = 1, l = path.length; i < l; i++) {
    const from = path[i - 1]
    const to = path[i]
    const nodeMesh = new Mesh(nodeGeometry, nodeMaterial)

    position.push(from.x, from.y, from.z)
    position.push(to.x, to.y, to.z)

    nodeMesh.position.copy(to)
    group.add(nodeMesh)
  }

  edgesGeometry.setAttribute('position', new Float32BufferAttribute(position, 3))

  const lines = new LineSegments(edgesGeometry, edgesMaterial)
  lines.matrixAutoUpdate = false

  group.add(lines)

  return group
}

// TODO try to use this
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

function createGoalHelper(point: Vector3) {
  const height = 0.75
  console.log('POSITION OF GOAL', point.toArray())
  const geometry = new ConeGeometry(0.5 * height, height, 8)
  const material = new MeshBasicMaterial({ color: 'red' })
  const mesh = new Mesh(geometry, material)

  mesh.rotateZ(Math.PI)
  mesh.position.copy(point)
  mesh.position.y += 0.5 * height

  return mesh
}

export { createGraphHelper, createPathHelper, createSearchTreeHelper, createGoalHelper }
