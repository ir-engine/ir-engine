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

import { useEffect } from 'react'

import {
  createEntity,
  Entity,
  EntityUUIDPair,
  getComponent,
  getMutableComponent,
  PresentationSystemGroup,
  QueryReactor,
  removeEntity,
  setComponent,
  SourceID,
  UndefinedEntity,
  useComponent,
  useEntityContext,
  UUIDComponent
} from '@ir-engine/ecs'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { NO_PROXY_STEALTH, useMutableState } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import {
  MaterialInstanceComponent,
  MaterialStateComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { getMaterialIndices } from '@ir-engine/spatial/src/renderer/materials/materialFunctions'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { isMobileXRHeadset } from '@ir-engine/spatial/src/xr/XRState'
import React from 'react'
import { FrontSide, MeshLambertMaterial, MeshPhysicalMaterial, MeshStandardMaterial } from 'three'

const reactor = () => {
  useEffect(() => {
    // default material according to GLTF spec. see https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#default-material
    const fallbackMaterial = new MeshStandardMaterial({
      name: 'Fallback Material',
      color: 0xffffff,
      emissive: 0x000000,
      metalness: 1,
      roughness: 1,
      transparent: false,
      depthTest: true,
      side: FrontSide
    })
    const fallbackMaterialEntity = createEntity()
    setComponent(fallbackMaterialEntity, MaterialStateComponent, {
      material: fallbackMaterial,
      instances: [UndefinedEntity]
    })
    setComponent(fallbackMaterialEntity, UUIDComponent, MaterialStateComponent.fallbackMaterialUUIDPair)
    setComponent(fallbackMaterialEntity, NameComponent, 'Fallback Material')
  }, [])

  const rendererState = useMutableState(RendererState)
  useEffect(() => {
    if (rendererState.qualityLevel.value === 0) rendererState.forceBasicMaterials.set(true)
  }, [rendererState.qualityLevel, rendererState.forceBasicMaterials])

  return <QueryReactor Components={[MaterialStateComponent]} ChildEntityReactor={ChildMaterialReactor} />
}

const ChildMaterialReactor = () => {
  const entity = useEntityContext()
  const forceBasicMaterials = useMutableState(RendererState).forceBasicMaterials
  const materialComponent = useComponent(entity, MaterialStateComponent)
  useEffect(() => {
    if (materialComponent.promised || materialComponent.material.promised) {
      // The material is still loading; don't access its value yet.
      // This happens when setting graphics quality to 0, in many cases. HookState will throw a 103 error. see https://tsu.atlassian.net/browse/IR-8475
      return
    }
    if (!materialComponent.material.value || !materialComponent.instances.length) return
    convertMaterials(entity, forceBasicMaterials.value)
  }, [
    materialComponent.material,
    materialComponent.material.needsUpdate,
    materialComponent.instances,
    forceBasicMaterials
  ])
  return null
}

const ExpensiveMaterials = new Set(['MeshStandardMaterial', 'MeshPhysicalMaterial'])
/**@todo refactor this to use preprocessor directives instead of new cloned materials with different shaders */
export const convertMaterials = (material: Entity, forceBasicMaterials: boolean) => {
  const materialComponent = getComponent(material, MaterialStateComponent)
  const setMaterial = (newMaterial: Entity) => {
    for (const instance of materialComponent.instances) {
      const indices = getMaterialIndices(instance, material)
      for (const index of indices) {
        const instanceComponent = getMutableComponent(instance, MaterialInstanceComponent)
        const entities = instanceComponent.entities.get(NO_PROXY_STEALTH) as Entity[]
        entities[index] = newMaterial
        instanceComponent.entities.set(entities)
      }
    }
  }
  const shouldMakeBasic =
    (forceBasicMaterials || isMobileXRHeadset) && ExpensiveMaterials.has(materialComponent.material.type)

  const uuid = getComponent(material, UUIDComponent)
  const basicUuid: EntityUUIDPair = {
    entitySourceID: ('basic-' + uuid.entitySourceID) as SourceID,
    entityID: uuid.entityID
  }
  const existingMaterialEntity = UUIDComponent.getEntityByUUID(UUIDComponent.join(basicUuid))
  if (shouldMakeBasic) {
    if (existingMaterialEntity) {
      removeEntity(existingMaterialEntity)
      return
    }

    const prevMaterial = materialComponent.material as MeshPhysicalMaterial
    const onlyEmmisive = prevMaterial.emissiveMap && !prevMaterial.map
    const newBasicMaterial = new MeshLambertMaterial().copy(prevMaterial)
    newBasicMaterial.specularMap = prevMaterial.roughnessMap ?? prevMaterial.specularIntensityMap
    if (onlyEmmisive) newBasicMaterial.emissiveMap = prevMaterial.emissiveMap
    else newBasicMaterial.map = prevMaterial.map
    newBasicMaterial.reflectivity = prevMaterial.metalness
    newBasicMaterial.envMap = prevMaterial.envMap
    newBasicMaterial.alphaTest = prevMaterial.alphaTest
    newBasicMaterial.side = prevMaterial.side

    const newMaterialEntity = createEntity()
    setComponent(newMaterialEntity, MaterialStateComponent, {
      material: newBasicMaterial,
      instances: materialComponent.instances
    })
    setComponent(newMaterialEntity, UUIDComponent, basicUuid)
    setComponent(newMaterialEntity, NameComponent, 'basic-' + getComponent(material, NameComponent))
    setMaterial(newMaterialEntity)
  } else if (!forceBasicMaterials) {
    const basicMaterialEntity = UUIDComponent.getEntityByUUID(UUIDComponent.join(uuid))
    if (!basicMaterialEntity) return
    const nonBasicUUID = UUIDComponent.join({
      entitySourceID: uuid.entitySourceID.slice(6) as SourceID,
      entityID: uuid.entityID
    })
    const materialEntity = UUIDComponent.getEntityByUUID(nonBasicUUID)
    if (!materialEntity) return
    setMaterial(materialEntity)
  }
}

export const MaterialLibrarySystem = defineSystem({
  uuid: 'ee.engine.scene.MaterialLibrarySystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
