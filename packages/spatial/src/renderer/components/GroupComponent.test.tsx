/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023
Ethereal Engine. All Rights Reserved.
*/

import {
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  hasComponent,
  removeComponent,
  removeEntity,
  setComponent
} from '@etherealengine/ecs'
import assert from 'assert'
import sinon from 'sinon'
import { BoxGeometry, Layers, Mesh, Object3D, Quaternion, SphereGeometry, Vector3 } from 'three'
import { assertVecAllApproxNotEq, assertVecApproxEq } from '../../physics/classes/Physics.test'
import { assertArrayEqual } from '../../physics/components/RigidBodyComponent.test'
import { TransformComponent } from '../RendererModule'
import { GroupComponent, addObjectToGroup, removeGroupComponent, removeObjectFromGroup } from './GroupComponent'
import { Layer } from './ObjectLayerComponent'

const GroupComponentDefaults = [] as Object3D[]

function assertGroupComponentEq(A, B) {
  assertArrayEqual(A, B)
}

describe('GroupComponent', () => {
  describe('IDs', () => {
    it('should initialize the GroupComponent.name field with the expected value', () => {
      assert.equal(GroupComponent.name, 'GroupComponent')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, GroupComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, GroupComponent)
      assertGroupComponentEq(data, GroupComponentDefaults)
    })
  }) //:: onInit

  describe('onRemove', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, GroupComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should call the T.removeFromParent function for every object in the group that has a parent', () => {
      const spy1 = sinon.spy()
      const spy2 = sinon.spy()
      const meshParent = new Mesh(new BoxGeometry())
      const mesh1 = new Mesh(new BoxGeometry())
      const mesh2 = new Mesh(new SphereGeometry())
      mesh1.removeFromParent = spy1
      mesh2.removeFromParent = spy2
      mesh1.name = 'Mesh1'
      mesh2.name = 'Mesh2'
      mesh1.parent = meshParent
      mesh2.parent = meshParent
      addObjectToGroup(testEntity, mesh1)
      addObjectToGroup(testEntity, mesh2)
      assert.equal(spy1.called, false)
      assert.equal(spy2.called, false)
      // Run and Check the result
      removeComponent(testEntity, GroupComponent)
      assert.equal(spy1.called, true)
      assert.equal(spy2.called, true)
    })
  }) //:: onRemove

  describe('removeGroupComponent', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, GroupComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should call the T.removeFromParent function for every object in the group', () => {
      const spy1 = sinon.spy()
      const spy2 = sinon.spy()
      const mesh1 = new Mesh(new BoxGeometry())
      const mesh2 = new Mesh(new SphereGeometry())
      mesh1.removeFromParent = spy1
      mesh2.removeFromParent = spy2
      mesh1.name = 'Mesh1'
      mesh2.name = 'Mesh2'
      addObjectToGroup(testEntity, mesh1)
      addObjectToGroup(testEntity, mesh2)
      assert.equal(spy1.called, false)
      assert.equal(spy2.called, false)
      // Run and Check the result
      removeGroupComponent(testEntity)
      assert.equal(spy1.called, true)
      assert.equal(spy2.called, true)
    })

    it('should remove the GroupComponent from the entity', () => {
      assert.equal(hasComponent(testEntity, GroupComponent), true)
      // Run and Check the result
      removeGroupComponent(testEntity)
      assert.equal(hasComponent(testEntity, GroupComponent), false)
    })
  }) //:: removeGroupComponent

  describe('removeObjectFromGroup', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, GroupComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should call the T.removeFromParent function of the object if the object has a parent', () => {
      const spy = sinon.spy()
      const meshParent = new Mesh(new BoxGeometry())
      const mesh = new Mesh(new BoxGeometry())
      mesh.removeFromParent = spy
      mesh.name = 'Mesh1'
      mesh.parent = meshParent
      addObjectToGroup(testEntity, mesh)
      assert.equal(spy.called, false)
      // Run and Check the result
      removeObjectFromGroup(testEntity, mesh)
      assert.equal(spy.called, true)
    })

    it('should remove the `@param object` from the GroupComponent list if the entity has a GroupComponent that contains the `@param object`', () => {
      const mesh1 = new Mesh(new BoxGeometry())
      const mesh2 = new Mesh(new SphereGeometry())
      addObjectToGroup(testEntity, mesh1)
      addObjectToGroup(testEntity, mesh2)
      assert.equal(getComponent(testEntity, GroupComponent).includes(mesh2), true)
      // Run and Check the result
      removeObjectFromGroup(testEntity, mesh2)
      assert.equal(getComponent(testEntity, GroupComponent).includes(mesh2), false)
    })

    it('should remove the GroupComponent from the entity if the group has no objects left after removing the `@param object`', () => {
      const mesh = new Mesh(new BoxGeometry())
      addObjectToGroup(testEntity, mesh)
      assert.equal(getComponent(testEntity, GroupComponent).includes(mesh), true)
      // Run and Check the result
      removeObjectFromGroup(testEntity, mesh)
      assert.equal(hasComponent(testEntity, GroupComponent), false)
    })
  }) //:: removeObjectFromGroup

  describe('addObjectToGroup', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should add the object to the GroupComponent list of objects', () => {
      setComponent(testEntity, GroupComponent)
      const mesh = new Mesh(new BoxGeometry())
      assert.equal(getComponent(testEntity, GroupComponent).includes(mesh), false)
      addObjectToGroup(testEntity, mesh)
      assert.equal(getComponent(testEntity, GroupComponent).includes(mesh), true)
    })

    it("should add a GroupComponent to the entity if it doesn't already have one", () => {
      assert.equal(hasComponent(testEntity, GroupComponent), false)
      const mesh = new Mesh(new BoxGeometry())
      addObjectToGroup(testEntity, mesh)
      assert.equal(hasComponent(testEntity, GroupComponent), true)
    })

    it("should add a TransformComponent to the entity if it doesn't already have one", () => {
      assert.equal(hasComponent(testEntity, TransformComponent), false)
      const mesh = new Mesh(new BoxGeometry())
      addObjectToGroup(testEntity, mesh)
      assert.equal(hasComponent(testEntity, TransformComponent), true)
    })

    it('should set the entity property of the `@param object` to `@param entity`', () => {
      const mesh = new Mesh(new BoxGeometry())
      assert.notEqual(mesh.entity, testEntity)
      addObjectToGroup(testEntity, mesh)
      assert.equal(mesh.entity, testEntity)
    })

    it("should set the position value of the object to the value of the entity's TransformComponent.position", () => {
      const Expected = new Vector3(40, 41, 42)
      const mesh = new Mesh(new BoxGeometry())
      setComponent(testEntity, TransformComponent, { position: Expected })
      assertVecAllApproxNotEq(mesh.position, getComponent(testEntity, TransformComponent).position, 3)
      addObjectToGroup(testEntity, mesh)
      assertVecApproxEq(mesh.position, getComponent(testEntity, TransformComponent).position, 3)
    })

    it("should set the quaterion value of the object to the value of the entity's TransformComponent.rotation", () => {
      const Expected = new Quaternion(40, 41, 42, 43).normalize()
      const mesh = new Mesh(new BoxGeometry())
      setComponent(testEntity, TransformComponent, { rotation: Expected })
      assertVecAllApproxNotEq(mesh.quaternion, getComponent(testEntity, TransformComponent).rotation, 4)
      addObjectToGroup(testEntity, mesh)
      assertVecApproxEq(mesh.quaternion, getComponent(testEntity, TransformComponent).rotation, 4)
    })

    it("should set the scale value of the object to the value of the entity's TransformComponent.scale", () => {
      const Expected = new Vector3(40, 41, 42)
      const mesh = new Mesh(new BoxGeometry())
      setComponent(testEntity, TransformComponent, { scale: Expected })
      assertVecAllApproxNotEq(mesh.scale, getComponent(testEntity, TransformComponent).scale, 3)
      addObjectToGroup(testEntity, mesh)
      assertVecApproxEq(mesh.scale, getComponent(testEntity, TransformComponent).scale, 3)
    })

    it('should set the matrixAutoUpdate value of the object to false', () => {
      const mesh = new Mesh(new BoxGeometry())
      assert.equal(mesh.matrixAutoUpdate, true)
      addObjectToGroup(testEntity, mesh)
      assert.equal(mesh.matrixAutoUpdate, false)
    })

    it('should set the matrixWorldAutoUpdate value of the object to false', () => {
      const mesh = new Mesh(new BoxGeometry())
      assert.equal(mesh.matrixWorldAutoUpdate, true)
      addObjectToGroup(testEntity, mesh)
      assert.equal(mesh.matrixWorldAutoUpdate, false)
    })

    it('should set the frustumCulled value of the object to false', () => {
      const mesh = new Mesh(new BoxGeometry())
      assert.equal(mesh.frustumCulled, true)
      addObjectToGroup(testEntity, mesh)
      assert.equal(mesh.frustumCulled, false)
    })

    it('should set the layers value of the object to a new Layer whichs ID is the `@param entity`', () => {
      const mesh = new Mesh(new BoxGeometry())
      assert.equal(mesh.layers instanceof Layers, true)
      addObjectToGroup(testEntity, mesh)
      assert.equal(mesh.layers instanceof Layer, true)
      // @ts-ignore Typescript doesn't understand the ObjectLayer type override done by addObjectToGroup
      assert.equal(mesh.layers.entity, testEntity)
    })

    /**
    // @todo How to check that the values are correctly proxified?
    // it("should proxify the object.position property", () => {})
    // it("should proxify the object.quaternion property", () => {})
    // it("should proxify the object.scale property", () => {})
    */

    /**
    // @todo Why are these failing?
    it("should set the matrix value of the object to the value of the entity's TransformComponent.matrix", () => {
      const Expected = new Matrix4()
      for (let id = 0; id < 16; ++id) Expected.elements[id] = id*0.001
      const mesh = new Mesh(new BoxGeometry())
      setComponent(testEntity, TransformComponent, {matrix: Expected})
      assertMatrixAllApproxNotEq(mesh.matrix, Expected)
      addObjectToGroup(testEntity, mesh)
      assertMatrixApproxEq(mesh.matrix, Expected)
    })

    it("should set the matrixWorld value of the object to the value of the entity's TransformComponent.matrixWorld", () => {
      const Expected = new Matrix4()
      for (let id = 0; id < 16; ++id) Expected.elements[id] = id*0.001
      const mesh = new Mesh(new BoxGeometry())
      setComponent(testEntity, TransformComponent, {matrixWorld: Expected})
      assertMatrixAllApproxNotEq(mesh.matrixWorld, Expected)
      addObjectToGroup(testEntity, mesh)
      assertMatrixApproxEq(mesh.matrixWorld, Expected)
    })
    */

    /**
    // @todo Is this testable?
    it("should assign a void function that does nothing to the function property named `updateWorldMatrix` of the object", () => {
      const mesh = new Mesh(new BoxGeometry())
      // ...
      addObjectToGroup(testEntity, mesh)
      // ...
    })
    */
  }) //:: addObjectToGroup

  describe('GroupReactor', () => {}) //:: GroupReactor
  describe('GroupQueryReactor', () => {}) //:: GroupQueryReactor
})
