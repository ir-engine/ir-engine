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
 * Unit Test suite for loading the `glTF.nodes` root property and all its children.
 * Based on glTF 2.0 specification requirements.
 * */
import { describe, it } from 'vitest'

describe('glTF.nodes Property', () => {
  // @note Functionally required if scenes exist
  it.todo('MAY be undefined', () => {})
  it.todo('MUST be an array of `node` objects when defined', () => {})
  it.todo('MUST have a length in range [1..] when defined', () => {})
}) //:: glTF.nodes

describe('glTF: Node Type', () => {
  it.todo(
    'MAY define either a `matrix` or any combination of `translation`/`rotation`/`scale` (TRS properties)',
    () => {}
  )
  it.todo('SHOULD use an Identity matrix for transformations when undefined', () => {})
  it.todo(
    'SHOULD convert `translation`/`rotation`/`scale` (TRS properties) to matrices and postmultiply in T*R*S order to compose the transformation',
    () => {}
  )

  describe('camera', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be an `integer` type when defined', () => {})
    it.todo('MUST have a value in range [0 .. glTF.cameras.length-1]', () => {})
  }) //:: camera

  describe('children', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be an array of `integer` types when defined', () => {})
    it.todo('MUST have a length in range [1..] when defined', () => {})
    it.todo('MUST have unique values', () => {})
    it.todo('MUST values that are >= 0', () => {})
    it.todo('MUST have values in range [0 .. glTF.nodes.length-1]', () => {})
    /*
    // @todo Is this true ?
    it.todo('MUST NOT contain the index of this node (no self-loops)', () => {})
    it.todo('MUST NOT form cycles in the node hierarchy', () => {})
    */
  }) //:: children

  describe('skin', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be an `integer` type when defined', () => {})
    it.todo('MUST have a value in range [0..glTF.skins.length - 1]', () => {})
    it.todo('MUST be defined if node.mesh is defined', () => {})
    it.todo(
      'MUST ensure that all joints used by the skin belong to the same scene when a skin is referenced by a node within a scene',
      () => {}
    )
    /*
    // @todo Is this true ?
    it.todo('MUST ensure that all `mesh.primitives` contain JOINTS_0 and WEIGHTS_0 attributes when defined', () => {})
    */
  }) //:: skin

  describe('matrix', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('SHOULD assign a default value of Identity matrix if undefined', () => {})
    it.todo('MUST be an array[16] of `number` type when defined', () => {})
    it.todo('MUST represent a 4x4 matrix specified in column-major order', () => {})
    it.todo('should not be defined if `translation`, `rotation`, or `scale` are defined', () => {})
    /*
    // @todo Is this true ?
    it.todo('should not be defined if any `animation.channel.target` targets this node', () => {})
    */
  }) //:: matrix

  describe('mesh', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be an `integer` type when defined', () => {})
    it.todo('MUST be an index into the root `meshes` array', () => {})
    it.todo('MUST have a value in range [0..glTF.meshes.length - 1]', () => {})
    it.todo('MUST be defined if node.skin is defined', () => {})
  }) //:: mesh

  describe('rotation', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('SHOULD assign a default value of [0.0, 0.0, 0.0, 1.0] (identity quaternion)', () => {})
    it.todo('MUST be an array[4] of `number` type when defined', () => {})
    it.todo('MUST represent a normalized quaternion (x, y, z, w)', () => {})
    it.todo('MUST have values in the range [-1..1]', () => {})
    it.todo('should not be defined if `matrix` is defined', () => {})
  }) //:: rotation

  describe('scale', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('SHOULD assign a default value of [1.0, 1.0, 1.0]', () => {})
    it.todo('MUST be an array[3] of `number` type when defined', () => {})
    it.todo('should not be defined if `matrix` is defined', () => {})
  }) //:: scale

  describe('translation', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('SHOULD assign a default value of [0.0, 0.0, 0.0]', () => {})
    it.todo('MUST be an array[3] of `number` type when defined', () => {})
    it.todo('should not be defined if `matrix` is defined', () => {})
  }) //:: translation

  describe('weights', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be an array of `number` type when defined', () => {})
    it.todo('MUST have a length matching the number of morph targets of the referenced mesh', () => {})
    it.todo('MUST be defined if node.mesh is defined', () => {})
  }) //:: weights

  describe('name', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be a `string` type when defined', () => {})
  }) //:: name

  describe('extensions', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be a JSON object when defined', () => {})
    // Example: KHR_lights_punctual properties
    it.todo('MUST contain valid extension properties if defined (e.g., KHR_lights_punctual light index)', () => {})
  }) //:: extensions

  describe('extras', () => {
    it.todo('MAY be undefined', () => {})
  }) //:: extras
}) //:: glTF: Node
