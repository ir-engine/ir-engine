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

/**
 * @fileoverview
 * Unit Test suite for loading the `glTF.asset` root property and all its children.
 * Based on glTF 2.0 specification requirements.
 * */
import { describe, expect, it } from 'vitest'

import { GLTF } from '@gltf-transform/core'
import { GLTFValidate } from '../GLTFLoaderFunctions'

const mockAssetMinimal = (): GLTF.IAsset => ({ version: '2.0' })

describe('glTF.asset Property', () => {
  /**
   * @todo
   * These root cases cannot possibly be tested with our current implementation.
   * Nothing in our current implementation checks the root glTF data directly.
   * */
  it.todo('MUST be defined', () => {})
  it.todo('MUST be an Asset object', () => {})

  describe('version', () => {
    it('MUST be defined', () => {
      const asset = mockAssetMinimal()
      // @ts-expect-error Delete the version property to provoke the error
      delete asset.version
      expect(() => GLTFValidate.asset(asset)).toThrow()
    })

    it('MUST be a `string` type', () => {
      const asset = mockAssetMinimal()
      // @ts-expect-error Set the version property to a number to provoke the error
      asset.version = 2.0 // Not a string
      expect(() => GLTFValidate.asset(asset)).toThrow()
      asset.version = '2.0' // Set a valid value
      expect(() => GLTFValidate.asset(asset)).not.toThrow()
    })

    it('MUST match the glTF version format with pattern ^[0-9]+.[0-9]+$', () => {
      const asset = mockAssetMinimal()
      asset.version = '2.0.0' // Not a valid glTF version format
      expect(() => GLTFValidate.asset(asset)).toThrow()
    })
  }) //:: version

  describe('copyright', () => {
    it('MAY be undefined', () => {
      const asset = mockAssetMinimal()
      expect(() => GLTFValidate.asset(asset)).not.toThrow()
    })

    it('MUST be a `string` type when defined', () => {
      const asset = mockAssetMinimal()
      // @ts-expect-error Set the copyright property to a number to provoke the error
      asset.copyright = 2023 // Not a string
      expect(() => GLTFValidate.asset(asset)).toThrow()
      asset.copyright = 'SomeCopyright' // Set a valid value
      expect(() => GLTFValidate.asset(asset)).not.toThrow()
    })
  }) //:: copyright

  describe('generator', () => {
    it('MAY be undefined', () => {
      const asset = mockAssetMinimal()
      expect(() => GLTFValidate.asset(asset)).not.toThrow()
    })

    it('MUST be a `string` type when defined', () => {
      const asset = mockAssetMinimal()
      // @ts-expect-error Set the generator property to a number to provoke the error
      asset.generator = { toolName: 'SomeGeneratorTool' } // Not a string
      expect(() => GLTFValidate.asset(asset)).toThrow()
      asset.generator = 'SomeGeneratorTool' // Set a valid value
      expect(() => GLTFValidate.asset(asset)).not.toThrow()
    })
  }) //:: generator

  describe('minVersion', () => {
    it('MAY be undefined', () => {
      const asset = mockAssetMinimal()
      expect(() => GLTFValidate.asset(asset)).not.toThrow()
    })

    it('MUST be a `string` type when defined', () => {
      const asset = mockAssetMinimal()
      // @ts-expect-error Set the minVersion property to a number to provoke the error
      asset.minVersion = 2.0 // Not a string
      expect(() => GLTFValidate.asset(asset)).toThrow()
      asset.minVersion = '2.0' // Set a valid value
      expect(() => GLTFValidate.asset(asset)).not.toThrow()
    })

    it('MUST NOT be greater than Asset.version', () => {
      const asset = mockAssetMinimal()
      asset.minVersion = '2.1' // Greater than 2.0
      expect(() => GLTFValidate.asset(asset)).toThrow()
      asset.minVersion = '2.0' // Set a valid value
      expect(() => GLTFValidate.asset(asset)).not.toThrow()
    })

    it('MUST match the glTF version format with pattern ^[0-9]+.[0-9]+$', () => {
      const asset = mockAssetMinimal()
      asset.minVersion = '2.0.0' // Not a valid glTF version format
      expect(() => GLTFValidate.asset(asset)).toThrow()
    })
  }) //:: minVersion

  describe('extensions', () => {
    it('MAY be undefined', () => {
      const asset = mockAssetMinimal()
      expect(() => GLTFValidate.asset(asset)).not.toThrow()
    })

    it('MUST be a JSON object when defined', () => {
      const asset = mockAssetMinimal()
      // @ts-expect-error Set the extensions property to a number to provoke the error
      asset.extensions = 42 // Not a JSON object
      expect(() => GLTFValidate.asset(asset)).toThrow()
      asset.extensions = {} // Set a valid value
      expect(() => GLTFValidate.asset(asset)).not.toThrow()
    })
  }) //:: extensions

  describe('extras', () => {
    it('MAY be undefined', () => {
      const asset = mockAssetMinimal()
      expect(() => GLTFValidate.asset(asset)).not.toThrow()
    })
  }) //:: extras
}) //:: glTF.asset
