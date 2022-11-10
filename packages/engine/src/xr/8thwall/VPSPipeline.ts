import {
  BufferAttribute,
  BufferGeometry,
  Color,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Quaternion,
  Vector3
} from 'three'

import { World } from '../../ecs/classes/World'
import { defineQuery, getComponentState } from '../../ecs/functions/ComponentFunctions'
import { VPSWaypointComponent } from '../VPSComponents'
import { updateWorldOrigin } from '../XRAnchorSystem'
import { XR8 } from './XR8'
import {
  CameraPipelineModule,
  WayspotFoundEvent,
  WayspotLostEvent,
  WayspotScanningEvent,
  WayspotUpdatedEvent
} from './XR8Types'

export const VPSPipeline = (world: World) => {
  const vec3 = new Vector3()
  const quat = new Quaternion()

  const vpsWaypointQuery = defineQuery([VPSWaypointComponent])

  /**
   * @todo
   * Refactor to use meshes for occlusion & shadow
   */
  const meshes = new Map<string, Mesh>()
  const onMeshUpdate = (args) => {
    console.log(args)
    if (!args.detail) return
    const { id, position, rotation } = args.detail
    const mesh = meshes.get(id)
    if (!mesh) return
    if (position) mesh.position.copy(position)
    if (rotation) mesh.quaternion.copy(rotation)
  }

  const onMeshFound = (args) => {
    console.log(args)
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

    onMeshUpdate(args)
  }

  const onMeshLost = (args) => {
    console.log(args)
    if (!args.detail) return
    const { id } = args.detail
    const mesh = meshes.get(id)
    if (!mesh) return
    mesh.removeFromParent()
    meshes.delete(id)
  }

  const onWayspotScanning = (event: WayspotScanningEvent) => {
    console.log(event)
  }

  const onWayspotFound = (event: WayspotFoundEvent) => {
    console.log(event)
    const { name } = event.detail

    const waypoints = vpsWaypointQuery()
    for (const entity of waypoints) {
      const waypoint = getComponentState(entity, VPSWaypointComponent)
      if (waypoint.name.value === name) waypoint.active.set(true)
    }

    onWayspotUpdated(event as any)
  }

  const onWayspotUpdated = (event: WayspotUpdatedEvent) => {
    console.log(event)
    const { position, rotation } = event.detail
    updateWorldOrigin(world, vec3.copy(position as Vector3), quat.copy(rotation as Quaternion))
  }

  const onWayspotLost = (event: WayspotLostEvent) => {
    console.log(event)
    const { name } = event.detail
    const waypoints = vpsWaypointQuery()
    for (const entity of waypoints) {
      const waypoint = getComponentState(entity, VPSWaypointComponent)
      if (waypoint.name.value === name) waypoint.active.set(false)
    }
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
      { event: 'reality.projectwayspotfound', process: onWayspotFound },
      { event: 'reality.projectwayspotscanning', process: onWayspotScanning },
      { event: 'reality.projectwayspotlost', process: onWayspotLost },
      { event: 'reality.projectwayspotupdated', process: onWayspotUpdated }
      // { event: 'reality.meshfound', process: onMeshFound },
      // { event: 'reality.meshupdated', process: onMeshUpdate },
      // { event: 'reality.meshlost', process: onMeshLost }
    ]
  } as CameraPipelineModule
}
