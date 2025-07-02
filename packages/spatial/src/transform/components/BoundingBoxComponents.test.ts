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
  Entity,
  EntityTreeComponent,
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
import { Box3, BoxGeometry, Mesh, Vector3 } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { assertVec } from '../../../tests/util/assert'
import { MeshComponent } from '../../renderer/components/MeshComponent'
import { BoundingBoxComponent, BoundingBoxComponentFunctions, updateBoundingBox } from './BoundingBoxComponent'

function createEntityWithBoxAndParent(parent: Entity): Entity {
  const result = createEntity()
  setComponent(result, EntityTreeComponent, { parentEntity: parent })
  const mesh = new Mesh(new BoxGeometry(result + 1, result + 2, result + 3))
  mesh.geometry.computeBoundingBox()
  const box = mesh.geometry.boundingBox!.clone()
  mesh.geometry.boundingBox = null
  setComponent(result, BoundingBoxComponent, { box: box })
  setComponent(result, MeshComponent, mesh)
  return result
}

type BoundingBoxComponentData = {
  box: Box3
  helper: Entity
}

const BoundingBoxComponentDefaults: BoundingBoxComponentData = {
  box: new Box3(),
  helper: UndefinedEntity
}

function assertBoundingBoxComponentEq(A: BoundingBoxComponentData, B: BoundingBoxComponentData): void {
  assertVec.approxEq(A.box.max, B.box.max, 3)
  assertVec.approxEq(A.box.min, B.box.min, 3)
  assert.equal(A.helper, B.helper)
}

describe('BoundingBoxComponent', () => {
  describe('IDs', () => {
    it('should initialize the BoundingBoxComponent.name field with the expected value', () => {
      assert.equal(BoundingBoxComponent.name, 'BoundingBoxComponent')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, BoundingBoxComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, BoundingBoxComponent)
      assertBoundingBoxComponentEq(data, BoundingBoxComponentDefaults)
    })
  }) //:: onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, BoundingBoxComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should change the values of an initialized BoundingBoxComponent', () => {
      const before = getComponent(testEntity, BoundingBoxComponent)
      assertBoundingBoxComponentEq(before, BoundingBoxComponentDefaults)
      const Expected = {
        box: new Box3(new Vector3(1, 2, 3), new Vector3(4, 5, 6)),
        helper: createEntity()
      }
      setComponent(testEntity, BoundingBoxComponent, Expected)
      const after = getComponent(testEntity, BoundingBoxComponent)
      assertBoundingBoxComponentEq(after, Expected)
    })
  }) //:: onSet
}) //:: BoundingBoxComponent

describe('updateBoundingBox', () => {
  let testEntity = UndefinedEntity

  beforeEach(async () => {
    createEngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    removeEntity(testEntity)
    return destroyEngine()
  })

  it("should call expandBoxByObject on every entity in the `@param entity`'s EntityTree", () => {
    // Set the data as expected
    const box = new Box3(new Vector3(1, 2, 3), new Vector3(4, 5, 6))
    setComponent(testEntity, BoundingBoxComponent, { box: box })
    setComponent(testEntity, MeshComponent, new Mesh(new BoxGeometry()))
    const one = createEntityWithBoxAndParent(testEntity)
    const two = createEntityWithBoxAndParent(one)
    const entityList: Entity[] = [testEntity, one, two]
    // Sanity check before running
    for (const entity of entityList) assert.equal(getComponent(entity, MeshComponent).geometry.boundingBox, null)
    // Run and Check the result
    updateBoundingBox(testEntity)
    for (const entity of entityList) assert.notEqual(getComponent(entity, MeshComponent).geometry.boundingBox, null)
  })

  it('should not do anything if `@param entity` does not have a BoundingBoxComponent', () => {
    // Set the data as expected
    // setComponent(testEntity, BoundingBoxComponent, { box: new Box3(new Vector3(1, 2, 3), new Vector3(4, 5, 6)) })
    setComponent(testEntity, MeshComponent, new Mesh(new BoxGeometry()))
    const one = createEntityWithBoxAndParent(testEntity)
    const two = createEntityWithBoxAndParent(one)
    const entityList: Entity[] = [testEntity, one, two]
    // Sanity check before running
    assert.equal(hasComponent(testEntity, BoundingBoxComponent), false)
    for (const entity of entityList) assert.equal(getComponent(entity, MeshComponent).geometry.boundingBox, null)
    // Run and Check the result
    updateBoundingBox(testEntity)
    for (const entity of entityList) assert.equal(getComponent(entity, MeshComponent).geometry.boundingBox, null)
  })
}) //:: updateBoundingBox

describe('expandBoxByObject', () => {
  let testEntity = UndefinedEntity

  beforeEach(async () => {
    createEngine()
    testEntity = createEntity()
    setComponent(testEntity, BoundingBoxComponent)
  })

  afterEach(() => {
    removeEntity(testEntity)
    return destroyEngine()
  })

  it('should call `@param object`.geometry.computeBoundingBox if its .boundingBox property is null', () => {
    // Set the data as expected
    setComponent(testEntity, MeshComponent, new Mesh(new BoxGeometry()))
    const mesh = getComponent(testEntity, MeshComponent)
    const box = getComponent(testEntity, BoundingBoxComponent).box
    // Sanity check before running
    assert.equal(Boolean(mesh.geometry), true)
    assert.equal(mesh.geometry.boundingBox, null)
    // Run and Check the result
    BoundingBoxComponentFunctions.expandBoxByObject(mesh, box)
    assert.notEqual(mesh.geometry.boundingBox, null)
  })

  it('should not do anything if `@param object`.geometry is falsy (aka does not have any geometry)', () => {
    // Set the data as expected
    const mesh = new Mesh()
    // @ts-ignore Force a falsy value into the mesh's geometry
    mesh.geometry = undefined
    const box = getComponent(testEntity, BoundingBoxComponent).box
    const before = box.clone()
    // Sanity check before running
    assert.equal(Boolean(mesh.geometry), false)
    // Run and Check the result
    BoundingBoxComponentFunctions.expandBoxByObject(mesh, box)
    const after = getComponent(testEntity, BoundingBoxComponent).box.clone()
    assertVec.approxEq(before.min, after.min, 3)
    assertVec.approxEq(before.max, after.max, 3)
  })

  it('should call `@param box`.union() to compute the result of combining itself with `@param`.object.geometry.boundingBox', () => {
    // Set the data as expected
    const mesh = new Mesh(new BoxGeometry(1234, 5678))
    const box = new Box3(new Vector3(1, 2, 3), new Vector3(4, 5, 6))
    const before = box.clone()
    mesh.geometry.computeBoundingBox()
    // Sanity check before running
    assert.equal(Boolean(mesh.geometry), true)
    assert.notEqual(mesh.geometry.boundingBox, null)
    // Run and Check the result
    BoundingBoxComponentFunctions.expandBoxByObject(mesh, box)
    const after = mesh.geometry.boundingBox!
    assertVec.anyApproxNotEq(before.min, after.min, 3)
    assertVec.anyApproxNotEq(before.max, after.max, 3)
  })
}) //:: expandBoxByObject
