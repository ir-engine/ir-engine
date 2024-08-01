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
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  removeEntity,
  setComponent,
  UndefinedEntity
} from '@etherealengine/ecs'
import assert from 'assert'
import { Color } from 'three'
import { assertFloatApproxEq } from '../../physics/classes/Physics.test'
import { InfiniteGridComponent } from './InfiniteGridHelper'

const InfiniteGridComponentDefaults = {
  size: 1,
  color: new Color(0x535353),
  distance: 200
}

function assertInfiniteGridComponentEq(A, B) {
  assert.equal(A.size, B.size)
  assertFloatApproxEq(A.r, B.r)
  assertFloatApproxEq(A.g, B.g)
  assertFloatApproxEq(A.b, B.b)
  assert.equal(A.distance, B.distance)
}

describe('InfiniteGridComponent', () => {
  describe('IDs', () => {
    it('should initialize the InfiniteGridComponent.name field with the expected value', () => {
      assert.equal(InfiniteGridComponent.name, 'InfiniteGridComponent')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, InfiniteGridComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, InfiniteGridComponent)
      assertInfiniteGridComponentEq(data, InfiniteGridComponentDefaults)
    })
  }) //:: onInit

  describe('onSet', () => {
    // it('should change the values of an initialized InfiniteGridComponent', () => {})
    // it('should not change values of an initialized InfiniteGridComponent when the data passed had incorrect types', () => {})
  }) //:: onSet

  describe('reactor', () => {
    // it('should trigger when engineRendererSettings.gridHeight changes', () => {})
    // it('should trigger when component.color changes', () => {})
    // it('should trigger when component.size changes', () => {})
    // it('should trigger when component.distance changes', () => {})
  }) //:: reactor
})

describe('createInfiniteGridHelper', () => {
  // it("should return a valid entity", () => {})
  // it("should assign an EntityTreeComponent to the returned entity", () => {})
  // it("should assign an InfiniteGridComponent to the returned entity", () => {})
  // it("should assign a NameComponent to the returned entity, with a value of 'Infinite Grid Helper'", () => {})
  // it("should assign a VisibleComponent to the returned entity, with a value of `true`", () => {})
})
