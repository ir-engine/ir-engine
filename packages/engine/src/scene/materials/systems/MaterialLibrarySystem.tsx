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
  PresentationSystemGroup,
  QueryReactor,
  setComponent,
  useComponent,
  useEntityContext,
  UUIDComponent
} from '@ir-engine/ecs'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { useMutableState } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
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
    setComponent(fallbackMaterialEntity, UUIDComponent, MaterialStateComponent.fallbackMaterialUUIDPair)
    setComponent(fallbackMaterialEntity, NameComponent, 'Fallback Material')
    setComponent(fallbackMaterialEntity, MaterialStateComponent, { material: fallbackMaterial })
  }, [])

  const rendererState = useMutableState(RendererState)
  useEffect(() => {
    if (rendererState.qualityLevel.value === 0) rendererState.forceBasicMaterials.set(true)
  }, [rendererState.qualityLevel, rendererState.forceBasicMaterials])

  return <QueryReactor Components={[MaterialStateComponent]} ChildEntityReactor={ChildMaterialReactor} />
}

const ChildMaterialReactor = () => {
  const entity = useEntityContext()
  const forceBasicMaterials = useMutableState(RendererState).forceBasicMaterials.value
  const materialComponent = useComponent(entity, MaterialStateComponent)
  const material = materialComponent.material.value as MeshPhysicalMaterial
  const shouldMakeBasic = forceBasicMaterials || isMobileXRHeadset

  useEffect(() => {
    if (!material || !shouldMakeBasic || !ExpensiveMaterials.has(material.type)) return

    const onlyEmmisive = material.emissiveMap && !material.map
    const newBasicMaterial = new MeshLambertMaterial().copy(material)
    newBasicMaterial.specularMap = material.roughnessMap ?? material.specularIntensityMap
    if (onlyEmmisive) newBasicMaterial.emissiveMap = material.emissiveMap
    else newBasicMaterial.map = material.map
    newBasicMaterial.reflectivity = material.metalness
    newBasicMaterial.envMap = material.envMap
    newBasicMaterial.alphaTest = material.alphaTest
    newBasicMaterial.side = material.side

    setComponent(entity, MaterialStateComponent, { material: newBasicMaterial })

    return () => {
      setComponent(entity, MaterialStateComponent, { material: material })
    }
  }, [shouldMakeBasic])

  return null
}

const ExpensiveMaterials = new Set(['MeshStandardMaterial', 'MeshPhysicalMaterial'])

export const MaterialLibrarySystem = defineSystem({
  uuid: 'ee.engine.scene.MaterialLibrarySystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
