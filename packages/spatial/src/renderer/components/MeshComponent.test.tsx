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

import { BoxGeometry, Color, LineBasicMaterial, MeshBasicMaterial, SphereGeometry } from 'three'

import { hasComponent } from '@etherealengine/ecs'
import { destroyEngine } from '@etherealengine/ecs/src/Engine'
import { createEntity, removeEntity } from '@etherealengine/ecs/src/EntityFunctions'
import { ResourceState } from '@etherealengine/engine/src/assets/state/ResourceState'
import { getState } from '@etherealengine/hyperflux'
import { act, render, renderHook } from '@testing-library/react'
import assert from 'assert'
import React, { useEffect } from 'react'
import sinon from 'sinon'
import { createEngine } from '../../initializeEngine'
import { MeshComponent, useMeshComponent } from './MeshComponent'

describe('MeshComponent', () => {
  beforeEach(async () => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('useMeshComponent hook creates component correctly', (done) => {
    const entity = createEntity()
    const geometry = new BoxGeometry(1, 1, 1)
    const material = new MeshBasicMaterial({ color: 0xffff00 })

    const { result } = renderHook(() => useMeshComponent(entity, geometry, material))

    assert(hasComponent(entity, MeshComponent))
    done()
  })

  it('useMeshComponent disposes resources correctly', (done) => {
    const entity = createEntity()
    const geometry = new BoxGeometry(1, 1, 1)
    const material = new MeshBasicMaterial({ color: 0xffff00 })

    const spy = sinon.spy()
    geometry.dispose = spy
    material.dispose = spy

    const Reactor = () => {
      const [mesh] = useMeshComponent(entity, geometry, material)
      return <></>
    }

    const { rerender, unmount } = render(<Reactor />)

    const resourceState = getState(ResourceState)

    act(async () => {
      assert(hasComponent(entity, MeshComponent))
      assert(resourceState.resources[geometry.uuid])
      assert(resourceState.resources[material.uuid])
      unmount()
    }).then(() => {
      assert(!hasComponent(entity, MeshComponent))
      assert(!resourceState.resources[geometry.uuid])
      assert(!resourceState.resources[material.uuid])
      sinon.assert.calledTwice(spy)
      removeEntity(entity)
      done()
    })
  })

  it('useMeshComponent updates geometry correctly', (done) => {
    const entity = createEntity()
    const geometry = new BoxGeometry(1, 1, 1)
    const geometry2 = new SphereGeometry(0.5)
    const material = new MeshBasicMaterial({ color: 0xffff00 })

    const geoUUID = geometry.uuid

    let renders = -1

    const resourceState = getState(ResourceState)
    const { result } = renderHook(() => {
      const [mesh, geoState, _] = useMeshComponent<BoxGeometry | SphereGeometry>(entity, geometry, material)
      renders += 1

      useEffect(() => {
        if (renders == 0) {
          assert(geoState.value)
          assert(resourceState.resources[geoUUID].asset)
          assert(resourceState.resources[geoUUID].references.length == 1)
          assert((resourceState.resources[geoUUID].asset as BoxGeometry).type === 'BoxGeometry')
          assert(mesh.geometry.type === 'BoxGeometry')
          geoState.set(geometry2)
        } else if (renders == 1) {
          assert(geoState.value)
          assert(resourceState.resources[geoUUID].asset)
          assert(resourceState.resources[geoUUID].references.length == 1)
          assert((resourceState.resources[geoUUID].asset as SphereGeometry).type === 'SphereGeometry')
          assert(mesh.geometry.type === 'SphereGeometry')
          done()
        }
      }, [geoState])

      return <></>
    })
  })

  it('useMeshComponent updates material correctly', (done) => {
    const entity = createEntity()
    const geometry = new BoxGeometry(1, 1, 1)
    const material = new MeshBasicMaterial({ color: 0xdadada })
    const material2 = new LineBasicMaterial({ color: 0xffff00 })

    const matUUID = material.uuid

    let renders = -1

    const { result } = renderHook(() => {
      const resourceState = getState(ResourceState)
      const [mesh, _, matState] = useMeshComponent<BoxGeometry, MeshBasicMaterial | LineBasicMaterial>(
        entity,
        geometry,
        material
      )
      renders += 1

      useEffect(() => {
        if (renders == 0) {
          assert(mesh)
          assert(resourceState.resources[mesh.uuid])
        } else {
          assert(false)
        }
      }, [mesh])

      useEffect(() => {
        if (renders == 0) {
          assert(matState.value)
          assert(resourceState.resources[matUUID].asset)
          assert(resourceState.resources[matUUID].references.length == 1)
          assert((resourceState.resources[matUUID].asset as MeshBasicMaterial).type === 'MeshBasicMaterial')
          assert((resourceState.resources[matUUID].asset as LineBasicMaterial).color.getHex() === 0xdadada)
          assert(mesh.material.type === 'MeshBasicMaterial')
          assert(mesh.material.color.getHex() === 0xdadada)
          matState.set(material2)
        } else if (renders == 1) {
          assert(matState.value)
          assert(resourceState.resources[matUUID].asset)
          assert(resourceState.resources[matUUID].references.length == 1)
          assert((resourceState.resources[matUUID].asset as LineBasicMaterial).type === 'LineBasicMaterial')
          assert((resourceState.resources[matUUID].asset as LineBasicMaterial).color.getHex() === 0xffff00)
          assert(mesh.material.type === 'LineBasicMaterial')
          assert(mesh.material.color.getHex() === 0xffff00)

          matState.color.set(new Color(0x000000))
        } else if (renders == 2) {
          assert((resourceState.resources[matUUID].asset as LineBasicMaterial).color.getHex() === 0x000000)
          assert(mesh.material.type === 'LineBasicMaterial')
          assert(mesh.material.color.getHex() === 0x000000)
          done()
        }
      }, [matState])

      return <></>
    })
  })
})
