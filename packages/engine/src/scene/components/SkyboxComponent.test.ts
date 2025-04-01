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
  removeEntity,
  setComponent,
  UndefinedEntity
} from '@ir-engine/ecs'
import { afterEach, assert, beforeEach, describe, it } from 'vitest'
import { SkyboxComponent } from './SkyboxComponent'

const SkyboxComponentDefaults = {
  backgroundColor: 0x000000,
  equirectangularPath: '',
  cubemapPath: '',
  backgroundType: 1,
  sky: null,
  skyboxProps: {
    turbidity: 10,
    rayleigh: 1,
    luminance: 1,
    mieCoefficient: 0.004999999999999893,
    mieDirectionalG: 0.99,
    inclination: 0.10471975511965978,
    azimuth: 0.16666666666666666
  }
}

describe('SkyboxComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      assert.equal(SkyboxComponent.name, 'SkyboxComponent')
    })

    it('should initialize the *Component.jsonID field with the expected value', () => {
      assert.equal(SkyboxComponent.jsonID, 'EE_skybox')
    })
  })

  describe('onInit', () => {
    let testEntity = UndefinedEntity
    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, SkyboxComponent)
    })
    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })
    it('should initialize the *Component with the expected default values', () => {
      const result = getComponent(testEntity, SkyboxComponent)
      assert.deepEqual(result, SkyboxComponentDefaults)
    })
  })

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, SkyboxComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should change the values of an initialized SkyboxComponent', () => {
      const before = getComponent(testEntity, SkyboxComponent)
      assert.deepEqual(before, SkyboxComponentDefaults)

      const Expected = {
        backgroundColor: 0xff0000,
        equirectangularPath: 'path/to/equirect.jpg',
        cubemapPath: 'path/to/cubemap/',
        backgroundType: 2,
        skyboxProps: {
          turbidity: 5,
          rayleigh: 2,
          luminance: 0.5,
          mieCoefficient: 0.003,
          mieDirectionalG: 0.8,
          inclination: 0.5,
          azimuth: 0.25
        }
      }

      setComponent(testEntity, SkyboxComponent, Expected)
      const after = getComponent(testEntity, SkyboxComponent)

      assert.equal(after.backgroundColor, Expected.backgroundColor)
      assert.equal(after.equirectangularPath, Expected.equirectangularPath)
      assert.equal(after.cubemapPath, Expected.cubemapPath)
      assert.equal(after.backgroundType, Expected.backgroundType)
      assert.deepEqual(after.skyboxProps, Expected.skyboxProps)
    })

    it('should not change values when passed incorrect types', () => {
      const before = getComponent(testEntity, SkyboxComponent)

      const Incorrect = {
        backgroundColor: 'not a color',
        equirectangularPath: 42,
        cubemapPath: true,
        backgroundType: 'wrong type',
        skyboxProps: 'not an object'
      }

      // @ts-ignore Intentionally passing incorrect types
      setComponent(testEntity, SkyboxComponent, Incorrect)
      const after = getComponent(testEntity, SkyboxComponent)
      assert.deepEqual(after, before)
    })
  })

  describe('Background Type Changes', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, SkyboxComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should handle color background type change', () => {
      const colorConfig = {
        backgroundType: 1,
        backgroundColor: 0xff0000
      }

      setComponent(testEntity, SkyboxComponent, colorConfig)
      const result = getComponent(testEntity, SkyboxComponent)

      assert.equal(result.backgroundType, colorConfig.backgroundType)
      assert.equal(result.backgroundColor, colorConfig.backgroundColor)
    })

    it('should handle equirectangular background type change', () => {
      const equirectConfig = {
        backgroundType: 2,
        equirectangularPath: 'path/to/equirect.jpg'
      }

      setComponent(testEntity, SkyboxComponent, equirectConfig)
      const result = getComponent(testEntity, SkyboxComponent)

      assert.equal(result.backgroundType, equirectConfig.backgroundType)
      assert.equal(result.equirectangularPath, equirectConfig.equirectangularPath)
    })

    it('should handle cubemap background type change', () => {
      const cubemapConfig = {
        backgroundType: 3,
        cubemapPath: 'path/to/cubemap/'
      }

      setComponent(testEntity, SkyboxComponent, cubemapConfig)
      const result = getComponent(testEntity, SkyboxComponent)

      assert.equal(result.backgroundType, cubemapConfig.backgroundType)
      assert.equal(result.cubemapPath, cubemapConfig.cubemapPath)
    })
  })

  describe('Skybox Properties', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, SkyboxComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should update individual skybox properties', () => {
      const newProps = {
        skyboxProps: {
          ...SkyboxComponentDefaults.skyboxProps,
          turbidity: 5,
          rayleigh: 2
        }
      }

      setComponent(testEntity, SkyboxComponent, newProps)
      const result = getComponent(testEntity, SkyboxComponent)

      assert.equal(result.skyboxProps.turbidity, newProps.skyboxProps.turbidity)
      assert.equal(result.skyboxProps.rayleigh, newProps.skyboxProps.rayleigh)
      // Other properties should remain at defaults
      assert.equal(result.skyboxProps.luminance, SkyboxComponentDefaults.skyboxProps.luminance)
    })

    it('should maintain property constraints', () => {
      const invalidProps = {
        skyboxProps: {
          ...SkyboxComponentDefaults.skyboxProps,
          turbidity: -1, // Should not allow negative values
          mieCoefficient: 2 // Should constrain to valid range
        }
      }

      setComponent(testEntity, SkyboxComponent, invalidProps)
      const result = getComponent(testEntity, SkyboxComponent)

      // Assert that values are constrained to valid ranges
      // (Note: Add these assertions based on your actual validation logic)
      assert(result.skyboxProps.turbidity >= 0)
      assert(result.skyboxProps.mieCoefficient >= 0 && result.skyboxProps.mieCoefficient <= 1)
    })
  })

  describe('Error Handling', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, SkyboxComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should handle missing texture paths gracefully', () => {
      const config = {
        backgroundType: 2, // equirectangular
        equirectangularPath: ''
      }

      setComponent(testEntity, SkyboxComponent, config)
      const result = getComponent(testEntity, SkyboxComponent)

      // Should fall back to default background type
      assert.equal(result.backgroundType, SkyboxComponentDefaults.backgroundType)
    })

    it('should validate background type values', () => {
      const config = {
        backgroundType: 999 // Invalid type
      }

      setComponent(testEntity, SkyboxComponent, config)
      const result = getComponent(testEntity, SkyboxComponent)

      // Should maintain valid background type
      assert(result.backgroundType >= 1 && result.backgroundType <= 4)
    })
  })
})
