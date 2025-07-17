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
  getChildrenWithComponents,
  getComponent,
  getOptionalComponent,
  removeEntityNodeRecursively,
  setComponent,
  SourceID,
  UndefinedEntity,
  UUIDComponent
} from '@ir-engine/ecs'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { assertArray } from '@ir-engine/spatial/tests/util/assert'
import { InstancedBufferAttribute, InstancedMesh, Matrix4, Quaternion } from 'three'
import { afterEach, assert, beforeEach, describe, it, vi } from 'vitest'
import { startEngineReactor } from '../../../tests/startEngineReactor'
import { overrideFileLoaderLoad } from '../../../tests/util/loadGLTFAssetNode'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { InstancingComponent } from './InstancingComponent'
import { deviceMetadataSchema, distanceMetadataSchema, Heuristic, VariantComponent } from './VariantComponent'

const VariantComponentDefaults = {
  levels: [] as Array<{
    src: string
    metadata: typeof distanceMetadataSchema | typeof deviceMetadataSchema
    heuristic: number
    currentLevel: number
  }>
}

function assertVariantComponentEqual(data, expected) {
  assertArray.eq(data.levels, expected.levels)
}
describe('VariantComponent', () => {
  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, VariantComponent)
    })

    afterEach(() => {
      removeEntityNodeRecursively(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, VariantComponent)
      assertVariantComponentEqual(data, VariantComponentDefaults)
    })
  }) // << onInit

  describe('reactor', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, VariantComponent)
    })

    afterEach(() => {
      removeEntityNodeRecursively(testEntity)
      return destroyEngine()
    })

    it('should have a child entity with a GLTFComponent', () => {
      const childEntity = getChildrenWithComponents(testEntity, [GLTFComponent]).at(0)
      assert.notEqual(childEntity, UndefinedEntity)
    })

    it('should not have a GLTFComponent', () => {
      const gltfComponent = getOptionalComponent(testEntity, GLTFComponent)
      assert.equal(gltfComponent, undefined)
    })
  }) // << reactor

  describe('VariantComponent with InstancingComponent', () => {
    overrideFileLoaderLoad()

    const base_url = 'packages/engine/tests/assets/LOD/'
    const lods = [base_url + 'Test_LOD0.glb', base_url + 'Test_LOD1.glb', base_url + 'Test_LOD2.glb']

    let testEntity = UndefinedEntity

    const createInstanceMatrix = () => {
      // create random instance matrix
      const matrices = [] as number[]
      const mat4 = new Matrix4()

      const areaSize = 100
      const count = 10

      for (let i = 0; i < count; i++) {
        const rot = new Quaternion().identity()
        mat4.makeRotationFromQuaternion(rot)
        mat4.elements[12] = (Math.random() - 0.5) * areaSize
        mat4.elements[13] = 0
        mat4.elements[14] = (Math.random() - 0.5) * areaSize
        matrices.push(...mat4.elements)
      }

      const instanceMatrix = new InstancedBufferAttribute(new Float32Array(matrices), 16)
      return instanceMatrix
    }

    beforeEach(async () => {
      createEngine()
      startEngineReactor()

      testEntity = createEntity()
      setComponent(testEntity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'test' as EntityID
      })
      setComponent(testEntity, InstancingComponent, { instanceMatrix: createInstanceMatrix() })
      setComponent(testEntity, VariantComponent)
    })

    afterEach(() => {
      removeEntityNodeRecursively(testEntity)
      return destroyEngine()
    })

    it('should not create a variant child entity when InstancingComponent is present', () => {
      const childEntities = getChildrenWithComponents(testEntity, [GLTFComponent]).filter((entity) => {
        const uuid = getComponent(entity, UUIDComponent)
        return uuid && uuid.entityID === 'variant-child'
      })

      assert.equal(childEntities.length, 0, 'Should not create the variant-child entity')
    })

    it('should render variant levels as instances when InstancingComponent is present', async () => {
      let distance = 0
      setComponent(testEntity, InstancingComponent, { instanceMatrix: createInstanceMatrix() })
      setComponent(testEntity, VariantComponent, {
        heuristic: 'DISTANCE' as Heuristic,
        levels: lods.map((src) => {
          const start = distance
          distance += 20
          return {
            src,
            metadata: {
              minDistance: start,
              maxDistance: distance
            }
          }
        })
      })

      await vi.waitUntil(() => getChildrenWithComponents(testEntity, [GLTFComponent]).length > 0, {
        timeout: 5000
      })

      const childGLTFEntities = getChildrenWithComponents(testEntity, [GLTFComponent])
      assert.equal(childGLTFEntities.length, lods.length)

      await vi.waitUntil(() => childGLTFEntities.every((entity) => GLTFComponent.isSceneLoaded(entity)), {
        timeout: 5000
      })

      const childMeshEntities = getChildrenWithComponents(testEntity, [MeshComponent])
      assert(childMeshEntities.length > 0)

      await vi.waitUntil(
        () => childMeshEntities.every((entity) => getComponent(entity, MeshComponent) instanceof InstancedMesh),
        {
          timeout: 5000
        }
      )

      for (const meshEntity of childMeshEntities) {
        const mesh = getComponent(meshEntity, MeshComponent)
        assert(mesh instanceof InstancedMesh)
      }
    })
  })
})
