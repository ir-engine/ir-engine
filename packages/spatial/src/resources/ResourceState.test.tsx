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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import assert from 'assert'
import { BoxGeometry, Mesh, MeshBasicMaterial, SphereGeometry } from 'three'
import { afterEach, beforeEach, describe, it, vi } from 'vitest'

import { createEntity, removeEntity, setComponent, SystemDefinitions, UndefinedEntity } from '@ir-engine/ecs'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'

import { createEngine } from '@ir-engine/ecs/src/Engine'
import { getState, startReactor } from '@ir-engine/hyperflux'
import { flushAll } from '@ir-engine/hyperflux/tests/utils/flushAll'
import sinon from 'sinon'
import { MeshComponent } from '../renderer/components/MeshComponent'
import { ResourceState, ResourceStateSystem } from './ResourceState'

const resourceStateSystemReactor = SystemDefinitions.get(ResourceStateSystem)!.reactor!

describe('ResourceState', () => {
  describe('ResourceState state', () => {
    describe('reactor', () => {
      let testEntity = UndefinedEntity

      beforeEach(async () => {
        createEngine()
        testEntity = createEntity()
        startReactor(resourceStateSystemReactor)
        await flushAll()
      })

      afterEach(() => {
        return destroyEngine()
      })

      it('should track mesh in state', async () => {
        const mesh = new Mesh(new SphereGeometry(), new MeshBasicMaterial())

        setComponent(testEntity, MeshComponent, mesh)

        await vi.waitUntil(() => {
          // @ts-expect-error
          const meshResourceID = mesh.resourceID
          return getState(ResourceState).resources[meshResourceID]
        })

        // @ts-expect-error
        const meshResourceID = mesh.resourceID
        const meshAssetEntry = getState(ResourceState).resources[meshResourceID]
        assert(meshAssetEntry.entity === testEntity)
        assert(meshAssetEntry.asset === mesh)
        assert(meshAssetEntry.type === 'Mesh')

        // @ts-expect-error
        const geometryResourceID = mesh.geometry.resourceID
        const geometryAssetEntry = getState(ResourceState).resources[geometryResourceID]
        assert(geometryAssetEntry.entity === testEntity)
        assert(geometryAssetEntry.asset === mesh.geometry)
        assert(geometryAssetEntry.type === 'Geometry')

        // @ts-expect-error
        const materialResourceID = mesh.material.resourceID
        const materialAssetEntry = getState(ResourceState).resources[materialResourceID]
        assert(materialAssetEntry.entity === testEntity)
        assert(materialAssetEntry.asset === mesh.material)
        assert(materialAssetEntry.type === 'Material')

        const index = mesh.geometry.index
        // @ts-expect-error
        const indexResourceID = index.resourceID
        const indexAssetEntry = getState(ResourceState).resources[indexResourceID]
        assert(indexAssetEntry.entity === testEntity)
        assert(indexAssetEntry.asset === index)
        assert(indexAssetEntry.type === 'BufferAttribute')

        const attributes = mesh.geometry.attributes

        // @ts-expect-error
        const positionResourceID = attributes.position.resourceID
        const positionAssetEntry = getState(ResourceState).resources[positionResourceID]
        assert(positionAssetEntry.entity === testEntity)
        assert(positionAssetEntry.asset === attributes.position)
        assert(positionAssetEntry.type === 'BufferAttribute')

        // @ts-expect-error
        const normalResourceID = attributes.normal.resourceID
        const normalAssetEntry = getState(ResourceState).resources[normalResourceID]
        assert(normalAssetEntry.entity === testEntity)
        assert(normalAssetEntry.asset === attributes.normal)
        assert(normalAssetEntry.type === 'BufferAttribute')

        // @ts-expect-error
        const uvResourceID = attributes.uv.resourceID
        const uvAssetEntry = getState(ResourceState).resources[uvResourceID]
        assert(uvAssetEntry.entity === testEntity)
      })

      it('should dispose when component unmounts', async () => {
        const mesh = new Mesh(new SphereGeometry(), new MeshBasicMaterial())
        const spy = sinon.spy()
        mesh.geometry.dispose = spy
        mesh.material.dispose = spy

        setComponent(testEntity, MeshComponent, mesh)

        await vi.waitUntil(() => {
          // @ts-expect-error
          const meshResourceID = mesh.resourceID
          return getState(ResourceState).resources[meshResourceID]
        })

        // @ts-expect-error
        const meshResourceID = mesh.resourceID

        const resources = getState(ResourceState).resources

        removeEntity(testEntity)

        await vi.waitUntil(() => {
          return !getState(ResourceState).resources[meshResourceID]
        })

        sinon.assert.calledTwice(spy)

        assert.equal(Object.keys(resources).length, 0)
      })

      it('should dispose and mount new asset upon component set', async () => {
        const mesh = new Mesh(new SphereGeometry(), new MeshBasicMaterial())
        const spy = sinon.spy()
        mesh.geometry.dispose = spy
        mesh.material.dispose = spy

        setComponent(testEntity, MeshComponent, mesh)

        await vi.waitUntil(() => {
          // @ts-expect-error
          const meshResourceID = mesh.resourceID
          return getState(ResourceState).resources[meshResourceID]
        })

        sinon.assert.notCalled(spy)

        const newMesh = new Mesh(new BoxGeometry(), new MeshBasicMaterial())

        setComponent(testEntity, MeshComponent, newMesh)

        const resource = await vi.waitUntil(() => {
          // @ts-expect-error
          const meshResourceID = newMesh.resourceID
          return getState(ResourceState).resources[meshResourceID]
        })

        assert(resource)
      })
    })
  })
})
