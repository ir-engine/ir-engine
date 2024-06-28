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

import assert from 'assert'
import { LoadingManager } from 'three'

import { createEntity, destroyEngine } from '@etherealengine/ecs'
import { createEngine } from '@etherealengine/ecs/src/Engine'
import { getState } from '@etherealengine/hyperflux'
import { ResourceState, ResourceType } from '@etherealengine/spatial/src/resources/ResourceState'

import { loadEmptyScene } from '../../../tests/util/loadEmptyScene'
import { loadResource } from '../functions/resourceLoaderFunctions'
import { ResourceLoadingManager } from '../loaders/base/ResourceLoadingManager'
import { GLTF } from '../loaders/gltf/GLTFLoader'
import { setDefaultLoadingManager } from './ResourceLoadingManagerState'

describe('ResourceLoadingManager', () => {
  const url = '/packages/projects/default-project/assets/collisioncube.glb'

  beforeEach(async () => {
    createEngine()
    loadEmptyScene()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('Calls loading manager', (done) => {
    const entity = createEntity()
    const resourceState = getState(ResourceState)
    const controller = new AbortController()
    assert.doesNotThrow(() => {
      setDefaultLoadingManager(
        new ResourceLoadingManager((startUrl) => {
          assert(startUrl === url)
          assert(resourceState.resources[url] !== undefined, 'Asset not added to resource manager')
          done()
          setDefaultLoadingManager()
        }) as LoadingManager
      )

      loadResource<GLTF>(
        url,
        ResourceType.GLTF,
        entity,
        (response) => {},
        (resquest) => {},
        (error) => {
          assert(false)
        },
        controller.signal
      )
    }, done)
  })
})
