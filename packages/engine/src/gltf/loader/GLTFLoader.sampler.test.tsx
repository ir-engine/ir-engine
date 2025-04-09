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
 * Unit Test suite for loading the `glTF.samplers` root property and all its children.
 * Based on glTF 2.0 specification requirements.
 * */
import { describe, it } from 'vitest'

describe('glTF.samplers Property', () => {
  it.todo('MAY be undefined', () => {})
  it.todo('MUST be an array of `sampler` objects when defined', () => {})
  it.todo('MUST have a length in range [1..] when defined', () => {})
}) //:: glTF.samplers

describe('glTF: Sampler Type', () => {
  describe('magFilter', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be an `integer` type when defined', () => {})
    it.todo('MUST be one of the allowed values: 9728 NEAREST, 9729 LINEAR', () => {})
  }) //:: magFilter

  describe('minFilter', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be an `integer` type when defined', () => {})
    it.todo(
      'MUST be one of the allowed values: 9728 NEAREST, 9729 LINEAR, 9984 NEAREST_MIPMAP_NEAREST, 9985 LINEAR_MIPMAP_NEAREST, 9986 NEAREST_MIPMAP_LINEAR, 9987 LINEAR_MIPMAP_LINEAR',
      () => {}
    )
  }) //:: minFilter

  describe('wrapS', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('SHOULD assign a default value of 10497 REPEAT', () => {})
    it.todo('MUST be an `integer` type when defined', () => {})
    it.todo('MUST be one of the allowed values: 33071 CLAMP_TO_EDGE, 33648 MIRRORED_REPEAT, 10497 REPEAT', () => {})
  }) //:: wrapS

  describe('wrapT', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('SHOULD assign a default value of 10497 REPEAT', () => {})
    it.todo('MUST be an `integer` type when defined', () => {})
    it.todo('MUST be one of the allowed values: 33071 CLAMP_TO_EDGE, 33648 MIRRORED_REPEAT, 10497 REPEAT', () => {})
  }) //:: wrapT

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
}) //:: glTF: Sampler
