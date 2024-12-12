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

import { Entity, createEngine, createEntity, destroyEngine, setComponent } from '@ir-engine/ecs'
import { getMutableState } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { destroySpatialEngine, destroySpatialViewer } from '@ir-engine/spatial/src/initializeEngine'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { IntersectionData } from '@ir-engine/spatial/src/input/functions/ClientInputHeuristics'
import { GroupComponent, addObjectToGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { TransformGizmoTagComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { BoxGeometry, Mesh, Vector3 } from 'three'
import { afterEach, assert, beforeEach, describe, it } from 'vitest'
import { assertFloat } from '../../../spatial/tests/util/assert'
import { mockSpatialEngine } from '../../../spatial/tests/util/mockSpatialEngine'
import { editorInputHeuristic } from './TransformGizmoSystem'

describe('TransformGizmoSystem', () => {
  describe('findEditor', () => {
    beforeEach(async () => {
      createEngine()
      mockSpatialEngine()
      getMutableState(EngineState).isEditing.set(true)
    })

    afterEach(() => {
      destroySpatialEngine()
      destroySpatialViewer()
      return destroyEngine()
    })

    describe('if there are gizmoPickerObjects ...', () => {
      // objects will be the combined GroupComponent arrays of all gizmoPickerObjectsQuery entities

      it('... should add the parentObject.entity and hit.distance to the `@param intersectionData` for every gizmoPickerObject hit by the `@param caster`', () => {
        const box1 = new Mesh(new BoxGeometry(2, 2, 2))
        const one = createEntity()
        setComponent(one, TransformComponent, { position: new Vector3(3.1, 3.1, 3.1) })
        setComponent(one, VisibleComponent)
        setComponent(one, MeshComponent, box1)
        setComponent(one, GroupComponent)
        addObjectToGroup(one, box1)
        setComponent(one, InputComponent)
        setComponent(one, TransformGizmoTagComponent)

        const box2 = new Mesh(new BoxGeometry(2, 2, 2))
        const two = createEntity()
        setComponent(two, TransformComponent, { position: new Vector3(3.2, 3.2, 3.2) })
        setComponent(two, VisibleComponent)
        setComponent(two, MeshComponent, box2)
        setComponent(two, GroupComponent)
        addObjectToGroup(two, box2)
        setComponent(two, InputComponent)
        setComponent(two, TransformGizmoTagComponent)

        const box3 = new Mesh(new BoxGeometry(2, 2, 2))
        const three = createEntity()
        setComponent(three, TransformComponent, { position: new Vector3(3.2, 3.2, 3.2) })
        setComponent(three, VisibleComponent)
        setComponent(three, MeshComponent, box3)
        setComponent(three, GroupComponent)
        addObjectToGroup(three, box3)
        setComponent(three, InputComponent)
        // setComponent(three, TransformGizmoTagComponent)  // Do not add three to the gizmoPickerObject query

        const KnownEntities = [one, two]

        const rayOrigin = new Vector3(0, 0, 0)
        const rayDirection = new Vector3(3, 3, 3).normalize()

        const data = new Set<IntersectionData>()

        editorInputHeuristic(data, rayOrigin, rayDirection)

        assert.notEqual(data.size, 0)
        const result = [...data]
        for (const hit of result) {
          assert.equal(KnownEntities.includes(hit.entity), true)
          assertFloat.approxNotEq(hit.distance, 0)
          assert.notEqual(hit.entity, three)
        }
      })

      it('... should not do anything if the ancestor object we found does not belong to an entity', () => {
        const box1 = new Mesh(new BoxGeometry(2, 2, 2))
        const one = createEntity()
        setComponent(one, TransformComponent, { position: new Vector3(3.1, 3.1, 3.1) })
        setComponent(one, VisibleComponent)
        setComponent(one, MeshComponent, box1)
        setComponent(one, GroupComponent)
        addObjectToGroup(one, box1)
        setComponent(one, InputComponent)
        setComponent(one, TransformGizmoTagComponent)

        const box2 = new Mesh(new BoxGeometry(2, 2, 2))
        const two = createEntity()
        setComponent(two, TransformComponent, { position: new Vector3(3.2, 3.2, 3.2) })
        setComponent(two, VisibleComponent)
        setComponent(two, MeshComponent, box2)
        setComponent(two, GroupComponent)
        addObjectToGroup(two, box2)
        setComponent(two, InputComponent)
        setComponent(two, TransformGizmoTagComponent)

        const rayOrigin = new Vector3(0, 0, 0)
        const rayDirection = new Vector3(3, 3, 3).normalize()

        const data = new Set<IntersectionData>()

        // Remove the ancestor so that the `if (!parentObject) continue` code branch is hit
        box1.entity = undefined! as Entity
        box2.entity = undefined! as Entity
        // Run and check that nothing was added
        editorInputHeuristic(data, rayOrigin, rayDirection)

        assert.equal(data.size, 0)
      })
    })

    describe('if there are no gizmoPickerObjects ...', () => {
      // objects will be the combined GroupComponent arrays of the inputObjectsQuery entities
      it('... should add the parentObject.entity and hit.distance to the `@param intersectionData` for every inputrObject hit by the `@param caster`', () => {
        const box1 = new Mesh(new BoxGeometry(2, 2, 2))
        const one = createEntity()
        setComponent(one, TransformComponent, { position: new Vector3(3.1, 3.1, 3.1) })
        setComponent(one, VisibleComponent)
        setComponent(one, MeshComponent, box1)
        setComponent(one, GroupComponent)
        addObjectToGroup(one, box1)
        setComponent(one, InputComponent)
        // setComponent(one, TransformGizmoTagComponent)  // Do not enable, so that we are on the inputObjects branch of the code

        const box2 = new Mesh(new BoxGeometry(2, 2, 2))
        const two = createEntity()
        setComponent(two, TransformComponent, { position: new Vector3(3.2, 3.2, 3.2) })
        setComponent(two, VisibleComponent)
        setComponent(two, MeshComponent, box2)
        setComponent(two, GroupComponent)
        addObjectToGroup(two, box2)
        setComponent(two, InputComponent)
        // setComponent(two, TransformGizmoTagComponent)  // Do not enable, so that we are on the inputObjects branch of the code

        const box3 = new Mesh(new BoxGeometry(2, 2, 2))
        const three = createEntity()
        setComponent(three, TransformComponent, { position: new Vector3(3.2, 3.2, 3.2) })
        setComponent(three, VisibleComponent)
        setComponent(three, MeshComponent, box3)
        setComponent(three, GroupComponent)
        addObjectToGroup(three, box3)
        // setComponent(three, InputComponent)  // Do not add the InputComponent, so that it is not part of inputObjectsQuery

        const KnownEntities = [one, two]

        const rayOrigin = new Vector3(0, 0, 0)
        const rayDirection = new Vector3(3, 3, 3).normalize()

        const data = new Set<IntersectionData>()

        editorInputHeuristic(data, rayOrigin, rayDirection)

        assert.notEqual(data.size, 0)
        const result = [...data]
        for (const hit of result) {
          assert.equal(KnownEntities.includes(hit.entity), true)
          assertFloat.approxNotEq(hit.distance, 0)
          assert.notEqual(hit.entity, three)
        }
      })

      it('... should not do anything if the ancestor object we found does not belong to an entity', () => {
        const box1 = new Mesh(new BoxGeometry(2, 2, 2))
        const one = createEntity()
        setComponent(one, TransformComponent, { position: new Vector3(3.1, 3.1, 3.1) })
        setComponent(one, VisibleComponent)
        setComponent(one, MeshComponent, box1)
        setComponent(one, GroupComponent)
        addObjectToGroup(one, box1)
        setComponent(one, InputComponent)
        // setComponent(one, TransformGizmoTagComponent)  // Do not enable, so that we are on the inputObjects branch of the code

        const box2 = new Mesh(new BoxGeometry(2, 2, 2))
        const two = createEntity()
        setComponent(two, TransformComponent, { position: new Vector3(3.2, 3.2, 3.2) })
        setComponent(two, VisibleComponent)
        setComponent(two, MeshComponent, box2)
        setComponent(two, GroupComponent)
        addObjectToGroup(two, box2)
        setComponent(two, InputComponent)
        // setComponent(two, TransformGizmoTagComponent)  // Do not enable, so that we are on the inputObjects branch of the code

        const box3 = new Mesh(new BoxGeometry(2, 2, 2))
        const three = createEntity()
        setComponent(three, TransformComponent, { position: new Vector3(3.2, 3.2, 3.2) })
        setComponent(three, VisibleComponent)
        setComponent(three, MeshComponent, box3)
        setComponent(three, GroupComponent)
        addObjectToGroup(three, box3)
        // setComponent(three, InputComponent)  // Do not add the InputComponent, so that it is not part of inputObjectsQuery

        const rayOrigin = new Vector3(0, 0, 0)
        const rayDirection = new Vector3(3, 3, 3).normalize()

        const data = new Set<IntersectionData>()

        // Remove the ancestor so that the `if (!parentObject) continue` code branch is hit
        box1.entity = undefined! as Entity
        box2.entity = undefined! as Entity
        // Run and check that nothing was added
        editorInputHeuristic(data, rayOrigin, rayDirection)

        assert.equal(data.size, 0)
      })
    })
  })
})
