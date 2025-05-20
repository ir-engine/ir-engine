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
 * Unit Test suite for loading the `glTF.images` root property and all its children.
 * Based on glTF 2.0 specification requirements.
 * */
import { describe, it } from 'vitest'

describe('glTF.images Property', () => {
  it.todo('MAY be undefined', () => {})
  it.todo('MUST be an array of `image` objects when defined', () => {})
  it.todo('MUST have a length in range [1..] when defined', () => {})
}) //:: glTF.images

describe('glTF: Image Type', () => {
  describe('uri', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST NOT be defined when `bufferView` is defined', () => {})
    it.todo('MUST be a `string` type when defined', () => {})
    it.todo('MUST be a path relative to the glTF file when not absolute', () => {})
    it.todo('MUST be a follow the iri-reference format when defined', () => {})
    it.todo('MUST be base64 encoded when it starts with data:', () => {})
    it.todo('MUST reference a PNG or JPEG image file if it is an external file URI', () => {})
    it.todo('MUST embed PNG or JPEG image data when it starts with data:', () => {})
    it.todo('MUST match the image.mimeType when it starts with data:', () => {})
  }) //:: uri

  describe('mimeType', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be a `string` type when defined', () => {})
    it.todo('MUST be defined if `bufferView` is defined', () => {})
    it.todo('MUST be undefined if `uri` is defined and not a data URI', () => {})
    it.todo('MUST be defined if `uri` is a data URI)', () => {})
    it.todo('MUST match the data inside the `uri` when it is a data URI', () => {})
    it.todo('MUST be one of the allowed values: "image/jpeg" | "image/png"', () => {})
  }) //:: mimeType

  describe('bufferView', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST NOT be defined when `uri` is defined', () => {})
    it.todo('MUST be an `integer` type when defined', () => {})
    it.todo('MUST have a value in range [0 .. glTF.bufferViews.length-1]', () => {})
    it.todo('MUST reference a bufferView containing valid PNG or JPEG image data', () => {})
  }) //:: bufferView

  describe('name', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be a `string` type when defined', () => {})
  }) //:: name

  describe('extensions', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be a JSON object when defined', () => {})
  }) //:: extensions

  describe('extras', () => {
    it.todo('MAY be undefined', () => {})
  }) //:: extras
}) //:: glTF: Image
