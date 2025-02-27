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

  it('registers a delta', () => {
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
