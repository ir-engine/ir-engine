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
import assert from 'assert'
import { Cache, LoadingManager } from 'three'
import { DoneCallback, afterEach, beforeEach, describe, it } from 'vitest'

import { createEntity, destroyEngine } from '@ir-engine/ecs'
import { createEngine } from '@ir-engine/ecs/src/Engine'
import { getState } from '@ir-engine/hyperflux'
import { ResourceState, ResourceType } from '@ir-engine/spatial/src/resources/ResourceState'

import { loadEmptyScene } from '../../../tests/util/loadEmptyScene'
import { loadResource } from '../functions/resourceLoaderFunctions'
import { ResourceLoadingManager } from '../loaders/base/ResourceLoadingManager'
import { GLTF as THREE_GLTF } from '../loaders/gltf/GLTFLoader'
import { setDefaultLoadingManager } from './ResourceLoadingManagerState'

const gltf: GLTF.IGLTF = {
  asset: {
    version: '2.0'
  },
  scenes: [{ nodes: [] }],
  scene: 0,
  nodes: []
}

const url = '/packages/projects/default-project/assets/collisioncube.gltf'

describe('ResourceLoadingManager', () => {
  beforeEach(async () => {
    createEngine()
    loadEmptyScene()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('Calls loading manager', () =>
    new Promise((done: DoneCallback) => {
      const entity = createEntity()
      const resourceState = getState(ResourceState)
      const controller = new AbortController()

      assert.doesNotThrow(() => {
        Cache.add(url, gltf)
        setDefaultLoadingManager(
          new ResourceLoadingManager((startUrl) => {
            assert(startUrl === url)
            assert(resourceState.resources[url] !== undefined, 'Asset not added to resource manager')
            setDefaultLoadingManager()
          }) as LoadingManager
        )

        loadResource<THREE_GLTF>(
          url,
          ResourceType.GLTF,
          entity,
          (response) => {
            done()
          },
          (resquest) => {},
          (error) => {
            assert(false)
          },
          controller.signal
        )
      }, done)
    }))
})
