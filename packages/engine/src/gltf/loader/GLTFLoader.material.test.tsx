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
 * Unit Test suite for loading the `glTF.materials` root property and all its children.
 * Based on glTF 2.0 specification requirements.
 * */
import { describe, it } from 'vitest'

describe('glTF.materials Property', () => {
  it.todo('MAY be undefined', () => {})
  it.todo('MUST be an array of `material` objects when defined', () => {})
  it.todo('MUST have a length in range [1..] when defined', () => {})
}) //:: glTF.materials

describe('glTF: Material Type', () => {
  describe('name', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be a `string` type when defined', () => {})
  }) //:: name

  describe('pbrMetallicRoughness', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST apply all the default values of PBR when undefined', () => {})
    it.todo('MUST be a `pbrMetallicRoughness` type object when defined', () => {})
  }) //:: pbrMetallicRoughness

  describe('normalTexture', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST interpret the material as not having a normal texture when undefined', () => {})
    it.todo('MUST be a `NormalTextureInfo` type object when defined', () => {})
    it.todo('MUST encode RGB components with linear transfer function', () => {})
    it.todo('MUST contain texels that represent XYZ components of a normal vector in tangent space', () => {})
    it.todo('MUST contain normal vectors that use the (+X.right, +Y.up, +Z.towardsViewer)', () => {})
    it.todo('MUST ignore a fourth component (A) when present', () => {})
  }) //:: normalTexture

  describe('occlusionTexture', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST interpret the material as not having an occlussion texture when undefined', () => {})
    it.todo('MUST be an `OcclusionTextureInfo` type object when defined', () => {})
    it.todo('MUST sample occlussion values linearly from the R channel', () => {})
    it.todo('MUST ignore other channels (GBA) of the texture when they are present', () => {})
    it.todo('MUST treat higher values as receiving more indirect lighting than lower values', () => {})
  }) //:: occlusionTexture

  describe('emissiveTexture', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be a `TextureInfo` type object when defined', () => {})
    it.todo('MUST contain RGB components encoded as sRGB', () => {})
    it.todo('MUST ignore a fourth component (A) when present', () => {})
  }) //:: emissiveTexture

  describe('emissiveFactor', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('SHOULD assign a default value of [0.0, 0.0, 0.0]', () => {})
    it.todo('MUST be an array[3] of `number` type when defined', () => {})
    it.todo('MUST have values in range [0.0..1.0] when defined', () => {})
    it.todo('MUST interpret each value as a multiplier for the texels sampled from .emissiveTexture', () => {})
  }) //:: emissiveFactor

  describe('alphaMode', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('SHOULD assign a default value of "OPAQUE"', () => {})
    it.todo('MUST be a `string` type when defined', () => {})
    it.todo('MUST be one of the allowed values: "OPAQUE" | "MASK" | "BLEND"', () => {})
    // OPAQUE
    it.todo("MUST ignore the alpha value of the material's base color when OPAQUE", () => {})
    // MASK
    it.todo(
      'MUST render the output as fully opaque/transparent depending on the alpha and alphaCutoff values when MASK',
      () => {}
    )
    // BLEND
    it.todo('MUST combine the source/destination into the output using a composite operator when BLEND', () => {})
  }) //:: alphaMode

  describe('alphaCutoff', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('SHOULD assign a default value of 0.5', () => {})
    it.todo('MUST be ignored for .alphaMode other than MASK', () => {})
    it.todo('MUST NOT be defined when .alphaMode is undefined', () => {})
    it.todo('MUST be a `number` type when defined', () => {})
    it.todo('MUST have a value in range [0.0..1.0] when defined', () => {})
    it.todo('MUST only apply if `alphaMode` is "MASK"', () => {})
    it.todo('MUST render the entire material as fully transparent when .alphaCutoff is greater than 1.0', () => {})
  }) //:: alphaCutoff

  describe('doubleSided', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('SHOULD assign a default value of false', () => {})
    it.todo('MUST be a `boolean` type when defined', () => {})
    it.todo('SHOULD enable back-face culling when true', () => {})
    it.todo('MUST reverse the back-face normals before lighting is evaluated', () => {})
  }) //:: doubleSided

  describe('extensions', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be a JSON object when defined', () => {})
  }) //:: extensions

  describe('extras', () => {
    it.todo('MAY be undefined', () => {})
  }) //:: extras
}) //:: glTF: Material

describe('glTF: PBRMetallicRoughness Type', () => {
  describe('baseColorFactor', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('SHOULD assign a default value of [1.0, 1.0, 1.0, 1.0]', () => {})
    it.todo('MUST be an array[4] of `number` type when defined', () => {})
    it.todo('MUST have values in range [0.0..1.0] when defined', () => {})
    it.todo('MUST interpret the values as linear multipliers for the sampled texels of the .baseColorTexture', () => {})
  }) //:: baseColorFactor

  describe('baseColorTexture', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST sample the texture with 1.0 for all components when undefined', () => {})
    it.todo('MUST be a `TextureInfo` type object when defined', () => {})
    it.todo('MUST be encode the first three elements as sRGB', () => {})
    it.todo('MUST interpret the fourth component (A) as the linear alpha coverage of the material if present', () => {})
    it.todo(
      'MUST use a linear alpha value of 1.0 for the material if the fourth component (A) is not present',
      () => {}
    )
    it.todo('MUST NOT store premultiplied texels', () => {})
  }) //:: baseColorTexture

  describe('metallicFactor', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('SHOULD assign a default value of 1.0', () => {})
    it.todo('MUST be a `number` type when defined', () => {})
    it.todo('MUST have a value in range [0.0..1.0] when defined', () => {})
    it.todo('MUST multiply the sampled metalness values of the MR texture by this value', () => {})
  }) //:: metallicFactor

  describe('roughnessFactor', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('SHOULD assign a default value of 1.0', () => {})
    it.todo('MUST be a `number` type when defined', () => {})
    it.todo('MUST have a value in range [0.0..1.0] when defined', () => {})
    it.todo('MUST multiply the sampled roughness values of the MR texture by this value', () => {})
  }) //:: roughnessFactor

  describe('metallicRoughnessTexture', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST sample (G,B) channels as 1.0 when undefined', () => {})
    it.todo('MUST be a `TextureInfo` type object when defined', () => {})
    it.todo('MUST sample metallic from the Blue (B) channel', () => {})
    it.todo('MUST sample roughness from the Green (G) channel', () => {})
    it.todo('MUST ignore (R,A) channels when present', () => {})
    it.todo('MUST have values encoded with a linear transfer function', () => {})
  }) //:: metallicRoughnessTexture

  describe('extensions', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be a JSON object when defined', () => {})
  }) //:: extensions

  describe('extras', () => {
    it.todo('MAY be undefined', () => {})
  }) //:: extras
}) //:: glTF: PBRMetallicRoughness

/**
 * @note
 * Treat the TextureInfo as a base type.
 * These tests also apply to all "derived" types
 * */
describe('glTF: TextureInfo Type', () => {
  describe('index', () => {
    it.todo('MUST be defined', () => {})
    it.todo('MUST be an `integer` type', () => {})
    it.todo('MUST be an index into the root `textures` array', () => {})
    it.todo('MUST have a value in range [0 .. glTF.textures.length-1]', () => {})
  }) //:: index

  describe('texCoord', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('SHOULD assign a default value of 0', () => {})
    it.todo('MUST be an `integer` type when defined', () => {})
    it.todo('MUST have a value in range [0..]', () => {})
    it.todo('MUST correspond to the TEXCOORD_<N> attribute key in mesh.primitives.attributes', () => {})
  }) //:: texCoord

  describe('extensions', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('MUST be a JSON object when defined', () => {})
    // Example: KHR_texture_transform properties
    it.todo(
      'MUST contain valid extension properties if defined (e.g., KHR_texture_transform offset/rotation/scale)',
      () => {}
    )
  }) //:: extensions

  describe('extras', () => {
    it.todo('MAY be undefined', () => {})
  }) //:: extras
}) //:: glTF: TextureInfo Type

describe('glTF: NormalTextureInfo Type', () => {
  describe('inherit properties from TextureInfo', () => {})

  describe('scale', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('SHOULD assign a default value of 1.0', () => {})
    it.todo('MUST be a `number` type when defined', () => {})
    it.todo(
      'MUST scale each normal vector of the texture using the formula:  scaledNormal = normalize<sampled normal texture value> * 2.0 - 1.0) * vec3(<normal scale>, <normal scale>, 1.0',
      () => {}
    )
  }) //:: scale
}) //:: glTF: NormalTextureInfo

describe('glTF: OcclusionTextureInfo Type', () => {
  describe('inherit properties from TextureInfo', () => {})

  describe('strength', () => {
    it.todo('MAY be undefined', () => {})
    it.todo('SHOULD assign a default value of 1.0', () => {})
    it.todo('MUST be a `number` type when defined', () => {})
    it.todo('MUST have a value in range [0.0..1.0] when defined', () => {})
    it.todo('MUST render no oclussion when 0.0, and full oclussion when 1.0', () => {})
    it.todo(
      'MUST modify the final oclussion value with the formula:  1.0 + strength * (<sampled occlusion texture value> - 1.0)',
      () => {}
    )
  }) //:: strength
}) //:: glTF: OcclusionTextureInfo
