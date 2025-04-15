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
 * Unit Test suite for loading the `glTF.bufferViews` root property and all its children.
 * Based on glTF 2.0 specification requirements.
 * */
import { describe, it } from 'vitest'

describe('glTF.bufferViews Property', () => {
  it.todo('MAY be undefined', () => {})
  it.todo('MUST be an array of `bufferView` objects when defined', () => {})
  it.todo('MUST have a length in range [1..] when defined', () => {})
}) //:: glTF.bufferViews

describe('glTF: BufferView Type', () => {
  describe('buffer', () => {
    it.todo('MUST be defined', () => {})
    it.todo('MUST be an `integer` type', () => {})
    it.todo('MUST be an index into the root `buffers` array', () => {})
    it.todo('MUST have a value in range [0 .. glTF.buffers.length-1]', () => {})
  }) //:: buffer

  describe('byteOffset', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('SHOULD assign a default value of 0', () => {})
    it.todo('MUST be an `integer` type when defined', () => {})
    it.todo('MUST have a value in range [0..]', () => {})
    it.todo('MUST specify the offset into the referenced buffer in bytes', () => {})
  }) //:: byteOffset

  describe('byteLength', () => {
    it.todo('MUST be defined', () => {})
    it.todo('MUST be an `integer` type', () => {})
    it.todo('MUST have a value in range [1..]', () => {})
    it.todo('MUST specify the length of the buffer view in bytes', () => {})
    it.todo('MUST ensure (bufferView.byteOffset + bufferView.byteLength) <= buffer.byteLength', () => {})
  }) //:: byteLength

  describe('byteStride', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST ensure that data is tightly packed when not defined', () => {})
    it.todo('MUST be defined when two or more accessors use the same buffer view', () => {})
    it.todo('MUST be an `integer` type when defined', () => {})
    it.todo('MUST have a value in range [4..252] when defined', () => {})
    /*
    // @todo: Are these valid ?
    it.todo('MUST be a multiple of 4 when defined', () => {})
    it.todo('MUST specify the stride between consecutive elements for interleaved data', () => {})
    it.todo('MUST only be defined when the `target` property indicates vertex attributes (ARRAY_BUFFER)', () => {})
    */
  }) //:: byteStride

  describe('target', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be an `integer` type when defined', () => {})
    it.todo('MUST be one of the allowed values: 34962 (ARRAY_BUFFER) | 34963 (ELEMENT_ARRAY_BUFFER)', () => {})
  }) //:: target

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
}) //:: glTF: BufferView
