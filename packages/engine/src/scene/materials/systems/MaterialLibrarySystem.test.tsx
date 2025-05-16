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

import {
  EntityID,
  EntityUUIDPair,
  SourceID,
  UUIDComponent,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  setComponent
} from '@ir-engine/ecs'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import {
  MaterialInstanceComponent,
  MaterialStateComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { mockSpatialEngine } from '@ir-engine/spatial/tests/util/mockSpatialEngine'
import { act, render } from '@testing-library/react'
import { Mesh, MeshLambertMaterial, MeshPhysicalMaterial } from 'three'
import { afterEach, assert, beforeEach, describe, it } from 'vitest'
import { convertMaterials } from './MaterialLibrarySystem'

describe('MaterialLibrarySystem', { retry: 2 }, () => {
  describe('convertMaterials', () => {
    let instanceEntity = UndefinedEntity
    let material = UndefinedEntity
    const materialInstanceID = 'materialUuid' as SourceID
    const materialID = 'id' as EntityID
    beforeEach(async () => {
      createEngine()
      mockSpatialEngine()
      material = createEntity()
      setComponent(material, UUIDComponent, { entitySourceID: materialInstanceID, entityID: materialID })
      setComponent(material, NameComponent, 'Material')
      setComponent(material, MaterialStateComponent, { material: new MeshPhysicalMaterial() })

      instanceEntity = createEntity()
      setComponent(instanceEntity, MaterialInstanceComponent, {
        entities: [material]
      })
      setComponent(instanceEntity, MeshComponent, new Mesh())
      await act(() => render(null))
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should convert a physical material to a basic material and update the instance', () => {
      convertMaterials(material, true)
      const basicUuid = { entitySourceID: 'basic-' + materialInstanceID, entityID: materialID } as EntityUUIDPair
      const basicMaterialEntity = UUIDComponent.getEntityByUUID(UUIDComponent.join(basicUuid))
      assert(getComponent(basicMaterialEntity, UUIDComponent).entitySourceID === basicUuid.entitySourceID)
      const basicMaterialComponent = getComponent(basicMaterialEntity, MaterialStateComponent)
      const basicMaterial = basicMaterialComponent.material as MeshLambertMaterial
      const originalMaterial = getComponent(material, MaterialStateComponent).material as MeshPhysicalMaterial
      assert(basicMaterial.reflectivity === originalMaterial.metalness)
      assert(basicMaterial.envMap === originalMaterial.envMap)
      assert(basicMaterial.alphaTest === originalMaterial.alphaTest)
      assert(basicMaterial.side === originalMaterial.side)

      assert(getComponent(instanceEntity, MaterialInstanceComponent).entities[0] === basicMaterialEntity)
    })

    it('should switch the instance back to physical when disabling basic materials', async () => {
      convertMaterials(material, true)

      const basicMaterialEntity = UUIDComponent.getEntityByUUID(
        UUIDComponent.join({
          entitySourceID: ('basic-' + materialInstanceID) as SourceID,
          entityID: materialID
        })
      )
      assert(getComponent(basicMaterialEntity, UUIDComponent).entitySourceID === 'basic-' + materialInstanceID)
      const instanceComponent = getComponent(instanceEntity, MaterialInstanceComponent)
      assert(instanceComponent.entities[0] === basicMaterialEntity)
      convertMaterials(basicMaterialEntity, false)
      assert(instanceComponent.entities[0] === material)
    })
  })
})
