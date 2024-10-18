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

import assert from 'assert'
import { DoneCallback, afterEach, beforeEach, describe, it } from 'vitest'

import { createEntity, destroyEngine } from '@ir-engine/ecs'
import { createEngine } from '@ir-engine/ecs/src/Engine'
import { getState } from '@ir-engine/hyperflux'
import {
  ResourceManager,
  ResourceState,
  ResourceStatus,
  ResourceType
} from '@ir-engine/spatial/src/resources/ResourceState'

import Sinon from 'sinon'
import { loadEmptyScene } from '../../../tests/util/loadEmptyScene'
import { overrideFileLoaderLoad } from '../../../tests/util/loadGLTFAssetNode'
import { Loader } from '../loaders/base/Loader'
import { GLTF } from '../loaders/gltf/GLTFLoader'
import { loadResource } from './resourceLoaderFunctions'

describe('resourceLoaderFunctions', () => {
  const url = '/packages/projects/default-project/assets/collisioncube.glb'

  overrideFileLoaderLoad()

  beforeEach(async () => {
    createEngine()
    loadEmptyScene()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('Errors when resource is missing', () =>
    new Promise((done: DoneCallback) => {
      const entity = createEntity()
      const resourceState = getState(ResourceState)
      const controller = new AbortController()
      const nonExistingUrl = '/doesNotExist.glb'
      assert.doesNotThrow(() => {
        loadResource(
          nonExistingUrl,
          ResourceType.GLTF,
          entity,
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
    }))

  it('Loads asset', () =>
    new Promise((done: DoneCallback) => {
      const entity = createEntity()
      const resourceState = getState(ResourceState)
      const controller = new AbortController()
      assert.doesNotThrow(() => {
        loadResource<GLTF>(
          url,
          ResourceType.GLTF,
          entity,
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
    }))

  it('Removes asset', () =>
    new Promise((done: DoneCallback) => {
      const entity = createEntity()
      const resourceState = getState(ResourceState)
      const controller = new AbortController()
      assert.doesNotThrow(() => {
        loadResource<GLTF>(
          url,
          ResourceType.GLTF,
          entity,
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
    }))

  it('Loads asset once, but references twice', () =>
    new Promise((done: DoneCallback) => {
      const entity = createEntity()
      const entity2 = createEntity()
      const resourceState = getState(ResourceState)
      const controller = new AbortController()
      assert.doesNotThrow(() => {
        loadResource<GLTF>(
          url,
          ResourceType.GLTF,
          entity,
          (response) => {
            assert(resourceState.resources[url].references.length === 1, 'References not counted')
            assert(resourceState.resources[url].references.indexOf(entity) !== -1, 'Entity not referenced')

            loadResource<GLTF>(
              url,
              ResourceType.GLTF,
              entity2,
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
    }))

  it('Counts references when entity is the same', () =>
    new Promise((done: DoneCallback) => {
      const entity = createEntity()
      const resourceState = getState(ResourceState)
      const controller = new AbortController()
      assert.doesNotThrow(() => {
        loadResource<GLTF>(
          url,
          ResourceType.GLTF,
          entity,
          (response) => {
            assert(resourceState.resources[url].references.length === 1, 'References not counted')
            assert(resourceState.resources[url].references.indexOf(entity) !== -1, 'Entity not referenced')

            loadResource<GLTF>(
              url,
              ResourceType.GLTF,
              entity,
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
    }))

  it('Can load the same asset sequentially', () =>
    new Promise((done: DoneCallback) => {
      const entity = createEntity()
      const entity2 = createEntity()
      const resourceState = getState(ResourceState)
      const controller1 = new AbortController()
      const controller2 = new AbortController()
      let oneDone = false
      assert.doesNotThrow(() => {
        loadResource<GLTF>(
          url,
          ResourceType.GLTF,
          entity,
          (response) => {
            assert(resourceState.resources[url] !== undefined, 'Asset not found')
            ResourceManager.unload(url, entity)
            if (oneDone) done()
            else oneDone = true
          },
          (resquest) => {},
          (error) => {
            assert(false)
          },
          controller1.signal
        )
        loadResource<GLTF>(
          url,
          ResourceType.GLTF,
          entity2,
          (response) => {
            assert(resourceState.resources[url] !== undefined, 'Asset not found')
            ResourceManager.unload(url, entity2)
            if (oneDone) done()
            else oneDone = true
          },
          (resquest) => {},
          (error) => {
            assert(false)
          },
          controller2.signal
        )
      }, done)
    }))

  it('Tracks assets referenced by GLTFs', () =>
    new Promise((done: DoneCallback) => {
      const entity = createEntity()
      const resourceState = getState(ResourceState)
      const controller = new AbortController()
      assert.doesNotThrow(() => {
        loadResource(
          url,
          ResourceType.GLTF,
          entity,
          (response) => {
            assert(resourceState.resources[url])
            assert(resourceState.resources[url].assetRefs?.Mesh.length === 2)
            const referencedMeshes = resourceState.resources[url].assetRefs.Mesh
            for (const refMesh of referencedMeshes) assert(resourceState.resources[refMesh])
            ResourceManager.unload(url, entity)
            assert(!resourceState.resources[url])
            done()
          },
          (resquest) => {
            assert(false)
          },
          (error) => {
            assert(false)
          },
          controller.signal
        )
      }, done)
    }))

  it('Will use the passed in loader', () => {
    const entity = createEntity()
    const resourceState = getState(ResourceState)

    const loader = {
      load: (
        url: string,
        onLoad: (data: any) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (err: unknown) => void,
        signal?: AbortSignal
      ) => {
        onLoad(url)
      }
    } as Loader

    const spy = Sinon.spy()

    const controller = new AbortController()
    loadResource(
      url,
      ResourceType.GLTF,
      entity,
      spy,
      (resquest) => {
        assert(false)
      },
      (error) => {
        assert(false)
      },
      controller.signal,
      loader
    )

    assert(spy.calledOnce)
  })
})
