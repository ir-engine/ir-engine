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

import {
  createEngine,
  createEntity,
  destroyEngine,
  Entity,
  EntityTreeComponent,
  getNestedChildren,
  getOptionalComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import { getMutableState } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { mockSpatialEngine } from '@ir-engine/spatial/tests/util/mockSpatialEngine'
import { Object3D } from 'three'
import { assert, it as base, describe } from 'vitest'
import { SpawnPointComponent } from './SpawnPointComponent'

const it = base.extend<{ entity: Entity }>({
  // eslint-disable-next-line no-empty-pattern
  entity: async ({}, use) => {
    createEngine()
    mockSpatialEngine()
    const entity = createEntity()
    await use(entity)
    removeEntity(entity)
    destroyEngine()
  }
})

describe('SpawnPointComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      assert.equal(SpawnPointComponent.name, 'SpawnPointComponent')
    })

    it('should initialize the *Component.jsonID field with the expected value', () => {
      assert.equal(SpawnPointComponent.jsonID, 'EE_spawn_point')
    })
  })

  describe('reactor', () => {
    // This test requires intercepting an HTTP request for the GLTF src
    it.skip('should initialize a child helper entity', async ({ entity }) => {
      getMutableState(RendererState).nodeHelperVisibility.set(true)
      setComponent(entity, SpawnPointComponent)

      let child = getNestedChildren(entity).at(0)
      assert.exists(child)
      child = child!

      let transform = getOptionalComponent(child, TransformComponent)

      assert.exists(transform)
      transform = transform!

      let tree = getOptionalComponent(child, EntityTreeComponent)
      assert.exists(tree)
      tree = tree!

      let object3d = getOptionalComponent(child, ObjectComponent) as Object3D
      assert.exists(object3d)
      object3d = object3d!

      assert(object3d.type === 'mesh')
    })
  })
})
