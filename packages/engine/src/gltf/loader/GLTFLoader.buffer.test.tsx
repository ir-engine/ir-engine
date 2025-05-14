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
 * Unit Test suite for loading the `glTF.buffers` root property and all its children.
 * Based on glTF 2.0 specification requirements.
 * */
import { describe, it } from 'vitest'

describe('glTF.buffers Property', () => {
  it.todo('MAY be undefined', () => {})
  it.todo('MUST be an array of `buffer` objects when defined', () => {})
  it.todo('MUST have a length in range [1..] when defined', () => {})
}) //:: glTF.buffers

describe('glTF: Buffer Type', () => {
  describe('uri', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be a `string` type when defined', () => {})
    it.todo('MUST be a path relative to the glTF file when not absolute', () => {})
    it.todo('MUST be a follow the iri-reference format when defined', () => {})
    it.todo('MUST be base64 encoded when it starts with data:', () => {})
  }) //:: uri

  describe('byteLength', () => {
    it.todo('MUST be defined', () => {})
    it.todo('MUST be an `integer` type', () => {})
    it.todo('MUST have a value in range [1..]', () => {})
    it.todo('MUST match the total size of the buffer data in bytes', () => {})
  }) //:: byteLength

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
}) //:: glTF: Buffer
