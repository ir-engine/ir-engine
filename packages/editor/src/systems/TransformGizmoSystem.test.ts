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

import {
  EngineState,
  EntityTreeComponent,
  SystemDefinitions,
  createEngine,
  createEntity,
  destroyEngine,
  setComponent
} from '@ir-engine/ecs'
import { getMutableState, startReactor } from '@ir-engine/hyperflux'
import { flushAll } from '@ir-engine/hyperflux/tests/utils/flushAll'
import { MeshBVHSystem, TransformComponent } from '@ir-engine/spatial'
import { destroySpatialEngine, destroySpatialViewer } from '@ir-engine/spatial/src/initializeEngine'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { IntersectionData } from '@ir-engine/spatial/src/input/functions/ClientInputHeuristics'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/components/RendererComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { TransformGizmoTagComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { BoxGeometry, Mesh, MeshBasicMaterial, Vector3 } from 'three'
import { afterEach, assert, beforeEach, describe, it, vi } from 'vitest'
import { assertFloat } from '../../../spatial/tests/util/assert'
import { mockSpatialEngine } from '../../../spatial/tests/util/mockSpatialEngine'
import { editorInputHeuristic } from './TransformGizmoSystem'

const meshBVHReactor = SystemDefinitions.get(MeshBVHSystem)!.reactor!

describe('TransformGizmoSystem', () => {
  describe('editorInputHeuristic', () => {
    beforeEach(async () => {
      createEngine()
      mockSpatialEngine()
      getMutableState(EngineState).isEditing.set(true)
      startReactor(meshBVHReactor)
      await flushAll()
    })

    afterEach(() => {
      destroySpatialEngine()
      destroySpatialViewer()
      return destroyEngine()
    })

    describe('if there are gizmoPickerObjects ...', () => {
      // objects will be the combined ObjectComponent arrays of all gizmoPickerObjectsQuery entities

      it('... should add the parentObject.entity and hit.distance to the `@param intersectionData` for every gizmoPickerObject hit by the `@param caster`', async () => {
        const box1 = new Mesh(new BoxGeometry(0.5, 0.5, 0.5), new MeshBasicMaterial())
        const one = createEntity()
        setComponent(one, TransformComponent, { position: new Vector3(1, 1, 1) })
        setComponent(one, VisibleComponent)
        setComponent(one, MeshComponent, box1)
        setComponent(one, InputComponent)
        ObjectLayerMaskComponent.setLayer(one, ObjectLayers.TransformGizmo)
        setComponent(one, TransformGizmoTagComponent)

        const box2 = new Mesh(new BoxGeometry(0.5, 0.5, 0.5), new MeshBasicMaterial())
        const two = createEntity()
        setComponent(two, TransformComponent, { position: new Vector3(2, 2, 2) })
        setComponent(two, VisibleComponent)
        setComponent(two, MeshComponent, box2)
        setComponent(two, InputComponent)
        ObjectLayerMaskComponent.setLayer(two, ObjectLayers.TransformGizmo)
        setComponent(two, TransformGizmoTagComponent)

        const box3 = new Mesh(new BoxGeometry(0.5, 0.5, 0.5), new MeshBasicMaterial())
        const three = createEntity()
        setComponent(three, TransformComponent, { position: new Vector3(1.5, 1.5, 1.5) })
        setComponent(three, VisibleComponent)
        setComponent(three, MeshComponent, box3)
        setComponent(three, InputComponent)
        ObjectLayerMaskComponent.setLayer(three, ObjectLayers.TransformGizmo)

        const viewerEntity = createEntity()
        setComponent(viewerEntity, RendererComponent, { scenes: [viewerEntity] })
        setComponent(one, EntityTreeComponent, { parentEntity: viewerEntity })
        setComponent(two, EntityTreeComponent, { parentEntity: viewerEntity })
        setComponent(three, EntityTreeComponent, { parentEntity: viewerEntity })

        const KnownEntities = [one, two]

        const rayOrigin = new Vector3(0, 0, 0)
        const rayDirection = new Vector3(1, 1, 1).normalize()

        const data = new Set<IntersectionData>()

        await vi.waitUntil(() => [box1, box2, box3].every((box) => box.geometry.boundsTree), { timeout: 10000 })

        editorInputHeuristic(viewerEntity, data, rayOrigin, rayDirection)

        assert.notEqual(data.size, 0)
        const result = [...data]
        for (const hit of result) {
          assert.equal(KnownEntities.includes(hit.entity), true)
          assertFloat.approxNotEq(hit.distance, 0)
          assert.notEqual(hit.entity, three)
        }
      })
    })

    describe('if there are no gizmoPickerObjects ...', () => {
      // objects will be the combined ObjectComponent arrays of the inputObjectsQuery entities
      it('... should add the parentObject.entity and hit.distance to the `@param intersectionData` for every inputrObject hit by the `@param caster`', async () => {
        const box1 = new Mesh(new BoxGeometry(2, 2, 2), new MeshBasicMaterial())
        const one = createEntity()
        setComponent(one, TransformComponent, { position: new Vector3(3.1, 3.1, 3.1) })
        setComponent(one, VisibleComponent)
        setComponent(one, MeshComponent, box1)
        setComponent(one, InputComponent)
        // setComponent(one, TransformGizmoTagComponent)  // Do not enable, so that we are on the inputObjects branch of the code

        const box2 = new Mesh(new BoxGeometry(2, 2, 2), new MeshBasicMaterial())
        const two = createEntity()
        setComponent(two, TransformComponent, { position: new Vector3(3.2, 3.2, 3.2) })
        setComponent(two, VisibleComponent)
        setComponent(two, MeshComponent, box2)
        setComponent(two, InputComponent)
        // setComponent(two, TransformGizmoTagComponent)  // Do not enable, so that we are on the inputObjects branch of the code

        const box3 = new Mesh(new BoxGeometry(2, 2, 2), new MeshBasicMaterial())
        const three = createEntity()
        setComponent(three, TransformComponent, { position: new Vector3(3.2, 3.2, 3.2) })
        setComponent(three, VisibleComponent)
        setComponent(three, MeshComponent, box3)
        // setComponent(three, InputComponent)  // Do not add the InputComponent, so that it is not part of inputObjectsQuery

        const viewerEntity = createEntity()
        setComponent(viewerEntity, RendererComponent, { scenes: [viewerEntity] })
        setComponent(one, EntityTreeComponent, { parentEntity: viewerEntity })
        setComponent(two, EntityTreeComponent, { parentEntity: viewerEntity })
        setComponent(three, EntityTreeComponent, { parentEntity: viewerEntity })

        const KnownEntities = [one, two]

        const rayOrigin = new Vector3(0, 0, 0)
        const rayDirection = new Vector3(3, 3, 3).normalize()

        const data = new Set<IntersectionData>()

        await vi.waitUntil(() => [box1, box2, box3].every((box) => box.geometry.boundsTree), { timeout: 10000 })

        editorInputHeuristic(viewerEntity, data, rayOrigin, rayDirection)

        assert.notEqual(data.size, 0)
        const result = [...data]
        for (const hit of result) {
          assert.equal(KnownEntities.includes(hit.entity), true)
          assertFloat.approxNotEq(hit.distance, 0)
          assert.notEqual(hit.entity, three)
        }
      })
    })
  })
})
