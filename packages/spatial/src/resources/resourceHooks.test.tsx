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

import '@hookstate/core'

import { act, render } from '@testing-library/react'
import assert from 'assert'
import React, { useEffect } from 'react'
import sinon from 'sinon'
import { AmbientLight, DirectionalLight } from 'three'
import { afterEach, beforeEach, describe, DoneCallback, it } from 'vitest'

import { createEntity, destroyEngine } from '@ir-engine/ecs'
import { createEngine } from '@ir-engine/ecs/src/Engine'
import { getState } from '@ir-engine/hyperflux'

import { useDisposable, useResource } from './resourceHooks'
import { ResourceState } from './ResourceState'

describe('ResourceHooks', () => {
  beforeEach(async () => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('Loads an Object3D correctly', () =>
    new Promise((done: DoneCallback) => {
      const entity = createEntity()

      let objUUID = undefined as undefined | string
      const Reactor = () => {
        const [light] = useDisposable(DirectionalLight, entity)
        objUUID = light.id.toString()

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
    }))

  it('Unloads an Object3D correctly', () =>
    new Promise((done: DoneCallback) => {
      const entity = createEntity()

      let objUUID = undefined as undefined | string
      const Reactor = () => {
        const [light, unload] = useDisposable(DirectionalLight, entity)
        objUUID = light.id.toString()

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
    }))

  it('Updates an Object3D correctly', () =>
    new Promise((done: DoneCallback) => {
      const entity = createEntity()

      const light1 = DirectionalLight
      const light2 = AmbientLight

      let lightClass = light1 as any
      let lightObj: any = undefined

      const Reactor = () => {
        const [light] = useDisposable(lightClass, entity)

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
    }))

  it('Can track any asset', () =>
    new Promise((done: DoneCallback) => {
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
    }))

  it('Can track any asset and callback when unloaded', () =>
    new Promise((done: DoneCallback) => {
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
        useResource(resourceObj, entity, () => {
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
    }))
})
