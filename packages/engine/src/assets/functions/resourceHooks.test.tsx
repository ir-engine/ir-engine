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
import { act, render } from '@testing-library/react'
import React, { useEffect } from 'react'
import sinon from 'sinon'
import { AmbientLight, DirectionalLight } from 'three'
import { loadEmptyScene } from '../../../tests/util/loadEmptyScene'
import { ResourceState } from '../state/ResourceState'
import { useGLTF, useObj, useResource, useTexture } from './resourceHooks'

describe('ResourceHooks', () => {
  const gltfURL = '/packages/projects/default-project/assets/collisioncube.glb'
  const gltfURL2 = '/packages/projects/default-project/assets/portal_frame.glb'
  const texURL = '/packages/projects/default-project/assets/drop-shadow.png'

  beforeEach(async () => {
    createEngine()
    loadEmptyScene()
  })

  afterEach(() => {
    return destroyEngine()
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

  it('Loads an Object3D correctly', (done) => {
    const entity = createEntity()

    let objUUID = undefined as undefined | string
    const Reactor = () => {
      const [light] = useObj<DirectionalLight, typeof DirectionalLight>(DirectionalLight, entity)
      objUUID = light.uuid

      useEffect(() => {
        assert(light.isDirectionalLight)
      }, [])

      return <></>
    }

    const { rerender, unmount } = render(<Reactor />)

    act(async () => {
      rerender(<Reactor />)
    }).then(() => {
      const resourceState = getState(ResourceState)
      assert(objUUID && resourceState.resources[objUUID])
      unmount()
      assert(!resourceState.resources[objUUID])
      done()
    })
  })

  it('Unloads an Object3D correctly', (done) => {
    const entity = createEntity()

    let objUUID = undefined as undefined | string
    const Reactor = () => {
      const [light, unload] = useObj(DirectionalLight, entity)
      objUUID = light.uuid

      useEffect(() => {
        unload()
      }, [])

      return <></>
    }

    const { rerender, unmount } = render(<Reactor />)

    act(async () => {
      rerender(<Reactor />)
    }).then(() => {
      const resourceState = getState(ResourceState)
      assert(objUUID && !resourceState.resources[objUUID])
      unmount()
      done()
    })
  })

  it('Updates an Object3D correctly', (done) => {
    const entity = createEntity()

    const light1 = DirectionalLight
    const light2 = AmbientLight

    let lightClass = light1 as any
    let lightObj: any = undefined

    const Reactor = () => {
      const [light] = useObj(lightClass, entity)

      useEffect(() => {
        lightObj = light
      }, [light])

      return <></>
    }

    const { rerender, unmount } = render(<Reactor />)

    act(async () => {
      assert(lightObj.isDirectionalLight)
      lightClass = light2
      rerender(<Reactor />)
    }).then(() => {
      assert(lightObj.isAmbientLight)
      unmount()
      done()
    })
  })

  it('Can track any asset', (done) => {
    const entity = createEntity()

    const spy = sinon.spy()

    const resourceObj = {
      data: new ArrayBuffer(128),
      dispose: function () {
        spy()
        this.data = null
      }
    }

    const Reactor = () => {
      useResource(resourceObj, entity)
      return <></>
    }

    const { rerender, unmount } = render(<Reactor />)

    act(async () => {
      rerender(<Reactor />)
    }).then(() => {
      unmount()
      sinon.assert.calledOnce(spy)
      assert(!resourceObj.data)
      done()
    })
  })

  it('Can track any asset tied to an id', (done) => {
    const entity = createEntity()

    const spy = sinon.spy()

    const id = '3456345623216'

    const resourceObj = {
      data: new ArrayBuffer(128),
      dispose: function () {
        spy()
        this.data = null
      }
    }

    const Reactor = () => {
      useResource(resourceObj, entity, id)
      return <></>
    }

    const { rerender, unmount } = render(<Reactor />)

    act(async () => {
      rerender(<Reactor />)
    }).then(() => {
      const resourceState = getState(ResourceState)
      assert(resourceState.resources[id])
      unmount()
      sinon.assert.calledOnce(spy)
      assert(!resourceObj.data)
      assert(!resourceState.resources[id])
      done()
    })
  })

  it('Can unload any asset tied to an id', (done) => {
    const entity = createEntity()

    const spy = sinon.spy()

    const id = '3456345623215'

    const resourceObj = {
      data: new ArrayBuffer(128),
      dispose: function () {
        spy()
        this.data = null
      }
    }

    const Reactor = () => {
      const [resource, unload] = useResource(resourceObj, entity, id)

      useEffect(() => {
        unload()
      }, [])

      return <></>
    }

    const { rerender, unmount } = render(<Reactor />)

    act(async () => {
      rerender(<Reactor />)
    }).then(() => {
      const resourceState = getState(ResourceState)
      sinon.assert.calledOnce(spy)
      assert(!resourceObj.data)
      assert(!resourceState.resources[id])
      unmount()
      done()
    })
  })

  it('Can track any asset and callback when unloaded', (done) => {
    const entity = createEntity()

    const spy = sinon.spy()

    const resourceObj = {
      data: new ArrayBuffer(128),
      onUnload: function () {
        spy()
        this.data = null
      }
    }

    const Reactor = () => {
      useResource(resourceObj, entity, undefined, () => {
        resourceObj.onUnload()
      })
      return <></>
    }

    const { rerender, unmount } = render(<Reactor />)

    act(async () => {
      rerender(<Reactor />)
    }).then(() => {
      unmount()
      sinon.assert.calledOnce(spy)
      assert(!resourceObj.data)
      done()
    })
  })

  it('Can update any asset correctly', (done) => {
    const entity = createEntity()

    const spy = sinon.spy()

    const onUnload = () => {
      spy()
    }

    let resource = new DirectionalLight() as any
    let resourceObj = undefined as any

    const Reactor = () => {
      const [res] = useResource(resource, entity, undefined, onUnload)

      useEffect(() => {
        resourceObj = res
      }, [res])
      return <></>
    }

    const { rerender, unmount } = render(<Reactor />)

    act(async () => {
      assert(resourceObj.isDirectionalLight)
      resource = new AmbientLight()
      rerender(<Reactor />)
    }).then(() => {
      assert(resourceObj.isAmbientLight)
      sinon.assert.calledOnce(spy)
      unmount()
      done()
    })
  })
})
