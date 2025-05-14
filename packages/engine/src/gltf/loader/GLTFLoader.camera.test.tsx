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
 * Unit Test suite for loading the `glTF.cameras` root property and all its children.
 * Based on glTF 2.0 specification requirements.
 * */
import { describe, it } from 'vitest'

describe('glTF.cameras Property', () => {
  it.todo('MAY be undefined', () => {})
  it.todo('MUST be an array of `camera` objects when defined', () => {})
  it.todo('MUST have a length in range [1..] when defined', () => {})
}) //:: glTF.cameras

describe('glTF: Camera Type', () => {
  describe('type', () => {
    it.todo('MUST be defined', () => {})
    it.todo('MUST be a `string` type', () => {})
    it.todo('MUST be one of the allowed values: "perspective" | "orthographic"', () => {})
  }) //:: type

  describe('orthographic', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be defined if `type` is "orthographic"', () => {})
    it.todo('MUST not be defined if `type` is "perspective"', () => {})
    it.todo('MUST be a `camera.orthographic` object when defined', () => {})
  }) //:: orthographic

  describe('perspective', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be defined if `type` is "perspective"', () => {})
    it.todo('MUST not be defined if `type` is "orthographic"', () => {})
    it.todo('MUST be a `camera.perspective` object when defined', () => {})
  }) //:: perspective

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
}) //:: glTF: Camera

describe('glTF: Camera.Orthographic Type', () => {
  describe('xmag', () => {
    it.todo('MUST be defined', () => {})
    it.todo('MUST be a `number` type', () => {})
    it.todo('MUST NOT equal zero', () => {})
    it.todo('SHOULD NOT be negative', () => {})
  }) //:: xmag

  describe('ymag', () => {
    it.todo('MUST be defined', () => {})
    it.todo('MUST be a `number` type', () => {})
    it.todo('MUST NOT equal zero', () => {})
    it.todo('SHOULD NOT be negative', () => {})
  }) //:: ymag

  describe('zfar', () => {
    it.todo('MUST be defined', () => {})
    it.todo('MUST be a `number` type', () => {})
    it.todo('MUST have a value greater than zero', () => {})
    it.todo('MUST be greater than `znear`', () => {})
  }) //:: zfar

  describe('znear', () => {
    it.todo('MUST be defined', () => {})
    it.todo('MUST be a `number` type', () => {})
    it.todo('MUST have a value in range [0..]', () => {})
  }) //:: znear

  describe('extensions', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be a JSON object when defined', () => {})
  }) //:: extensions

  describe('extras', () => {
    it.todo('MAY be undefined', () => {})
  }) //:: extras
}) //:: glTF: Camera.Orthographic

describe('glTF: Camera.Perspective Type', () => {
  describe('aspectRatio', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be a `number` type when defined', () => {})
    it.todo('MUST have a value > 0 when defined', () => {})
    it.todo('MUST use the rendering viewport aspect ratio when undefined', () => {})
  }) //:: aspectRatio

  describe('yfov', () => {
    it.todo('MUST be defined', () => {})
    it.todo('MUST be a `number` type', () => {})
    it.todo('MUST a value > 0', () => {})
    it.todo('SHOULD be a value in radians', () => {})
    it.todo('SHOULD be less than PI', () => {})
  }) //:: yfov

  describe('zfar', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('SHOULD use infinite projection when undefined', () => {})
    it.todo('MUST be a `number` type when defined', () => {})
    it.todo('MUST have a value > 0 when defined', () => {})
    it.todo('MUST be greater than `znear` when defined', () => {})
  }) //:: zfar

  describe('znear', () => {
    it.todo('MUST be defined', () => {})
    it.todo('MUST be a `number` type', () => {})
    it.todo('MUST have a value > 0', () => {})
  }) //:: znear

  describe('extensions', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be a JSON object when defined', () => {})
  }) //:: extensions

  describe('extras', () => {
    it.todo('MAY be undefined', () => {})
  }) //:: extras
}) //:: glTF: CameraPerspective
