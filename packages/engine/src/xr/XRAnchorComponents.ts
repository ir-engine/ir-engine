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

import { useEffect } from 'react'
import { BufferGeometry, Mesh, MeshLambertMaterial, MeshStandardMaterial, ShadowMaterial } from 'three'
import matches from 'ts-matches'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { defineAction, getMutableState, getState, State, useHookstate } from '@etherealengine/hyperflux'

import { matchesQuaternion, matchesVector3 } from '../common/functions/MatchesUtils'
import { Engine } from '../ecs/classes/Engine'
import { SceneState } from '../ecs/classes/Scene'
import { defineComponent, getComponent, useComponent, useOptionalComponent } from '../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../ecs/functions/EntityFunctions'
import { GroupComponent, Object3DWithEntity } from '../scene/components/GroupComponent'
import { UUIDComponent } from '../scene/components/UUIDComponent'
import { LocalTransformComponent, TransformComponent } from '../transform/components/TransformComponent'
import { XRState } from './XRState'

/**
 * A PersistentAnchorComponent specifies that an entity represents an
 *   AR location that can be resolved by a Visual Positioning System
 */
export const PersistentAnchorComponent = defineComponent({
  name: 'PersistentAnchorComponent',
  jsonID: 'persistent-anchor',

  /**
   * Set default initialization values
   * @param entity
   * @returns
   */
  onInit: (entity) => {
    return {
      /** an identifiable name for this anchor */
      name: '',
      /** whether to show this object as a wireframe upon tracking - useful for debugging */
      wireframe: false,
      /** internal - whether this anchor is currently being tracked */
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

  reactor: PersistentAnchorReactor
})

const vpsMeshes = new Map<string, { wireframe?: boolean }>()

const shadowMat = new ShadowMaterial({ opacity: 0.5, color: 0x0a0a0a })
const occlusionMat = new MeshLambertMaterial({ colorWrite: false })

/** adds occlusion and shadow materials, and hides the mesh (or sets it to wireframe) */
const anchorMeshFound = (
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
const anchorMeshLost = (
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
        vpsMeshes.delete(obj.uuid)
      }
    })
  }
  for (const mesh of meshes.value) {
    mesh.removeFromParent()
  }
  meshes.set([])
}

/**
 * PersistentAnchorComponent entity state reactor - reacts to the conditions upon which a mesh should be
 * @param
 * @returns
 */
function PersistentAnchorReactor() {
  const entity = useEntityContext()

  const originalParentEntityUUID = useHookstate('' as EntityUUID)
  const meshes = useHookstate([] as Mesh[])

  const anchor = useComponent(entity, PersistentAnchorComponent)
  const groupComponent = useOptionalComponent(entity, GroupComponent)
  const xrState = useHookstate(getMutableState(XRState))

  const group = groupComponent?.value as (Object3DWithEntity & Mesh<BufferGeometry, MeshStandardMaterial>)[] | undefined

  useEffect(() => {
    if (!group) return
    const active = anchor.value && xrState.sessionMode.value === 'immersive-ar'
    if (active) {
      /** remove from scene and add to world origins */
      const originalParent = getComponent(
        getComponent(entity, LocalTransformComponent).parentEntity ?? getState(SceneState).sceneEntity,
        UUIDComponent
      )
      originalParentEntityUUID.set(originalParent)
      const localTransform = getComponent(entity, LocalTransformComponent)
      localTransform.parentEntity = Engine.instance.originEntity
      TransformComponent.dirtyTransforms[entity] = true

      const wireframe = anchor.wireframe.value
      anchorMeshFound(group, wireframe, meshes)
    } else {
      /** add back to the scene */
      const originalParent = UUIDComponent.entitiesByUUID[originalParentEntityUUID.value]
      const localTransform = getComponent(entity, LocalTransformComponent)
      localTransform.parentEntity = originalParent
      TransformComponent.dirtyTransforms[entity] = true

      anchorMeshLost(group, meshes)
    }
  }, [anchor.active, groupComponent?.length, xrState.sessionActive])

  return null
}

export class PersistentAnchorActions {
  static anchorFound = defineAction({
    type: 'xre.anchor.anchorFound' as const,
    name: matches.string,
    position: matchesVector3,
    rotation: matchesQuaternion
  })

  static anchorUpdated = defineAction({
    type: 'xre.anchor.anchorUpdated' as const,
    name: matches.string,
    position: matchesVector3,
    rotation: matchesQuaternion
  })

  static anchorLost = defineAction({
    type: 'xre.anchor.anchorLost' as const,
    name: matches.string
  })
}
