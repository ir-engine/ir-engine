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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useEffect } from 'react'
import { Light, Material, Mesh, Object3D, SkinnedMesh, Texture } from 'three'

import {
  getComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useHasComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { Entity, SourceID } from '@ir-engine/ecs/src/Entity'
import { defineQuery, EntityArrayBoundary, QueryReactor } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { AnimationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { getState } from '@ir-engine/hyperflux'
import { CallbackComponent } from '@ir-engine/spatial/src/common/CallbackComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { MaterialInstanceComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import {
  DistanceFromCameraComponent,
  FrustumCullCameraComponent
} from '@ir-engine/spatial/src/transform/components/DistanceComponents'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { KHRUnlitExtensionComponent } from '../../gltf/MaterialExtensionComponents'
import { UpdatableCallback, UpdatableComponent } from '../components/UpdatableComponent'

import { UUIDComponent } from '@ir-engine/ecs'
import { ShadowComponent } from '../components/ShadowComponent'

const disposeMaterial = (material: Material) => {
  for (const [key, val] of Object.entries(material) as [string, Texture][]) {
    if (val && typeof val.dispose === 'function') {
      val.dispose()
    }
  }
  material.dispose()
}

export const disposeObject3D = (obj: Object3D) => {
  const mesh = obj as Mesh<any, any>
  if (mesh.material) {
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(disposeMaterial)
    } else {
      disposeMaterial(mesh.material)
    }
  }

  if (mesh.geometry) {
    mesh.geometry.dispose()
    for (const key in mesh.geometry.attributes) {
      mesh.geometry.deleteAttribute(key)
    }
  }

  const skinnedMesh = obj as SkinnedMesh
  if (skinnedMesh.isSkinnedMesh) {
    skinnedMesh.skeleton?.dispose()
  }

  const light = obj as Light // anything with dispose function
  if (typeof light.dispose === 'function') light.dispose()
}

const visibleObjectQuery = defineQuery([ObjectComponent, VisibleComponent])
const updatableQuery = defineQuery([UpdatableComponent, CallbackComponent])

const minimumFrustumCullDistanceSqr = 5 * 5 // 5 units

const execute = () => {
  const delta = getState(ECSState).deltaSeconds
  for (const entity of updatableQuery()) {
    const callbacks = getComponent(entity, CallbackComponent)
    callbacks.get(UpdatableCallback)?.(delta)
  }
  for (const entity of visibleObjectQuery()) {
    const obj = getComponent(entity, ObjectComponent)
    const hasDistance = hasComponent(entity, DistanceFromCameraComponent)
    const inRange = hasDistance
      ? DistanceFromCameraComponent.squaredDistance[entity] > minimumFrustumCullDistanceSqr
      : true
    /**
     * do frustum culling here, but only if the object is more than 5 units away
     */
    const visible = !(FrustumCullCameraComponent.isCulled[entity] && inRange)

    obj.visible = visible
  }
}

const ModelEntityReactor = (props: { entity: Entity }) => {
  const entity = props.entity
  const sourceID = hasComponent(entity, UUIDComponent) ? UUIDComponent.getAsSourceID(entity) : ('' as SourceID)
  const childEntities = UUIDComponent.useEntitiesBySource(sourceID)

  return (
    <EntityArrayBoundary entities={childEntities} ChildEntityReactor={ChildReactor} props={{ parentEntity: entity }} />
  )
}

const useIsUnlit = (entity: Entity) => {
  let isUnlit = useHasComponent(entity, KHRUnlitExtensionComponent)
  const materialInstanceUUIDs = useOptionalComponent(entity, MaterialInstanceComponent)?.entities.value

  if (materialInstanceUUIDs) {
    for (const matEntityID of materialInstanceUUIDs) {
      const matEntity = UUIDComponent.getEntityFromSameSourceByID(entity, matEntityID)
      if (matEntity && hasComponent(matEntity, KHRUnlitExtensionComponent)) {
        isUnlit = true
        break
      }
    }
  }

  return isUnlit
}

const ChildReactor = (props: { entity: Entity; parentEntity: Entity }) => {
  const isMesh = useHasComponent(props.entity, MeshComponent)
  const isVisible = useHasComponent(props.entity, VisibleComponent)
  const isUnlit = useIsUnlit(props.entity)

  const shadowComponent = useOptionalComponent(props.parentEntity, ShadowComponent)
  useEffect(() => {
    if (!isMesh || !isVisible) return
    if (shadowComponent) {
      if (!isUnlit) setComponent(props.entity, ShadowComponent, getComponent(props.parentEntity, ShadowComponent))
      else removeComponent(props.entity, ShadowComponent)
    }
  }, [isVisible, isMesh, isUnlit, shadowComponent?.cast, shadowComponent?.receive])

  return null
}

const reactor = () => {
  return (
    <>
      <QueryReactor Components={[GLTFComponent]} ChildEntityReactor={ModelEntityReactor} />
    </>
  )
}

export const SceneObjectSystem = defineSystem({
  uuid: 'ee.engine.SceneObjectSystem',
  insert: { after: AnimationSystemGroup },
  execute,
  reactor
})
