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
  defineComponent,
  destroyEngine,
  EntityTreeComponent,
  S,
  setComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { NodeID, NodeIDComponent } from '@ir-engine/engine/src/gltf/NodeIDComponent'
import { SourceComponent, SourceID } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { SceneDeltaState } from '@ir-engine/engine/src/scene/systems/SceneDeltaState'
import { getState } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { Group } from 'three'
import { afterEach, assert, beforeEach, describe, it } from 'vitest'
import { EditorControlFunctions } from '../functions/EditorControlFunctions'

const createSourcedEntity = (source = 'testSource', nodeID = 'testNodeID') => {
  const entity = createEntity()
  setComponent(entity, SourceComponent, source as SourceID)
  setComponent(entity, NodeIDComponent, nodeID as NodeID)
  setComponent(entity, UUIDComponent, NodeIDComponent.getUUIDBySourceAndNodeID(source as SourceID, nodeID as NodeID))
  setComponent(entity, TransformComponent)
  setComponent(entity, EntityTreeComponent)

  const obj3d = new Group()
  obj3d.entity = entity
  setComponent(entity, ObjectComponent, obj3d)
  return entity
}

describe('Scene Deltas', () => {
  beforeEach(() => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('registers a delta for adding a component', () => {
    const testComponent = defineComponent({
      name: 'TestComponent',
      jsonID: 'EE_test',
      schema: S.Object({
        value: S.Number(0)
      })
    })

    const sourceID = 'source.glb' as SourceID
    const nodeID = 'nodeID' as NodeID
    const entity = createSourcedEntity(sourceID, nodeID)

    const testValue = Math.random()
    EditorControlFunctions.addOrRemoveComponent([entity], testComponent, true, { value: testValue })

    const deltaState = getState(SceneDeltaState)
    assert.equal(deltaState[sourceID][nodeID][testComponent.jsonID].value, testValue)
  })
})
