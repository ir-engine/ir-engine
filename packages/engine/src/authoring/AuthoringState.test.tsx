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
  Engine,
  EngineState,
  entityExists,
  EntityID,
  EntityTreeComponent,
  EntityUUID,
  getComponent,
  Layers,
  setComponent,
  SourceID,
  UndefinedEntity,
  UUIDComponent
} from '@ir-engine/ecs'
import { getMutableState, getState, UserID } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { AddOperation } from 'rfc6902/diff'
import { Quaternion, Vector3 } from 'three'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  applyCommandsToECS,
  AuthoringActions,
  AuthoringState,
  computeCommands,
  getSourceSnapshot,
  HistoryCommand,
  SourceData
} from './AuthoringState'

const sourceID1 = 'source1' as SourceID
const sourceID2 = 'source2' as SourceID
const nodeID1 = 'node1' as EntityID
const nodeID2 = 'node2' as EntityID

describe('AuthoringState', () => {
  describe('computeCommands', () => {
    it('should handle undo and redo commands correctly', () => {
      const commands: HistoryCommand[] = [
        { [sourceID1]: [{ op: 'add', path: '/node1', value: {} }] },
        { type: 'undo' },
        { type: 'redo' }
      ]
      const { doneStack, redoStack } = computeCommands(commands)
      expect(doneStack).toHaveLength(1)
      expect(redoStack).toHaveLength(0)
    })

    it('should clear redo stack on new command', () => {
      const commands: HistoryCommand[] = [
        { [sourceID1]: [{ op: 'add', path: '/node1', value: {} }] },
        { type: 'undo' },
        { [sourceID1]: [{ op: 'add', path: '/node2', value: {} }] }
      ]
      const { doneStack, redoStack } = computeCommands(commands)
      expect(doneStack).toHaveLength(1)
      expect(redoStack).toHaveLength(0)
    })

    it('should handle multiple undo and redo commands correctly', () => {
      const commands: HistoryCommand[] = [
        { [sourceID1]: [{ op: 'add', path: '/node1', value: {} }] },
        { [sourceID1]: [{ op: 'add', path: '/node2', value: {} }] },
        { type: 'undo' },
        { type: 'redo' },
        { type: 'undo' }
      ]
      const { doneStack, redoStack } = computeCommands(commands)
      expect(doneStack).toHaveLength(1)
      expect(redoStack).toHaveLength(1)
    })

    it('should handle multiple undo and redo commands with commands between them correctly', () => {
      const commands: HistoryCommand[] = [
        { [sourceID1]: [{ op: 'add', path: '/node1', value: {} }] },
        { [sourceID1]: [{ op: 'add', path: '/node2', value: {} }] },
        { type: 'undo' },
        { [sourceID1]: [{ op: 'add', path: '/node3', value: {} }] },
        { type: 'redo' },
        { type: 'undo' }
      ]
      const { doneStack, redoStack } = computeCommands(commands)
      expect(doneStack).toHaveLength(1)
      expect(redoStack).toHaveLength(1)
    })

    it('should handle undo and redo commands for multiple sources correctly', () => {
      const commands: HistoryCommand[] = [
        { [sourceID1]: [{ op: 'add', path: '/node1', value: {} }] },
        { [sourceID2]: [{ op: 'add', path: '/node2', value: {} }] },
        { type: 'undo' },
        { type: 'redo' }
      ]
      const { doneStack, redoStack } = computeCommands(commands)
      expect(doneStack).toHaveLength(2)
      expect(redoStack).toHaveLength(0)
    })
  })

  describe('applyCommandsToECS', () => {
    const Component1 = defineComponent({ name: 'Component1', jsonID: 'Component1' })
    const Component2 = defineComponent({ name: 'Component2', jsonID: 'Component2' })
    let source1 = UndefinedEntity
    let source2 = UndefinedEntity
    beforeEach(() => {
      createEngine()
      source1 = createEntity(Layers.Authoring)
      setComponent(source1, UUIDComponent, { entitySourceID: 'source' as SourceID, entityID: '1' as EntityID })
      source2 = createEntity(Layers.Authoring)
      setComponent(source2, UUIDComponent, { entitySourceID: 'source' as SourceID, entityID: '2' as EntityID })
    })

    afterEach(() => {
      return destroyEngine()
    })

    describe('addEntity', () => {
      it('should add entity to ECS', () => {
        const currentState: SourceData = {}
        const finalState: SourceData = { [nodeID1]: {} }

        applyCommandsToECS(sourceID1, currentState, finalState)

        const node1UUID = (sourceID1 + nodeID1) as EntityUUID
        const node1Entity = UUIDComponent.getEntityByUUID(node1UUID, Layers.Authoring)

        expect(node1Entity).toBeDefined()
      })

      it('should add multiple entities to ECS', () => {
        const currentState: SourceData = {}
        const finalState: SourceData = {
          [nodeID1]: { [Component1.jsonID]: {} },
          [nodeID2]: { [Component2.jsonID]: {} }
        }

        applyCommandsToECS(sourceID1, currentState, finalState)

        const node1UUID = (sourceID1 + nodeID1) as EntityUUID
        const node1Entity = UUIDComponent.getEntityByUUID(node1UUID, Layers.Authoring)
        const node2UUID = (sourceID1 + nodeID2) as EntityUUID
        const node2Entity = UUIDComponent.getEntityByUUID(node2UUID, Layers.Authoring)

        expect(node1Entity).toBeDefined()
        expect(node2Entity).toBeDefined()
      })

      it('should add entity with components to ECS', () => {
        const currentState: SourceData = {}
        const finalState: SourceData = { [nodeID1]: { [Component1.jsonID]: {}, [Component2.jsonID]: {} } }

        applyCommandsToECS(sourceID1, currentState, finalState)

        const node1UUID = (sourceID1 + nodeID1) as EntityUUID
        const node1Entity = UUIDComponent.getEntityByUUID(node1UUID, Layers.Authoring)

        expect(node1Entity).toBeDefined()
        expect(getComponent(node1Entity, Component1)).toBeDefined()
        expect(getComponent(node1Entity, Component2)).toBeDefined()
      })

      it('should add multiple entities with components to ECS', () => {
        const currentState: SourceData = {}
        const finalState: SourceData = {
          [nodeID1]: { [Component1.jsonID]: {} },
          [nodeID2]: { [Component2.jsonID]: {} }
        }

        applyCommandsToECS(sourceID1, currentState, finalState)

        const node1UUID = (sourceID1 + nodeID1) as EntityUUID
        const node1Entity = UUIDComponent.getEntityByUUID(node1UUID, Layers.Authoring)
        const node2UUID = (sourceID1 + nodeID2) as EntityUUID
        const node2Entity = UUIDComponent.getEntityByUUID(node2UUID, Layers.Authoring)

        expect(node1Entity).toBeDefined()
        expect(node2Entity).toBeDefined()
        expect(getComponent(node1Entity, Component1)).toBeDefined()
        expect(getComponent(node2Entity, Component2)).toBeDefined()
      })
    })

    describe('removeEntity', () => {
      it('should remove entity from ECS', () => {
        const entity1 = UUIDComponent.create(source1, nodeID1, Layers.Authoring)
        const currentState: SourceData = { [nodeID1]: {} }
        const finalState: SourceData = {}

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(entityExists(entity1)).toBe(false)
      })

      it('should remove multiple entities from ECS', () => {
        const entity1 = UUIDComponent.create(source1, nodeID1, Layers.Authoring)
        const entity2 = UUIDComponent.create(source1, nodeID2, Layers.Authoring)
        const currentState: SourceData = { [nodeID1]: {}, [nodeID2]: {} }
        const finalState: SourceData = {}

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(entityExists(entity1)).toBe(false)
        expect(entityExists(entity2)).toBe(false)
      })

      it('should remove entity with components from ECS', () => {
        const entity1 = UUIDComponent.create(source1, nodeID1, Layers.Authoring)
        const currentState: SourceData = { [nodeID1]: { [Component1.jsonID]: {}, [Component2.jsonID]: {} } }
        const finalState: SourceData = {}

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(entityExists(entity1)).toBe(false)
      })

      it('should remove multiple entities with components from ECS', () => {
        const entity1 = UUIDComponent.create(source1, nodeID1, Layers.Authoring)
        const entity2 = UUIDComponent.create(source1, nodeID2, Layers.Authoring)
        setComponent(entity1, Component1)
        setComponent(entity2, Component2)
        const currentState: SourceData = {
          [nodeID1]: { [Component1.jsonID]: {} },
          [nodeID2]: { [Component2.jsonID]: {} }
        }
        const finalState: SourceData = {}

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(entityExists(entity1)).toBe(false)
        expect(entityExists(entity2)).toBe(false)
      })
    })

    describe('setComponent', () => {
      it('should set component on entity in ECS', () => {
        const entity1 = UUIDComponent.create(source1, nodeID1, Layers.Authoring)
        const currentState: SourceData = { [nodeID1]: {} }
        const finalState: SourceData = { [nodeID1]: { [Component1.jsonID]: {} } }

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(getComponent(entity1, Component1)).toBeDefined()
      })

      it('should set component on multiple entities in ECS', () => {
        const entity1 = UUIDComponent.create(source1, nodeID1, Layers.Authoring)
        const entity2 = UUIDComponent.create(source1, nodeID2, Layers.Authoring)
        const currentState: SourceData = { [nodeID1]: {}, [nodeID2]: {} }
        const finalState: SourceData = {
          [nodeID1]: { [Component1.jsonID]: {} },
          [nodeID2]: { [Component2.jsonID]: {} }
        }

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(getComponent(entity1, Component1)).toBeDefined()
        expect(getComponent(entity2, Component2)).toBeDefined()
      })

      it('should set multiple components on entity in ECS', () => {
        const entity1 = UUIDComponent.create(source1, nodeID1, Layers.Authoring)
        const currentState: SourceData = { [nodeID1]: {} }
        const finalState: SourceData = { [nodeID1]: { [Component1.jsonID]: {}, [Component2.jsonID]: {} } }

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(getComponent(entity1, Component1)).toBeDefined()
        expect(getComponent(entity1, Component2)).toBeDefined()
      })

      it('should set multiple components on multiple entities in ECS', () => {
        const entity1 = UUIDComponent.create(source1, nodeID1, Layers.Authoring)
        const entity2 = UUIDComponent.create(source1, nodeID2, Layers.Authoring)
        const currentState: SourceData = { [nodeID1]: {}, [nodeID2]: {} }
        const finalState: SourceData = {
          [nodeID1]: { [Component1.jsonID]: {}, [Component2.jsonID]: {} },
          [nodeID2]: { [Component1.jsonID]: {}, [Component2.jsonID]: {} }
        }

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(getComponent(entity1, Component1)).toBeDefined()
        expect(getComponent(entity1, Component2)).toBeDefined()
        expect(getComponent(entity2, Component1)).toBeDefined()
        expect(getComponent(entity2, Component2)).toBeDefined()
      })

      it('should set component on entity with existing components in ECS', () => {
        const entity1 = UUIDComponent.create(source1, nodeID1, Layers.Authoring)
        setComponent(entity1, Component1)
        const currentState: SourceData = { [nodeID1]: { [Component1.jsonID]: {} } }
        const finalState: SourceData = { [nodeID1]: { [Component1.jsonID]: {}, [Component2.jsonID]: {} } }

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(getComponent(entity1, Component1)).toBeDefined()
        expect(getComponent(entity1, Component2)).toBeDefined()
      })

      it('should set component on multiple entities with existing components in ECS', () => {
        const entity1 = UUIDComponent.create(source1, nodeID1, Layers.Authoring)
        const entity2 = UUIDComponent.create(source1, nodeID2, Layers.Authoring)
        setComponent(entity1, Component1)
        setComponent(entity2, Component2)
        const currentState: SourceData = {
          [nodeID1]: { [Component1.jsonID]: {} },
          [nodeID2]: { [Component2.jsonID]: {} }
        }
        const finalState: SourceData = {
          [nodeID1]: { [Component1.jsonID]: {}, [Component2.jsonID]: {} },
          [nodeID2]: { [Component1.jsonID]: {}, [Component2.jsonID]: {} }
        }

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(getComponent(entity1, Component1)).toBeDefined()
        expect(getComponent(entity1, Component2)).toBeDefined()
        expect(getComponent(entity2, Component1)).toBeDefined()
        expect(getComponent(entity2, Component2)).toBeDefined()
      })

      it('should set multiple components on entity with existing components in ECS', () => {
        const entity1 = UUIDComponent.create(source1, nodeID1, Layers.Authoring)
        setComponent(entity1, Component1)
        const currentState: SourceData = { [nodeID1]: { [Component1.jsonID]: {} } }
        const finalState: SourceData = { [nodeID1]: { [Component1.jsonID]: {}, [Component2.jsonID]: {} } }

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(getComponent(entity1, Component1)).toBeDefined()
        expect(getComponent(entity1, Component2)).toBeDefined()
      })

      it('should set multiple components on multiple entities with existing components in ECS', () => {
        const entity1 = UUIDComponent.create(source1, nodeID1, Layers.Authoring)
        const entity2 = UUIDComponent.create(source1, nodeID2, Layers.Authoring)
        setComponent(entity1, Component1)
        setComponent(entity2, Component2)
        const currentState: SourceData = {
          [nodeID1]: { [Component1.jsonID]: {} },
          [nodeID2]: { [Component2.jsonID]: {} }
        }
        const finalState: SourceData = {
          [nodeID1]: { [Component1.jsonID]: {}, [Component2.jsonID]: {} },
          [nodeID2]: { [Component1.jsonID]: {}, [Component2.jsonID]: {} }
        }

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(getComponent(entity1, Component1)).toBeDefined()
        expect(getComponent(entity1, Component2)).toBeDefined()
        expect(getComponent(entity2, Component1)).toBeDefined()
        expect(getComponent(entity2, Component2)).toBeDefined()
      })
    })

    describe('removeComponent', () => {
      it('should remove component from entity in ECS', () => {
        const entity1 = UUIDComponent.create(source1, nodeID1, Layers.Authoring)
        setComponent(entity1, Component1)
        const currentState: SourceData = { [nodeID1]: { [Component1.jsonID]: {} } }
        const finalState: SourceData = { [nodeID1]: {} }

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(getComponent(entity1, Component1)).toBeUndefined()
      })

      it('should remove component from multiple entities in ECS', () => {
        const entity1 = UUIDComponent.create(source1, nodeID1, Layers.Authoring)
        const entity2 = UUIDComponent.create(source1, nodeID2, Layers.Authoring)
        setComponent(entity1, Component1)
        setComponent(entity2, Component2)
        const currentState: SourceData = {
          [nodeID1]: { [Component1.jsonID]: {} },
          [nodeID2]: { [Component2.jsonID]: {} }
        }
        const finalState: SourceData = { [nodeID1]: {}, [nodeID2]: {} }

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(getComponent(entity1, Component1)).toBeUndefined()
        expect(getComponent(entity2, Component2)).toBeUndefined()
      })

      it('should remove multiple components from entity in ECS', () => {
        const entity1 = UUIDComponent.create(source1, nodeID1, Layers.Authoring)
        setComponent(entity1, Component1)
        setComponent(entity1, Component2)
        const currentState: SourceData = { [nodeID1]: { [Component1.jsonID]: {}, [Component2.jsonID]: {} } }
        const finalState: SourceData = { [nodeID1]: {} }

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(getComponent(entity1, Component1)).toBeUndefined()
        expect(getComponent(entity1, Component2)).toBeUndefined()
      })

      it('should remove multiple components from multiple entities in ECS', () => {
        const entity1 = UUIDComponent.create(source1, nodeID1, Layers.Authoring)
        const entity2 = UUIDComponent.create(source1, nodeID2, Layers.Authoring)
        setComponent(entity1, Component1)
        setComponent(entity1, Component2)
        setComponent(entity2, Component1)
        setComponent(entity2, Component2)
        const currentState: SourceData = {
          [nodeID1]: { [Component1.jsonID]: {}, [Component2.jsonID]: {} },
          [nodeID2]: { [Component1.jsonID]: {}, [Component2.jsonID]: {} }
        }
        const finalState: SourceData = { [nodeID1]: {}, [nodeID2]: {} }

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(getComponent(entity1, Component1)).toBeUndefined()
        expect(getComponent(entity1, Component2)).toBeUndefined()
        expect(getComponent(entity2, Component1)).toBeUndefined()
        expect(getComponent(entity2, Component2)).toBeUndefined()
      })

      it('should remove component from entity with other components in ECS', () => {
        const entity1 = UUIDComponent.create(source1, nodeID1, Layers.Authoring)
        setComponent(entity1, Component1)
        setComponent(entity1, Component2)
        const currentState: SourceData = { [nodeID1]: { [Component1.jsonID]: {}, [Component2.jsonID]: {} } }
        const finalState: SourceData = { [nodeID1]: { [Component2.jsonID]: {} } }

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(getComponent(entity1, Component1)).toBeUndefined()
        expect(getComponent(entity1, Component2)).toBeDefined()
      })

      it('should remove component from multiple entities with other components in ECS', () => {
        const entity1 = UUIDComponent.create(source1, nodeID1, Layers.Authoring)
        const entity2 = UUIDComponent.create(source1, nodeID2, Layers.Authoring)
        setComponent(entity1, Component1)
        setComponent(entity1, Component2)
        setComponent(entity2, Component1)
        setComponent(entity2, Component2)
        const currentState: SourceData = {
          [nodeID1]: { [Component1.jsonID]: {}, [Component2.jsonID]: {} },
          [nodeID2]: { [Component1.jsonID]: {}, [Component2.jsonID]: {} }
        }
        const finalState: SourceData = {
          [nodeID1]: { [Component2.jsonID]: {} },
          [nodeID2]: { [Component1.jsonID]: {} }
        }

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(getComponent(entity1, Component1)).toBeUndefined()
        expect(getComponent(entity1, Component2)).toBeDefined()
        expect(getComponent(entity2, Component1)).toBeDefined()
        expect(getComponent(entity2, Component2)).toBeUndefined()
      })
    })
  })

  describe('getSourceSnapshot', () => {
    let source1 = UndefinedEntity
    let source2 = UndefinedEntity
    beforeEach(() => {
      createEngine()
      source1 = createEntity(Layers.Authoring)
      setComponent(source1, UUIDComponent, { entitySourceID: 'source' as SourceID, entityID: '1' as EntityID })
      source2 = createEntity(Layers.Authoring)
      setComponent(source2, UUIDComponent, { entitySourceID: 'source' as SourceID, entityID: '2' as EntityID })
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should return snapshot of source with correct component data', () => {
      const Component1 = defineComponent({ name: 'Component1', jsonID: 'Component1', toJSON: () => ({}) })
      const Component2 = defineComponent({ name: 'Component2', jsonID: 'Component2', toJSON: () => ({}) })
      const entity1 = UUIDComponent.create(source1, nodeID1, Layers.Authoring)
      const entity2 = UUIDComponent.create(source1, nodeID2, Layers.Authoring)
      setComponent(entity1, Component1)
      setComponent(entity2, Component2)

      const snapshot = getSourceSnapshot(sourceID1)

      expect(snapshot).toEqual({
        [nodeID1]: { [Component1.jsonID]: {} },
        [nodeID2]: { [Component2.jsonID]: {} }
      })
    })

    it('should include TransformComponent in the snapshot with correct data', () => {
      const entity = UUIDComponent.create(source1, nodeID1, Layers.Authoring)

      const position = new Vector3(1, 2, 3)
      const rotation = new Quaternion(0.1, 0.2, 0.3, 0.4)
      const scale = new Vector3(2, 2, 2)

      setComponent(entity, TransformComponent, {
        position,
        rotation,
        scale
      })

      const snapshot = getSourceSnapshot(sourceID1)

      expect(snapshot[nodeID1]).toBeDefined()
      expect(snapshot[nodeID1][TransformComponent.jsonID]).toBeDefined()
      expect(snapshot[nodeID1][TransformComponent.jsonID].position).toEqual({ x: 1, y: 2, z: 3 })
      expect(snapshot[nodeID1][TransformComponent.jsonID].rotation).toEqual({ x: 0.1, y: 0.2, z: 0.3, w: 0.4 })
      expect(snapshot[nodeID1][TransformComponent.jsonID].scale).toEqual({ x: 2, y: 2, z: 2 })
    })

    it('should include EntityTreeComponent in the snapshot with correct data', () => {
      const parentEntity = UUIDComponent.create(source1, 'parent' as EntityID, Layers.Authoring)
      const childEntity = UUIDComponent.create(source1, nodeID1, Layers.Authoring)

      setComponent(parentEntity, EntityTreeComponent, { parentEntity: source1 })

      console.log({ parentEntity, childEntity })
      setComponent(childEntity, EntityTreeComponent, {
        parentEntity: parentEntity,
        childIndex: 2
      })

      const snapshot = getSourceSnapshot(sourceID1)

      expect(snapshot[nodeID1]).toBeDefined()
      expect(snapshot[nodeID1][EntityTreeComponent.jsonID]).toBeDefined()
      expect(snapshot[nodeID1][EntityTreeComponent.jsonID].parentEntity).toBe(
        getComponent(parentEntity, UUIDComponent).entityID
      )

      expect(snapshot[nodeID1][EntityTreeComponent.jsonID].childIndex).toBeDefined()
    })

    it('should include NameComponent in the snapshot with correct data', () => {
      const entity = UUIDComponent.create(source1, nodeID1, Layers.Authoring)

      setComponent(entity, NameComponent, 'TestEntityName')

      const snapshot = getSourceSnapshot(sourceID1)

      expect(snapshot[nodeID1]).toBeDefined()
      expect(snapshot[nodeID1][NameComponent.jsonID]).toBeDefined()
      expect(snapshot[nodeID1][NameComponent.jsonID]).toBe('TestEntityName')
    })

    it('should include all special case components in the snapshot correctly', () => {
      const parentEntity = UUIDComponent.create(source1, 'parent' as EntityID, Layers.Authoring)
      const entity = UUIDComponent.create(source1, nodeID1, Layers.Authoring)

      setComponent(parentEntity, EntityTreeComponent, { parentEntity: source1 })

      const position = new Vector3(1, 2, 3)
      const rotation = new Quaternion(0.1, 0.2, 0.3, 0.4)
      const scale = new Vector3(2, 2, 2)

      setComponent(entity, TransformComponent, {
        position,
        rotation,
        scale
      })

      setComponent(entity, EntityTreeComponent, {
        parentEntity: parentEntity,
        childIndex: 1
      })

      setComponent(entity, NameComponent, 'TestEntityName')

      const snapshot = getSourceSnapshot(sourceID1)

      expect(snapshot[nodeID1]).toBeDefined()

      expect(snapshot[nodeID1][TransformComponent.jsonID]).toBeDefined()
      expect(snapshot[nodeID1][TransformComponent.jsonID].position).toEqual({ x: 1, y: 2, z: 3 })
      expect(snapshot[nodeID1][TransformComponent.jsonID].rotation).toEqual({ x: 0.1, y: 0.2, z: 0.3, w: 0.4 })
      expect(snapshot[nodeID1][TransformComponent.jsonID].scale).toEqual({ x: 2, y: 2, z: 2 })

      expect(snapshot[nodeID1][EntityTreeComponent.jsonID]).toBeDefined()
      expect(snapshot[nodeID1][EntityTreeComponent.jsonID].parentEntity).toBe(
        getComponent(parentEntity, UUIDComponent).entityID
      )

      expect(snapshot[nodeID1][EntityTreeComponent.jsonID].childIndex).toBeDefined()

      expect(snapshot[nodeID1][NameComponent.jsonID]).toBeDefined()
      expect(snapshot[nodeID1][NameComponent.jsonID]).toBe('TestEntityName')
    })
  })

  describe('canUndo', () => {
    beforeEach(() => {
      createEngine()

      getMutableState(EngineState).userID.set('testUser' as UserID)
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should return false when there are no commands', () => {
      getMutableState(AuthoringState).commands['testUser'].set([])

      expect(AuthoringState.canUndo()).toBe(false)
    })

    it('should return false when there are only undo commands', () => {
      getMutableState(AuthoringState).commands['testUser'].set([{ type: 'undo' }, { type: 'undo' }])

      expect(AuthoringState.canUndo()).toBe(false)
    })

    it('should return true when there are commands that can be undone', () => {
      getMutableState(AuthoringState).commands['testUser'].set([
        { [sourceID1]: [{ op: 'add', path: '/node1', value: {} }] }
      ])

      expect(AuthoringState.canUndo()).toBe(true)
    })

    it('should return true when there are commands after undo/redo operations', () => {
      getMutableState(AuthoringState).commands['testUser'].set([
        { [sourceID1]: [{ op: 'add', path: '/node1', value: {} }] },
        { type: 'undo' },
        { type: 'redo' },
        { [sourceID1]: [{ op: 'add', path: '/node2', value: {} }] }
      ])

      expect(AuthoringState.canUndo()).toBe(true)
    })
  })

  describe('canRedo', () => {
    beforeEach(() => {
      createEngine()

      getMutableState(EngineState).userID.set('testUser' as UserID)
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should return false when there are no commands', () => {
      getMutableState(AuthoringState).commands['testUser'].set([])

      expect(AuthoringState.canRedo()).toBe(false)
    })

    it('should return false when there are no undo commands', () => {
      getMutableState(AuthoringState).commands['testUser'].set([
        { [sourceID1]: [{ op: 'add', path: '/node1', value: {} }] },
        { [sourceID1]: [{ op: 'add', path: '/node2', value: {} }] }
      ])

      expect(AuthoringState.canRedo()).toBe(false)
    })

    it('should return true when there are commands that can be redone', () => {
      getMutableState(AuthoringState).commands['testUser'].set([
        { [sourceID1]: [{ op: 'add', path: '/node1', value: {} }] },
        { type: 'undo' }
      ])

      expect(AuthoringState.canRedo()).toBe(true)
    })

    it('should return false after a new command is added after an undo', () => {
      getMutableState(AuthoringState).commands['testUser'].set([
        { [sourceID1]: [{ op: 'add', path: '/node1', value: {} }] },
        { type: 'undo' },
        { [sourceID1]: [{ op: 'add', path: '/node2', value: {} }] }
      ])

      expect(AuthoringState.canRedo()).toBe(false)
    })
  })

  describe('snapshot', () => {
    let source1 = UndefinedEntity
    let source2 = UndefinedEntity
    beforeEach(() => {
      createEngine()
      source1 = createEntity(Layers.Authoring)
      setComponent(source1, UUIDComponent, { entitySourceID: 'source' as SourceID, entityID: '1' as EntityID })
      source2 = createEntity(Layers.Authoring)
      setComponent(source2, UUIDComponent, { entitySourceID: 'source' as SourceID, entityID: '2' as EntityID })

      getMutableState(EngineState).userID.set('testUser' as UserID)
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should dispatch an action for the sourceID with', () => {
      const Component1 = defineComponent({ name: 'Component1', jsonID: 'Component1', toJSON: () => ({}) })
      const entity = UUIDComponent.create(source1, nodeID1, Layers.Authoring)
      setComponent(entity, Component1)

      const initialSnapshot = getSourceSnapshot(sourceID1)
      getMutableState(AuthoringState).sources[sourceID1].set({
        initial: initialSnapshot,
        latest: initialSnapshot
      })

      const Component2 = defineComponent({ name: 'Component2', jsonID: 'Component2', toJSON: () => ({}) })
      setComponent(entity, Component2)

      AuthoringState.snapshot(sourceID1)

      const latestSnapshot = getState(AuthoringState).sources[sourceID1].latest
      expect(latestSnapshot).toBeDefined()
      expect(latestSnapshot[nodeID1]).toBeDefined()

      const updatedSnapshot = getSourceSnapshot(sourceID1)
      expect(updatedSnapshot[nodeID1][Component2.jsonID]).toBeDefined()
    })
  })

  describe('snapshotEntities', () => {
    let source1 = UndefinedEntity
    let source2 = UndefinedEntity
    beforeEach(() => {
      createEngine()
      source1 = createEntity(Layers.Authoring)
      setComponent(source1, UUIDComponent, { entitySourceID: 'source' as SourceID, entityID: '1' as EntityID })
      source2 = createEntity(Layers.Authoring)
      setComponent(source2, UUIDComponent, { entitySourceID: 'source' as SourceID, entityID: '2' as EntityID })

      getMutableState(EngineState).userID.set('testUser' as UserID)
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should do nothing when no entities are provided', () => {
      AuthoringState.snapshotEntities([])

      const actions = Engine.instance.store.actions.history
      expect(actions).toHaveLength(0)
    })

    it('should dispatch an ops action for each source when entities are provided', () => {
      getMutableState(AuthoringState).sources[sourceID1].set({
        initial: {},
        latest: {}
      })

      const Component1 = defineComponent({ name: 'Component1', jsonID: 'Component1', toJSON: () => ({}) })
      const entity = UUIDComponent.create(source1, nodeID1, Layers.Authoring)
      setComponent(entity, Component1)

      AuthoringState.snapshotEntities([entity])

      const actions = Engine.instance.store.actions.incoming
      expect(actions).toHaveLength(1)
      const action = actions[0] as typeof AuthoringActions.ops.matches._TYPE
      expect(action.type).toBe(AuthoringActions.ops.type)
      expect(action.ops[sourceID1]).toBeDefined()
      expect(action.ops[sourceID1]).toHaveLength(1)
      const op = action.ops[sourceID1][0] as AddOperation
      expect(op.op).toBe('add')
      expect(op.path).toBe('/node1')
      expect(op.value).toStrictEqual({ Component1: {} })
    })

    it('should dispatch an ops action for each source when entities are provided', () => {
      getMutableState(AuthoringState).sources[sourceID1].set({
        initial: {},
        latest: {}
      })
      getMutableState(AuthoringState).sources[sourceID2].set({
        initial: {},
        latest: {}
      })

      const Component1 = defineComponent({ name: 'Component1', jsonID: 'Component1', toJSON: () => ({}) })
      const entity1 = UUIDComponent.create(source1, nodeID1, Layers.Authoring)
      setComponent(entity1, Component1)

      const Component2 = defineComponent({ name: 'Component2', jsonID: 'Component2', toJSON: () => ({}) })
      const entity2 = UUIDComponent.create(source2, nodeID2, Layers.Authoring)
      setComponent(entity2, Component2)

      AuthoringState.snapshotEntities([entity1, entity2])

      const actions = Engine.instance.store.actions.incoming
      expect(actions).toHaveLength(1)
      const action = actions[0] as typeof AuthoringActions.ops.matches._TYPE
      expect(action.type).toBe(AuthoringActions.ops.type)
      expect(action.ops[sourceID1]).toBeDefined()
      expect(action.ops[sourceID1]).toHaveLength(1)
      expect(action.ops[sourceID2]).toBeDefined()
      expect(action.ops[sourceID2]).toHaveLength(1)
    })
  })
})
