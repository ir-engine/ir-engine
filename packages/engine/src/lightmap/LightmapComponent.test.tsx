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
  EntityTreeComponent,
  getComponent,
  setComponent,
  UndefinedEntity,
  UUIDComponent
} from '@ir-engine/ecs'
import { destroySpatialEngine } from '@ir-engine/spatial/src/initializeEngine'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { mockSpatialEngine } from '@ir-engine/spatial/tests/util/mockSpatialEngine'
import { act, render } from '@testing-library/react'
import React from 'react'
import { BoxGeometry, BufferAttribute, Mesh, MeshStandardMaterial } from 'three'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AssetState } from '../gltf/GLTFState'
import { LightmapComponent } from './LightmapComponent'

describe('LightmapComponent', () => {
  let testEntity = UndefinedEntity

  beforeEach(async () => {
    createEngine()
    mockSpatialEngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    destroySpatialEngine()
    return destroyEngine()
  })

  describe('IDs', () => {
    it('should initialize the LightmapComponent.name field with the expected value', () => {
      expect(LightmapComponent.name).toBe('LightmapComponent')
    })

    it('should initialize the LightmapComponent.jsonID field with the expected value', () => {
      expect(LightmapComponent.jsonID).toBe('IR_lightmap')
    })
  })

  describe('schema', () => {
    it('should initialize with default values', () => {
      setComponent(testEntity, LightmapComponent)
      const component = getComponent(testEntity, LightmapComponent)

      expect(component.atlasSrc).toBe('')
    })

    it('should set values', () => {
      const testAtlasSrc = '/test/atlas.gltf'

      setComponent(testEntity, LightmapComponent, {
        atlasSrc: testAtlasSrc
      })

      const component = getComponent(testEntity, LightmapComponent)
      expect(component.atlasSrc).toBe(testAtlasSrc)
    })
  })

  describe('reactor', () => {
    it('should load the GLTF atlas asset from atlasSrc and apply the loaded atlased meshes to the corresponding meshes', async () => {
      const sceneEntity = createEntity()
      const sceneUUID = 'test-scene-uuid'
      setComponent(sceneEntity, UUIDComponent, { entityID: sceneUUID as any, entitySourceID: 'scene' as any })
      setComponent(sceneEntity, SceneComponent)

      const lightmapEntity = createEntity()
      setComponent(lightmapEntity, EntityTreeComponent, { parentEntity: sceneEntity })

      // original mesh entities that will receive the atlas data
      const originalMeshEntity1 = createEntity()
      const originalMeshEntity2 = createEntity()
      const originalMeshUUID1 = 'mesh-1'
      const originalMeshUUID2 = 'mesh-2'

      setComponent(originalMeshEntity1, UUIDComponent, {
        entityID: (sceneUUID + originalMeshUUID1) as any,
        entitySourceID: 'scene' as any
      })
      setComponent(originalMeshEntity2, UUIDComponent, {
        entityID: (sceneUUID + originalMeshUUID2) as any,
        entitySourceID: 'scene' as any
      })

      const originalGeometry1 = new BoxGeometry(1, 1, 1)
      const originalGeometry2 = new BoxGeometry(2, 2, 2)

      setComponent(originalMeshEntity1, MeshComponent, new Mesh(originalGeometry1, new MeshStandardMaterial()))
      setComponent(originalMeshEntity2, MeshComponent, new Mesh(originalGeometry2, new MeshStandardMaterial()))

      const mockAtlasEntity = createEntity()
      const mockAtlasChild1 = createEntity()
      const mockAtlasChild2 = createEntity()

      setComponent(mockAtlasChild1, UUIDComponent, {
        entityID: originalMeshUUID1 as any,
        entitySourceID: 'atlas' as any
      })
      setComponent(mockAtlasChild2, UUIDComponent, {
        entityID: originalMeshUUID2 as any,
        entitySourceID: 'atlas' as any
      })

      // atlas geometries with lightmap UV attributes
      const atlasGeometry1 = new BoxGeometry(1, 1, 1)
      const atlasGeometry2 = new BoxGeometry(2, 2, 2)

      const lightmapUVs1 = new Float32Array([
        0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.0, 0.5, 0.5, 0.0, 1.0, 0.0, 1.0, 0.5, 0.5, 0.5
      ])
      const lightmapUVs2 = new Float32Array([
        0.0, 0.5, 0.5, 0.5, 0.5, 1.0, 0.0, 1.0, 0.5, 0.5, 1.0, 0.5, 1.0, 1.0, 0.5, 1.0
      ])

      atlasGeometry1.setAttribute('uv2', new BufferAttribute(lightmapUVs1, 2))
      atlasGeometry2.setAttribute('uv2', new BufferAttribute(lightmapUVs2, 2))

      const atlasMesh1 = new Mesh(atlasGeometry1, new MeshStandardMaterial())
      const atlasMesh2 = new Mesh(atlasGeometry2, new MeshStandardMaterial())

      setComponent(mockAtlasChild1, MeshComponent, atlasMesh1)
      setComponent(mockAtlasChild2, MeshComponent, atlasMesh2)

      setComponent(mockAtlasChild1, EntityTreeComponent, { parentEntity: mockAtlasEntity })
      setComponent(mockAtlasChild2, EntityTreeComponent, { parentEntity: mockAtlasEntity })

      AssetState.loadAsync = vi.fn().mockResolvedValue(mockAtlasEntity)

      // Set the atlas source to trigger loading
      const atlasUrl = '/test/lightmap-atlas.gltf'
      setComponent(lightmapEntity, LightmapComponent, {
        atlasSrc: atlasUrl
      })

      await act(async () => {
        render(<LightmapComponent.reactor entity={lightmapEntity} />)
        await new Promise((resolve) => setTimeout(resolve, 100))
      })

      expect(AssetState.loadAsync).toHaveBeenCalledWith(atlasUrl, false, expect.any(String))

      // Verify that the original mesh geometries now have the lightmap UV attributes
      const updatedMesh1 = getComponent(originalMeshEntity1, MeshComponent)
      const updatedMesh2 = getComponent(originalMeshEntity2, MeshComponent)

      expect(updatedMesh1.geometry.attributes.uv2).toBeDefined()
      expect(updatedMesh2.geometry.attributes.uv2).toBeDefined()

      expect(updatedMesh1.geometry.attributes.uv2.array).toEqual(lightmapUVs1)
      expect(updatedMesh2.geometry.attributes.uv2.array).toEqual(lightmapUVs2)

      expect(updatedMesh1.geometry.index).toEqual(atlasGeometry1.index)
      expect(updatedMesh2.geometry.index).toEqual(atlasGeometry2.index)
    })
  })
})
