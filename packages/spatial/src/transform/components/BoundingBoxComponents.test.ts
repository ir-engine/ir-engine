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
  Entity,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import assert from 'assert'
import { Box3, Vector3 } from 'three'
import { assertVecApproxEq } from '../../physics/classes/Physics.test'
import { MeshComponent } from '../../renderer/components/MeshComponent'
import { BoundingBoxComponent, _BoundingBoxComponentFunctions } from './BoundingBoxComponents'

type BoundingBoxComponentData = {
  box: Box3
  helper: Entity
}

const BoundingBoxComponentDefaults: BoundingBoxComponentData = {
  box: new Box3(),
  helper: UndefinedEntity
}

function assertBoundingBoxComponentEq(A: BoundingBoxComponentData, B: BoundingBoxComponentData): void {
  assertVecApproxEq(A.box.max, B.box.max, 3)
  assertVecApproxEq(A.box.min, B.box.min, 3)
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

    it('should not change values of an initialized BoundingBoxComponent when the data passed had incorrect types', () => {
      const before = getComponent(testEntity, BoundingBoxComponent)
      assertBoundingBoxComponentEq(before, BoundingBoxComponentDefaults)
      const Incorrect = { box: 'someBox', helper: false }
      // @ts-ignore Override the linter to force-send invalid types
      setComponent(testEntity, BoundingBoxComponent, Incorrect)
      const after = getComponent(testEntity, BoundingBoxComponent)
      assertBoundingBoxComponentEq(after, BoundingBoxComponentDefaults)
    })
  }) //:: onSet

  describe('reactor', () => {
    describe('when BoundingBoxComponent is mounted or RendererState.nodeHelperVisibility changes', () => {
      // it("should call updateBoundingBox on the entityContext whenever the value of RendererState.nodeHelperVisibility changes", () => {})
      // it("should not ?? when RendererState.nodeHelperVisibility is false", () => {})
      // create a new entity
      // create a new Box3Helper with the name `bounding-box-helper-${entity}`
      // set the helper.name as the helperEntity's name
      // set the helperEntity as visible
      // set the entityContext to be the parent of the helper entity
      // add the Box3Helper to the GroupComponent of the helper entity
      // activate the ObjectLayers.NodeHelper layer into the Box3Helper.layers
      // set the entityContext.BoundingBoxComponent.helper property to the newly created helperEntity
    })

    describe('when BoundingBoxComponent is unmounted', () => {
      // ... should remove the helperEntity", () => {
      // ... should set the entityContext.BoundingBoxComponent.helper entity to UndefinedEntity
    })
  }) //:: reactor
}) //:: BoundingBoxComponent

describe('updateBoundingBox', () => {
  // it("should not do anything if `@param entity` does not have a BoundingBoxComponent", () => {})
  // it("should call expandBoxByObject on every entity in the `@param entity`'s EntityTree", () => {})
  // it("should not updateMatrixWorld on the helperObject of the entity when there is no BoundingBoxComponent.helper defined for the entity", () => {})
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

  it('??', () => {
    const mesh = getComponent(testEntity, MeshComponent)
    const box = getComponent(testEntity, BoundingBoxComponent).box
    _BoundingBoxComponentFunctions.expandBoxByObject(mesh, box)
  })

  // it("should call `@param object`.geometry.computeBoundingBox if its .boundingBox property is null", () => {})
  // it("should call `@param box`.union() to compute the result of combining itself with `@param`.object.geometry.boundingBox", () => {})
  // it("should not do anything if `@param object`.geometry is falsy (aka does not have any geometry)", () => {})
}) //:: expandBoxByObject
