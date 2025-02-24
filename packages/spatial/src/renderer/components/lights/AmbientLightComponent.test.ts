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
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  hasComponent,
  removeComponent,
  removeEntity,
  serializeComponent,
  setComponent,
  UndefinedEntity
} from '@ir-engine/ecs'
import assert from 'assert'
import { Color, ColorRepresentation } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { mockSpatialEngine } from '../../../../tests/util/mockSpatialEngine'
import { destroySpatialEngine } from '../../../initializeEngine'
import { TransformComponent } from '../../RendererModule'
import { ObjectComponent } from '../ObjectComponent'
import { AmbientLightComponent } from './AmbientLightComponent'
import { LightTagComponent } from './LightTagComponent'

type AmbientLightComponentData = { color: ColorRepresentation; intensity: number }
const AmbientLightComponentDefaults: AmbientLightComponentData = {
  color: 0xffffff,
  intensity: 1
}

function assertAmbientLightComponentEq(A: AmbientLightComponentData, B: AmbientLightComponentData): void {
  assert.equal(new Color(A.color).getHex(), new Color(B.color).getHex())
  assert.equal(A.intensity, B.intensity)
}
function assertAmbientLightComponentNotEq(A: AmbientLightComponentData, B: AmbientLightComponentData): void {
  assert.notEqual(new Color(A.color).getHex(), new Color(B.color).getHex())
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

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, AmbientLightComponent)
      assertAmbientLightComponentEq(data, AmbientLightComponentDefaults)
    })
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

    it('should change the intensity value of an initialized AmbientLightComponent', () => {
      const before = getComponent(testEntity, AmbientLightComponent)
      assertAmbientLightComponentEq(before, AmbientLightComponentDefaults)
      const Expected: AmbientLightComponentData = {
        color: AmbientLightComponentDefaults.color,
        intensity: 42
      }

      // Run and Check the result
      setComponent(testEntity, AmbientLightComponent, Expected)
      const result = getComponent(testEntity, AmbientLightComponent)
      assertAmbientLightComponentEq(result, Expected)
      assert.notEqual(result.intensity, AmbientLightComponentDefaults.intensity)
    })

    it('should change the color value of an initialized AmbientLightComponent when the color is passed as a string', () => {
      const before = getComponent(testEntity, AmbientLightComponent)
      assertAmbientLightComponentEq(before, AmbientLightComponentDefaults)
      const Expected = {
        color: '#123456',
        intensity: AmbientLightComponentDefaults.intensity
      }

      // Run and Check the result
      setComponent(testEntity, AmbientLightComponent, Expected)
      const result = getComponent(testEntity, AmbientLightComponent)
      assert.notDeepEqual(result.color, AmbientLightComponentDefaults.color)
    })

    it('should change the color value of an initialized AmbientLightComponent when the color is passed as a Color object (the default allowed type)', () => {
      const before = getComponent(testEntity, AmbientLightComponent)
      assertAmbientLightComponentEq(before, AmbientLightComponentDefaults)
      const Expected = {
        color: new Color(0x123456),
        intensity: AmbientLightComponentDefaults.intensity
      }

      // Run and Check the result
      setComponent(testEntity, AmbientLightComponent, Expected)
      const result = getComponent(testEntity, AmbientLightComponent)
      assert.notDeepEqual(result.color, AmbientLightComponentDefaults.color)
    })
  }) //:: onSet

  describe('toJSON', () => {
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

    it("should serialize the component's default data as expected", () => {
      const Expected = {
        color: new Color(AmbientLightComponentDefaults.color).getHex(),
        intensity: AmbientLightComponentDefaults.intensity
      }
      const result = serializeComponent(testEntity, AmbientLightComponent)
      assert.deepEqual(result, Expected)
    })
  })

  describe('reactor', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransformComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroySpatialEngine()
      return destroyEngine()
    })

    it('should set a LightTagComponent on the entityContext when it is mounted', () => {
      // Sanity check before running
      assert.equal(hasComponent(testEntity, LightTagComponent), false)

      // Run and Check the result
      setComponent(testEntity, AmbientLightComponent)
      assert.equal(hasComponent(testEntity, LightTagComponent), true)
    })

    it('should add an AmbientLight object to the ObjectComponent of the entityContext when it is mounted', () => {
      // Sanity check before running
      const before = getComponent(testEntity, ObjectComponent)
      assert.equal(!!before, false)

      // Run and Check the result
      setComponent(testEntity, AmbientLightComponent)
      const after = getComponent(testEntity, ObjectComponent)
      assert.equal(!!after, true)
      const result = after.type === 'AmbientLight'
      assert.equal(result, true)
    })

    it('should remove the AmbientLight object from the ObjectComponent of the entityContext when it is unmounted', () => {
      // Sanity check before running
      const before1 = getComponent(testEntity, ObjectComponent)
      assert.equal(!!before1, false)
      setComponent(testEntity, AmbientLightComponent)

      // Run and Check the result
      removeComponent(testEntity, AmbientLightComponent)
      const after = getComponent(testEntity, ObjectComponent)
      assert.equal(!!after, false)
    })

    it('should react when component.intensity changes', () => {
      const Initial = 21
      const Expected = 42
      setComponent(testEntity, AmbientLightComponent, { intensity: Initial })

      // Sanity check before running
      const before = getComponent(testEntity, AmbientLightComponent).intensity
      assert.equal(before, Initial)

      // Run and Check the result
      setComponent(testEntity, AmbientLightComponent, { intensity: Expected })
      const result = getComponent(testEntity, AmbientLightComponent).intensity
      assert.equal(result, Expected)
    })

    it('should react when component.color changes', () => {
      const Initial = new Color(0x123456)
      const Expected = new Color(0x424242)
      setComponent(testEntity, AmbientLightComponent, { color: Initial })

      // Sanity check before running
      const before = getComponent(testEntity, AmbientLightComponent).color
      assert.equal(new Color(before).getHex(), Initial.getHex())

      // Run and Check the result
      setComponent(testEntity, AmbientLightComponent, { color: Expected })
      const result = getComponent(testEntity, AmbientLightComponent).color
      assert.equal(new Color(result).getHex(), Expected.getHex())
    })
  }) //:: reactor
})
