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
import { getMutableState } from '@ir-engine/hyperflux'
import { flushAll } from '@ir-engine/hyperflux/tests/utils/flushAll'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import {
  MaterialInstanceComponent,
  MaterialStateComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { mockSpatialEngine } from '@ir-engine/spatial/tests/util/mockSpatialEngine'
import { Mesh, MeshLambertMaterial, MeshPhysicalMaterial } from 'three'
import { afterEach, assert, beforeEach, describe, it } from 'vitest'

describe('MaterialLibrarySystem', () => {
  describe('convertMaterials', () => {
    let instanceEntity = UndefinedEntity
    let materialEntity = UndefinedEntity
    const materialInstanceID = 'materialInstanceID' as SourceID
    const materialID = 'materialID' as EntityID

    beforeEach(async () => {
      createEngine()
      mockSpatialEngine()
      materialEntity = createEntity()
      setComponent(materialEntity, UUIDComponent, { entitySourceID: materialInstanceID, entityID: materialID })
      setComponent(materialEntity, NameComponent, 'Material')
      setComponent(materialEntity, MaterialStateComponent, { material: new MeshPhysicalMaterial() })

      instanceEntity = createEntity()
      setComponent(instanceEntity, UUIDComponent, {
        entitySourceID: materialInstanceID,
        entityID: 'meshID' as EntityID
      })
      setComponent(instanceEntity, MaterialInstanceComponent, {
        entities: [getComponent(materialEntity, UUIDComponent).entityID]
      })
      setComponent(instanceEntity, MeshComponent, new Mesh())

      await flushAll()
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should convert a physical material to a basic material and update the instance', async () => {
      getMutableState(RendererState).forceBasicMaterials.set(true)
      await flushAll()

      const basicUuid = { entitySourceID: 'basic-' + materialInstanceID, entityID: materialID } as EntityUUIDPair
      const basicMaterialEntity = UUIDComponent.getEntityByUUID(UUIDComponent.join(basicUuid))

      assert.equal(getComponent(basicMaterialEntity, UUIDComponent).entitySourceID, basicUuid.entitySourceID)

      const basicMaterialComponent = getComponent(basicMaterialEntity, MaterialStateComponent)
      const basicMaterial = basicMaterialComponent.material as MeshLambertMaterial
      const originalMaterial = getComponent(materialEntity, MaterialStateComponent).material as MeshPhysicalMaterial

      assert.equal(basicMaterial.reflectivity, originalMaterial.metalness)
      assert.equal(basicMaterial.envMap, originalMaterial.envMap)
      assert.equal(basicMaterial.uuid, UUIDComponent.join(basicUuid))
      assert.equal(basicMaterial.alphaTest, originalMaterial.alphaTest)
      assert.equal(basicMaterial.side, originalMaterial.side)
      assert.equal(
        getComponent(instanceEntity, MaterialInstanceComponent).entities[0],
        getComponent(basicMaterialEntity, UUIDComponent).entityID
      )
    })

    it('should switch the instance back to physical when disabling basic materials', async () => {
      getMutableState(RendererState).forceBasicMaterials.set(true)
      await flushAll()

      const basicMaterialEntity = UUIDComponent.getEntityByUUID(
        UUIDComponent.join({
          entitySourceID: ('basic-' + materialInstanceID) as SourceID,
          entityID: materialID
        })
      )

      assert.equal(getComponent(basicMaterialEntity, UUIDComponent).entitySourceID, 'basic-' + materialInstanceID)

      const instanceComponent = getComponent(instanceEntity, MaterialInstanceComponent)

      assert.equal(instanceComponent.entities[0], getComponent(basicMaterialEntity, UUIDComponent).entityID)

      getMutableState(RendererState).forceBasicMaterials.set(false)
      await flushAll()

      assert.equal(instanceComponent.entities[0], getComponent(materialEntity, UUIDComponent).entityID)
    })
  })
})
