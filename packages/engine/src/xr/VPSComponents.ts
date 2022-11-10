import { useEffect } from 'react'
import { BufferGeometry, Mesh, MeshLambertMaterial, MeshStandardMaterial, ShadowMaterial } from 'three'

import { getState, State, useHookstate } from '@xrengine/hyperflux'

import { defineComponent, hasComponent, useComponent } from '../ecs/functions/ComponentFunctions'
import { EntityReactorProps } from '../ecs/functions/EntityFunctions'
import { GroupComponent, Object3DWithEntity } from '../scene/components/GroupComponent'
import { setVisibleComponent } from '../scene/components/VisibleComponent'
import { XRState } from './XRState'

const shadowMat = new ShadowMaterial({ opacity: 0.5, color: 0x0a0a0a })
const occlusionMat = new MeshLambertMaterial({ colorWrite: false })

export const VPSWaypointComponent = defineComponent({
  name: 'VPSWaypointComponent',

  onInit: (entity) => {
    return {
      name: '',
      active: false,
      wireframe: false
    }
  },

  toJSON: (entity, component) => {
    return {
      name: component.name.value,
      wireframe: component.wireframe.value
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.name === 'string' && json.name !== component.name.value) component.name.set(json.name)
    if (typeof json.wireframe === 'string' && json.wireframe !== component.wireframe.value)
      component.wireframe.set(json.wireframe)
  },

  onRemove: (entity, component) => {},

  reactor: VPSReactor
})

export const SCENE_COMPONENT_VPS_WAYPOINT = 'vps-waypoint'

const vpsMeshWaypointFound = (
  group: (Object3DWithEntity & Mesh<BufferGeometry, MeshStandardMaterial>)[],
  wireframe: boolean,
  meshes: State<Mesh[]>
) => {
  for (const object of group) {
    object.traverse((obj: Mesh<BufferGeometry, MeshStandardMaterial>) => {
      if (obj.isMesh) {
        if (!obj.userData.XR8_VPS) {
          obj.userData.XR8_VPS = {}

          if (wireframe) {
            obj.userData.XR8_VPS.wireframe = obj.material.wireframe
            obj.material.wireframe = true
          } else {
            obj.material.visible = false
          }

          const shadowMesh = new Mesh().copy(obj, true)
          shadowMesh.material = shadowMat
          obj.parent!.add(shadowMesh)

          const occlusionMesh = new Mesh().copy(obj, true)
          occlusionMesh.material = occlusionMat
          obj.parent!.add(occlusionMesh)

          meshes.merge([shadowMesh, occlusionMesh])
        }
      }
    })
  }
}

const vpsMeshWaypointLost = (
  group: (Object3DWithEntity & Mesh<BufferGeometry, MeshStandardMaterial>)[],
  meshes: State<Mesh[]>
) => {
  for (const object of group) {
    object.traverse((obj: Mesh<BufferGeometry, MeshStandardMaterial>) => {
      if (obj.material && obj.userData?.XR8_VPS) {
        obj.material.wireframe = obj.userData.XR8_VPS.wireframe
        obj.material.visible = true
        delete obj.userData.XR8_VPS
      }
    })
  }
  for (const mesh of meshes.value) {
    mesh.removeFromParent()
  }
}

function VPSReactor({ root }: EntityReactorProps) {
  const entity = root.entity
  if (!hasComponent(entity, VPSWaypointComponent) || !hasComponent(entity, GroupComponent)) throw root.stop()

  const meshes = useHookstate([] as Mesh[])

  const vpsWaypoint = useComponent(entity, VPSWaypointComponent)
  const groupComponent = useComponent(entity, GroupComponent)
  const xrState = useHookstate(getState(XRState))

  const group = groupComponent.value as (Object3DWithEntity & Mesh<BufferGeometry, MeshStandardMaterial>)[]

  useEffect(() => {
    const active = vpsWaypoint.active.value && xrState.sessionActive.value
    // setVisibleComponent(entity, active)
    if (active) {
      vpsMeshWaypointFound(group, vpsWaypoint.wireframe.value, meshes)
    } else {
      vpsMeshWaypointLost(group, meshes)
    }
  }, [vpsWaypoint.active, groupComponent])

  return null
}
