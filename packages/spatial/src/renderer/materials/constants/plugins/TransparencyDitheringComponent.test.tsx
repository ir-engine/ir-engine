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
  EntityUUID,
  UndefinedEntity,
  createEngine,
  createEntity,
  createInitialComponentValue,
  destroyEngine,
  getComponent,
  hasComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import assert from 'assert'
import { Material, Uniform } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { assertArray } from '../../../../../tests/util/assert'
import { MaterialStateComponent } from '../../MaterialComponent'
import {
  TransparencyDitheringPluginComponent,
  TransparencyDitheringRootComponent
} from './TransparencyDitheringComponent'

type TransparencyDitheringRootComponentData = {
  materials: EntityUUID[]
}
const TransparencyDitheringRootComponentDefaults: TransparencyDitheringRootComponentData = {
  materials: [] as EntityUUID[]
}

function assertTransparencyDitheringRootComponentEq(
  A: TransparencyDitheringRootComponentData,
  B: TransparencyDitheringRootComponentData
): void {
  assertArray.eq(A.materials, B.materials)
}

describe('TransparencyDitheringRootComponent', () => {
  describe('IDs', () => {
    it('should initialize the TransparencyDitheringRootComponent.name field with the expected value', () => {
      assert.equal(TransparencyDitheringRootComponent.name, 'TransparencyDitheringRootComponent')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransparencyDitheringRootComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, TransparencyDitheringRootComponent)
      assertTransparencyDitheringRootComponentEq(data, TransparencyDitheringRootComponentDefaults)
    })
  }) //:: onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })
  }) //:: onSet
})

type TransparencyDitheringPluginComponentData = {
  centers: Uniform
  exponents: Uniform
  distances: Uniform
  useWorldCalculation: Uniform
}

const TransparencyDitheringPluginComponentDefaults: TransparencyDitheringPluginComponentData =
  createInitialComponentValue(UndefinedEntity, TransparencyDitheringPluginComponent)

function assertTransparencyDitheringPluginComponentEq(
  A: TransparencyDitheringPluginComponentData,
  B: TransparencyDitheringPluginComponentData
): void {
  assert.deepEqual(A.centers, B.centers)
  assert.deepEqual(A.exponents, B.exponents)
  assert.deepEqual(A.distances, B.distances)
  assert.deepEqual(A.useWorldCalculation, B.useWorldCalculation)
}

describe('TransparencyDitheringPluginComponent', () => {
  describe('IDs', () => {
    it('should initialize the TransparencyDitheringPluginComponent.name field with the expected value', () => {
      assert.equal(TransparencyDitheringPluginComponent.name, 'TransparencyDitheringPluginComponent')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransparencyDitheringPluginComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, TransparencyDitheringPluginComponent)
      assertTransparencyDitheringPluginComponentEq(data, TransparencyDitheringPluginComponentDefaults)
    })
  }) //:: onInit

  describe('reactor', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should set call `setPlugin` on the MaterialStateComponent.material of the entityContext', () => {
      const material = new Material()
      // Set the data as expected
      setComponent(testEntity, MaterialStateComponent, { material: material })
      // Sanity check before running
      assert.equal(getComponent(testEntity, MaterialStateComponent).material.plugins, undefined)
      // Run and Check the result
      setComponent(testEntity, TransparencyDitheringPluginComponent)
      assert.notEqual(getComponent(testEntity, MaterialStateComponent).material.plugins, undefined)
    })

    it('should not do anything if the entityContext does not have a MaterialStateComponent', () => {
      // Sanity check before running
      assert.equal(hasComponent(testEntity, MaterialStateComponent), false)
      // Run and Check the result
      setComponent(testEntity, TransparencyDitheringPluginComponent)
      assert.equal(hasComponent(testEntity, MaterialStateComponent), false)
    })
  }) //:: reactor
})
