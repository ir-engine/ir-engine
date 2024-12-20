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

import {
  createEntity,
  Entity,
  EntityUUID,
  getComponent,
  getMutableComponent,
  PresentationSystemGroup,
  QueryReactor,
  removeEntity,
  setComponent,
  UndefinedEntity,
  useComponent,
  useEntityContext,
  UUIDComponent
} from '@ir-engine/ecs'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { NO_PROXY, useMutableState } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import {
  MaterialInstanceComponent,
  MaterialPrototypeDefinition,
  MaterialPrototypeDefinitions,
  MaterialStateComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import {
  createMaterialPrototype,
  getMaterialIndices
} from '@ir-engine/spatial/src/renderer/materials/materialFunctions'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { isMobileXRHeadset } from '@ir-engine/spatial/src/xr/XRState'
import React from 'react'
import { MeshBasicMaterial, MeshLambertMaterial, MeshPhysicalMaterial } from 'three'

const reactor = () => {
  useEffect(() => {
    MaterialPrototypeDefinitions.map((prototype: MaterialPrototypeDefinition, uuid) =>
      createMaterialPrototype(prototype)
    )
    const fallbackMaterial = new MeshBasicMaterial({ name: 'Fallback Material', color: 0xff69b4 })
    fallbackMaterial.uuid = MaterialStateComponent.fallbackMaterial
    const fallbackMaterialEntity = createEntity()
    setComponent(fallbackMaterialEntity, MaterialStateComponent, {
      material: fallbackMaterial,
      instances: [UndefinedEntity]
    })
    setComponent(fallbackMaterialEntity, UUIDComponent, MaterialStateComponent.fallbackMaterial)
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
  const setMaterial = (uuid: EntityUUID, newUuid: EntityUUID) => {
    for (const instance of materialComponent.instances) {
      const indices = getMaterialIndices(instance, uuid)
      for (const index of indices) {
        const instanceComponent = getMutableComponent(instance, MaterialInstanceComponent)
        const uuids = instanceComponent.uuid.get(NO_PROXY) as EntityUUID[]
        uuids[index] = newUuid
        instanceComponent.uuid.set(uuids)
      }
    }
  }
  const shouldMakeBasic =
    (forceBasicMaterials || isMobileXRHeadset) && ExpensiveMaterials.has(materialComponent.material.type)

  const uuid = getComponent(material, UUIDComponent)
  const basicUuid = ('basic-' + uuid) as EntityUUID
  const existingMaterialEntity = UUIDComponent.getEntityByUUID(basicUuid)
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
    newBasicMaterial.uuid = basicUuid
    newBasicMaterial.alphaTest = prevMaterial.alphaTest
    newBasicMaterial.side = prevMaterial.side
    newBasicMaterial.plugins = undefined

    const newMaterialEntity = createEntity()
    setComponent(newMaterialEntity, MaterialStateComponent, {
      material: newBasicMaterial,
      instances: materialComponent.instances
    })
    setComponent(newMaterialEntity, UUIDComponent, basicUuid)
    setComponent(newMaterialEntity, NameComponent, 'basic-' + getComponent(material, NameComponent))
    setMaterial(uuid, basicUuid)
  } else if (!forceBasicMaterials) {
    const basicMaterialEntity = UUIDComponent.getEntityByUUID(uuid)
    if (!basicMaterialEntity) return
    const nonBasicUUID = uuid.slice(6) as EntityUUID
    const materialEntity = UUIDComponent.getEntityByUUID(nonBasicUUID)
    if (!materialEntity) return
    setMaterial(uuid, nonBasicUUID)
  }
}

export const MaterialLibrarySystem = defineSystem({
  uuid: 'ee.engine.scene.MaterialLibrarySystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
