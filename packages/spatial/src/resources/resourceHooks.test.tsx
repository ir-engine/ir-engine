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
import { DoneCallback, afterEach, beforeEach, describe, it } from 'vitest'

import { createEntity, destroyEngine } from '@ir-engine/ecs'
import { createEngine } from '@ir-engine/ecs/src/Engine'

import { AmbientLight, DirectionalLight } from 'three'
import { useResource } from './resourceHooks'

describe('ResourceHooks', () => {
  beforeEach(async () => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

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

  it('Updates an any asset', () =>
    new Promise((done: DoneCallback) => {
      const entity = createEntity()

      const spy = sinon.spy()
      const spy2 = sinon.spy()

      const light1 = new DirectionalLight()
      const light2 = new AmbientLight()

      light1.dispose = spy
      light2.dispose = spy2

      let lightObj: any = undefined
      let lightObj2: any = undefined

      const Reactor = () => {
        const [light] = useResource(() => light1 as DirectionalLight | AmbientLight, entity)

        useEffect(() => {
          lightObj = light.value
          light.set(light2)
          lightObj2 = light.value
        }, [])

        return <></>
      }

      const { rerender, unmount } = render(<Reactor />)
      assert(lightObj.isDirectionalLight)
      assert(lightObj2.isAmbientLight)
      assert(spy.calledOnce)
      assert(!spy2.called)
      unmount()
      done()
    }))
})
