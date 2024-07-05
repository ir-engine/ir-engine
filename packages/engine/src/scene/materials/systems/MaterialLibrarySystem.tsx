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

import React, { ReactElement, useEffect } from 'react'

import {
  EntityUUID,
  getComponent,
  getOptionalComponent,
  PresentationSystemGroup,
  QueryReactor,
  removeEntity,
  useComponent,
  useEntityContext,
  useOptionalComponent
} from '@etherealengine/ecs'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import {
  MaterialPrototypeDefinition,
  MaterialPrototypeDefinitions
} from '@etherealengine/spatial/src/renderer/materials/MaterialComponent'
import {
  createMaterialEntity,
  createMaterialPrototype,
  materialPrototypeMatches,
  setMeshMaterial,
  updateMaterialPrototype
} from '@etherealengine/spatial/src/renderer/materials/materialFunctions'

import { MeshComponent } from '@etherealengine/spatial/src/renderer/components/MeshComponent'
import {
  MaterialInstanceComponent,
  MaterialStateComponent
} from '@etherealengine/spatial/src/renderer/materials/MaterialComponent'
import { isArray } from 'lodash'
import { Material } from 'three'
import { SourceComponent } from '../../components/SourceComponent'

const reactor = (): ReactElement => {
  useEffect(() => {
    MaterialPrototypeDefinitions.map((prototype: MaterialPrototypeDefinition) => createMaterialPrototype(prototype))
  }, [])

  return (
    <>
      <QueryReactor Components={[MaterialInstanceComponent]} ChildEntityReactor={MaterialInstanceReactor} />
      <QueryReactor Components={[MaterialStateComponent]} ChildEntityReactor={MaterialEntityReactor} />
      <QueryReactor Components={[MeshComponent]} ChildEntityReactor={MeshReactor} />
    </>
  )
}

const MeshReactor = () => {
  const entity = useEntityContext()
  const materialComponent = useOptionalComponent(entity, MaterialInstanceComponent)
  const meshComponent = useComponent(entity, MeshComponent)
  useEffect(() => {
    if (materialComponent) return
    const material = meshComponent.material.value as Material
    if (!isArray(material)) createMaterialEntity(material, entity)
    else for (const mat of material) createMaterialEntity(mat, entity)
  }, [])
  return null
}

const MaterialEntityReactor = () => {
  const entity = useEntityContext()
  const materialComponent = useComponent(entity, MaterialStateComponent)
  useEffect(() => {
    if (!materialComponent.instances.value!) return
    for (const sourceEntity of materialComponent.instances.value)
      for (const entity of SourceComponent.entitiesBySource[getComponent(sourceEntity, SourceComponent)]) {
        const uuid = getOptionalComponent(entity, MaterialInstanceComponent)?.uuid as EntityUUID[] | undefined
        if (uuid) setMeshMaterial(entity, uuid)
      }
  }, [materialComponent.material])

  useEffect(() => {
    if (materialComponent.prototypeEntity.value && !materialPrototypeMatches(entity)) updateMaterialPrototype(entity)
  }, [materialComponent.prototypeEntity])

  useEffect(() => {
    if (materialComponent.instances.value?.length === 0) removeEntity(entity)
  }, [materialComponent.instances])

  return null
}

const MaterialInstanceReactor = () => {
  const entity = useEntityContext()
  const materialComponent = useComponent(entity, MaterialInstanceComponent)
  const uuid = materialComponent.uuid
  useEffect(() => {
    if (uuid.value) setMeshMaterial(entity, uuid.value as EntityUUID[])
  }, [materialComponent.uuid])
  return null
}

export const MaterialLibrarySystem = defineSystem({
  uuid: 'ee.engine.scene.MaterialLibrarySystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
