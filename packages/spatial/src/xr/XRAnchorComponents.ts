/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { useEffect } from 'react'
import { BufferGeometry, Mesh, MeshLambertMaterial, MeshStandardMaterial, Object3D, ShadowMaterial } from 'three'
import matches from 'ts-matches'

import { EntityUUID, UUIDComponent } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { State, defineAction, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'

import { S } from '@ir-engine/ecs/src/ComponentSchemaUtils'
import { matchesQuaternion, matchesVector3 } from '../common/functions/MatchesUtils'
import { GroupComponent, addObjectToGroup } from '../renderer/components/GroupComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { XRState } from './XRState'

/**
 * A PersistentAnchorComponent specifies that an entity represents an
 *   AR location that can be resolved by a Visual Positioning System
 */
export const PersistentAnchorComponent = defineComponent({
  name: 'PersistentAnchorComponent',
  jsonID: 'EE_persistent_anchor',

  schema: S.Object({
    /** an identifiable name for this anchor */
    name: S.String(''),
    /** whether to show this object as a wireframe upon tracking - useful for debugging */
    wireframe: S.Bool(false),
    /** internal - whether this anchor is currently being tracked */
    active: S.Bool(false)
  }),

  reactor: PersistentAnchorReactor
})

const vpsMeshes = new Map<string, { wireframe?: boolean }>()

const shadowMat = new ShadowMaterial({ opacity: 0.5, color: 0x0a0a0a })
const occlusionMat = new MeshLambertMaterial({ colorWrite: false })

/** adds occlusion and shadow materials, and hides the mesh (or sets it to wireframe) */
const anchorMeshFound = (
  group: (Object3D & Mesh<BufferGeometry, MeshStandardMaterial>)[],
  wireframe: boolean,
  meshes: State<Mesh[]>
) => {
  for (const obj of group) {
    if (!obj.isMesh) continue
    if (!vpsMeshes.has(obj.uuid)) {
      const shadowMesh = new Mesh().copy(obj, true)
      shadowMesh.material = shadowMat
      const parentEntity = getComponent(obj.entity, EntityTreeComponent).parentEntity!
      addObjectToGroup(parentEntity, shadowMesh)

      const occlusionMesh = new Mesh().copy(obj, true)
      occlusionMesh.material = occlusionMat
      addObjectToGroup(parentEntity, occlusionMesh)

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
}

/** removes the occlusion and shadow materials, and resets the mesh */
const anchorMeshLost = (group: (Object3D & Mesh<BufferGeometry, MeshStandardMaterial>)[], meshes: State<Mesh[]>) => {
  for (const obj of group) {
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
  const xrState = useMutableState(XRState)

  const group = groupComponent?.value as (Object3D & Mesh<BufferGeometry, MeshStandardMaterial>)[] | undefined

  useEffect(() => {
    if (!group) return
    const active = anchor.value && xrState.sessionMode.value === 'immersive-ar'
    if (active) {
      /** remove from scene and add to world origins */
      const originalParent = getComponent(getComponent(entity, EntityTreeComponent).parentEntity, UUIDComponent)
      originalParentEntityUUID.set(originalParent)
      setComponent(entity, EntityTreeComponent, { parentEntity: Engine.instance.localFloorEntity })
      TransformComponent.dirtyTransforms[entity] = true

      const wireframe = anchor.wireframe.value
      anchorMeshFound(group, wireframe, meshes)
    } else {
      /** add back to the scene */
      const originalParent = UUIDComponent.getEntityByUUID(originalParentEntityUUID.value)
      setComponent(entity, EntityTreeComponent, { parentEntity: originalParent })
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
