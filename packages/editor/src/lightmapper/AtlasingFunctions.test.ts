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
  EntityID,
  EntityTreeComponent,
  getComponent,
  Layers,
  setComponent,
  SourceID,
  UndefinedEntity,
  UUIDComponent
} from '@ir-engine/ecs'
import { getMutableState } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { initializeSpatialEngine } from '@ir-engine/spatial/src/initializeEngine'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { BoundingBoxComponent } from '@ir-engine/spatial/src/transform/components/BoundingBoxComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { Box3, BoxGeometry, BufferAttribute, Mesh, MeshStandardMaterial, Vector3 } from 'three'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EditorState } from '../services/EditorServices'
import { AtlasingFunctions, UVUnwrapperState } from './AtlasingFunctions'

vi.mock('../functions/assetFunctions', () => ({
  uploadProjectFiles: vi.fn(() => ({
    promises: [Promise.resolve(['http://example.com/atlas.gltf'])]
  }))
}))

vi.mock('@ir-engine/engine/src/gltf/exportGLTFScene', () => ({
  exportGLTFScene: vi.fn(() =>
    Promise.resolve([
      {
        asset: { version: '2.0' },
        scenes: [{ nodes: [0] }],
        nodes: [{ mesh: 0 }],
        meshes: [{ primitives: [{ attributes: { POSITION: 0, TEXCOORD_1: 1 } }] }]
      },
      new ArrayBuffer(100)
    ])
  )
}))

vi.mock('../components/properties/Util', () => ({
  commitProperty: vi.fn(() => vi.fn())
}))

// Mock the UV2UnwrapperState
const mockUnwrapper = {
  isLoaded: true,
  packOptions: { padding: 1 },
  packAtlas: vi.fn().mockImplementation(async (geometries, uvChannel) => {
    // Simulate the UV unwrapper adding UV2 coordinates
    for (const geom of geometries) {
      const uvCount = geom.attributes.position.count
      const uv2Array = new Float32Array(uvCount * 2)

      for (let i = 0; i < uvCount; i++) {
        uv2Array[i * 2] = Math.random()
        uv2Array[i * 2 + 1] = Math.random()
      }

      geom.setAttribute('uv2', new BufferAttribute(uv2Array, 2))
    }
  })
}

describe('AtlasingFunctions', () => {
  beforeEach(async () => {
    createEngine()
    initializeSpatialEngine()
  })

  afterEach(() => {
    destroyEngine()
  })

  describe('exportAtlasData', () => {
    it('should export atlas data', async () => {
      const sceneEntity = createEntity()
      setComponent(sceneEntity, UUIDComponent, {
        entitySourceID: 'test' as SourceID,
        entityID: 'scene' as EntityID
      })
      setComponent(sceneEntity, EntityTreeComponent, { parentEntity: UndefinedEntity })
      setComponent(sceneEntity, SceneComponent)
      const entities = [createEntity()]
      for (const entity of entities) {
        setComponent(entity, MeshComponent, new Mesh(new BoxGeometry(1, 1, 1), new MeshStandardMaterial()))
        setComponent(entity, UUIDComponent, {
          entitySourceID: 'test' as SourceID,
          entityID: UUIDComponent.generate()
        })
        setComponent(entity, EntityTreeComponent, { parentEntity: sceneEntity })
      }
      const projectName = 'test-project'
      const relativePath = 'public/scenes/lightmap/test-scene'
      const assetName = 'test-atlas'

      const url = await AtlasingFunctions.exportAtlasData(entities, projectName, relativePath, assetName)

      expect(url).toBe('http://example.com/atlas.gltf')
    })
  })

  describe('generateAtlas', () => {
    beforeEach(() => {
      getMutableState(EditorState).merge({
        projectName: 'test-project',
        sceneName: 'test-scene.gltf'
      })
    })

    it('should generate the atlas and add UV2 attributes to mesh geometry', async () => {
      vi.mock('xatlas-three', () => ({
        UVUnwrapper: vi.fn().mockImplementation(() => mockUnwrapper)
      }))

      const sceneEntity = createEntity()
      setComponent(sceneEntity, UUIDComponent, {
        entitySourceID: 'test' as SourceID,
        entityID: 'scene' as EntityID
      })
      setComponent(sceneEntity, EntityTreeComponent, { parentEntity: UndefinedEntity })
      setComponent(sceneEntity, SceneComponent)

      const meshEntity = createEntity()
      const geometry = new BoxGeometry(1, 1, 1)

      expect(geometry.attributes.uv2).toBeUndefined()

      const mesh = new Mesh(geometry, new MeshStandardMaterial())
      setComponent(meshEntity, MeshComponent, mesh)
      setComponent(meshEntity, UUIDComponent, {
        entitySourceID: 'test' as SourceID,
        entityID: UUIDComponent.generate()
      })
      setComponent(meshEntity, EntityTreeComponent, { parentEntity: sceneEntity })

      const lightmapEntity = createEntity()
      setComponent(lightmapEntity, NameComponent, 'test-lightmap')
      setComponent(lightmapEntity, UUIDComponent, {
        entitySourceID: 'test' as SourceID,
        entityID: 'lightmap' as EntityID
      })
      setComponent(lightmapEntity, EntityTreeComponent, { parentEntity: sceneEntity })

      const entities = [meshEntity]

      const result = await AtlasingFunctions.generateAtlas(entities, lightmapEntity, 'uv2')

      expect(result).toEqual(entities)

      const meshComponent = getComponent(meshEntity, MeshComponent)
      expect(meshComponent.geometry.attributes.uv2).toBeDefined()
      expect(meshComponent.geometry.attributes.uv2.count).toBe(geometry.attributes.position.count)
      expect(meshComponent.geometry.attributes.uv2.itemSize).toBe(2)

      expect(mockUnwrapper.packAtlas).toHaveBeenCalledWith([geometry], 'uv2', 'uv')
      expect(mockUnwrapper.packOptions.padding).toBe(1)
    })

    it('should return early if unwrapper is not loaded', async () => {
      getMutableState(UVUnwrapperState).isLoaded.set(false)

      const sceneEntity = createEntity()
      setComponent(sceneEntity, UUIDComponent, {
        entitySourceID: 'test' as SourceID,
        entityID: 'scene' as EntityID
      })
      setComponent(sceneEntity, EntityTreeComponent, { parentEntity: UndefinedEntity })
      setComponent(sceneEntity, SceneComponent)

      const meshEntity = createEntity()
      const geometry = new BoxGeometry(1, 1, 1)

      expect(geometry.attributes.uv2).toBeUndefined()

      const mesh = new Mesh(geometry, new MeshStandardMaterial())
      setComponent(meshEntity, MeshComponent, mesh)
      setComponent(meshEntity, UUIDComponent, {
        entitySourceID: 'test' as SourceID,
        entityID: UUIDComponent.generate()
      })
      setComponent(meshEntity, EntityTreeComponent, { parentEntity: sceneEntity })

      const lightmapEntity = createEntity()
      setComponent(lightmapEntity, NameComponent, 'test-lightmap')
      setComponent(lightmapEntity, UUIDComponent, {
        entitySourceID: 'test' as SourceID,
        entityID: 'lightmap' as EntityID
      })
      setComponent(lightmapEntity, EntityTreeComponent, { parentEntity: sceneEntity })

      const entities = [meshEntity]

      const result = await AtlasingFunctions.generateAtlas(entities, lightmapEntity)

      expect(result).toBeUndefined()
    })
  })

  describe('getEntities', () => {
    it('should return mesh entities that are inside the bounding box and filter out those outside', () => {
      const meshEntity1 = createEntity(Layers.Authoring)
      const meshEntity2 = createEntity(Layers.Authoring)
      const meshEntity3 = createEntity(Layers.Authoring)

      const geometry1 = new BoxGeometry(0.5, 0.5, 0.5)
      const geometry2 = new BoxGeometry(0.5, 0.5, 0.5)
      const geometry3 = new BoxGeometry(0.5, 0.5, 0.5)

      geometry1.translate(0, 0, 0)
      geometry1.computeBoundingBox()

      geometry2.translate(0.5, 0.5, 0.5)
      geometry2.computeBoundingBox()

      geometry3.translate(5, 5, 5)
      geometry3.computeBoundingBox()

      const mesh1 = new Mesh(geometry1, new MeshStandardMaterial())
      const mesh2 = new Mesh(geometry2, new MeshStandardMaterial())
      const mesh3 = new Mesh(geometry3, new MeshStandardMaterial())

      setComponent(meshEntity1, MeshComponent, mesh1)
      setComponent(meshEntity1, VisibleComponent)
      setComponent(meshEntity1, TransformComponent)

      setComponent(meshEntity2, MeshComponent, mesh2)
      setComponent(meshEntity2, VisibleComponent)
      setComponent(meshEntity2, TransformComponent)

      setComponent(meshEntity3, MeshComponent, mesh3)
      setComponent(meshEntity3, VisibleComponent)
      setComponent(meshEntity3, TransformComponent)

      const lightmapEntity = createEntity()
      setComponent(lightmapEntity, TransformComponent)

      const boundingBox = new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1))
      setComponent(lightmapEntity, BoundingBoxComponent, { box: boundingBox })

      const result = AtlasingFunctions.getEntities(lightmapEntity)

      // Should return meshEntity1 and meshEntity2 inside the bounding box
      // meshEntity3 should be filtered out as it's outside the bounding box
      expect(result).toHaveLength(2)
    })
  })
})
