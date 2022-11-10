import { useEffect } from 'react'
import { BufferGeometry, Mesh, MeshLambertMaterial, MeshStandardMaterial, ShadowMaterial } from 'three'
import matches from 'ts-matches'

import { defineAction, getState, State, useHookstate } from '@xrengine/hyperflux'

import { matchesQuaternion, matchesVector3 } from '../common/functions/MatchesUtils'
import { defineComponent, hasComponent, useComponent, useOptionalComponent } from '../ecs/functions/ComponentFunctions'
import { EntityReactorProps } from '../ecs/functions/EntityFunctions'
import { GroupComponent, Object3DWithEntity } from '../scene/components/GroupComponent'
import { XRState } from './XRState'

/**
 * A VPSWayspotComponent specifies that an entity represents an
 *   AR location that can be resolved by a Visual Positioning System
 */
export const VPSWayspotComponent = defineComponent({
  name: 'VPSWayspotComponent',

  /**
   * Set default initialization values
   * @param entity
   * @returns
   */
  onInit: (entity) => {
    return {
      /** an identifiable name for this wayspot */
      name: '',
      /** whether to show this object as a wireframe upon tracking - useful for debugging */
      wireframe: false,
      /** internal - whether this wayspot is currently being tracked */
      active: false
    }
  },

  /**
   * Specify JSON serialization schema
   * @param entity
   * @param component
   * @returns
   */
  toJSON: (entity, component) => {
    return {
      name: component.name.value,
      wireframe: component.wireframe.value
    }
  },

  /**
   * Handle data deserialization
   * @param entity
   * @param component
   * @param json
   * @returns
   */
  onSet: (entity, component, json) => {
    if (!json) return

    if (typeof json.name === 'string' && json.name !== component.name.value) component.name.set(json.name)

    if (typeof json.wireframe === 'string' && json.wireframe !== component.wireframe.value)
      component.wireframe.set(json.wireframe)
  },

  reactor: VPSReactor
})

export const SCENE_COMPONENT_VPS_WAYSPOT = 'vps-wayspot'

const vpsMeshes = new Map<string, { wireframe?: boolean }>()

const shadowMat = new ShadowMaterial({ opacity: 0.5, color: 0x0a0a0a })
const occlusionMat = new MeshLambertMaterial({ colorWrite: false })

/** adds occlusion and shadow materials, and hides the mesh (or sets it to wireframe) */
const vpsMeshWayspotFound = (
  group: (Object3DWithEntity & Mesh<BufferGeometry, MeshStandardMaterial>)[],
  wireframe: boolean,
  meshes: State<Mesh[]>
) => {
  for (const object of group) {
    object.traverse((obj: Mesh<BufferGeometry, MeshStandardMaterial>) => {
      if (obj.isMesh) {
        if (!vpsMeshes.has(obj.uuid)) {
          const shadowMesh = new Mesh().copy(obj, true)
          shadowMesh.material = shadowMat
          obj.parent!.add(shadowMesh)

          const occlusionMesh = new Mesh().copy(obj, true)
          occlusionMesh.material = occlusionMat
          obj.parent!.add(occlusionMesh)

          if (wireframe) {
            obj.material.wireframe = true
          } else {
            obj.visible = false
          }

          vpsMeshes.set(obj.uuid, {
            wireframe: wireframe ? obj.material.wireframe : undefined
          })

          meshes.merge([shadowMesh, occlusionMesh])
        }
      }
    })
  }
}

/** removes the occlusion and shadow materials, and resets the mesh */
const vpsMeshWayspotLost = (
  group: (Object3DWithEntity & Mesh<BufferGeometry, MeshStandardMaterial>)[],
  meshes: State<Mesh[]>
) => {
  for (const object of group) {
    object.traverse((obj: Mesh<BufferGeometry, MeshStandardMaterial>) => {
      if (obj.material && vpsMeshes.has(obj.uuid)) {
        const wireframe = vpsMeshes.get(obj.uuid)!.wireframe
        if (typeof wireframe === 'boolean') {
          obj.material.wireframe = wireframe
        } else {
          obj.visible = true
        }
        delete obj.userData.XR8_VPS
      }
    })
  }
  for (const mesh of meshes.value) {
    mesh.removeFromParent()
  }
  meshes.set([])
}

/**
 * VPSWayspotComponent entity state reactor - reacts to the conditions upon which a mesh should be
 * @param
 * @returns
 */
function VPSReactor({ root }: EntityReactorProps) {
  const entity = root.entity

  const meshes = useHookstate([] as Mesh[])

  const vpsWayspot = useOptionalComponent(entity, VPSWayspotComponent)
  const groupComponent = useOptionalComponent(entity, GroupComponent)
  const xrState = useHookstate(getState(XRState))

  const group = groupComponent?.value as (Object3DWithEntity & Mesh<BufferGeometry, MeshStandardMaterial>)[] | undefined

  useEffect(() => {
    if (!group) return
    const active = !!vpsWayspot?.active?.value && xrState.sessionActive.value
    if (active) {
      vpsMeshWayspotFound(group, vpsWayspot?.wireframe.value, meshes)
    } else {
      vpsMeshWayspotLost(group, meshes)
    }
  }, [vpsWayspot?.active, groupComponent?.length, xrState.sessionActive])

  if (!hasComponent(entity, VPSWayspotComponent)) throw root.stop()

  return null
}

export class VPSActions {
  static wayspotFound = defineAction({
    type: 'xre.vps.wayspotFound' as const,
    name: matches.string,
    position: matchesVector3,
    rotation: matchesQuaternion
  })

  static wayspotUpdated = defineAction({
    type: 'xre.vps.wayspotUpdated' as const,
    name: matches.string,
    position: matchesVector3,
    rotation: matchesQuaternion
  })

  static wayspotLost = defineAction({
    type: 'xre.vps.wayspotLost' as const,
    name: matches.string
  })
}
