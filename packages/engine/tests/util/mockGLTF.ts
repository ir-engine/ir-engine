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

import { expect } from 'vitest'

import { GLTF } from '@gltf-transform/core'
import { UndefinedEntity } from '@ir-engine/ecs'
import { LoadingManager } from 'three'
import {
  BINARY_EXTENSION_CHUNK_TYPES,
  BINARY_EXTENSION_HEADER_LENGTH,
  BINARY_EXTENSION_HEADER_MAGIC
} from '../../src/gltf/GLTFComponent'
import { DependencyCache, GLTFParserOptions } from '../../src/gltf/GLTFLoaderFunctions'
import { SourceID } from '../../src/scene/components/SourceComponent'

type MockGLBOptions = {
  magic?: string
  version?: number
  json?: object
  bin?: ArrayBuffer
}

/** @description Sets the missing values of `@param args` to their relevant default values. */
export function mockGLBOptionsSetMissingDefaults(args: MockGLBOptions) {
  if (args.magic == undefined) args.magic = BINARY_EXTENSION_HEADER_MAGIC
  if (args.version == undefined) args.version = 2
  if (args.json == undefined) args.json = {}
  if (args.bin == undefined) args.bin = new ArrayBuffer(0)
}

/** @description Returns the total length of the GLB file that the GLB header should describe for the file described by `@param args` */
export function mockGLBLength(args: MockGLBOptions): number {
  expect(args.json).not.toBeUndefined()
  expect(args.bin).not.toBeUndefined()
  const json = 4 + 4 + JSON.stringify(args.json).length
  const bin = 4 + 4 + args.bin!.byteLength
  return BINARY_EXTENSION_HEADER_LENGTH + json + bin
}

/** @description Writes the GLTF Header data described by `@param args` into the `@param glb` buffer */
export function mockGLBHeader(glb: Uint8Array, args: MockGLBOptions) {
  expect(args.magic!.length).toBe(4)
  expect(args.version).not.toBeUndefined()
  const view = new DataView(glb.buffer)
  // Write magic
  for (let id = 0; id < args.magic!.length; ++id) view.setUint8(id, args.magic!.charCodeAt(id))
  // Write Version
  view.setUint32(4, args.version!, true)
  // Write length
  view.setUint32(8, mockGLBLength(args), true)
}

/**
 * @description Writes the GLTF JSON data described by `@param args` into the `@param glb` buffer
 * @returns The index to the byte right after the JSON chunk. Can be used as the start offset for writing into the BIN chunck.
 * */
export function mockGLBChunkJSON(glb: Uint8Array, args: MockGLBOptions): number {
  expect(args.json).not.toBeUndefined()
  const json = JSON.stringify(args.json)
  const view = new DataView(glb.buffer)
  const chunkStart = BINARY_EXTENSION_HEADER_LENGTH
  // Write Length
  view.setUint32(chunkStart, json.length, true)
  // Write Type
  view.setUint32(chunkStart + 4, BINARY_EXTENSION_CHUNK_TYPES.JSON, true)
  // Write Data
  for (let id = 0; id < json.length; ++id) {
    view.setUint8(BINARY_EXTENSION_HEADER_LENGTH + 4 + 4 + id, json.charCodeAt(id))
  }
  return chunkStart + 4 + 4 + json.length
}

/** @description Writes the GLTF BIN data described by `@param args` into the `@param glb` buffer */
export function mockGLBChunkBIN(glb: Uint8Array, args: MockGLBOptions, chunkStart: number) {
  expect(args.bin).not.toBeUndefined()
  expect(chunkStart).not.toBeLessThanOrEqual(BINARY_EXTENSION_HEADER_LENGTH + 4)
  const view = new DataView(glb.buffer)
  // Write Length
  view.setUint32(chunkStart, args.bin!.byteLength, true)
  // Write Type
  view.setUint32(chunkStart + 4, BINARY_EXTENSION_CHUNK_TYPES.BIN, true)
  // Write Data
  const u8binData = new Uint8Array(args.bin!) // @warning Would write zeros if indexed directly, instead of from this typed array
  for (let id = 0; id < args.bin!.byteLength; ++id) {
    view.setUint8(chunkStart + 4 + 4 + id, u8binData![id])
  }
}

/**
 * @description
 * Writes the Binary GLTF data described by `@param args` into the `@param glb` buffer
 *
 * @note
 * Will set every parameter to a sane default when that parameter is omitted.
 * Magic and version become valid values, and json/bin become empty (but valid) data
 * */
export function mockGLB(args: MockGLBOptions) {
  mockGLBOptionsSetMissingDefaults(args)

  const result = new Uint8Array(mockGLBLength(args))
  mockGLBHeader(result, args)
  const jsonEnd = mockGLBChunkJSON(result, args)
  mockGLBChunkBIN(result, args, jsonEnd)
  return result
}

/**
 * Creates an empty GLTF object with only the required asset property filled in.
 * All array properties are undefined by default, as per the glTF spec which requires
 * arrays to either be undefined or have at least one element.
 *
 * @param generator Optional generator name, defaults to 'IREngine.MockGLTF'
 * @param version Optional version string, defaults to '2.0'
 * @returns An empty IGLTF object with required fields
 */
export function mockGLTF(generator = '@ir-engine/MockGLTF', version = '2.0'): GLTF.IGLTF {
  return {
    asset: {
      version,
      generator
    }
    // All other array properties are undefined by default, as per the glTF spec
  }
}

/**
 * Creates mock GLTFParserOptions for testing
 * @param gltf The GLTF object to use in the options
 * @param url Optional URL for the GLTF file, defaults to 'test.gltf'
 * @returns GLTFParserOptions object for testing
 */
export function mockGLTFOptions(gltf: GLTF.IGLTF, url = 'test.gltf'): GLTFParserOptions {
  // Ensure the dependency cache is set up for this URL
  if (!DependencyCache.has(url)) DependencyCache.set(url, new Map())

  return {
    url,
    documentID: 'TestDocumentID' as SourceID,
    document: gltf,
    entity: UndefinedEntity,
    body: null,
    manager: new LoadingManager(),
    path: '',
    requestHeader: {}
  }
}
