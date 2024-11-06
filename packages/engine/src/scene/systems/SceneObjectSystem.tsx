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

import React, { useEffect } from 'react'
import {
  Light,
  Material,
  Mesh,
  MeshLambertMaterial,
  MeshPhongMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  SkinnedMesh,
  Texture
} from 'three'

import { useEntityContext, UUIDComponent } from '@ir-engine/ecs'
import {
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { Entity, EntityUUID } from '@ir-engine/ecs/src/Entity'
import { defineQuery, QueryReactor } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { AnimationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { getMutableState, getState, useHookstate, useImmediateEffect } from '@ir-engine/hyperflux'
import { CallbackComponent } from '@ir-engine/spatial/src/common/CallbackComponent'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { ThreeToPhysics } from '@ir-engine/spatial/src/physics/types/PhysicsTypes'
import { GroupComponent, GroupQueryReactor } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import {
  MaterialInstanceComponent,
  MaterialStateComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { createAndAssignMaterial } from '@ir-engine/spatial/src/renderer/materials/materialFunctions'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { ResourceManager } from '@ir-engine/spatial/src/resources/ResourceState'
import {
  DistanceFromCameraComponent,
  FrustumCullCameraComponent
} from '@ir-engine/spatial/src/transform/components/DistanceComponents'
import { isMobileXRHeadset } from '@ir-engine/spatial/src/xr/XRState'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { KHRUnlitExtensionComponent } from '../../gltf/MaterialDefinitionComponent'
import { UpdatableCallback, UpdatableComponent } from '../components/UpdatableComponent'

import { ShadowComponent } from '../components/ShadowComponent'
import { SourceComponent } from '../components/SourceComponent'

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

export const ExpensiveMaterials = new Set([MeshPhongMaterial, MeshStandardMaterial, MeshPhysicalMaterial])
/**@todo refactor this to use preprocessor directives instead of new cloned materials with different shaders */
export function setupObject(obj: Object3D, entity: Entity, forceBasicMaterials = false) {
  const child = obj as any as Mesh<any, any>
  if (child.material) {
    const shouldMakeBasic =
      (forceBasicMaterials || isMobileXRHeadset) && ExpensiveMaterials.has(child.material.constructor)
    if (shouldMakeBasic) {
      const basicUUID = `basic-${child.material.uuid}` as EntityUUID
      const basicMaterialEntity = UUIDComponent.getEntityByUUID(basicUUID)
      if (basicMaterialEntity) {
        child.material = getComponent(basicMaterialEntity, MaterialStateComponent).material
        return
      }
      const prevMaterial = child.material
      const onlyEmmisive = prevMaterial.emissiveMap && !prevMaterial.map
      const newBasicMaterial = new MeshLambertMaterial().copy(prevMaterial)
      newBasicMaterial.specularMap = prevMaterial.roughnessMap ?? prevMaterial.specularIntensityMap
      if (onlyEmmisive) newBasicMaterial.emissiveMap = prevMaterial.emissiveMap
      else newBasicMaterial.map = prevMaterial.map
      newBasicMaterial.reflectivity = prevMaterial.metalness
      newBasicMaterial.envMap = prevMaterial.envMap
      newBasicMaterial.uuid = basicUUID
      newBasicMaterial.alphaTest = prevMaterial.alphaTest
      newBasicMaterial.side = prevMaterial.side
      newBasicMaterial.plugins = undefined

      createAndAssignMaterial(entity, newBasicMaterial)
      setComponent(entity, MaterialInstanceComponent, { uuid: [basicUUID] })
    } else {
      const UUID = child.material.uuid as EntityUUID
      const basicMaterialEntity = UUIDComponent.getEntityByUUID(UUID)
      if (!basicMaterialEntity) return

      const nonBasicUUID = UUID.slice(6) as EntityUUID
      const materialEntity = UUIDComponent.getEntityByUUID(nonBasicUUID)
      if (!materialEntity) return

      setComponent(entity, MaterialInstanceComponent, { uuid: [nonBasicUUID] })
    }
  }
}

const groupQuery = defineQuery([GroupComponent])
const updatableQuery = defineQuery([UpdatableComponent, CallbackComponent])

function SceneObjectReactor(props: { entity: Entity; obj: Object3D }) {
  const { entity, obj } = props

  const renderState = getMutableState(RendererState)
  const forceBasicMaterials = useHookstate(renderState.forceBasicMaterials)

  useImmediateEffect(() => {
    setComponent(entity, DistanceFromCameraComponent)
  }, [])

  useEffect(() => {
    const source = hasComponent(entity, GLTFComponent)
      ? GLTFComponent.getInstanceID(entity)
      : getOptionalComponent(entity, SourceComponent)
    return () => {
      ResourceManager.unloadObj(obj, source)
    }
  }, [])

  useEffect(() => {
    setupObject(obj, entity, forceBasicMaterials.value)
  }, [forceBasicMaterials])

  return null
}

const minimumFrustumCullDistanceSqr = 5 * 5 // 5 units

const execute = () => {
  const delta = getState(ECSState).deltaSeconds
  for (const entity of updatableQuery()) {
    const callbacks = getComponent(entity, CallbackComponent)
    callbacks.get(UpdatableCallback)?.(delta)
  }
  for (const entity of groupQuery()) {
    const group = getComponent(entity, GroupComponent)
    /**
     * do frustum culling here, but only if the object is more than 5 units away
     */
    const visible =
      hasComponent(entity, VisibleComponent) &&
      !(
        FrustumCullCameraComponent.isCulled[entity] &&
        DistanceFromCameraComponent.squaredDistance[entity] > minimumFrustumCullDistanceSqr
      )

    for (const obj of group) obj.visible = visible
  }
}

const ModelEntityReactor = () => {
  const entity = useEntityContext()
  const modelInstanceID = GLTFComponent.useInstanceID(entity)
  const childEntities = useHookstate(SourceComponent.entitiesBySourceState[modelInstanceID])

  return (
    <>
      {childEntities.value?.map((childEntity: Entity) => (
        <ChildReactor key={childEntity} entity={childEntity} parentEntity={entity} />
      ))}
    </>
  )
}

const useIsUnlit = (entity: Entity) => {
  let isUnlit = !!useOptionalComponent(entity, KHRUnlitExtensionComponent)
  const materialInstanceUUIDs = useOptionalComponent(entity, MaterialInstanceComponent)?.uuid.value

  if (materialInstanceUUIDs) {
    for (const uuid of materialInstanceUUIDs) {
      const matEntity = UUIDComponent.getEntityByUUID(uuid)
      if (matEntity && hasComponent(matEntity, KHRUnlitExtensionComponent)) {
        isUnlit = true
        break
      }
    }
  }

  return isUnlit
}

const ChildReactor = (props: { entity: Entity; parentEntity: Entity }) => {
  const isMesh = useOptionalComponent(props.entity, MeshComponent)
  const isModelColliders = useOptionalComponent(props.parentEntity, RigidBodyComponent)
  const isVisible = useOptionalComponent(props.entity, VisibleComponent)
  const isUnlit = useIsUnlit(props.entity)

  const shadowComponent = useOptionalComponent(props.parentEntity, ShadowComponent)
  useEffect(() => {
    if (!isMesh || !isVisible) return
    if (shadowComponent && !isUnlit)
      setComponent(props.entity, ShadowComponent, getComponent(props.parentEntity, ShadowComponent))
    else removeComponent(props.entity, ShadowComponent)
  }, [isVisible, isMesh, isUnlit, shadowComponent?.cast, shadowComponent?.receive])

  useEffect(() => {
    if (!isModelColliders || !isMesh) return

    const geometry = getComponent(props.entity, MeshComponent).geometry

    const shape = ThreeToPhysics[geometry.type]

    if (!shape) return

    setComponent(props.entity, ColliderComponent, { shape })

    return () => {
      removeComponent(props.entity, ColliderComponent)
    }
  }, [isModelColliders, isMesh])

  return null
}

const reactor = () => {
  return (
    <>
      <QueryReactor Components={[GLTFComponent]} ChildEntityReactor={ModelEntityReactor} />
      <GroupQueryReactor GroupChildReactor={SceneObjectReactor} />
    </>
  )
}
//<QueryReactor Components={[SourceComponent]} ChildEntityReactor={SceneObjectEntityReactor} />
export const SceneObjectSystem = defineSystem({
  uuid: 'ee.engine.SceneObjectSystem',
  insert: { after: AnimationSystemGroup },
  execute,
  reactor
})
