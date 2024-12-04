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
import { BufferGeometry, Mesh, MeshStandardMaterial, Object3D, ShadowMaterial } from 'three'
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
import { createEntity, removeEntity, useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { defineAction, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { NameComponent } from '../common/NameComponent'
import { matchesQuaternion, matchesVector3 } from '../common/functions/MatchesUtils'
import { MeshComponent } from '../renderer/components/MeshComponent'
import { ObjectComponent } from '../renderer/components/ObjectComponent'
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

const shadowMat = new ShadowMaterial({ opacity: 0.5, color: 0x0a0a0a, colorWrite: false })

/**
 * PersistentAnchorComponent entity state reactor - reacts to the conditions upon which a mesh should be
 * @param
 * @returns
 */
function PersistentAnchorReactor() {
  const entity = useEntityContext()

  const originalParentEntityUUID = useHookstate('' as EntityUUID)

  const anchor = useComponent(entity, PersistentAnchorComponent)
  const objectComponent = useOptionalComponent(entity, ObjectComponent)
  const xrState = useMutableState(XRState)

  const obj = objectComponent?.value as (Object3D & Mesh<BufferGeometry, MeshStandardMaterial>) | undefined

  useEffect(() => {
    if (!obj) return
    const active = anchor.value && xrState.sessionMode.value === 'immersive-ar'
    if (!active) return

    /** remove from scene and add to world origins */
    const originalParent = getComponent(getComponent(entity, EntityTreeComponent).parentEntity, UUIDComponent)
    originalParentEntityUUID.set(originalParent)
    setComponent(entity, EntityTreeComponent, { parentEntity: Engine.instance.localFloorEntity })
    TransformComponent.dirtyTransforms[entity] = true

    const wireframe = anchor.wireframe.value

    const shadowMesh = new Mesh().copy(obj, true)
    shadowMesh.material = shadowMat
    const parentEntity = getComponent(obj.entity, EntityTreeComponent).parentEntity!
    const shadowEntity = createEntity()
    setComponent(shadowEntity, NameComponent, obj.name + '_shadow')
    setComponent(shadowEntity, TransformComponent, {
      position: obj.position.clone(),
      rotation: obj.quaternion.clone(),
      scale: obj.scale.clone()
    })
    setComponent(shadowEntity, EntityTreeComponent, { parentEntity })
    setComponent(shadowEntity, MeshComponent, shadowMesh)
    setComponent(shadowEntity, ObjectComponent, shadowMesh)

    if (wireframe) {
      obj.material.wireframe = true
    } else {
      obj.visible = false
    }

    return () => {
      /** add back to the scene */
      const originalParent = UUIDComponent.getEntityByUUID(originalParentEntityUUID.value)
      setComponent(entity, EntityTreeComponent, { parentEntity: originalParent })
      TransformComponent.dirtyTransforms[entity] = true

      if (typeof wireframe === 'boolean') {
        obj.material.wireframe = wireframe
      } else {
        obj.visible = true
      }
      removeEntity(shadowEntity)
    }
  }, [anchor.active, !!objectComponent, xrState.sessionActive])

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
