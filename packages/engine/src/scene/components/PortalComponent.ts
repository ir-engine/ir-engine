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

import { RigidBodyType, ShapeType } from '@dimforge/rapier3d-compat'
import { useEffect } from 'react'
import {
  ArrowHelper,
  BackSide,
  Euler,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  SphereGeometry,
  Texture,
  Vector3
} from 'three'

import { defineState, getMutableState, getState, none, useHookstate } from '@etherealengine/hyperflux'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { V_100 } from '../../common/constants/MathConstants'
import { matches } from '../../common/functions/MatchesUtils'
import { isClient } from '../../common/functions/getEnvironment'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity, UndefinedEntity } from '../../ecs/classes/Entity'
import {
  ComponentType,
  SerializedComponentType,
  defineComponent,
  getComponent,
  hasComponent,
  setComponent,
  useComponent
} from '../../ecs/functions/ComponentFunctions'
import { createEntity, entityExists, removeEntity, useEntityContext } from '../../ecs/functions/EntityFunctions'
import { EntityTreeComponent } from '../../ecs/functions/EntityTree'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { RendererState } from '../../renderer/RendererState'
import { portalPath } from '../../schemas/projects/portal.schema'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { ObjectLayers } from '../constants/ObjectLayers'
import { setObjectLayers } from '../functions/setObjectLayers'
import { setCallback } from './CallbackComponent'
import { ColliderComponent } from './ColliderComponent'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'
import { NameComponent } from './NameComponent'
import { SceneAssetPendingTagComponent } from './SceneAssetPendingTagComponent'
import { SceneObjectComponent } from './SceneObjectComponent'
import { UUIDComponent } from './UUIDComponent'
import { VisibleComponent, setVisibleComponent } from './VisibleComponent'

export const PortalPreviewTypeSimple = 'Simple' as const
export const PortalPreviewTypeSpherical = 'Spherical' as const

export const PortalPreviewTypes = new Set<string>()
PortalPreviewTypes.add(PortalPreviewTypeSimple)
PortalPreviewTypes.add(PortalPreviewTypeSpherical)

export const PortalEffects = new Map<string, ComponentType<any>>()
PortalEffects.set('None', null!)

export const portalColliderValues: SerializedComponentType<typeof ColliderComponent> = {
  bodyType: RigidBodyType.Fixed,
  shapeType: ShapeType.Cuboid,
  isTrigger: true,
  removeMesh: true,
  collisionLayer: CollisionGroups.Trigger,
  collisionMask: CollisionGroups.Avatars,
  restitution: 0,
  triggers: [
    {
      onEnter: 'teleport',
      onExit: null,
      target: '' as EntityUUID
    }
  ]
}

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
  jsonID: 'portal',

  onInit: (entity) => {
    return {
      linkedPortalId: '' as EntityUUID,
      location: '',
      effectType: 'None',
      previewType: PortalPreviewTypeSimple as string,
      previewImageURL: '',
      redirect: false,
      spawnPosition: new Vector3(),
      spawnRotation: new Quaternion(),
      remoteSpawnPosition: new Vector3(),
      remoteSpawnRotation: new Quaternion(),
      mesh: null as Mesh<SphereGeometry, MeshBasicMaterial> | null,
      helperEntity: null as Entity | null
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.string.test(json.linkedPortalId)) component.linkedPortalId.set(json.linkedPortalId)
    if (matches.string.test(json.location)) component.location.set(json.location)
    if (matches.string.test(json.effectType)) component.effectType.set(json.effectType)
    if (matches.string.test(json.previewType)) component.previewType.set(json.previewType)
    if (matches.string.test(json.previewImageURL)) component.previewImageURL.set(json.previewImageURL)
    if (matches.boolean.test(json.redirect)) component.redirect.set(json.redirect)
    if (matches.object.test(json.spawnPosition)) component.spawnPosition.value.copy(json.spawnPosition)
    if (matches.object.test(json.spawnRotation)) {
      if (json.spawnRotation.w) component.spawnRotation.value.copy(json.spawnRotation)
      // backwards compat
      else
        component.spawnRotation.value.copy(
          new Quaternion().setFromEuler(new Euler().setFromVector3(json.spawnRotation as any))
        )
    }

    if (
      !getState(EngineState).sceneLoaded &&
      hasComponent(entity, SceneObjectComponent) &&
      !hasComponent(entity, RigidBodyComponent)
    )
      setComponent(entity, SceneAssetPendingTagComponent)
  },

  toJSON: (entity, component) => {
    return {
      location: component.location.value,
      linkedPortalId: component.linkedPortalId.value,
      redirect: component.redirect.value,
      effectType: component.effectType.value,
      previewType: component.previewType.value,
      previewImageURL: component.previewImageURL.value,
      spawnPosition: {
        x: component.spawnPosition.value.x,
        y: component.spawnPosition.value.y,
        z: component.spawnPosition.value.z
      } as Vector3,
      spawnRotation: {
        x: component.spawnRotation.value.x,
        y: component.spawnRotation.value.y,
        z: component.spawnRotation.value.z,
        w: component.spawnRotation.value.w
      } as Quaternion
    }
  },

  reactor: function () {
    const entity = useEntityContext()
    const debugEnabled = useHookstate(getMutableState(RendererState).nodeHelperVisibility)
    const portalComponent = useComponent(entity, PortalComponent)

    useEffect(() => {
      setCallback(entity, 'teleport', () => {
        const now = Date.now()
        const { lastPortalTimeout, portalTimeoutDuration, activePortalEntity } = getState(PortalState)
        if (activePortalEntity || lastPortalTimeout + portalTimeoutDuration > now) return
        getMutableState(PortalState).activePortalEntity.set(entity)
      })
      setComponent(entity, ColliderComponent, JSON.parse(JSON.stringify(portalColliderValues)))
    }, [])

    useEffect(() => {
      if (!debugEnabled.value) return
      const helper = new ArrowHelper(new Vector3(0, 0, 1), new Vector3(0, 0, 0), 1, 0x000000)
      helper.name = `portal-helper-${entity}`

      setObjectLayers(helper, ObjectLayers.NodeHelper)
      const helperEntity = createEntity()

      addObjectToGroup(helperEntity, helper)
      setComponent(helperEntity, NameComponent, helper.name)
      setComponent(helperEntity, EntityTreeComponent, { parentEntity: entity })
      setVisibleComponent(helperEntity, true)
      getComponent(helperEntity, TransformComponent).rotation.copy(
        new Quaternion().setFromAxisAngle(V_100, Math.PI / 2)
      )

      setObjectLayers(helper, ObjectLayers.NodeHelper)
      portalComponent.helperEntity.set(helperEntity)

      return () => {
        removeEntity(helperEntity)
        portalComponent.helperEntity.set(none)
      }
    }, [debugEnabled])

    useEffect(() => {
      if (portalComponent.previewType.value !== PortalPreviewTypeSpherical) return

      const portalMesh = new Mesh(new SphereGeometry(1.5, 32, 32), new MeshBasicMaterial({ side: BackSide }))
      portalMesh.geometry.translate(0, 1.5, 0)
      portalComponent.mesh.set(portalMesh)
      addObjectToGroup(entity, portalMesh)

      return () => {
        removeObjectFromGroup(entity, portalMesh)
        portalComponent.mesh.set(null)
      }
    }, [portalComponent.previewType])

    useEffect(() => {
      if (!isClient) return
      if (!portalComponent.mesh.value) return

      const linkedPortalExists = UUIDComponent.getEntityByUUID(portalComponent.linkedPortalId.value)

      const applyPortalDetails = (portalDetails: {
        spawnPosition: Vector3
        spawnRotation: Quaternion
        previewImageURL: string
      }) => {
        portalComponent.remoteSpawnPosition.value.copy(portalDetails.spawnPosition)
        portalComponent.remoteSpawnRotation.value.copy(portalDetails.spawnRotation)
        if (
          typeof portalComponent.previewImageURL.value !== 'undefined' &&
          portalComponent.previewImageURL.value !== ''
        ) {
          const mesh = portalComponent.mesh.value
          if (mesh) {
            AssetLoader.loadAsync(portalDetails.previewImageURL).then((texture: Texture) => {
              if (!mesh || !entityExists(entity)) return
              mesh.material.map = texture
              texture.needsUpdate = true
            })
          }
        }
      }

      if (linkedPortalExists) {
        /** Portal is in the scene already */
        const portalDetails = getComponent(linkedPortalExists, PortalComponent)
        if (portalDetails) applyPortalDetails(portalDetails)
      } else {
        /** Portal is not in the scene yet */
        Engine.instance.api
          .service(portalPath)
          .get(portalComponent.linkedPortalId.value, { query: { locationName: portalComponent.location.value } })
          .then((data) => {
            const portalDetails = data
            if (portalDetails) applyPortalDetails(portalDetails)
          })
          .catch((e) => {
            console.error('Error getting portal', e)
          })
      }
    }, [portalComponent.previewImageURL, portalComponent.mesh])

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
