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
 * Unit Test suite for loading the `glTF.skins` root property and all its children.
 * Based on glTF 2.0 specification requirements.
 * */
import { describe, it } from 'vitest'

describe('glTF.skins Property', () => {
  it.todo('MAY be undefined', () => {})
  it.todo('MUST be an array of `skin` objects when defined', () => {})
  it.todo('MUST have a length in range [1..] when defined', () => {})
}) //:: glTF.skins

describe('glTF: Skin Type', () => {
  describe('inverseBindMatrices', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST interpret each matrix as an identity matrix when undefined', () => {})
    it.todo('MUST be an `integer` type when defined', () => {})
    it.todo('MUST be a value in range [0 .. glTF.accessors.length-1', () => {})
    it.todo('MUST reference an accessor with `count` equal to the length of the `joints` array', () => {})
    /*
    // @todo Is this true ?
    it.todo('MUST reference an accessor with `componentType` FLOAT (5126)', () => {})
    it.todo('MUST reference an accessor with `type` MAT4', () => {})
    it.todo('Accessor contains the inverse bind matrices for each joint', () => {})
    */
  }) //:: inverseBindMatrices

  describe('skeleton', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be an `integer` type when defined', () => {})
    it.todo('MUST be a value in range [0 .. glTF.nodes.length-1', () => {})
    it.todo(
      'MUST reference the closest common root of the joints hierarchy or a direct/indirect parent node of the closest common root',
      () => {}
    )
  }) //:: skeleton

  describe('joints', () => {
    it.todo('MUST be defined', () => {})
    it.todo('MUST be an array of `integer` types', () => {})
    it.todo('MUST have a length in range [1..]', () => {})
    it.todo('MUST have unique values', () => {})
    it.todo('MUST have values that are >= 0', () => {})
  }) //:: joints

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
}) //:: glTF: Skin
