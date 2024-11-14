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
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import assert from 'assert'
import { BoxGeometry, Layers, Matrix4, Mesh, Quaternion, Vector3 } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { assertMatrix, assertVec } from '../../../tests/util/assert'
import { TransformComponent } from '../RendererModule'
import { ObjectComponent } from './ObjectComponent'
import { Layer } from './ObjectLayerComponent'

describe('ObjectComponent', () => {
  describe('IDs', () => {
    it('should initialize the ObjectComponent.name field with the expected value', () => {
      assert.equal(ObjectComponent.name, 'ObjectComponent')
    })
  }) //:: IDs

  describe('setComponent', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should add the object to the ObjectComponent', () => {
      const mesh = new Mesh(new BoxGeometry())
      assert.notEqual(getComponent(testEntity, ObjectComponent), mesh)
      setComponent(testEntity, ObjectComponent, mesh)
      assert.equal(getComponent(testEntity, ObjectComponent), mesh)
    })

    it("should add a ObjectComponent to the entity if it doesn't already have one", () => {
      assert.equal(hasComponent(testEntity, ObjectComponent), false)
      const mesh = new Mesh(new BoxGeometry())
      setComponent(testEntity, ObjectComponent, mesh)
      assert.equal(hasComponent(testEntity, ObjectComponent), true)
    })

    it("should add a TransformComponent to the entity if it doesn't already have one", () => {
      assert.equal(hasComponent(testEntity, TransformComponent), false)
      const mesh = new Mesh(new BoxGeometry())
      setComponent(testEntity, ObjectComponent, mesh)
      assert.equal(hasComponent(testEntity, TransformComponent), true)
    })

    it('should set the entity property of the `@param object` to `@param entity`', () => {
      const mesh = new Mesh(new BoxGeometry())
      assert.notEqual(mesh.entity, testEntity)
      setComponent(testEntity, ObjectComponent, mesh)
      assert.equal(mesh.entity, testEntity)
    })

    it("should set the position value of the object to the value of the entity's TransformComponent.position", () => {
      const Expected = new Vector3(40, 41, 42)
      const mesh = new Mesh(new BoxGeometry())
      setComponent(testEntity, TransformComponent, { position: Expected })
      assertVec.allApproxNotEq(mesh.position, getComponent(testEntity, TransformComponent).position, 3)
      setComponent(testEntity, ObjectComponent, mesh)
      assertVec.approxEq(mesh.position, getComponent(testEntity, TransformComponent).position, 3)
    })

    it("should set the quaterion value of the object to the value of the entity's TransformComponent.rotation", () => {
      const Expected = new Quaternion(40, 41, 42, 43).normalize()
      const mesh = new Mesh(new BoxGeometry())
      setComponent(testEntity, TransformComponent, { rotation: Expected })
      assertVec.allApproxNotEq(mesh.quaternion, getComponent(testEntity, TransformComponent).rotation, 4)
      setComponent(testEntity, ObjectComponent, mesh)
      assertVec.approxEq(mesh.quaternion, getComponent(testEntity, TransformComponent).rotation, 4)
    })

    it("should set the scale value of the object to the value of the entity's TransformComponent.scale", () => {
      const Expected = new Vector3(40, 41, 42)
      const mesh = new Mesh(new BoxGeometry())
      setComponent(testEntity, TransformComponent, { scale: Expected })
      assertVec.allApproxNotEq(mesh.scale, getComponent(testEntity, TransformComponent).scale, 3)
      setComponent(testEntity, ObjectComponent, mesh)
      assertVec.approxEq(mesh.scale, getComponent(testEntity, TransformComponent).scale, 3)
    })

    it('should set the matrixAutoUpdate value of the object to false', () => {
      const mesh = new Mesh(new BoxGeometry())
      assert.equal(mesh.matrixAutoUpdate, true)
      setComponent(testEntity, ObjectComponent, mesh)
      assert.equal(mesh.matrixAutoUpdate, false)
    })

    it('should set the matrixWorldAutoUpdate value of the object to false', () => {
      const mesh = new Mesh(new BoxGeometry())
      assert.equal(mesh.matrixWorldAutoUpdate, true)
      setComponent(testEntity, ObjectComponent, mesh)
      assert.equal(mesh.matrixWorldAutoUpdate, false)
    })

    it('should set the frustumCulled value of the object to false', () => {
      const mesh = new Mesh(new BoxGeometry())
      assert.equal(mesh.frustumCulled, true)
      setComponent(testEntity, ObjectComponent, mesh)
      assert.equal(mesh.frustumCulled, false)
    })

    it('should set the layers value of the object to a new Layer whichs ID is the `@param entity`', () => {
      const mesh = new Mesh(new BoxGeometry())
      assert.equal(mesh.layers instanceof Layers, true)
      setComponent(testEntity, ObjectComponent, mesh)
      assert.equal(mesh.layers instanceof Layer, true)
      // @ts-ignore Typescript doesn't understand the ObjectLayer type override done by addObjectToGroup
      assert.equal(mesh.layers.entity, testEntity)
    })

    it("should set the matrix value of the object to the value of the entity's TransformComponent.matrix", () => {
      const Expected = new Matrix4()
      for (let id = 0; id < 16; ++id) Expected.elements[id] = id * 0.001
      const position = new Vector3()
      const rotation = new Quaternion()
      const scale = new Vector3()
      Expected.decompose(position, rotation, scale)
      const mesh = new Mesh(new BoxGeometry())
      setComponent(testEntity, TransformComponent, { position: position, rotation: rotation, scale: scale })
      assertMatrix.allApproxNotEq(mesh.matrix, Expected)
      setComponent(testEntity, ObjectComponent, mesh)
      assertMatrix.approxEq(mesh.matrix, getComponent(testEntity, TransformComponent).matrix)
    })

    it("should set the matrixWorld value of the object to the value of the entity's TransformComponent.matrixWorld", () => {
      const Expected = new Matrix4()
      for (let id = 0; id < 16; ++id) Expected.elements[id] = id * 0.001
      const position = new Vector3()
      const rotation = new Quaternion()
      const scale = new Vector3()
      Expected.decompose(position, rotation, scale)
      const mesh = new Mesh(new BoxGeometry())
      setComponent(testEntity, TransformComponent, { position: position, rotation: rotation, scale: scale })
      assertMatrix.allApproxNotEq(mesh.matrixWorld, Expected)
      setComponent(testEntity, ObjectComponent, mesh)
      assertMatrix.approxEq(mesh.matrixWorld, getComponent(testEntity, TransformComponent).matrixWorld)
    })
  }) //:: addObjectToGroup
})
