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
  createEngine,
  createEntity,
  destroyEngine,
  setComponent,
  SourceID,
  UndefinedEntity,
  UUIDComponent
} from '@ir-engine/ecs'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { destroySpatialEngine } from '@ir-engine/spatial/src/initializeEngine'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import {
  MaterialInstanceComponent,
  MaterialStateComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { mockSpatialEngine } from '@ir-engine/spatial/tests/util/mockSpatialEngine'
import { BoxGeometry, BufferAttribute, BufferGeometry, Mesh, MeshStandardMaterial } from 'three'
import { MeshBVH } from 'three-mesh-bvh'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Lightmapper } from './LightmapperFunctions'

describe('LightmapperFunctions', () => {
  let testEntity = UndefinedEntity

  beforeEach(async () => {
    createEngine()
    mockSpatialEngine()
    testEntity = createEntity()
    setComponent(testEntity, NameComponent, 'test-lightmap')
  })

  afterEach(() => {
    destroySpatialEngine()
    return destroyEngine()
  })

  describe('Lightmapper functions', () => {
    it('should export all expected functions', () => {
      expect(typeof Lightmapper.initialize).toBe('function')
      expect(typeof Lightmapper.sample).toBe('function')
      expect(typeof Lightmapper.getBakeBVH).toBe('function')
      expect(typeof Lightmapper.uploadLightmapTexture).toBe('function')
      expect(typeof Lightmapper.handleBakeLightmap).toBe('function')
    })
  })

  describe('getBakeBVH', () => {
    it('should create BVH from mesh entities and filter out transparent materials', () => {
      const entity1 = createEntity()
      const entity2 = createEntity()
      const entity3 = createEntity() // transparent

      const geometry1 = new BoxGeometry(1, 1, 1)
      const geometry2 = new BoxGeometry(2, 2, 2)
      const geometry3 = new BoxGeometry(3, 3, 3)

      const mesh1 = new Mesh(geometry1, new MeshStandardMaterial())
      const mesh2 = new Mesh(geometry2, new MeshStandardMaterial())
      const mesh3 = new Mesh(geometry3, new MeshStandardMaterial())

      setComponent(entity1, MeshComponent, mesh1)
      setComponent(entity2, MeshComponent, mesh2)
      setComponent(entity3, MeshComponent, mesh3)

      const transparentMaterialEntity = createEntity()
      setComponent(transparentMaterialEntity, UUIDComponent, {
        entitySourceID: 'test' as SourceID,
        entityID: UUIDComponent.generate()
      })
      const transparentMaterial = new MeshStandardMaterial({ transparent: true, opacity: 0.5 })
      setComponent(transparentMaterialEntity, MaterialStateComponent, { material: transparentMaterial })
      setComponent(entity3, MaterialInstanceComponent, { entities: [transparentMaterialEntity] })

      const entities = [entity1, entity2, entity3]
      const bvh = Lightmapper.getBakeBVH(entities)

      // ensure transparent groups are removed
      const mergedGeometry = bvh.geometry
      expect(mergedGeometry.groups.length).toBe(2)

      expect(bvh).toBeInstanceOf(MeshBVH)
    })
  })

  describe('createGeometryFromGroups', () => {
    it('should create new geometry with specified groups', () => {
      const sourceGeometry = new BufferGeometry()

      // vertices for a quad
      const vertices = new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0])

      const indices = new Uint16Array([0, 1, 2, 0, 2, 3])

      sourceGeometry.setAttribute('position', new BufferAttribute(vertices, 3))
      sourceGeometry.setIndex(new BufferAttribute(indices, 1))
      sourceGeometry.addGroup(0, 3, 0)
      sourceGeometry.addGroup(3, 3, 1)

      const entity = createEntity()
      const mesh = new Mesh(sourceGeometry, new MeshStandardMaterial())
      setComponent(entity, MeshComponent, mesh)

      const materialEntity1 = createEntity()
      const materialEntity2 = createEntity()
      setComponent(materialEntity1, UUIDComponent, {
        entitySourceID: 'test' as SourceID,
        entityID: UUIDComponent.generate()
      })
      setComponent(materialEntity2, UUIDComponent, {
        entitySourceID: 'test' as SourceID,
        entityID: UUIDComponent.generate()
      })
      const t = new MeshStandardMaterial()
      const opaqueMaterial = new MeshStandardMaterial({ transparent: false })
      const transparentMaterial = new MeshStandardMaterial({ transparent: true, opacity: 0.5 })

      setComponent(materialEntity1, MaterialStateComponent, { material: opaqueMaterial })
      setComponent(materialEntity2, MaterialStateComponent, { material: transparentMaterial })
      setComponent(entity, MaterialInstanceComponent, { entities: [materialEntity1, materialEntity2] })

      const entities = [entity]
      const bvh = Lightmapper.getBakeBVH(entities)

      // expect it to successfully create BVH with filtered geometry
      expect(bvh).toBeInstanceOf(MeshBVH)
    })
  })
})
