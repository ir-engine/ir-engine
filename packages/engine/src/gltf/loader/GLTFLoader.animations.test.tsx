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
 * Unit Test suite for loading the `glTF.animations` root property and all its children.
 * Based on glTF 2.0 specification requirements.
 * */
import { describe, it } from 'vitest'

describe('glTF.animations Property', () => {
  it.todo('MAY be undefined', () => {})
  it.todo('MUST be an array of `animation`s when defined', () => {})
  it.todo('MUST have a length in range [1..] when defined', () => {})
}) //:: glTF.animations

describe('glTF: Animation Type', () => {
  describe('channels', () => {
    it.todo('MUST be defined', () => {})
    it.todo('MUST be an array of `animation.channel` types', () => {})
    it.todo('MUST have a length in range [1..]', () => {})
    it.todo('MUST ensure that different channels of the same animation do NOT have the same targets.', () => {})
  }) //:: channels

  describe('samplers', () => {
    it.todo('MUST be defined', () => {})
    it.todo('MUST be an array of `animation.sampler` types', () => {})
    it.todo('MUST have a length in range [1..]', () => {})
  }) //:: samplers

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
}) //:: glTF: Animation

describe('glTF: AnimationChannel Type', () => {
  describe('sampler', () => {
    it.todo('MUST be defined', () => {})
    it.todo("MUST be an `integer` index into the animation's `samplers` array", () => {})
    it.todo('MUST have a value in range [0..animation.samplers.length - 1]', () => {})
  }) //:: sampler

  describe('target', () => {
    it.todo('MUST be defined', () => {})
    it.todo('MUST be an `animation.channel.target` type object', () => {})
  }) //:: target

  describe('extensions', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be a JSON object when defined', () => {})
  }) //:: extensions

  describe('extras', () => {
    it.todo('MAY be undefined', () => {})
  }) //:: extras
}) //:: glTF: AnimationChannel

describe('glTF: AnimationChannelTarget Type', () => {
  describe('node', () => {
    // Note: Optional if an extension like KHR_animation_pointer is used
    it.todo('MAY be undefined (if using specific extensions)', () => {})
    it.todo('MUST be an `integer` index into the root `nodes` array when defined', () => {})
    it.todo('MUST have a value in range [0..glTF.nodes.length - 1] when defined', () => {})
  }) //:: node

  describe('path', () => {
    it.todo('MUST be defined', () => {})
    it.todo('MUST be a `string`', () => {})
    it.todo('MUST be one of the allowed values: "translation" | "rotation" | "scale" | "weights"', () => {})
    it.todo(
      'MUST ensure that the sampler values are a translation along the (X,Y,Z) axes when its value is "translation".',
      () => {}
    )
    it.todo(
      'MUST ensure that the sampler values are the values of a quaternion in the order (x,y,z,w), where w is the scalar when its value is "rotation" property',
      () => {}
    )
    it.todo(
      'MUST ensure that the sampler values are the scaling factors along the (X,Y,Z) axes when its value is "scale".',
      () => {}
    )
    // Note: Extensions like KHR_animation_pointer allow "pointer"
    it.todo('MAY allow "pointer" if KHR_animation_pointer extension is used', () => {})
  }) //:: path

  describe('extensions', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be a JSON object when defined', () => {})
    // Example: KHR_animation_pointer specific properties
    it.todo('MUST contain valid extension properties if defined (e.g., KHR_animation_pointer.pointer)', () => {})
  }) //:: extensions

  describe('extras', () => {
    it.todo('MAY be undefined', () => {})
  }) //:: extras
}) //:: glTF: AnimationChannelTarget

describe('glTF: AnimationSampler Type', () => {
  describe('input', () => {
    it.todo('MUST be defined', () => {})
    it.todo('MUST be an integer value in range [0..glTF.accessors.length - 1]', () => {})
    it.todo('MUST be an index into the root `accessors` array', () => {})
    it.todo('MUST reference an accessor containing FLOAT scalars', () => {})
    it.todo('MUST reference an accessor with strictly increasing values  _(ie. time[n + 1] > time[n])_', () => {})
    it.todo('MUST interpret the accessor values as time in seconds', () => {})
  }) //:: input

  describe('interpolation', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('SHOULD assign a default value of "LINEAR"', () => {})
    it.todo('MUST be one of the `string` allowed values: "LINEAR" | "STEP" | "CUBICSPLINE"', () => {})
    // LINEAR
    it.todo('SHOULD use slerp to interpolate quaternions when "LINEAR"', () => {})
    it.todo('MUST have the same number of input and output elements "LINEAR"', () => {})
    // STEP
    it.todo('MUST have the same number of input and output elements "STEP"', () => {})
    // CUBICSPLINE
    it.todo('MUST have three times the number of input elements than output elements when "CUBICSPLINE"', () => {})
    it.todo(
      'MUST store three elements for each input in the output (in-tangent, spline vertex, out-tangent) when "CUBICSPLINE"',
      () => {}
    )
    it.todo('MUST check that there are at least two keyframes when "CUBICSPLINE"', () => {})
    // Note: Specific interpolations might be required for certain types via extensions
    // it.todo('MUST use "STEP" interpolation if animating integer or boolean types via extensions', () => {})
  }) //:: interpolation

  describe('output', () => {
    it.todo('MUST be defined', () => {})
    it.todo('MUST be an `integer` index into the root `accessors` array', () => {})
    it.todo('MUST have a value in range [0 .. glTF.accessors.length-1]', () => {})
  }) //:: output

  describe('extensions', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be a JSON object when defined', () => {})
  }) //:: extensions

  describe('extras', () => {
    it.todo('MAY be undefined', () => {})
  }) //:: extras
}) //:: glTF: AnimationSampler
