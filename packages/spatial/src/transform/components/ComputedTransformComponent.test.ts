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
import { afterEach, beforeEach, describe, it } from 'vitest'
import { assertArrayEqual } from '../../../tests/util/mathAssertions'
import { ComputedTransformComponent } from './ComputedTransformComponent'
import { TransformComponent } from './TransformComponent'

type ComputedTransformComponentData = {
  referenceEntities: Entity[]
  computeFunction: (() => void) | undefined
}

const ComputedTransformComponentDefaults: ComputedTransformComponentData = {
  referenceEntities: [] as Entity[],
  computeFunction: undefined
}

function assertComputedTransformComponentEq(
  A: ComputedTransformComponentData,
  B: ComputedTransformComponentData
): void {
  assertArrayEqual(A.referenceEntities, B.referenceEntities)
  assert.equal(A.computeFunction?.toString(), B.computeFunction?.toString())
}

describe('ComputedTransformComponent', () => {
  describe('IDs', () => {
    it('should initialize the ComputedTransformComponent.name field with the expected value', () => {
      assert.equal(ComputedTransformComponent.name, 'ComputedTransformComponent')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, ComputedTransformComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, ComputedTransformComponent)
      assertComputedTransformComponentEq(data, ComputedTransformComponentDefaults)
    })
  }) //:: onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, ComputedTransformComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should change the values of an initialized ComputedTransformComponent', () => {
      const before = getComponent(testEntity, ComputedTransformComponent)
      assertComputedTransformComponentEq(before, ComputedTransformComponentDefaults)
      const Expected = {
        referenceEntities: [1, 2, 3] as Entity[],
        computeFunction: () => {
          let thing = 0
          ++thing
        }
      }
      setComponent(testEntity, ComputedTransformComponent, Expected)
      const after = getComponent(testEntity, ComputedTransformComponent)
      assertComputedTransformComponentEq(after, Expected)
    })

    it('should not change values of an initialized ComputedTransformComponent when the data passed had incorrect types', () => {
      const before = getComponent(testEntity, ComputedTransformComponent)
      assertComputedTransformComponentEq(before, ComputedTransformComponentDefaults)
      const Incorrect = { referenceEntities: 'someBox', computeFunction: false }
      // @ts-ignore Override the linter to force-send invalid types
      setComponent(testEntity, ComputedTransformComponent, Incorrect)
      const after = getComponent(testEntity, ComputedTransformComponent)
      assertComputedTransformComponentEq(after, ComputedTransformComponentDefaults)
    })
  }) //:: onSet

  describe('reactor', () => {
    beforeEach(async () => {
      createEngine()
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should set TransformComponent.transformsNeedSorting to true when it first mounts', () => {
      // Set the data as expected
      TransformComponent.transformsNeedSorting = false
      // Sanity check before running
      assert.equal(TransformComponent.transformsNeedSorting, false)
      // Run and Check the result
      setComponent(createEntity(), ComputedTransformComponent)
      assert.equal(TransformComponent.transformsNeedSorting, true)
    })
  }) //:: reactor
}) //:: ComputedTransformComponent
