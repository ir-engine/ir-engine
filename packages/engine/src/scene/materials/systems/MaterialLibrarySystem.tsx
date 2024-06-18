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
  getOptionalComponent,
  PresentationSystemGroup,
  QueryReactor,
  useComponent,
  useEntityContext,
  useOptionalComponent
} from '@etherealengine/ecs'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import {
  MaterialComponent,
  MaterialComponents,
  MaterialPrototypeDefinition,
  MaterialPrototypeDefinitions
} from '@etherealengine/spatial/src/renderer/materials/MaterialComponent'
import {
  createMaterialPrototype,
  setMeshMaterial,
  updateMaterialPrototype
} from '@etherealengine/spatial/src/renderer/materials/materialFunctions'
import { iterateEntityNode } from '@etherealengine/spatial/src/transform/components/EntityTree'

import { MeshComponent } from '@etherealengine/spatial/src/renderer/components/MeshComponent'
import { isArray } from 'lodash'
import { Material } from 'three'
import { createMaterialInstance, removeMaterial } from '../functions/materialSourcingFunctions'

const reactor = (): ReactElement => {
  useEffect(() => {
    MaterialPrototypeDefinitions.map((prototype: MaterialPrototypeDefinition) => createMaterialPrototype(prototype))
  }, [])

  return (
    <>
      <QueryReactor
        Components={[MaterialComponent[MaterialComponents.Instance]]}
        ChildEntityReactor={MaterialInstanceReactor}
      />
      <QueryReactor
        Components={[MaterialComponent[MaterialComponents.State]]}
        ChildEntityReactor={MaterialEntityReactor}
      />
      <QueryReactor Components={[MeshComponent]} ChildEntityReactor={MeshReactor} />
    </>
  )
}

const MeshReactor = () => {
  const entity = useEntityContext()
  const materialComponent = useOptionalComponent(entity, MaterialComponent[MaterialComponents.Instance])
  const meshComponent = useComponent(entity, MeshComponent)
  useEffect(() => {
    if (materialComponent) return
    const material = meshComponent.material.value as Material
    if (!isArray(material)) createMaterialInstance('', entity, material)
    else for (const mat of material) createMaterialInstance('', entity, mat)
  }, [])
  return null
}

const MaterialEntityReactor = () => {
  const entity = useEntityContext()
  const materialComponent = useComponent(entity, MaterialComponent[MaterialComponents.State])
  useEffect(() => {
    if (materialComponent.instances.value)
      for (const sourceEntity of materialComponent.instances.value) {
        iterateEntityNode(sourceEntity, (childEntity) => {
          const uuid = getOptionalComponent(childEntity, MaterialComponent[MaterialComponents.Instance])?.uuid as
            | EntityUUID[]
            | undefined
          if (uuid) setMeshMaterial(childEntity, uuid)
        })
      }
  }, [materialComponent.material])

  useEffect(() => {
    if (materialComponent.prototypeEntity.value) updateMaterialPrototype(entity)
  }, [materialComponent.prototypeEntity])

  useEffect(() => {
    if (materialComponent.instances.value?.length === 0) removeMaterial(entity)
  }, [materialComponent.instances])

  return null
}

const MaterialInstanceReactor = () => {
  const entity = useEntityContext()
  const materialComponent = useComponent(entity, MaterialComponent[MaterialComponents.Instance])
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
