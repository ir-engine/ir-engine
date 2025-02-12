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
import { BackSide, Mesh, MeshBasicMaterial, SphereGeometry } from 'three'

import { EntityUUID } from '@ir-engine/ecs'
import {
  ComponentType,
  defineComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity, UndefinedEntity } from '@ir-engine/ecs/src/Entity'
import { createEntity, useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { defineState, getMutableState, getState, useHookstate } from '@ir-engine/hyperflux'
import { setCallback } from '@ir-engine/spatial/src/common/CallbackComponent'
import { Vector3_Right } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { ArrowHelperComponent } from '@ir-engine/spatial/src/common/debug/ArrowHelperComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { TriggerComponent } from '@ir-engine/spatial/src/physics/components/TriggerComponent'
import { CollisionGroups } from '@ir-engine/spatial/src/physics/enums/CollisionGroups'
import { Shapes } from '@ir-engine/spatial/src/physics/types/PhysicsTypes'
import { addObjectToGroup, removeObjectFromGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { useDisposable, useResource } from '@ir-engine/spatial/src/resources/resourceHooks'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'

export const PortalPreviewTypeSimple = 'Simple' as const
export const PortalPreviewTypeSpherical = 'Spherical' as const

export const PortalPreviewTypes = new Set<string>()
PortalPreviewTypes.add(PortalPreviewTypeSimple)
PortalPreviewTypes.add(PortalPreviewTypeSpherical)

export const PortalEffects = new Map<string, ComponentType<any>>()
PortalEffects.set('None', null!)

export const PortalState = defineState({
  name: 'PortalState',
  initial: {
    lastPortalTimeout: 0,
    portalTimeoutDuration: 5000,
    activePortalEntity: UndefinedEntity,
    portalReady: false
  }
})

export const PortalComponent = defineComponent({
  name: 'PortalComponent',
  jsonID: 'EE_portal',

  schema: S.Object({
    linkedPortalId: S.EntityUUID(),
    location: S.String(''),
    effectType: S.String('None'),
    previewType: S.String(PortalPreviewTypeSimple),
    previewImageURL: S.String(''),
    redirect: S.Bool(false),
    spawnPosition: T.Vec3(),
    spawnRotation: T.Quaternion(),
    remoteSpawnPosition: T.Vec3(),
    remoteSpawnRotation: T.Quaternion(),
    mesh: S.NonSerialized(S.Type<Mesh<SphereGeometry, MeshBasicMaterial>>())
  }),

  reactor: function () {
    const entity = useEntityContext()
    const debugEnabled = useHookstate(getMutableState(RendererState).nodeHelperVisibility)
    const portalComponent = useComponent(entity, PortalComponent)

    useEffect(() => {
      setCallback(entity, 'teleport', (triggerEntity: Entity, otherEntity: Entity) => {
        if (otherEntity !== AvatarComponent.getSelfAvatarEntity()) return
        const now = Date.now()
        const { lastPortalTimeout, portalTimeoutDuration, activePortalEntity } = getState(PortalState)
        if (activePortalEntity || lastPortalTimeout + portalTimeoutDuration > now) return
        getMutableState(PortalState).activePortalEntity.set(entity)
      })

      /** Allow scene data populating rigidbody component too */
      if (hasComponent(entity, RigidBodyComponent)) return
      setComponent(entity, RigidBodyComponent, { type: 'fixed' })
      setComponent(entity, ColliderComponent, {
        shape: Shapes.Sphere,
        collisionLayer: CollisionGroups.Trigger,
        collisionMask: CollisionGroups.Avatars
      })
      setComponent(entity, TriggerComponent, {
        triggers: [
          {
            onEnter: 'teleport',
            onExit: '',
            target: '' as EntityUUID
          }
        ]
      })
    }, [])

    useEffect(() => {
      if (debugEnabled.value) {
        setComponent(entity, ArrowHelperComponent, {
          name: 'portal-helper',
          length: 1,
          dir: Vector3_Right,
          color: 0x000000
        })
      }
      return () => {
        removeComponent(entity, ArrowHelperComponent)
      }
    }, [debugEnabled])

    const [portalGeometry] = useResource<SphereGeometry>(new SphereGeometry(1, 32, 32), entity)
    const [portalMesh] = useDisposable(
      Mesh<SphereGeometry, MeshBasicMaterial>,
      entity,
      portalGeometry.value as SphereGeometry,
      new MeshBasicMaterial({ side: BackSide })
    )

    useEffect(() => {
      if (portalComponent.previewType.value !== PortalPreviewTypeSpherical) return
      portalComponent.mesh.set(portalMesh)
      addObjectToGroup(entity, portalMesh)
      return () => {
        removeObjectFromGroup(entity, portalMesh)
      }
    }, [portalComponent.previewType.value])

    /** @todo - reimplement once spawn points are refactored */
    // const portalDetails = useGet(spawnPointPath, portalComponent.linkedPortalId.value)

    // const [texture] = useTexture(portalDetails.data?.previewImageURL || '', entity)

    // useEffect(() => {
    //   if (!texture || !portalComponent.mesh.value) return

    //   const material = portalComponent.mesh.value.material as MeshBasicMaterial
    //   material.map = texture
    //   material.needsUpdate = true
    // }, [texture, portalComponent.mesh])

    // useEffect(() => {
    //   if (!portalDetails.data) return
    //   portalComponent.remoteSpawnPosition.value.copy(portalDetails.data.position as Vector3)
    //   portalComponent.remoteSpawnRotation.value.copy(portalDetails.data.rotation as Quaternion)
    // }, [portalDetails])

    return null
  },

  setPlayerInPortalEffect: (effectType: string) => {
    const entity = createEntity()
    setComponent(entity, EntityTreeComponent)
    setComponent(entity, NameComponent, 'portal-' + effectType)
    setComponent(entity, VisibleComponent)
    setComponent(entity, PortalEffects.get(effectType))
  }
})
