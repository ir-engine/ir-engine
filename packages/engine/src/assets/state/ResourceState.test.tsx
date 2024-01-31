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

import { createEntity, destroyEngine } from '@etherealengine/ecs'
import { getState } from '@etherealengine/hyperflux'
import { createEngine } from '@etherealengine/spatial/src/initializeEngine'
import { LoadingManager } from 'three'
import { loadEmptyScene } from '../../../tests/util/loadEmptyScene'
import { ResourceLoadingManager } from '../loaders/base/ResourceLoadingManager'
import { GLTF } from '../loaders/gltf/GLTFLoader'
import { ResourceManager, ResourceState, ResourceStatus, ResourceType } from './ResourceState'

describe('ResourceState', () => {
  const url = '/packages/projects/default-project/assets/collisioncube.glb'

  beforeEach(async () => {
    createEngine()
    loadEmptyScene()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('Errors when resource is missing', (done) => {
    const entity = createEntity()
    const resourceState = getState(ResourceState)
    const controller = new AbortController()
    const nonExistingUrl = '/doesNotExist.glb'
    assert.doesNotThrow(() => {
      ResourceManager.load(
        nonExistingUrl,
        ResourceType.GLTF,
        entity,
        {},
        (response) => {
          assert(false)
        },
        (resquest) => {
          assert(false)
        },
        (error) => {
          assert(resourceState.resources[nonExistingUrl].status === ResourceStatus.Error)
          done()
        },
        controller.signal
      )
    }, done)
  })

  it('Loads asset', (done) => {
    const entity = createEntity()
    const resourceState = getState(ResourceState)
    const controller = new AbortController()
    assert.doesNotThrow(() => {
      ResourceManager.load<GLTF>(
        url,
        ResourceType.GLTF,
        entity,
        {},
        (response) => {
          assert(response.asset)
          assert(resourceState.resources[url].status === ResourceStatus.Loaded, 'Asset not loaded')

          done()
        },
        (resquest) => {},
        (error) => {
          assert(false)
        },
        controller.signal
      )
    }, done)
  })

  it('Removes asset', (done) => {
    const entity = createEntity()
    const resourceState = getState(ResourceState)
    const controller = new AbortController()
    assert.doesNotThrow(() => {
      ResourceManager.load<GLTF>(
        url,
        ResourceType.GLTF,
        entity,
        {},
        (response) => {
          ResourceManager.unload(url, entity)
          assert(resourceState.resources[url] === undefined, 'Asset not removed')

          done()
        },
        (resquest) => {},
        (error) => {
          assert(false)
        },
        controller.signal
      )
    }, done)
  })

  it('Loads asset once, but references twice', (done) => {
    const entity = createEntity()
    const entity2 = createEntity()
    const resourceState = getState(ResourceState)
    const controller = new AbortController()
    assert.doesNotThrow(() => {
      ResourceManager.load<GLTF>(
        url,
        ResourceType.GLTF,
        entity,
        {},
        (response) => {
          assert(resourceState.resources[url].references.length === 1, 'References not counted')
          assert(resourceState.resources[url].references.indexOf(entity) !== -1, 'Entity not referenced')

          ResourceManager.load<GLTF>(
            url,
            ResourceType.GLTF,
            entity2,
            {},
            (response) => {
              assert(response.asset)
              assert(resourceState.resources[url].references.length === 2, 'References not counted')
              assert(resourceState.resources[url].references.indexOf(entity) !== -1, 'Entity not referenced')
              assert(resourceState.resources[url].references.indexOf(entity) !== -1, 'Entity2 not referenced')
              ResourceManager.unload(url, entity)

              assert(resourceState.resources[url].references.length.valueOf() === 1, 'Entity reference not removed')
              assert(resourceState.resources[url].references.indexOf(entity) === -1)

              ResourceManager.unload(url, entity2)
              assert(resourceState.resources[url] === undefined, 'Asset not removed')

              done()
            },
            (resquest) => {},
            (error) => {
              assert(false)
            },
            controller.signal
          )
        },
        (resquest) => {},
        (error) => {
          assert(false)
        },
        controller.signal
      )
    }, done)
  })

  it('Counts references when entity is the same', (done) => {
    const entity = createEntity()
    const resourceState = getState(ResourceState)
    const controller = new AbortController()
    assert.doesNotThrow(() => {
      ResourceManager.load<GLTF>(
        url,
        ResourceType.GLTF,
        entity,
        {},
        (response) => {
          assert(resourceState.resources[url].references.length === 1, 'References not counted')
          assert(resourceState.resources[url].references.indexOf(entity) !== -1, 'Entity not referenced')

          ResourceManager.load<GLTF>(
            url,
            ResourceType.GLTF,
            entity,
            {},
            (response) => {
              assert(resourceState.resources[url].references.length === 2, 'References not counted')
              assert(resourceState.resources[url].references.indexOf(entity) !== -1, 'Entity not referenced')
              ResourceManager.unload(url, entity)

              assert(resourceState.resources[url].references.length.valueOf() === 1, 'Entity reference not removed')
              assert(resourceState.resources[url].references.indexOf(entity) !== -1)

              ResourceManager.unload(url, entity)
              assert(resourceState.resources[url] === undefined, 'Asset not removed')

              done()
            },
            (resquest) => {},
            (error) => {
              assert(false)
            },
            controller.signal
          )
        },
        (resquest) => {},
        (error) => {
          assert(false)
        },
        controller.signal
      )
    }, done)
  })

  it('Calls loading manager', (done) => {
    const entity = createEntity()
    const resourceState = getState(ResourceState)
    const controller = new AbortController()
    assert.doesNotThrow(() => {
      ResourceManager.setDefaultLoadingManager(
        new ResourceLoadingManager((startUrl) => {
          assert(startUrl === url)
          assert(resourceState.resources[url] !== undefined, 'Asset not added to resource manager')
          done()
          ResourceManager.setDefaultLoadingManager()
        }) as LoadingManager
      )

      ResourceManager.load<GLTF>(
        url,
        ResourceType.GLTF,
        entity,
        {},
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
