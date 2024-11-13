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

import {
  SystemDefinitions,
  UndefinedEntity,
  createEntity,
  destroyEngine,
  getComponent,
  getMutableComponent,
  hasComponent,
  removeEntity,
  serializeComponent,
  setComponent
} from '@ir-engine/ecs'
import { createEngine } from '@ir-engine/ecs/src/Engine'
import assert from 'assert'
import { afterEach, beforeEach, describe, it } from 'vitest'

import { Matrix4, Quaternion, Vector3 } from 'three'
import {
  assertArrayEqual,
  assertFloatApproxEq,
  assertFloatApproxNotEq,
  assertVecAnyApproxNotEq,
  assertVecApproxEq
} from '../../../tests/util/mathAssertions'
import { Axis, PI, Vector3_One, Vector3_Zero } from '../../common/constants/MathConstants'
import { SceneComponent } from '../../renderer/components/SceneComponents'
import { TransformDirtyUpdateSystem } from '../systems/TransformSystem'
import { EntityTreeComponent, getAncestorWithComponents } from './EntityTree'
import {
  TransformComponent,
  TransformECS,
  TransformGizmoTagComponent,
  composeMatrix,
  decomposeMatrix,
  setFromRotationMatrix
} from './TransformComponent'

const _position = Vector3_Zero.clone()
const _rotation = new Quaternion()
const _scale = Vector3_One.clone()

type TransformComponentData = {
  position: Vector3
  rotation: Quaternion
  scale: Vector3
  matrix: Matrix4
  matrixWorld: Matrix4
}

const TransformComponentDefaults: TransformComponentData = {
  position: new Vector3(),
  rotation: new Quaternion(0, 0, 0, 1),
  scale: new Vector3(1, 1, 1),
  matrix: new Matrix4(),
  matrixWorld: new Matrix4()
}

function assertTransformComponentEq(A: TransformComponentData, B: TransformComponentData): void {
  assertVecApproxEq(A.position, B.position, 3)
  assertVecApproxEq(A.rotation, B.rotation, 4)
  assertVecApproxEq(A.scale, B.scale, 3)
  assertArrayEqual(A.matrix.elements, B.matrix.elements)
  assertArrayEqual(A.matrixWorld.elements, B.matrixWorld.elements)
}

describe('TransformComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      assert.equal(TransformComponent.name, 'TransformComponent')
    })

    it('should initialize the *Component.jsonID field with the expected value', () => {
      assert.equal(TransformComponent.jsonID, 'EE_transform')
    })

    it('should initialize the *Component.schema field with the expected value', () => {
      assert.deepEqual(TransformComponent.schema, TransformECS)
    })
  }) //:: Fields

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransformComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the *Component with the expected default values', () => {
      const result = getComponent(testEntity, TransformComponent)
      assertTransformComponentEq(result, TransformComponentDefaults)
    })
  }) //:: onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransformComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should change the values of an initialized TransformComponent', () => {
      const before = getComponent(testEntity, TransformComponent)
      assertTransformComponentEq(before, TransformComponentDefaults)
      const Expected = {
        position: new Vector3(1, 2, 3),
        rotation: new Quaternion(4, 5, 6, 7).normalize(),
        scale: new Vector3(8, 9, 10),
        matrix: new Matrix4(), // Ignored by onSet
        matrixWorld: new Matrix4() // Ignored by onSet
      }
      setComponent(testEntity, TransformComponent, Expected)
      const after = getComponent(testEntity, TransformComponent)
      assertTransformComponentEq(after, Expected)
    })

    it('should not change values of an initialized TransformComponent when the data passed had incorrect types', () => {
      const before = getComponent(testEntity, TransformComponent)
      assertTransformComponentEq(before, TransformComponentDefaults)
      const Incorrect = {
        position: 'somePosition',
        rotation: 'someRotation',
        scale: false,
        matrix: true,
        matrixWorld: 42
      }
      // @ts-ignore Coerce incorrectly typed data into the onSet call
      setComponent(testEntity, TransformComponent, Incorrect)
      const after = getComponent(testEntity, TransformComponent)
      assertTransformComponentEq(before, after)
    })
  }) //:: onSet

  describe('toJSON', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransformComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it("should serialize the component's data correctly", () => {
      const Expected = {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0, w: 1 },
        scale: { x: 1, y: 1, z: 1 }
      }
      const json = serializeComponent(testEntity, TransformComponent)
      assert.deepEqual(json, Expected)
    })
  }) //:: toJSON

  /**
  // @todo
  describe('reactor', () => { }) //:: reactor
  */

  describe('getWorldPosition', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransformComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should set `@param vec3`.x to the value of `@param entity`.TransformComponent.matrixWorld.elements[12] ', () => {
      const Expected = 42
      const ID = 12
      // Sanity check before running
      assert.equal(hasComponent(testEntity, TransformComponent), true)
      assert.notEqual(getComponent(testEntity, TransformComponent).matrixWorld.elements[ID], Expected)
      // Set the data as expected
      getMutableComponent(testEntity, TransformComponent).matrixWorld.elements[ID].set(Expected)
      // Run and Check the result
      const result = new Vector3()
      TransformComponent.getWorldPosition(testEntity, result)
      assert.equal(result.x, Expected)
    })

    it('should set `@param vec3`.y to the value of `@param entity`.TransformComponent.matrixWorld.elements[13]', () => {
      const Expected = 42
      const ID = 13
      // Sanity check before running
      assert.equal(hasComponent(testEntity, TransformComponent), true)
      assert.notEqual(getComponent(testEntity, TransformComponent).matrixWorld.elements[ID], Expected)
      // Set the data as expected
      getMutableComponent(testEntity, TransformComponent).matrixWorld.elements[ID].set(Expected)
      // Run and Check the result
      const result = new Vector3()
      TransformComponent.getWorldPosition(testEntity, result)
      assert.equal(result.y, Expected)
    })

    it('should set `@param vec3`.z to the value of `@param entity`.TransformComponent.matrixWorld.elements[14]', () => {
      const Expected = 42
      const ID = 14
      // Sanity check before running
      assert.equal(hasComponent(testEntity, TransformComponent), true)
      assert.notEqual(getComponent(testEntity, TransformComponent).matrixWorld.elements[ID], Expected)
      // Set the data as expected
      getMutableComponent(testEntity, TransformComponent).matrixWorld.elements[ID].set(Expected)
      // Run and Check the result
      const result = new Vector3()
      TransformComponent.getWorldPosition(testEntity, result)
      assert.equal(result.z, Expected)
    })

    it('should return a Vector3 with the values of `@param entity`.TransformComponent.matrixWorld.elements[(12,13,14)]', () => {
      const Expected = new Vector3(42, 43, 44)
      // Set the data as expected
      getMutableComponent(testEntity, TransformComponent).matrixWorld.elements[12].set(Expected.x)
      getMutableComponent(testEntity, TransformComponent).matrixWorld.elements[13].set(Expected.y)
      getMutableComponent(testEntity, TransformComponent).matrixWorld.elements[14].set(Expected.z)
      // Sanity check before running
      assert.equal(hasComponent(testEntity, TransformComponent), true)
      // Run and Check the result
      const result = TransformComponent.getWorldPosition(testEntity, new Vector3())
      assertVecApproxEq(result, Expected, 3)
    })
  }) //:: getWorldPosition

  describe('getMatrixRelativeToEntity', () => {
    beforeEach(async () => {
      createEngine()
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should write a new matrix into `@param outMatrix` based on `@param entity`.matrixWorld and relative to `@param relativeEntity`.matrixWorld', () => {
      const Difference = 42
      const Base = new Vector3(1, 1, 1)
      const Absolute = Base.clone().addScalar(Difference)
      const Relative = Absolute.clone().sub(Base)
      const Expected = new Matrix4().compose(Relative, new Quaternion(), new Vector3(1, 1, 1))
      // Set the data as expected
      const testEntity = createEntity()
      const relativeEntity = createEntity()
      setComponent(testEntity, TransformComponent, { position: Absolute })
      setComponent(relativeEntity, TransformComponent, { position: Base })
      // Run and Check the result
      const result = new Matrix4()
      TransformComponent.getMatrixRelativeToEntity(testEntity, relativeEntity, result)
      assertArrayEqual(result.elements, Expected.elements)
    })

    it('should return a new matrix based on `@param entity`.matrixWorld and relative to `@param relativeEntity`.matrixWorld', () => {
      const Difference = 42
      const Base = new Vector3(1, 1, 1)
      const Absolute = Base.clone().addScalar(Difference)
      const Relative = Absolute.clone().sub(Base)
      const Expected = new Matrix4().compose(Relative, new Quaternion(), new Vector3(1, 1, 1))
      // Set the data as expected
      const testEntity = createEntity()
      const relativeEntity = createEntity()
      setComponent(testEntity, TransformComponent, { position: Absolute })
      setComponent(relativeEntity, TransformComponent, { position: Base })
      // Run and Check the result
      const result = TransformComponent.getMatrixRelativeToEntity(testEntity, relativeEntity, new Matrix4())
      assertArrayEqual(result.elements, Expected.elements)
    })
  }) //:: getMatrixRelativeToEntity

  describe('getMatrixRelativeToScene', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransformComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should copy `@param entity`.TransformComponent.matrixWorld into `@param outMatrix` when neither itself nor one of its ancestors have a SceneComponent', () => {
      const Position = new Vector3(42, 42, 42)
      const Expected = new Matrix4().compose(Position, new Quaternion(), new Vector3(1, 1, 1))
      // Sanity check before running
      assert.equal(getAncestorWithComponents(testEntity, [SceneComponent]), UndefinedEntity)
      // Set the data as expected
      const matrixWorld = getMutableComponent(testEntity, TransformComponent).matrixWorld.elements
      matrixWorld[12].set(Position.x)
      matrixWorld[13].set(Position.y)
      matrixWorld[14].set(Position.z)
      // Run and Check the result
      const result = new Matrix4()
      TransformComponent.getMatrixRelativeToScene(testEntity, result)
      assertArrayEqual(result.elements, Expected.elements)
    })

    it('should return `@param entity`.TransformComponent.matrixWorld when neither itself nor one of its ancestors have a SceneComponent', () => {
      const Position = new Vector3(42, 42, 42)
      const Expected = new Matrix4().compose(Position, new Quaternion(), new Vector3(1, 1, 1))
      // Sanity check before running
      assert.equal(getAncestorWithComponents(testEntity, [SceneComponent]), UndefinedEntity)
      // Set the data as expected
      const matrixWorld = getMutableComponent(testEntity, TransformComponent).matrixWorld.elements
      matrixWorld[12].set(Position.x)
      matrixWorld[13].set(Position.y)
      matrixWorld[14].set(Position.z)
      // Run and Check the result
      const result = TransformComponent.getMatrixRelativeToScene(testEntity, new Matrix4())
      assertArrayEqual(result.elements, Expected.elements)
    })

    it('should write a matrix into `@param outMatrix` based on `@param entity`.matrixWorld and relative to the closest parent of `@param entity` that has a SceneComponent', () => {
      const Difference = 42
      const Base = new Vector3(1, 1, 1)
      const Absolute = Base.clone().addScalar(Difference)
      const Relative = Absolute.clone().sub(Base)
      const Expected = new Matrix4().compose(Relative, new Quaternion(), new Vector3(1, 1, 1))
      // Set the data as expected
      const sceneEntity = createEntity()
      setComponent(sceneEntity, TransformComponent, { position: Base })
      setComponent(sceneEntity, SceneComponent)
      const parentEntity = createEntity()
      setComponent(parentEntity, EntityTreeComponent, { parentEntity: sceneEntity })
      setComponent(parentEntity, TransformComponent, { position: Vector3_One.clone().negate() })
      const testEntity = createEntity()
      setComponent(testEntity, EntityTreeComponent, { parentEntity: parentEntity })
      setComponent(testEntity, TransformComponent, { position: Absolute })
      // Sanity check before running
      const ancestor = getAncestorWithComponents(testEntity, [SceneComponent])
      assert.notEqual(ancestor, UndefinedEntity)
      assert.equal(ancestor, sceneEntity)
      // Run and Check the result
      const result = new Matrix4()
      TransformComponent.getMatrixRelativeToScene(testEntity, result)
      assertArrayEqual(result.elements, Expected.elements)
    })

    it('should return a new matrix based on `@param entity`.matrixWorld and relative to the closest parent of `@param entity` that has a SceneComponent', () => {
      const Difference = 42
      const Base = new Vector3(1, 1, 1)
      const Absolute = Base.clone().addScalar(Difference)
      const Relative = Absolute.clone().sub(Base)
      const Expected = new Matrix4().compose(Relative, new Quaternion(), new Vector3(1, 1, 1))
      // Set the data as expected
      const sceneEntity = createEntity()
      setComponent(sceneEntity, TransformComponent, { position: Base })
      setComponent(sceneEntity, SceneComponent)
      const parentEntity = createEntity()
      setComponent(parentEntity, EntityTreeComponent, { parentEntity: sceneEntity })
      setComponent(parentEntity, TransformComponent, { position: Vector3_One.clone().negate() })
      const testEntity = createEntity()
      setComponent(testEntity, EntityTreeComponent, { parentEntity: parentEntity })
      setComponent(testEntity, TransformComponent, { position: Absolute })
      // Sanity check before running
      const ancestor = getAncestorWithComponents(testEntity, [SceneComponent])
      assert.notEqual(ancestor, UndefinedEntity)
      assert.equal(ancestor, sceneEntity)
      // Run and Check the result
      const result = TransformComponent.getMatrixRelativeToScene(testEntity, new Matrix4())
      assertArrayEqual(result.elements, Expected.elements)
    })

    /**
    // @todo When the tree update bug is fixed.
    it("should force-update the matrices of all entities in the EntityTree parent/child chain between `@param entity` and relativeEntity", () => {})
    */
  }) //:: getMatrixRelativeToScene

  describe('getWorldRotation', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransformComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should decompose the rotation from `@param entity`.TransformComponent.matrixWorld and return it', () => {
      const Expected = new Quaternion(1, 2, 3, 4).normalize()
      // Set the data as expected
      const matrixWorld = getMutableComponent(testEntity, TransformComponent).matrixWorld
      matrixWorld.value.decompose(_position, _rotation, _scale).compose(_position, Expected, _scale)
      // Sanity check before running
      assert.equal(hasComponent(testEntity, TransformComponent), true)
      // Run and Check the result
      const result = TransformComponent.getWorldRotation(testEntity, new Quaternion())
      assertVecApproxEq(result, Expected, 4)
    })

    it('should decompose the rotation from `@param entity`.TransformComponent.matrixWorld and write it into `@param quaternion`', () => {
      const Expected = new Quaternion(1, 2, 3, 4).normalize()
      // Set the data as expected
      const matrixWorld = getMutableComponent(testEntity, TransformComponent).matrixWorld
      matrixWorld.value.decompose(_position, _rotation, _scale).compose(_position, Expected, _scale)
      // Sanity check before running
      assert.equal(hasComponent(testEntity, TransformComponent), true)
      // Run and Check the result
      const result = new Quaternion()
      TransformComponent.getWorldRotation(testEntity, result)
      assertVecApproxEq(result, Expected, 4)
    })
  }) //:: getWorldRotation

  describe('getWorldScale', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransformComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should decompose the scale from `@param entity`.TransformComponent.matrixWorld and return it', () => {
      const Expected = new Vector3(41, 42, 43)
      // Set the data as expected
      const matrixWorld = getMutableComponent(testEntity, TransformComponent).matrixWorld
      matrixWorld.value.decompose(_position, _rotation, _scale).compose(_position, _rotation, Expected)
      // Sanity check before running
      assert.equal(hasComponent(testEntity, TransformComponent), true)
      // Run and Check the result
      const result = TransformComponent.getWorldScale(testEntity, new Vector3())
      assertVecApproxEq(result, Expected, 3)
    })

    it('should decompose the scale from `@param entity`.TransformComponent.matrixWorld and write it into `@param vec3`', () => {
      const Expected = new Vector3(41, 42, 43)
      // Set the data as expected
      const matrixWorld = getMutableComponent(testEntity, TransformComponent).matrixWorld
      matrixWorld.value.decompose(_position, _rotation, _scale).compose(_position, _rotation, Expected)
      // Sanity check before running
      assert.equal(hasComponent(testEntity, TransformComponent), true)
      // Run and Check the result
      const result = new Vector3()
      TransformComponent.getWorldScale(testEntity, result)
      assertVecApproxEq(result, Expected, 3)
    })
  }) //:: getWorldScale

  describe('getSceneScale', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransformComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should write a (1,1,1) vector into `@param vec3` when none of the ancestors of `@param entity` have a SceneComponent', () => {
      const Expected = new Vector3(1, 1, 1)
      const Initial = Vector3_Zero.clone().addScalar(1234)
      // Sanity check before running
      assert.equal(hasComponent(testEntity, TransformComponent), true)
      setComponent(testEntity, TransformComponent, { scale: Initial })
      const ancestor = getAncestorWithComponents(testEntity, [SceneComponent])
      assert.equal(ancestor, UndefinedEntity)
      // Run and Check the result
      const result = new Vector3()
      TransformComponent.getSceneScale(testEntity, result)
      assertVecAnyApproxNotEq(result, Initial, 3)
      assertVecApproxEq(result, Expected, 3)
    })

    it('should return a (1,1,1) vector when none of the ancestors of `@param entity` have a SceneComponent', () => {
      const Expected = new Vector3(1, 1, 1)
      const Initial = Vector3_Zero.clone().addScalar(1234)
      // Set the data as expected
      setComponent(testEntity, TransformComponent, { scale: Initial })
      // Sanity check before running
      assert.equal(hasComponent(testEntity, TransformComponent), true)
      const ancestor = getAncestorWithComponents(testEntity, [SceneComponent])
      assert.equal(ancestor, UndefinedEntity)
      // Run and Check the result
      const result = TransformComponent.getSceneScale(testEntity, new Vector3())
      assertVecAnyApproxNotEq(result, Initial, 3)
      assertVecApproxEq(result, Expected, 3)
    })

    it('should write into `@param vec3` the scale extracted from the `@param entity`.TransformComponent.matrixWorld relative to its closest ancestor that has a SceneComponent', () => {
      const scale = 0.02380952380952381 // Expected scale value for each axis
      const Expected = new Vector3(scale, scale, scale)
      const Initial = new Vector3(42, 42, 42)
      // Set the data as expected
      const parentEntity = createEntity()
      setComponent(parentEntity, SceneComponent)
      setComponent(parentEntity, TransformComponent, { scale: Initial })
      setComponent(testEntity, EntityTreeComponent, { parentEntity: parentEntity })
      setComponent(testEntity, TransformComponent)
      // Sanity check before running
      assert.equal(hasComponent(testEntity, TransformComponent), true)
      assert.equal(hasComponent(parentEntity, SceneComponent), true)
      const ancestor = getAncestorWithComponents(testEntity, [SceneComponent])
      assert.notEqual(ancestor, UndefinedEntity)
      assert.equal(ancestor, parentEntity)
      // Run and Check the result
      const result = new Vector3()
      TransformComponent.getSceneScale(testEntity, result)
      assertVecAnyApproxNotEq(result, Initial, 3)
      assertVecApproxEq(result, Expected, 3)
    })

    it('should return the scale extracted from the `@param entity`.TransformComponent.matrixWorld relative to its closest ancestor that has a SceneComponent', () => {
      const scale = 0.02380952380952381 // Expected scale value for each axis
      const Expected = new Vector3(scale, scale, scale)
      const Initial = new Vector3(42, 42, 42)
      // Set the data as expected
      const parentEntity = createEntity()
      setComponent(parentEntity, SceneComponent)
      setComponent(parentEntity, TransformComponent, { scale: Initial })
      setComponent(testEntity, EntityTreeComponent, { parentEntity: parentEntity })
      setComponent(testEntity, TransformComponent)
      // Sanity check before running
      assert.equal(hasComponent(testEntity, TransformComponent), true)
      assert.equal(hasComponent(parentEntity, SceneComponent), true)
      const ancestor = getAncestorWithComponents(testEntity, [SceneComponent])
      assert.notEqual(ancestor, UndefinedEntity)
      assert.equal(ancestor, parentEntity)
      // Run and Check the result
      const result = TransformComponent.getSceneScale(testEntity, new Vector3())
      assertVecAnyApproxNotEq(result, Initial, 3)
      assertVecApproxEq(result, Expected, 3)
    })
  }) //:: getSceneScale

  describe('updateFromWorldMatrix', () => {
    let parentEntity = UndefinedEntity
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      parentEntity = createEntity()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      removeEntity(parentEntity)
      return destroyEngine()
    })

    it('should mark TransformComponent.dirtyTransforms for `@param entity` as true', () => {
      const Expected = true
      // Set the data as expected
      setComponent(parentEntity, SceneComponent)
      setComponent(parentEntity, TransformComponent)
      setComponent(testEntity, EntityTreeComponent, { parentEntity: parentEntity })
      setComponent(testEntity, TransformComponent)
      // Sanity check before running
      assert.equal(hasComponent(testEntity, TransformComponent), true)
      assert.equal(hasComponent(testEntity, EntityTreeComponent), true)
      assert.equal(getComponent(testEntity, EntityTreeComponent).parentEntity, parentEntity)
      // Run and Check the result
      TransformComponent.updateFromWorldMatrix(testEntity)
      const result = TransformComponent.dirtyTransforms[testEntity]
      assert.equal(result, Expected)
    })

    it('should set the TransformComponent.matrixWorld of `@param entity` to be its transform relative to its parent when the entity has a parent', () => {
      const Expected = new Matrix4().compose(
        new Vector3(42, 43, 44),
        new Quaternion(1, 2, 3, 4).normalize(),
        new Vector3(21, 21, 21)
      )
      // Set the data as expected
      setComponent(parentEntity, SceneComponent)
      setComponent(parentEntity, TransformComponent)
      setComponent(testEntity, EntityTreeComponent, { parentEntity: parentEntity })
      setComponent(testEntity, TransformComponent)
      getMutableComponent(testEntity, TransformComponent).matrixWorld.set(Expected)
      // Sanity check before running
      assert.equal(hasComponent(testEntity, TransformComponent), true)
      assert.equal(hasComponent(testEntity, EntityTreeComponent), true)
      assert.equal(getComponent(testEntity, EntityTreeComponent).parentEntity, parentEntity)
      // Run and Check the result
      TransformComponent.updateFromWorldMatrix(testEntity)
      const result = getComponent(testEntity, TransformComponent)
      assertArrayEqual(result.matrix.elements, Expected.elements)
      assertArrayEqual(result.matrix.elements, result.matrixWorld.elements)
    })

    it('should copy the TransformComponent.matrixWorld of `@param entity` into its TransformComponent.matrix when the entity has no parent', () => {
      const Expected = new Matrix4().compose(
        new Vector3(42, 43, 44),
        new Quaternion(1, 2, 3, 4).normalize(),
        new Vector3(21, 21, 21)
      )
      // Set the data as expected
      setComponent(testEntity, TransformComponent)
      getMutableComponent(testEntity, TransformComponent).matrixWorld.set(Expected)
      // Sanity check before running
      assert.equal(hasComponent(testEntity, TransformComponent), true)
      assert.equal(hasComponent(testEntity, EntityTreeComponent), false)
      // Run and Check the result
      TransformComponent.updateFromWorldMatrix(testEntity)
      const result = getComponent(testEntity, TransformComponent)
      assertArrayEqual(result.matrix.elements, Expected.elements)
      assertArrayEqual(result.matrix.elements, result.matrixWorld.elements)
    })
  }) //:: updateFromWorldMatrix

  describe('setWorldPosition', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should set the `@param entity`.TransformComponent.matrixWorld[12,13,14] elements to the values of `@param position`.(x,y,z)', () => {
      const Expected = new Vector3(42, 43, 44)
      // Set the data as expected
      setComponent(testEntity, TransformComponent)
      // Sanity check before running
      assert.equal(hasComponent(testEntity, TransformComponent), true)
      const before = getComponent(testEntity, TransformComponent).matrixWorld.clone().elements
      assertFloatApproxNotEq(before[12], Expected.x)
      assertFloatApproxNotEq(before[13], Expected.y)
      assertFloatApproxNotEq(before[14], Expected.z)
      // Run and Check the result
      TransformComponent.setWorldPosition(testEntity, Expected)
      const result = getComponent(testEntity, TransformComponent).matrixWorld.elements
      assertFloatApproxEq(result[12], Expected.x)
      assertFloatApproxEq(result[13], Expected.y)
      assertFloatApproxEq(result[14], Expected.z)
    })
  }) //:: setWorldPosition

  describe('setWorldRotation', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should set the rotation values of `@param entity`.TransformComponent.matrixWorld to the values of `@param quaternion`', () => {
      const Expected = new Quaternion(42, 43, 44, 45).normalize()
      // Set the data as expected
      setComponent(testEntity, TransformComponent)
      // Sanity check before running
      assert.equal(hasComponent(testEntity, TransformComponent), true)
      const before = {
        position: new Vector3(),
        rotation: new Quaternion(),
        scale: new Vector3()
      }
      getComponent(testEntity, TransformComponent).matrixWorld.decompose(before.position, before.rotation, before.scale)
      assertVecAnyApproxNotEq(before.rotation, Expected, 4)
      // Run and Check the result
      TransformComponent.setWorldRotation(testEntity, Expected)
      const result = {
        position: new Vector3(),
        rotation: new Quaternion(),
        scale: new Vector3()
      }
      getComponent(testEntity, TransformComponent).matrixWorld.decompose(result.position, result.rotation, result.scale)
      assertVecApproxEq(result.rotation, Expected, 4)
    })
  }) //:: setWorldRotation

  describe('setWorldScale', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should set the scale values of `@param entity`.TransformComponent.matrixWorld to the values of `@param scale`', () => {
      const Expected = new Vector3(42, 43, 44)
      // Set the data as expected
      setComponent(testEntity, TransformComponent)
      // Sanity check before running
      assert.equal(hasComponent(testEntity, TransformComponent), true)
      const before = {
        position: new Vector3(),
        rotation: new Quaternion(),
        scale: new Vector3()
      }
      getComponent(testEntity, TransformComponent).matrixWorld.decompose(before.position, before.rotation, before.scale)
      assertVecAnyApproxNotEq(before.scale, Expected, 4)
      // Run and Check the result
      TransformComponent.setWorldScale(testEntity, Expected)
      const result = {
        position: new Vector3(),
        rotation: new Quaternion(),
        scale: new Vector3()
      }
      getComponent(testEntity, TransformComponent).matrixWorld.decompose(result.position, result.rotation, result.scale)
      assertVecApproxEq(result.scale, Expected, 4)
    })
  }) //:: setWorldScale

  describe('forward', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should copy into `@param outVector` the `@param entity`.TransformComponent.matrixWorld[8,9,10] elements as a normalized Vector3', () => {
      const Expected = new Vector3(0, -0.7191960944793238, 0.6948071514353372)
      const rotation = new Quaternion().identity().setFromAxisAngle(Axis.X, 42 / PI)
      // Set the data as expected
      setComponent(testEntity, TransformComponent, { rotation: rotation })
      // Sanity check before running
      assert.equal(hasComponent(testEntity, TransformComponent), true)
      // Run and Check the result
      const result = new Vector3()
      TransformComponent.forward(testEntity, result)
      assert.equal(result.x <= 1 && result.x >= -1, true)
      assert.equal(result.y <= 1 && result.y >= -1, true)
      assert.equal(result.z <= 1 && result.z >= -1, true)
      assertVecApproxEq(result, Expected, 3)
    })

    it('should return the `@param entity`.TransformComponent.matrixWorld[8,9,10] elements as a normalized Vector3', () => {
      const Expected = new Vector3(0, -0.7191960944793238, 0.6948071514353372)
      const rotation = new Quaternion().identity().setFromAxisAngle(Axis.X, 42 / PI)
      // Set the data as expected
      setComponent(testEntity, TransformComponent, { rotation: rotation })
      // Sanity check before running
      assert.equal(hasComponent(testEntity, TransformComponent), true)
      // Run and Check the result
      const result = TransformComponent.forward(testEntity, new Vector3())
      assert.equal(result.x <= 1 && result.x >= -1, true)
      assert.equal(result.y <= 1 && result.y >= -1, true)
      assert.equal(result.z <= 1 && result.z >= -1, true)
      assertVecApproxEq(result, Expected, 3)
    })
  }) //:: forward

  describe('back', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should copy into `@param outVector` the `@param entity`.TransformComponent.matrixWorld[8,9,10] elements as a negated and normalized Vector3', () => {
      const Expected = new Vector3(0, -0.7191960944793238, 0.6948071514353372).negate()
      const rotation = new Quaternion().identity().setFromAxisAngle(Axis.X, 42 / PI)
      // Set the data as expected
      setComponent(testEntity, TransformComponent, { rotation: rotation })
      // Sanity check before running
      assert.equal(hasComponent(testEntity, TransformComponent), true)
      // Run and Check the result
      const result = new Vector3()
      TransformComponent.back(testEntity, result)
      assert.equal(result.x <= 1 && result.x >= -1, true)
      assert.equal(result.y <= 1 && result.y >= -1, true)
      assert.equal(result.z <= 1 && result.z >= -1, true)
      assertVecApproxEq(result, Expected, 3)
    })

    it('should return the `@param entity`.TransformComponent.matrixWorld[8,9,10] elements as a negated and normalized Vector3', () => {
      const Expected = new Vector3(0, -0.7191960944793238, 0.6948071514353372).negate()
      const rotation = new Quaternion().identity().setFromAxisAngle(Axis.X, 42 / PI)
      // Set the data as expected
      setComponent(testEntity, TransformComponent, { rotation: rotation })
      // Sanity check before running
      assert.equal(hasComponent(testEntity, TransformComponent), true)
      // Run and Check the result
      const result = TransformComponent.back(testEntity, new Vector3())
      assert.equal(result.x <= 1 && result.x >= -1, true)
      assert.equal(result.y <= 1 && result.y >= -1, true)
      assert.equal(result.z <= 1 && result.z >= -1, true)
      assertVecApproxEq(result, Expected, 3)
    })
  }) //:: back

  describe('up', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should copy into `@param outVector` the `@param entity`.TransformComponent.matrixWorld[4,5,6] elements as a normalized Vector3', () => {
      const Expected = new Vector3(0, 0.6948071514353372, 0.7191960944793238)
      const rotation = new Quaternion().identity().setFromAxisAngle(Axis.X, 42 / PI)
      // Set the data as expected
      setComponent(testEntity, TransformComponent, { rotation: rotation })
      // Sanity check before running
      assert.equal(hasComponent(testEntity, TransformComponent), true)
      // Run and Check the result
      const result = new Vector3()
      TransformComponent.up(testEntity, result)
      assert.equal(result.x <= 1 && result.x >= -1, true)
      assert.equal(result.y <= 1 && result.y >= -1, true)
      assert.equal(result.z <= 1 && result.z >= -1, true)
      assertVecApproxEq(result, Expected, 3)
    })

    it('should return the `@param entity`.TransformComponent.matrixWorld[4,5,6] elements as a normalized Vector3', () => {
      const Expected = new Vector3(0, 0.6948071514353372, 0.7191960944793238)
      const rotation = new Quaternion().identity().setFromAxisAngle(Axis.X, 42 / PI)
      // Set the data as expected
      setComponent(testEntity, TransformComponent, { rotation: rotation })
      // Sanity check before running
      assert.equal(hasComponent(testEntity, TransformComponent), true)
      // Run and Check the result
      const result = TransformComponent.up(testEntity, new Vector3())
      assert.equal(result.x <= 1 && result.x >= -1, true)
      assert.equal(result.y <= 1 && result.y >= -1, true)
      assert.equal(result.z <= 1 && result.z >= -1, true)
      assertVecApproxEq(result, Expected, 3)
    })
  }) //:: up

  describe('down', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should copy into `@param outVector` the `@param entity`.TransformComponent.matrixWorld[4,5,6] elements as a negated and normalized Vector3', () => {
      const Expected = new Vector3(0, 0.6948071514353372, 0.7191960944793238).negate()
      const rotation = new Quaternion().identity().setFromAxisAngle(Axis.X, 42 / PI)
      // Set the data as expected
      setComponent(testEntity, TransformComponent, { rotation: rotation })
      // Sanity check before running
      assert.equal(hasComponent(testEntity, TransformComponent), true)
      // Run and Check the result
      const result = new Vector3()
      TransformComponent.down(testEntity, result)
      assert.equal(result.x <= 1 && result.x >= -1, true)
      assert.equal(result.y <= 1 && result.y >= -1, true)
      assert.equal(result.z <= 1 && result.z >= -1, true)
      assertVecApproxEq(result, Expected, 3)
    })

    it('should return the `@param entity`.TransformComponent.matrixWorld[4,5,6] elements as a negated and normalized Vector3', () => {
      const Expected = new Vector3(0, 0.6948071514353372, 0.7191960944793238).negate()
      const rotation = new Quaternion().identity().setFromAxisAngle(Axis.X, 42 / PI)
      // Set the data as expected
      setComponent(testEntity, TransformComponent, { rotation: rotation })
      // Sanity check before running
      assert.equal(hasComponent(testEntity, TransformComponent), true)
      // Run and Check the result
      const result = TransformComponent.down(testEntity, new Vector3())
      assert.equal(result.x <= 1 && result.x >= -1, true)
      assert.equal(result.y <= 1 && result.y >= -1, true)
      assert.equal(result.z <= 1 && result.z >= -1, true)
      assertVecApproxEq(result, Expected, 3)
    })
  }) //:: down

  describe('right', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should copy into `@param outVector` the `@param entity`.TransformComponent.matrixWorld[0,1,2] elements as a normalized Vector3', () => {
      const Expected = new Vector3(0.6948071514353372, 0, -0.7191960944793238)
      const rotation = new Quaternion().identity().setFromAxisAngle(Axis.Y, 42 / PI)
      // Set the data as expected
      setComponent(testEntity, TransformComponent, { rotation: rotation })
      // Sanity check before running
      assert.equal(hasComponent(testEntity, TransformComponent), true)
      // Run and Check the result
      const result = new Vector3()
      TransformComponent.right(testEntity, result)
      assert.equal(result.x <= 1 && result.x >= -1, true)
      assert.equal(result.y <= 1 && result.y >= -1, true)
      assert.equal(result.z <= 1 && result.z >= -1, true)
      assertVecApproxEq(result, Expected, 3)
    })

    it('should return the `@param entity`.TransformComponent.matrixWorld[0,1,2] elements as a normalized Vector3', () => {
      const Expected = new Vector3(0.6948071514353372, 0, -0.7191960944793238)
      const rotation = new Quaternion().identity().setFromAxisAngle(Axis.Y, 42 / PI)
      // Set the data as expected
      setComponent(testEntity, TransformComponent, { rotation: rotation })
      // Sanity check before running
      assert.equal(hasComponent(testEntity, TransformComponent), true)
      // Run and Check the result
      const result = TransformComponent.right(testEntity, new Vector3())
      assert.equal(result.x <= 1 && result.x >= -1, true)
      assert.equal(result.y <= 1 && result.y >= -1, true)
      assert.equal(result.z <= 1 && result.z >= -1, true)
      assertVecApproxEq(result, Expected, 3)
    })
  }) //:: right

  describe('left', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should copy into `@param outVector` the `@param entity`.TransformComponent.matrixWorld[0,1,2] elements as a negated and normalized Vector3', () => {
      const Expected = new Vector3(0.6948071514353372, 0, -0.7191960944793238).negate()
      const rotation = new Quaternion().identity().setFromAxisAngle(Axis.Y, 42 / PI)
      // Set the data as expected
      setComponent(testEntity, TransformComponent, { rotation: rotation })
      // Sanity check before running
      assert.equal(hasComponent(testEntity, TransformComponent), true)
      // Run and Check the result
      const result = new Vector3()
      TransformComponent.left(testEntity, result)
      assert.equal(result.x <= 1 && result.x >= -1, true)
      assert.equal(result.y <= 1 && result.y >= -1, true)
      assert.equal(result.z <= 1 && result.z >= -1, true)
      assertVecApproxEq(result, Expected, 3)
    })

    it('should return the `@param entity`.TransformComponent.matrixWorld[0,1,2] elements as a negated and normalized Vector3', () => {
      const Expected = new Vector3(0.6948071514353372, 0, -0.7191960944793238).negate()
      const rotation = new Quaternion().identity().setFromAxisAngle(Axis.Y, 42 / PI)
      // Set the data as expected
      setComponent(testEntity, TransformComponent, { rotation: rotation })
      // Sanity check before running
      assert.equal(hasComponent(testEntity, TransformComponent), true)
      // Run and Check the result
      const result = TransformComponent.left(testEntity, new Vector3())
      assert.equal(result.x <= 1 && result.x >= -1, true)
      assert.equal(result.y <= 1 && result.y >= -1, true)
      assert.equal(result.z <= 1 && result.z >= -1, true)
      assertVecApproxEq(result, Expected, 3)
    })
  }) //:: left

  describe('transformsNeedSorting', () => {
    beforeEach(async () => {
      createEngine()
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should start with the expected default value', () => {
      // Required because running other tests will override this value.
      // Unnecesary when running this test with `.only`
      SystemDefinitions.get(TransformDirtyUpdateSystem)?.execute()

      const Expected = false
      const result = TransformComponent.transformsNeedSorting
      assert.equal(result, Expected)
    })
  }) //:: transformsNeedSorting

  describe('General Purpose', () => {
    beforeEach(async () => {
      createEngine()
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should create a valid TransformComponent', () => {
      const entity = createEntity()

      setComponent(entity, TransformComponent)
      const transformComponent = getComponent(entity, TransformComponent)
      assert.equal(TransformComponent.dirtyTransforms[entity], true)
      transformComponent.position.x = 12
      assert.equal(transformComponent.position.x, TransformComponent.position.x[entity])
    })
  }) //:: General Purpose
}) //:: TransformComponent

describe('composeMatrix', () => {
  let testEntity = UndefinedEntity

  beforeEach(async () => {
    createEngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    removeEntity(testEntity)
    return destroyEngine()
  })

  it('should have the same behavior as Matrix4.compose', () => {
    const Expected = {
      position: new Vector3(1, 2, 3),
      rotation: new Quaternion(4, 5, 6, 7).normalize(),
      scale: new Vector3(9, 10, 11),
      matrix: new Matrix4()
    }
    Expected.matrix = new Matrix4().compose(Expected.position, Expected.rotation, Expected.scale)
    // Set the data as expected
    setComponent(testEntity, TransformComponent)
    TransformComponent.position.x[testEntity] = Expected.position.x
    TransformComponent.position.y[testEntity] = Expected.position.y
    TransformComponent.position.z[testEntity] = Expected.position.z
    TransformComponent.rotation.x[testEntity] = Expected.rotation.x
    TransformComponent.rotation.y[testEntity] = Expected.rotation.y
    TransformComponent.rotation.z[testEntity] = Expected.rotation.z
    TransformComponent.rotation.w[testEntity] = Expected.rotation.w
    TransformComponent.scale.x[testEntity] = Expected.scale.x
    TransformComponent.scale.y[testEntity] = Expected.scale.y
    TransformComponent.scale.z[testEntity] = Expected.scale.z
    // Sanity check before running
    assert.equal(hasComponent(testEntity, TransformComponent), true)
    // Run and Check the result
    composeMatrix(testEntity)
    const result = {
      position: getComponent(testEntity, TransformComponent).position.clone(),
      rotation: getComponent(testEntity, TransformComponent).rotation.clone(),
      scale: getComponent(testEntity, TransformComponent).scale.clone(),
      matrix: new Matrix4()
    }
    result.matrix = new Matrix4().compose(result.position, result.rotation, result.scale)
    assertArrayEqual(result.matrix.elements, Expected.matrix.elements)
  })
}) //:: composeMatrix

describe('decomposeMatrix', () => {
  let testEntity = UndefinedEntity

  beforeEach(async () => {
    createEngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    removeEntity(testEntity)
    return destroyEngine()
  })

  it('should have the same behavior as Matrix4.decompose', () => {
    const Expected = {
      position: new Vector3(1, 2, 3),
      rotation: new Quaternion(4, 5, 6, 7).normalize(),
      scale: new Vector3(9, 10, 11)
    }
    // Set the data as expected
    setComponent(testEntity, TransformComponent, {
      position: Expected.position,
      rotation: Expected.rotation,
      scale: Expected.scale
    })
    // Sanity check before running
    assert.equal(hasComponent(testEntity, TransformComponent), true)
    // Run and Check the result
    decomposeMatrix(testEntity)
    const result = {
      position: new Vector3(),
      rotation: new Quaternion(),
      scale: new Vector3(1, 1, 1)
    }
    getComponent(testEntity, TransformComponent).matrix.decompose(result.position, result.rotation, result.scale)
    assertFloatApproxEq(TransformComponent.position.x[testEntity], Expected.position.x)
    assertFloatApproxEq(TransformComponent.position.y[testEntity], Expected.position.y)
    assertFloatApproxEq(TransformComponent.position.z[testEntity], Expected.position.z)
    assertFloatApproxEq(TransformComponent.rotation.x[testEntity], Expected.rotation.x)
    assertFloatApproxEq(TransformComponent.rotation.y[testEntity], Expected.rotation.y)
    assertFloatApproxEq(TransformComponent.rotation.z[testEntity], Expected.rotation.z)
    assertFloatApproxEq(TransformComponent.rotation.w[testEntity], Expected.rotation.w)
    assertFloatApproxEq(TransformComponent.scale.x[testEntity], Expected.scale.x)
    assertFloatApproxEq(TransformComponent.scale.y[testEntity], Expected.scale.y)
    assertFloatApproxEq(TransformComponent.scale.z[testEntity], Expected.scale.z)
  })
}) //:: decomposeMatrix

describe('setFromRotationMatrix', () => {
  let testEntity = UndefinedEntity

  beforeEach(async () => {
    createEngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    removeEntity(testEntity)
    return destroyEngine()
  })

  it('should set the TransformComponent.rotation.(x,y,z,w) for `@param entity` based on the 3x3 rotation matrix contained in `@param m`', () => {
    const Expected = new Quaternion(4, 5, 6, 7).normalize()
    // Set the data as expected
    setComponent(testEntity, TransformComponent)
    // Sanity check before running
    assert.equal(hasComponent(testEntity, TransformComponent), true)
    // Run and Check the result
    setFromRotationMatrix(testEntity, new Matrix4().makeRotationFromQuaternion(Expected))
    assertFloatApproxEq(TransformComponent.rotation.x[testEntity], Expected.x)
    assertFloatApproxEq(TransformComponent.rotation.y[testEntity], Expected.y)
    assertFloatApproxEq(TransformComponent.rotation.z[testEntity], Expected.z)
    assertFloatApproxEq(TransformComponent.rotation.w[testEntity], Expected.w)
  })
}) //:: setFromRotationMatrix

describe('TransformGizmoTagComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      assert.equal(TransformGizmoTagComponent.name, 'TransformGizmoTagComponent')
    })
  }) //:: Fields
}) //:: TransformGizmoTagComponent
