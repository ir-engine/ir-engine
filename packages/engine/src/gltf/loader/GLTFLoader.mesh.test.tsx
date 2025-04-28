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
 * Unit Test suite for loading the `glTF.meshes` root property and all its children.
 * Based on glTF 2.0 specification requirements.
 * */
import { describe, it } from 'vitest'

describe('glTF.meshes Property', () => {
  it.todo('MAY be undefined', () => {})
  it.todo('MUST be an array of `mesh` objects when defined', () => {})
  it.todo('MUST have a length in range [1..] when defined', () => {})
}) //:: glTF.meshes

describe('glTF: Mesh Type', () => {
  describe('primitives', () => {
    it.todo('MUST be defined', () => {})
    it.todo('MUST be an array of `mesh.primitive` objects', () => {})
    it.todo('MUST have a length in range [1..]', () => {})
    /*
    // @todo Is this true ?
    it.todo('All primitives SHOULD define the same attributes', () => {}) // Spec recommendation
    */
  }) //:: primitives

  describe('weights', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be an array of `number` type when defined', () => {})
    it.todo('MUST have a length equal to the number of morph targets defined in primitives', () => {})
  }) //:: weights

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
}) //:: glTF: Mesh

describe('glTF: MeshPrimitive Type', () => {
  describe('attributes', () => {
    it.todo('MUST be defined', () => {})
    it.todo('MUST be a JSON object', () => {})
    it.todo(
      'MUST have `integer` values representing indices into the root `accessors` array that contains its data',
      () => {}
    )
    /*
    // @todo Is this true ?
    it.todo('MUST contain at least a "POSITION" attribute', () => {})
    it.todo('Keys MUST be valid attribute semantics (POSITION, NORMAL, TANGENT, TEXCOORD_n, COLOR_n, JOINTS_n, WEIGHTS_n)', () => {})
    it.todo('Accessor referenced by POSITION MUST have componentType FLOAT and type VEC3', () => {})
    it.todo('Accessor referenced by NORMAL MUST have componentType FLOAT and type VEC3', () => {})
    it.todo('Accessor referenced by TANGENT MUST have componentType FLOAT and type VEC4', () => {})
    it.todo('Accessor referenced by TEXCOORD_n MUST have componentType FLOAT/UNSIGNED_BYTE(normalized)/UNSIGNED_SHORT(normalized) and type VEC2', () => {})
    it.todo('Accessor referenced by COLOR_n MUST have componentType FLOAT/UNSIGNED_BYTE(normalized)/UNSIGNED_SHORT(normalized) and type VEC3 or VEC4', () => {})
    it.todo('Accessor referenced by JOINTS_n MUST have componentType UNSIGNED_BYTE/UNSIGNED_SHORT and type VEC4', () => {})
    it.todo('Accessor referenced by WEIGHTS_n MUST have componentType FLOAT/UNSIGNED_BYTE(normalized)/UNSIGNED_SHORT(normalized) and type VEC4', () => {})
    it.todo('All accessors referenced MUST have the same `count`', () => {})
    */
  }) //:: attributes

  describe('indices', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be an `integer` type when defined', () => {})
    it.todo('MUST be an index into the root `accessors` array', () => {})
    it.todo('MUST reference an accessor with `componentType` UNSIGNED_BYTE, UNSIGNED_SHORT, or UNSIGNED_INT', () => {})
    it.todo('MUST reference an accessor with `type` SCALAR', () => {})
    it.todo('should render using drawArrays if undefined', () => {})
    it.todo('should render using drawElements if defined', () => {})
    /** @todo Not in the spec, but technically correct */
    it.todo('MUST reference an accessor whose bufferView target is ELEMENT_ARRAY_BUFFER (34963)', () => {})
  }) //:: indices

  describe('material', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be an `integer` type when defined', () => {})
    it.todo('MUST have a value in range [0 .. glTF.materials.lenght-1] when defined', () => {})
  }) //:: material

  describe('mode', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('SHOULD assign a default value of 4 (TRIANGLES)', () => {})
    it.todo('MUST be an `integer` type when defined', () => {})
    it.todo(
      'MUST be one of the allowed values: 0 POINTS, 1 LINES, 2 LINE_LOOP, 3 LINE_STRIP, 4 TRIANGLES, 5 TRIANGLE_STRIP, 6 TRIANGLE_FAN',
      () => {}
    )
  }) //:: mode

  describe('targets', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be an array of objects when defined', () => {})
    /*
    // @todo Is this true ?
    it.todo('Each target object MUST map attribute semantics (POSITION, NORMAL, TANGENT) to accessor indices', () => {})
    it.todo('Each referenced accessor MUST contain displacement data (same type as base attribute)', () => {})
    it.todo('All morph target accessors for a primitive MUST have the same `count` as the base attributes', () => {})
    */
  }) //:: targets

  describe('extensions', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be a JSON object when defined', () => {})
    // @todo KHR_draco_mesh_compression properties
    it.todo(
      'MUST contain valid extension properties if defined (e.g., KHR_draco_mesh_compression bufferView/attributes)',
      () => {}
    )
  }) //:: extensions

  describe('extras', () => {
    it.todo('MAY be undefined', () => {})
  }) //:: extras
}) //:: glTF: MeshPrimitive
