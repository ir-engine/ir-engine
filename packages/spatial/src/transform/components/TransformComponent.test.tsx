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
import { Matrix4, Quaternion, Vector3 } from 'three'
import { assertVecApproxEq } from '../../physics/classes/Physics.test'
import { assertArrayEqual } from '../../physics/components/RigidBodyComponent.test'
import { TransformComponent, TransformECS, TransformGizmoTagComponent } from './TransformComponent'

type TransformComponentData = {
  position: Vector3
  rotation: Quaternion
  scale: Vector3
  matrix: Matrix4
  matrixWorld: Matrix4
}

const TransformComponentDefaults: TransformComponentData = {
  position: new Vector3(),
  rotation: new Quaternion(0, 0, 0, 0),
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
        rotation: { x: 0, y: 0, z: 0, w: 0 },
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
  }) //:: getWorldPosition

  describe('getWorldRotation', () => {}) //:: getWorldRotation
  describe('getWorldScale', () => {}) //:: getWorldScale

  describe('getMatrixRelativeToEntity', () => {}) //:: getMatrixRelativeToEntity
  describe('getMatrixRelativeToScene', () => {}) //:: getMatrixRelativeToScene
  describe('getSceneScale', () => {}) //:: getSceneScale
  describe('updateFromWorldMatrix', () => {}) //:: updateFromWorldMatrix
  describe('setWorldPosition', () => {}) //:: setWorldPosition
  describe('setWorldRotation', () => {}) //:: setWorldRotation
  describe('setWorldScale', () => {}) //:: setWorldScale
  describe('forward', () => {}) //:: forward
  describe('back', () => {}) //:: back
  describe('up', () => {}) //:: up
  describe('down', () => {}) //:: down
  describe('right', () => {}) //:: right
  describe('left', () => {}) //:: left
  describe('transformsNeedSorting', () => {}) //:: transformsNeedSorting

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

describe('composeMatrix', () => {}) //:: composeMatrix
describe('decomposeMatrix', () => {}) //:: decomposeMatrix
describe('setFromRotationMatrix', () => {}) //:: setFromRotationMatrix

describe('TransformGizmoTagComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      assert.equal(TransformGizmoTagComponent.name, 'TransformGizmoTagComponent')
    })
  }) //:: Fields
}) //:: TransformGizmoTagComponent
