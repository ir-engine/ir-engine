import {
  EntityUUID,
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
import React from 'react'
import { Mesh, MeshLambertMaterial, MeshPhysicalMaterial } from 'three'
import { afterEach, assert, beforeEach, describe, it } from 'vitest'
import { convertMaterials } from './MaterialLibrarySystem'

describe('MaterialLibrarySystem', () => {
  describe('convertMaterials', () => {
    let instanceEntity = UndefinedEntity
    let material = UndefinedEntity
    const materialUuid = 'materialUuid' as EntityUUID
    beforeEach(async () => {
      createEngine()
      mockSpatialEngine()
      material = createEntity()
      setComponent(material, UUIDComponent, materialUuid)
      setComponent(material, NameComponent, 'Material')
      setComponent(material, MaterialStateComponent, { material: new MeshPhysicalMaterial() })

      instanceEntity = createEntity()
      setComponent(instanceEntity, MaterialInstanceComponent, {
        uuid: ['mockUuid1' as EntityUUID, materialUuid, 'mockUuid2' as EntityUUID]
      })
      setComponent(instanceEntity, MeshComponent, new Mesh())
      const { rerender, unmount } = render(<></>)
      await act(async () => rerender(<></>))
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should convert a physical material to a basic material and update the instance', () => {
      convertMaterials(material, true)
      const basicUuid = ('basic-' + materialUuid) as EntityUUID
      const basicMaterialEntity = UUIDComponent.getEntityByUUID(basicUuid)
      assert(getComponent(basicMaterialEntity, UUIDComponent) === basicUuid)
      const basicMaterialComponent = getComponent(basicMaterialEntity, MaterialStateComponent)
      const basicMaterial = basicMaterialComponent.material as MeshLambertMaterial
      const originalMaterial = getComponent(material, MaterialStateComponent).material as MeshPhysicalMaterial
      assert(basicMaterial.reflectivity === originalMaterial.metalness)
      assert(basicMaterial.envMap === originalMaterial.envMap)
      assert(basicMaterial.uuid === 'basic-' + materialUuid)
      assert(basicMaterial.alphaTest === originalMaterial.alphaTest)
      assert(basicMaterial.side === originalMaterial.side)

      assert(getComponent(instanceEntity, MaterialInstanceComponent).uuid[1] === basicUuid)
    })

    it('should switch the instance back to physical when disabling basic materials', async () => {
      convertMaterials(material, true)

      const basicUuid = ('basic-' + materialUuid) as EntityUUID
      const basicMaterialEntity = UUIDComponent.getEntityByUUID(basicUuid)
      assert(getComponent(basicMaterialEntity, UUIDComponent) === basicUuid)
      const instanceComponent = getComponent(instanceEntity, MaterialInstanceComponent)
      assert(instanceComponent.uuid[1] === basicUuid)
      convertMaterials(basicMaterialEntity, false)
      assert(instanceComponent.uuid[1] === materialUuid)
    })
  })
})
