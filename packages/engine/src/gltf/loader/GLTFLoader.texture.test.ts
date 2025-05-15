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

/**
 * @fileoverview
 * Unit Test suite for loading the `glTF.textures` root property and all its children.
 * Based on glTF 2.0 specification requirements.
 * */
import { describe, it } from 'vitest'

describe('glTF.textures Property', () => {
  it.todo('MAY be undefined', () => {})
  it.todo('MUST be an array of `texture` objects when defined', () => {})
  it.todo('MUST have a length in range [1..] when defined', () => {})
}) //:: glTF.textures

describe('glTF: Texture Type', () => {
  describe('sampler', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('SHOULD use a sampler with repeat wrapping and auto-filtering when undefined', () => {})
    it.todo('MUST be an `integer` type when defined', () => {})
    it.todo('MUST have a value in range [0 .. glTF.samplers.length-1]', () => {})
  }) //:: sampler

  describe('source', () => {
    // @note Required for core glTF, but optional if an extension like KHR_texture_basisu provides the source.
    it.todo('MAY be undefined (if using certain extensions)', () => {})
    it.todo('SHOULD supply an alternate texture source when undefined (eg. from an extension)', () => {})
    it.todo('MUST be an `integer` type when defined', () => {})
    it.todo('MUST have a value in range [0 .. glTF.images.length-1]', () => {})
  }) //:: source

  describe('name', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be a `string` type when defined', () => {})
  }) //:: name

  describe('extensions', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be a JSON object when defined', () => {})
    // @todo KHR_texture_basisu properties
    it.todo('MUST contain valid extension properties if defined (e.g., KHR_texture_basisu source index)', () => {})
  }) //:: extensions

  describe('extras', () => {
    it.todo('MAY be undefined', () => {})
  }) //:: extras
}) //:: glTF: Texture
