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

import { act, render, renderHook } from '@testing-library/react'
import assert from 'assert'
import React, { useEffect } from 'react'
import { DoneCallback, afterEach, beforeEach, describe, it } from 'vitest'

import { createEntity, destroyEngine } from '@ir-engine/ecs'
import { createEngine } from '@ir-engine/ecs/src/Engine'
import { getState, useHookstate } from '@ir-engine/hyperflux'
import { ResourceState } from '@ir-engine/spatial/src/resources/ResourceState'

import { loadEmptyScene } from '../../../tests/util/loadEmptyScene'
import { overrideFileLoaderLoad, overrideTextureLoaderLoad } from '../../../tests/util/loadGLTFAssetNode'
import { useTexture } from './resourceLoaderHooks'

describe('ResourceLoaderHooks', () => {
  // const gltfURL = '/packages/projects/default-project/assets/collisioncube.glb'
  // const gltfURL2 = '/packages/projects/default-project/assets/portal_frame.glb'
  const texURL = '/packages/projects/default-project/assets/drop-shadow.png'
  const texURL2 = '/packages/projects/default-project/assets/galaxyTexture.jpg'

  overrideFileLoaderLoad()
  overrideTextureLoaderLoad()

  beforeEach(async () => {
    createEngine()
    loadEmptyScene()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('Renders hook', () =>
    new Promise((done: DoneCallback) => {
      const entity = createEntity()

      const { result } = renderHook(() => {
        const [tex, error] = useTexture(texURL, entity)
        useEffect(() => {
          assert(!error)
          assert(tex)
          done()
        }, [tex])

        return <></>
      })
    }))

  it('Loads Texture file', () =>
    new Promise((done: DoneCallback) => {
      const entity = createEntity()

      const Reactor = () => {
        const [texture, error] = useTexture(texURL, entity)

        useEffect(() => {
          assert(!error)
          const resourceState = getState(ResourceState)
          assert(resourceState.resources[texURL])
          assert(resourceState.resources[texURL].references.includes(entity))
        }, [texture, error])

        return <></>
      }

      const { rerender, unmount } = render(<Reactor />)

      act(async () => {
        rerender(<Reactor />)
      }).then(() => {
        unmount()
        done()
      })
    }))

  it('Unloads asset when component is unmounted', () =>
    new Promise((done: DoneCallback) => {
      const entity = createEntity()

      const Reactor = () => {
        const [_] = useTexture(texURL, entity)

        return <></>
      }

      const { rerender, unmount } = render(<Reactor />)

      act(async () => {
        rerender(<Reactor />)
      }).then(() => {
        unmount()
        const resourceState = getState(ResourceState)
        assert(!resourceState.resources[texURL])
        done()
      })
    }))

  it('Asset changes are reactive', () =>
    new Promise((done: DoneCallback) => {
      const entity = createEntity()

      let updatedCount = 0
      let lastID = 0
      const { result } = renderHook(() => {
        const url = useHookstate(texURL)
        const [texture, error] = useTexture(url.value, entity)
        useEffect(() => {
          assert(!error)
          if (updatedCount == 0) {
            assert(texture)
            lastID = texture.id
            url.set(texURL2)
          } else if (updatedCount == 1) {
            assert(texture)
            assert(texture.id !== lastID)
            done()
          }

          updatedCount += 1
        }, [texture])

        return <></>
      })
    }))

  it('Errors correctly', () =>
    new Promise((done: DoneCallback) => {
      const entity = createEntity()
      const nonExistingUrl = '/doesNotExist.png'

      const Reactor = () => {
        const [tex, error] = useTexture(nonExistingUrl, entity)

        useEffect(() => {
          assert(error)
          assert(!tex)
        }, [tex, error])

        return <></>
      }

      const { rerender, unmount } = render(<Reactor />)

      act(async () => {
        rerender(<Reactor />)
      }).then(() => {
        unmount()
        done()
      })
    }))

  it('Unloads asset when source is changed', () =>
    new Promise((done: DoneCallback) => {
      const entity = createEntity()
      let src = texURL

      const Reactor = () => {
        const [tex, error] = useTexture(src, entity)

        useEffect(() => {
          assert(!error)

          const resourceState = getState(ResourceState)
          if (src === texURL && tex) {
            assert(resourceState.resources[texURL])
            assert(resourceState.resources[texURL].references.includes(entity))
            assert(!resourceState.resources[texURL2])
          } else if (src === texURL2 && tex) {
            assert(resourceState.resources[texURL2])
            assert(resourceState.resources[texURL2].references.includes(entity))
            assert(!resourceState.resources[texURL])
          }
        }, [tex, error])

        return <></>
      }

      const { rerender, unmount } = render(<Reactor />)

      act(async () => {
        rerender(<Reactor />)
      }).then(() => {
        act(async () => {
          src = texURL2
          rerender(<Reactor />)
        }).then(() => {
          unmount()
          done()
        })
      })
    }))

  it('Calls loadResource synchronously', () =>
    new Promise(async (done: DoneCallback) => {
      const resourceState = getState(ResourceState)
      const entity = createEntity()
      // use renderHook to render the hook
      const { unmount } = renderHook(() => {
        // call the useTexture hook
        useTexture(texURL, entity)
      })
      // ensure that the loadResource function is synchronously called when the hook is rendered
      assert(resourceState.resources[texURL])
      unmount()
      await act(() => render(<></>))
      done()
    }))
})
