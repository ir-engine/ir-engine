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

import { Entity, createEngine, createEntity, destroyEngine, getComponent, setComponent } from '@ir-engine/ecs'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { Vector2 } from 'three'
import { afterEach, assert, beforeEach, describe, it } from 'vitest'
import { TerrainMeshComponent } from './TerrainMeshComponent'

describe('TerrainMeshComponent', () => {
  let entity: Entity

  beforeEach(() => {
    createEngine()
    entity = createEntity()
    setComponent(entity, TransformComponent)
  })

  afterEach(() => {
    destroyEngine()
  })

  describe('Component Definition', () => {
    it('should initialize the TerrainMeshComponent.name field with the expected value', () => {
      assert.equal(TerrainMeshComponent.name, 'TerrainMeshComponent')
    })

    it('should initialize the TerrainMeshComponent.jsonID field with the expected value', () => {
      assert.equal(TerrainMeshComponent.jsonID, 'EE_terrain_mesh')
    })
  })

  describe('Component Properties', () => {
    it('should set default values when component is added', () => {
      setComponent(entity, TerrainMeshComponent)
      const component = getComponent(entity, TerrainMeshComponent)

      assert.equal(component.width, 100)
      assert.equal(component.height, 20)
      assert.equal(component.depth, 100)
      assert.equal(component.widthSegments, 100)
      assert.equal(component.depthSegments, 100)
      assert.equal(component.heightmapURL, '')
      assert.equal(component.enablePhysics, true)
      assert.equal(component.diffuseMap1, '')
      assert.equal(component.diffuseMap2, '')
      assert.equal(component.diffuseMap3, '')
      assert.equal(component.normalMap1, '')
      assert.equal(component.normalMap2, '')
      assert.equal(component.normalMap3, '')
      assert.deepEqual(component.texScale1, new Vector2(0.1, 0.1))
      assert.deepEqual(component.texScale2, new Vector2(0.1, 0.1))
      assert.deepEqual(component.texScale3, new Vector2(0.1, 0.1))
      assert.equal(component.blendSharpness, 2.0)
      assert.equal(component.normalScale, 1.0)
      assert.equal(component.visible, true)
    })

    it('should allow setting custom values', () => {
      setComponent(entity, TerrainMeshComponent, {
        width: 200,
        height: 50,
        depth: 200,
        widthSegments: 200,
        depthSegments: 200,
        heightmapURL: 'test-heightmap.png',
        enablePhysics: false,
        texScale1: new Vector2(0.2, 0.2),
        blendSharpness: 3.0
      })

      const component = getComponent(entity, TerrainMeshComponent)

      assert.equal(component.width, 200)
      assert.equal(component.height, 50)
      assert.equal(component.depth, 200)
      assert.equal(component.widthSegments, 200)
      assert.equal(component.depthSegments, 200)
      assert.equal(component.heightmapURL, 'test-heightmap.png')
      assert.equal(component.enablePhysics, false)
      assert.deepEqual(component.texScale1, new Vector2(0.2, 0.2))
      assert.equal(component.blendSharpness, 3.0)
    })
  })

  // Note: Full rendering tests would require mocking the texture loading and WebGL context
  // These tests focus on component definition and basic property setting
})
