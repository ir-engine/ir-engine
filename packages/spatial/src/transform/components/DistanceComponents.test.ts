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

import assert from 'assert'
import { afterEach, beforeEach, describe, it } from 'vitest'

import {
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  removeComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import {
  DistanceComponentSchema,
  DistanceFromCameraComponent,
  DistanceFromLocalClientComponent,
  FrustumCullCameraComponent,
  FrustumCullCameraSchema
} from './DistanceComponents'

describe('DistanceFromLocalClientComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      assert.equal(DistanceFromLocalClientComponent.name, 'DistanceFromLocalClientComponent')
    })

    it('should intitialize the *Component.schema field with the expected value', () => {
      assert.equal(DistanceFromLocalClientComponent.schema, DistanceComponentSchema)
    })
  }) //:: Fields
}) //:: DistanceFromLocalClientComponent

describe('DistanceFromCameraComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      assert.equal(DistanceFromCameraComponent.name, 'DistanceFromCameraComponent')
    })

    it('should intitialize the *Component.schema field with the expected value', () => {
      assert.equal(DistanceFromCameraComponent.schema, DistanceComponentSchema)
    })
  }) //:: Fields
}) //:: DistanceFromCameraComponent

describe('FrustumCullCameraComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      assert.equal(FrustumCullCameraComponent.name, 'FrustumCullCameraComponent')
    })

    it('should intitialize the *Component.schema field with the expected value', () => {
      assert.equal(FrustumCullCameraComponent.schema, FrustumCullCameraSchema)
    })
  }) //:: Fields

  describe('reactor', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, FrustumCullCameraComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should set FrustumCullCameraComponent.isCulled[entity] to 0 when the component is unmounted', () => {
      const Expected = 0
      // Set the data as expected
      const Initial = 42
      FrustumCullCameraComponent.isCulled[testEntity] = Initial
      // Sanity check before running
      const before = FrustumCullCameraComponent.isCulled[testEntity]
      assert.equal(before, Initial)
      assert.notEqual(before, Expected)
      // Run and Check the result
      removeComponent(testEntity, FrustumCullCameraComponent)
      const result = FrustumCullCameraComponent.isCulled[testEntity]
      assert.equal(result, Expected)
    })
  }) //:: reactor
}) //:: FrustumCullCameraComponent
