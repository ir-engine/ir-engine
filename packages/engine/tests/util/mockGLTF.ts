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

import { GLTF } from '@gltf-transform/core'
import { UndefinedEntity } from '@ir-engine/ecs'
import { LoadingManager } from 'three'
import { DependencyCache, GLTFParserOptions } from '../../src/gltf/GLTFLoaderFunctions'
import { SourceID } from '../../src/scene/components/SourceComponent'

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
