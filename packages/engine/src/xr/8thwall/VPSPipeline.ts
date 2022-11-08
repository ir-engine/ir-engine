import { BufferAttribute, BufferGeometry, Mesh, MeshBasicMaterial } from 'three'

import { World } from '../../ecs/classes/World'
import { XR8 } from './XR8'

export const VPSPipeline = (world: World) => {
  const meshes = new Map<string, Mesh>()
  const handleMeshUpdate = (args) => {
    // console.log(args)
    if (!args.detail) return
    const { id, position, rotation } = args.detail
    const mesh = meshes.get(id)
    if (!mesh) return
    if (position) mesh.position.copy(position)
    if (rotation) mesh.quaternion.copy(rotation)
  }

  const handleMeshFound = (args) => {
    // console.log(args)
    if (!args.detail) return
    const { id, geometry } = args.detail
    const scene = world.scene

    const material = new MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.7 })
    const geom = new BufferGeometry()
    geom.setIndex(new BufferAttribute(geometry.index.array, 1))
    geom.setAttribute('position', new BufferAttribute(geometry.attributes[0].array, 3))
    geom.setAttribute('color', new BufferAttribute(geometry.attributes[1].array, 3))
    const mesh = new Mesh(geom, material)
    mesh.name = 'vps-mesh'
    scene.add(mesh)

    meshes.set(id, mesh)

    handleMeshUpdate(args)
  }

  const handleMeshLost = (args) => {
    // console.log(args)
    if (!args.detail) return
    const { id } = args.detail
    const mesh = meshes.get(id)
    if (!mesh) return
    mesh.removeFromParent()
    meshes.delete(id)
  }

  return {
    name: 'VPSPipeline',
    onStart: () => {
      const watcher = XR8.Vps.makeWayspotWatcher({
        onVisible: () => {},
        onHidden: () => {},
        pollGps: true,
        lat: 0,
        lng: 0
      })
    },
    listeners: [
      // { event: 'reality.projectwayspotfound', process: console.log },
      // { event: 'reality.projectwayspotscanning', process: console.log },
      // { event: 'reality.projectwayspotlost', process: console.log },
      // { event: 'reality.projectwayspotupdated', process: console.log },
      { event: 'reality.meshfound', process: handleMeshFound },
      { event: 'reality.meshupdated', process: handleMeshUpdate },
      { event: 'reality.meshlost', process: handleMeshLost }
    ]
  }
}
