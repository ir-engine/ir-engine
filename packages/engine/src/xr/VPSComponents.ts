import { useEffect } from 'react'
import { Mesh, MeshBasicMaterial, MeshPhongMaterial, ShadowMaterial } from 'three'

import { useHookstate } from '@xrengine/hyperflux'

import {
  defineComponent,
  getComponent,
  hasComponent,
  useComponent,
  useOptionalComponent
} from '../ecs/functions/ComponentFunctions'
import { EntityReactorProps } from '../ecs/functions/EntityFunctions'
import {
  addObjectToGroup,
  GroupComponent,
  Object3DWithEntity,
  removeObjectFromGroup
} from '../scene/components/GroupComponent'

const shadowMat = new ShadowMaterial({ opacity: 0.5, color: 0x0a0a0a })
const wireframeMat = new MeshBasicMaterial({ wireframe: true })
const occlusionMat = new MeshPhongMaterial({ colorWrite: false })

export const VPSWaypointComponent = defineComponent({
  name: 'VPSWaypointComponent',

  onInit: (entity) => {
    return {
      name: '',
      active: false
    }
  },

  toJSON: (entity, component) => {
    return {
      name: component.name.value
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    console.log(json.name, component.name.value)
    if (typeof json.name === 'string' && json.name !== component.name.value) component.name.set(json.name)
  },

  onRemove: (entity, component) => {},

  reactor: VPSReactor
})

export const SCENE_COMPONENT_VPS_WAYPOINT = 'vps-waypoint'

function VPSReactor({ root }: EntityReactorProps) {
  const entity = root.entity
  if (!hasComponent(entity, VPSWaypointComponent)) throw root.stop()

  const meshes = useHookstate([] as Mesh[])

  const vpsWaypoint = useComponent(entity, VPSWaypointComponent)
  const group = useOptionalComponent(entity, GroupComponent)

  // update scene
  useEffect(() => {
    if (!group?.value) return

    const active = vpsWaypoint.active.value
    if (active) {
      for (const object of group.value as (Object3DWithEntity & Mesh)[]) {
        object.traverse((obj: Mesh) => {
          if (obj.isMesh) {
            if (!obj.userData.XR8_VPS) obj.userData.XR8_VPS = {}
            if (!obj.userData.XR8_VPS.oldMaterial) {
              obj.userData.XR8_VPS.oldMaterial = obj.material
              obj.material = occlusionMat

              const shadowMesh = new Mesh().copy(obj, true)
              shadowMesh.material = shadowMat
              obj.parent!.add(shadowMesh)

              const wireframeMesh = new Mesh().copy(obj, true)
              wireframeMesh.material = wireframeMat
              obj.parent!.add(wireframeMesh)

              meshes.merge([shadowMesh, wireframeMesh])
            }
          }
        })
      }
    } else {
      for (const object of group.value) {
        object.traverse((obj: Mesh) => {
          if (obj.material && obj.userData?.XR8_VPS?.oldMaterial) {
            obj.material = obj.userData.XR8_VPS.oldMaterial
            delete obj.userData.XR8_VPS.oldMaterial
          }
        })
      }
      for (const mesh of meshes.value) {
        mesh.removeFromParent()
      }
    }
  }, [vpsWaypoint.active, group])

  return null
}
