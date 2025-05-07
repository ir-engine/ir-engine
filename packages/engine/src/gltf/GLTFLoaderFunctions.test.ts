/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { describe, it } from 'vitest'

describe('GLTFLoaderFunctions', () => {
  describe('computeBounds', () => {
    // dep: `@param primitiveDef`.attributes
    // dep: `@param primitiveDef`.attributes.POSITION
    // dep: `@param json`.accessors[ `@param primitiveDef`.attributes.POSITION ]
    it.todo(
      'should not do anything (return early) if `@param json`.accessors[ `@param primitiveDef`.attributes.POSITION ] is missing its .min property',
      () => {}
    )
    it.todo(
      'should not do anything (return early) if `@param json`.accessors[ `@param primitiveDef`.attributes.POSITION ] is missing its .max property',
      () => {}
    )
    it.todo(
      'should set `@param geometry`.boundingBox to a new box object created with `@param json`.accessors(min,max) when .accessors.normalized is false and `@param primitiveDef`.targets is undefined',
      () => {}
    )
    it.todo(
      'should set `@param geometry`.boundingBox to a new box object created with `@param json`.accessors(min,max)*getNormalizedComponentScale when .accessors.normalized is true and `@param primitiveDef`.targets is undefined',
      () => {}
    )
    it.todo(
      `should set '@param geometry'.boundingBox to a new box object
             created with '@param json'.accessors(min,max) that is expanded
             by the (min,max) properties of every '@param primitiveDef'.targets that are not missing either of them
             when .accessors.normalized is falsy
             and primitiveDef.targets is not undefined`,
      () => {}
    )
    it.todo(
      `should set '@param geometry'.boundingBox to a new box object
             created with '@param json'.accessors(min,max) that is expanded
             by the normalized (min,max) properties of every '@param primitiveDef'.targets that are not missing either of them
             when .accessors.normalized is falsy
             primitiveDef.targets is not undefined
             and primitiveDef.targets.normalized is truthy`,
      () => {}
    )
    it.todo(
      'should set `@param geometry`.boundingSphere to a new Sphere object that has its .center property set to the center of geometry.boundingBox',
      () => {}
    )
    it.todo(
      'should set `@param geometry`.boundingSphere to a new Sphere object that has its .radius property set to the distance between (geometry.boundingBox.min,  geometry.boundingBox.max) divided by 2',
      () => {}
    )
  }) //:: computeBounds

  describe('loadMaterial', () => {
    // dep: `@param options`.document
    // dep: `@param options`.document.meshes
    // dep: `@param options`.document.meshes[`@param meshIndex`]
    // dep: `@param options`.document.meshes[`@param meshIndex`].primitives[`@param primitiveIndex`]
    // dep: `@param options`.document.meshes[`@param meshIndex`].primitives[`@param primitiveIndex`].material
    // dep: `@param options`.document.meshes[`@param meshIndex`].primitives[`@param primitiveIndex`].extensions
    // should return a promise that resolves to the result value of KHR_DRACO_MESH_COMPRESSION.decodePrimitive called with (`@param options`, options.document.meshes[`@param meshIndex`].primitives[`@param primitiveIndex`]) as arguments
    // draco compression: true
    //   should call GLTFLoaderFunctions.computeBounds with (json, geometry, primitiveDef) as arguments
    //   should assign geometry.extras to primitiveDef.extras if geometry has any
    // draco compression: false
    //   should call GLTFLoaderFunctions.computeBounds with (json, geometry, primitiveDef) as arguments
    //   should assign geometry.extras to primitiveDef.extras if geometry has any
    // TODO: Other test cases of the function for coverage
  }) //:: loadMaterial

  describe('loadPrimitive', () => {}) //:: loadPrimitive
  describe('loadPrimitives', () => {}) //:: loadPrimitives
  describe('loadAccessor', () => {}) //:: loadAccessor
  describe('loadBufferView', () => {}) //:: loadBufferView
  describe('loadBuffer', () => {}) //:: loadBuffer
  describe('loadMorphTargets', () => {}) //:: loadMorphTargets
  describe('mergeMorphTargets', () => {}) //:: mergeMorphTargets
  describe('assignTexture', () => {}) //:: assignTexture
  describe('loadTexture', () => {}) //:: loadTexture
  describe('loadImageSource', () => {}) //:: loadImageSource
  describe('loadTextureImage', () => {}) //:: loadTextureImage
  describe('loadAnimation', () => {}) //:: loadAnimation
  describe('loadCamera', () => {}) //:: loadCamera
  describe('loadMesh', () => {}) //:: loadMesh
  describe('loadNode', () => {}) //:: loadNode
  describe('loadScene', () => {}) //:: loadScene
  describe('unloadScene', () => {}) //:: unloadScene
}) //:: GLTFLoaderFunctions
