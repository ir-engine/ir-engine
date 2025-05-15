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
import { Engine, getComponent, getOptionalComponent, serializeComponent, setComponent } from '@ir-engine/ecs'
import { it } from '@ir-engine/engine/src/scene/util/testUtil'
import { BackgroundComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/WebGLRendererSystem'
import { mockSpatialEngine } from '@ir-engine/spatial/tests/util/mockSpatialEngine'
import {
  CubeReflectionMapping,
  CubeTexture,
  DataTexture,
  EquirectangularReflectionMapping,
  LinearFilter,
  SRGBColorSpace,
  Texture
} from 'three'
import { assert, describe, expect, vi } from 'vitest'
import { Sky } from '../classes/Sky'
import { SkyTypeEnum } from '../constants/SkyTypeEnum'
import { SkyboxComponent } from './SkyboxComponent'

const SkyboxComponentDefaults = {
  backgroundColor: 0x000000,
  equirectangularPath: '',
  cubemapPath: '',
  backgroundType: 1,
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
    it('should initialize the *Component with the expected default values', ({ entity }) => {
      setComponent(entity, SkyboxComponent)
      const result = getComponent(entity, SkyboxComponent)
      expect(JSON.stringify(result)).toEqual(JSON.stringify(SkyboxComponentDefaults))
    })
  })

  describe('toJSON', () => {
    it("should serialize the component's default data as expected", ({ entity }) => {
      setComponent(entity, SkyboxComponent)

      const result = serializeComponent(entity, SkyboxComponent)
      expect(result).toEqual(SkyboxComponentDefaults)
    })

    it("should serialize the component's non-default data as expected", ({ entity }) => {
      const expected: typeof SkyboxComponentDefaults = {
        ...SkyboxComponentDefaults,
        cubemapPath: '/path/to/cubemap.png'
      }

      setComponent(entity, SkyboxComponent, expected)

      const result = serializeComponent(entity, SkyboxComponent)

      expect(result.cubemapPath).toEqual(expected.cubemapPath)
    })
  })

  describe('onSet', () => {
    it('should change the values of an initialized SkyboxComponent', ({ entity }) => {
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

      setComponent(entity, SkyboxComponent, Expected)
      const result = getComponent(entity, SkyboxComponent)
      assert.equal(result.backgroundColor, Expected.backgroundColor)
      assert.equal(result.equirectangularPath, Expected.equirectangularPath)
      assert.equal(result.cubemapPath, Expected.cubemapPath)
      assert.equal(result.backgroundType, Expected.backgroundType)
      assert.deepEqual(result.skyboxProps, Expected.skyboxProps)
    })
  })

  describe('reactor', () => {
    it('should react to equirectangular textures', async ({ entity }) => {
      setComponent(entity, SkyboxComponent)
      const initial = getComponent(entity, SkyboxComponent)

      expect(initial.backgroundType).toEqual(SkyTypeEnum.cubemap)

      setComponent(entity, SkyboxComponent, {
        backgroundType: SkyTypeEnum.equirectangular,
        equirectangularPath: 'https://picsum.photos/200.jpg'
      })

      const result = getComponent(entity, SkyboxComponent)
      expect(result.backgroundType).equals(SkyTypeEnum.equirectangular)
      expect(result.equirectangularPath).equals('https://picsum.photos/200.jpg')

      const background = await vi.waitUntil(() => getOptionalComponent(entity, BackgroundComponent) as Texture)

      expect(background.colorSpace).equals(SRGBColorSpace)
      expect(background.mapping).toEqual(EquirectangularReflectionMapping)
      expect(background.minFilter).toEqual(LinearFilter)
    })

    it('should support solid colors', async ({ entity }) => {
      let background = getComponent(entity, BackgroundComponent) as DataTexture | undefined
      expect(background).toBeUndefined()

      setComponent(entity, SkyboxComponent, {
        backgroundType: SkyTypeEnum.color,
        backgroundColor: 0xffffff
      })

      background = undefined
      background = await vi.waitUntil(() => getOptionalComponent(entity, BackgroundComponent) as DataTexture)

      background = background!

      expect(background.colorSpace).toBe(SRGBColorSpace)
      expect(background.mapping).toBe(EquirectangularReflectionMapping)
      // Sample a pixel from the background texture
      expect(background.image.data).toBeDefined()

      // Get the first pixel's RGB values
      const r = background.image.data[0]
      const g = background.image.data[1]
      const b = background.image.data[2]

      expect(r).toBe(255)
      expect(b).toBe(255)
      expect(g).toBe(255)
    })

    it.skip('should support cubemaps', async ({ entity }) => {
      setComponent(entity, SkyboxComponent, {
        backgroundType: SkyTypeEnum.cubemap,
        cubemapPath: 'https://picsum.photos/200.jpg'
      })

      // TODO: Mock cubemap responses
      // see loadCubeMapTexture() - @ir-engine/src/scenes/constants/Util.ts
    })

    it('should set Sky properties correctly when skyboxProps change', async ({ entity }) => {
      mockSpatialEngine()
      // Create a Sky instance
      const sky = new Sky()

      setComponent(Engine.instance.viewerEntity, RendererComponent)

      // Set initial component with default skyboxProps
      setComponent(entity, SkyboxComponent, {
        backgroundType: SkyTypeEnum.skybox,
        sky,
        skyboxProps: {
          turbidity: 10,
          rayleigh: 1,
          luminance: 1,
          mieCoefficient: 0.004999999999999893,
          mieDirectionalG: 0.99,
          inclination: 0.10471975511965978,
          azimuth: 0.16666666666666666
        }
      })

      const background = await vi.waitUntil(() => getComponent(entity, BackgroundComponent) as CubeTexture)

      expect(background.mapping).toEqual(CubeReflectionMapping)
    })
  })
})
