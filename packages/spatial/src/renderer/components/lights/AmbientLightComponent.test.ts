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

import { createEngine, createEntity, destroyEngine, removeEntity, setComponent, UndefinedEntity } from '@ir-engine/ecs'
import assert from 'assert'
import { Color } from 'three'
import { mockSpatialEngine } from '../../../../tests/util/mockSpatialEngine'
import { destroySpatialEngine } from '../../../initializeEngine'
import { TransformComponent } from '../../RendererModule'
import { AmbientLightComponent } from './AmbientLightComponent'

type AmbientLightComponentData = { color: Color; intensity: number }
const AmbientLightComponentDefaults = {
  color: new Color(),
  intensity: 1
} as AmbientLightComponentData

function assertAmbientLightComponentEq(A: AmbientLightComponentData, B: AmbientLightComponentData): void {
  assert.deepEqual(A.color, B.color)
  assert.equal(A.intensity, B.intensity)
}
function assertAmbientLightComponentNotEq(A: AmbientLightComponentData, B: AmbientLightComponentData): void {
  assert.notDeepEqual(A.color, B.color)
  assert.notEqual(A.intensity, B.intensity)
}

describe('AmbientLightComponent', () => {
  describe('IDs', () => {
    it('should initialize the AmbientLightComponent.name field with the expected value', () => {
      assert.equal(AmbientLightComponent.name, 'AmbientLightComponent')
    })

    it('should initialize the AmbientLightComponent.jsonID field with the expected value', () => {
      assert.equal(AmbientLightComponent.jsonID, 'EE_ambient_light')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, AmbientLightComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    /**
    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, AmbientLightComponent)
      assertAmbientLightComponentEq(data, AmbientLightComponentDefaults)
    })
    */
  }) //:: onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, AmbientLightComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroySpatialEngine()
      return destroyEngine()
    })

    /**
    it('should change the values of an initialized AmbientLightComponent', () => {})
    it('should not change values of an initialized AmbientLightComponent when the data passed had incorrect types', () => {})
    */
  }) //:: onSet

  describe('toJSON', () => {
    beforeEach(async () => {
      createEngine()
    })

    afterEach(() => {
      return destroyEngine()
    })

    // it("should serialize the component's default data as expected", () => {})
  })

  describe('reactor', () => {}) //:: reactor
})
