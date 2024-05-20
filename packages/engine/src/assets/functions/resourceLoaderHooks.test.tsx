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

import { act, render, renderHook } from '@testing-library/react'
import assert from 'assert'
import React, { useEffect } from 'react'

import { createEntity, destroyEngine } from '@etherealengine/ecs'
import { getState, useHookstate } from '@etherealengine/hyperflux'
import { createEngine } from '@etherealengine/spatial/src/initializeEngine'
import { ResourceState } from '@etherealengine/spatial/src/resources/ResourceState'

import { loadEmptyScene } from '../../../tests/util/loadEmptyScene'
import { overrideFileLoaderLoad } from '../../../tests/util/loadGLTFAssetNode'
import { useGLTF, useTexture } from './resourceLoaderHooks'

describe('ResourceLoaderHooks', () => {
  const gltfURL = '/packages/projects/default-project/assets/collisioncube.glb'
  const gltfURL2 = '/packages/projects/default-project/assets/portal_frame.glb'
  const texURL = '/packages/projects/default-project/assets/drop-shadow.png'

  overrideFileLoaderLoad()

  beforeEach(async () => {
    createEngine()
    loadEmptyScene()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('Renders hook', (done) => {
    const entity = createEntity()

    let gltfRender = 0

    const { result } = renderHook(() => {
      const [gltf, error] = useGLTF(gltfURL, entity)
      useEffect(() => {
        assert(!error)
        if (gltfRender > 0) {
          assert(gltf)
          done()
        }
        gltfRender += 1
      }, [gltf])

      return <></>
    })
  })

  it('Loads GLTF file', (done) => {
    const entity = createEntity()

    const Reactor = () => {
      const [gltf, error] = useGLTF(gltfURL, entity)

      useEffect(() => {
        assert(!error)
        if (gltf) {
          const resourceState = getState(ResourceState)
          assert(resourceState.resources[gltfURL])
          assert(resourceState.resources[gltfURL].references.includes(entity))
        }
      }, [gltf, error])

      return <></>
    }

    const { rerender, unmount } = render(<Reactor />)

    act(async () => {
      rerender(<Reactor />)
    }).then(() => {
      unmount()
      done()
    })
  })

  it('Loads Texture file', (done) => {
    const entity = createEntity()

    const Reactor = () => {
      const [texture, error] = useTexture(texURL, entity)

      useEffect(() => {
        assert(!error)
        if (texture) {
          const resourceState = getState(ResourceState)
          assert(resourceState.resources[texURL])
          assert(resourceState.resources[texURL].references.includes(entity))
        }
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
  })

  it('Unloads asset when component is unmounted', (done) => {
    const entity = createEntity()

    const Reactor = () => {
      const [_] = useGLTF(gltfURL, entity)

      return <></>
    }

    const { rerender, unmount } = render(<Reactor />)

    act(async () => {
      rerender(<Reactor />)
    }).then(() => {
      unmount()
      const resourceState = getState(ResourceState)
      assert(!resourceState.resources[gltfURL])
      done()
    })
  })

  it('Asset changes are reactive', (done) => {
    const entity = createEntity()

    let updatedCount = 0
    let lastID = 0
    const { result } = renderHook(() => {
      const url = useHookstate(gltfURL)
      const [gltf, error] = useGLTF(url.value, entity)
      useEffect(() => {
        assert(!error)
        if (updatedCount == 0) {
          assert(!gltf)
        } else if (updatedCount == 1) {
          assert(gltf)
          lastID = gltf.scene.id
          url.set(gltfURL2)
        } else if (updatedCount >= 2 && gltf) {
          assert(gltf.scene.id !== lastID)
          done()
        }
        updatedCount += 1
      }, [gltf])

      return <></>
    })
  })

  it('Errors correctly', (done) => {
    const entity = createEntity()
    const nonExistingUrl = '/doesNotExist.glb'

    let err: ErrorEvent | Error | null = null

    const Reactor = () => {
      const [gltf, error] = useGLTF(nonExistingUrl, entity)

      useEffect(() => {
        err = error
        assert(!gltf)
      }, [gltf, error])

      return <></>
    }

    const { rerender, unmount } = render(<Reactor />)

    act(async () => {
      rerender(<Reactor />)
    }).then(() => {
      assert(err)
      unmount()
      done()
    })
  })

  it('Unloads asset when source is change', (done) => {
    const entity = createEntity()
    let src = gltfURL

    const Reactor = () => {
      const [gltf, error] = useGLTF(src, entity)

      useEffect(() => {
        assert(!error)

        const resourceState = getState(ResourceState)
        if (src === gltfURL && gltf) {
          console.log('Model One Loaded')
          assert(resourceState.resources[gltfURL])
          assert(resourceState.resources[gltfURL].references.includes(entity))
          assert(!resourceState.resources[gltfURL2])
        } else if (src === gltfURL2 && gltf) {
          console.log('Model Two Loaded')
          assert(resourceState.resources[gltfURL2])
          assert(resourceState.resources[gltfURL2].references.includes(entity))
          assert(!resourceState.resources[gltfURL])
        }
      }, [gltf, error])

      return <></>
    }

    const { rerender, unmount } = render(<Reactor />)

    act(async () => {
      rerender(<Reactor />)
    }).then(() => {
      act(async () => {
        src = gltfURL2
        rerender(<Reactor />)
      }).then(() => {
        unmount()
        done()
      })
    })
  })
})
