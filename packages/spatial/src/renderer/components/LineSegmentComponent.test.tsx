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

import { act, render } from '@testing-library/react'
import assert from 'assert'
import React, { useEffect } from 'react'
import sinon from 'sinon'
import { BoxGeometry, LineBasicMaterial, LineSegments, MeshBasicMaterial, SphereGeometry } from 'three'

import { getComponent, getMutableComponent, hasComponent, removeComponent, setComponent } from '@etherealengine/ecs'
import { destroyEngine } from '@etherealengine/ecs/src/Engine'
import { createEntity, removeEntity } from '@etherealengine/ecs/src/EntityFunctions'
import { getState } from '@etherealengine/hyperflux'

import { startEngine } from '@etherealengine/ecs/src/Engine'
import { ResourceState } from '../../resources/ResourceState'
import { ObjectLayerMasks, ObjectLayers } from '../constants/ObjectLayers'
import { GroupComponent } from './GroupComponent'
import { LineSegmentComponent } from './LineSegmentComponent'
import { ObjectLayerComponents, ObjectLayerMaskComponent } from './ObjectLayerComponent'

describe('LineSegmentComponent', () => {
  beforeEach(async () => {
    startEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('Creates LineSegmentComponent', (done) => {
    const entity = createEntity()
    const geometry = new BoxGeometry(1, 1, 1)
    const material = new MeshBasicMaterial({ color: 0xffff00 })

    const Reactor = () => {
      useEffect(() => {
        setComponent(entity, LineSegmentComponent, { geometry: geometry, material: material })
      }, [])

      return <></>
    }

    const { rerender, unmount } = render(<Reactor />)

    const resourceState = getState(ResourceState)

    act(async () => {
      assert(hasComponent(entity, LineSegmentComponent))
      assert(resourceState.resources[geometry.uuid])
      assert(resourceState.resources[material.uuid])
      removeEntity(entity)
      unmount()
    }).then(() => {
      assert(!hasComponent(entity, LineSegmentComponent))
      assert(!resourceState.resources[geometry.uuid])
      assert(!resourceState.resources[material.uuid])
      done()
    })
  })

  it('Updates LineSegmentComponent correctly', (done) => {
    const entity = createEntity()
    const geometry = new BoxGeometry(1, 1, 1)
    const material = new MeshBasicMaterial({ color: 0xffff00 })

    const spy = sinon.spy()
    geometry.dispose = spy
    material.dispose = spy

    const geoResourceID = geometry.uuid
    const matResourceID = material.uuid

    const geometry2 = new SphereGeometry(0.5)
    const material2 = new LineBasicMaterial()

    geometry2.dispose = spy
    material2.dispose = spy

    const Reactor = () => {
      useEffect(() => {
        setComponent(entity, LineSegmentComponent, { geometry: geometry, material: material })
      }, [])

      return <></>
    }

    const { rerender, unmount } = render(<Reactor />)

    const resourceState = getState(ResourceState)
    act(async () => {
      assert(hasComponent(entity, LineSegmentComponent))
      assert(resourceState.resources[geoResourceID])
      assert(
        resourceState.resources[geoResourceID].asset &&
          (resourceState.resources[geoResourceID].asset as BoxGeometry).type === 'BoxGeometry'
      )
      assert(resourceState.resources[matResourceID])
      assert(
        resourceState.resources[matResourceID].asset &&
          (resourceState.resources[matResourceID].asset as MeshBasicMaterial).type === 'MeshBasicMaterial'
      )
      const lineSegmentComponent = getMutableComponent(entity, LineSegmentComponent)
      lineSegmentComponent.geometry.set(geometry2)
      lineSegmentComponent.material.set(material2)
      rerender(<Reactor />)
    }).then(() => {
      sinon.assert.calledTwice(spy)
      assert(
        resourceState.resources[geoResourceID].asset &&
          (resourceState.resources[geoResourceID].asset as SphereGeometry).type === 'SphereGeometry'
      )
      assert(
        resourceState.resources[matResourceID].asset &&
          (resourceState.resources[matResourceID].asset as LineBasicMaterial).type === 'LineBasicMaterial'
      )
      removeEntity(entity)
      assert(!hasComponent(entity, LineSegmentComponent))
      assert(!resourceState.resources[geoResourceID])
      assert(!resourceState.resources[matResourceID])
      assert(spy.callCount === 4)
      unmount()
      done()
    })
  })

  it('Removes resources when LineSegmentComponent is unmounted', (done) => {
    const entity = createEntity()
    const geometry = new BoxGeometry(1, 1, 1)
    const material = new MeshBasicMaterial({ color: 0xffff00 })

    const spy = sinon.spy()
    geometry.dispose = spy
    material.dispose = spy

    const Reactor = () => {
      useEffect(() => {
        setComponent(entity, LineSegmentComponent, { geometry: geometry, material: material })
        return () => {
          removeComponent(entity, LineSegmentComponent)
        }
      }, [])

      return <></>
    }

    const { rerender, unmount } = render(<Reactor />)

    const resourceState = getState(ResourceState)

    act(async () => {
      assert(hasComponent(entity, LineSegmentComponent))
      assert(resourceState.resources[geometry.uuid])
      assert(resourceState.resources[material.uuid])
      unmount()
    }).then(() => {
      assert(!hasComponent(entity, LineSegmentComponent))
      assert(!resourceState.resources[geometry.uuid])
      assert(!resourceState.resources[material.uuid])
      sinon.assert.calledTwice(spy)
      removeEntity(entity)
      done()
    })
  })

  it('Sets LineSegment layer mask correctly', (done) => {
    const entity = createEntity()
    const geometry = new BoxGeometry(1, 1, 1)
    const material = new MeshBasicMaterial({ color: 0xffff00 })

    const layerMask = ObjectLayerMasks.NodeHelper
    const layer = ObjectLayers.NodeHelper

    const Reactor = () => {
      useEffect(() => {
        setComponent(entity, LineSegmentComponent, {
          geometry: geometry,
          material: material,
          layerMask: layerMask
        })
        return () => {
          removeComponent(entity, LineSegmentComponent)
        }
      }, [])

      return <></>
    }

    const { rerender, unmount } = render(<Reactor />)

    act(async () => {
      rerender(<Reactor />)
    }).then(() => {
      assert(hasComponent(entity, LineSegmentComponent))
      assert(hasComponent(entity, GroupComponent))
      assert(hasComponent(entity, ObjectLayerMaskComponent))
      assert(hasComponent(entity, ObjectLayerComponents[layer]))
      const group = getComponent(entity, GroupComponent)
      const lineSegments = group[0] as LineSegments
      assert(lineSegments.isLineSegments)
      assert(lineSegments.layers.mask === layerMask)
      unmount()
      removeEntity(entity)
      done()
    })
  })
})
