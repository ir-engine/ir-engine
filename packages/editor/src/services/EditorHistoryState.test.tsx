import {
  createEngine,
  defineComponent,
  destroyEngine,
  entityExists,
  getComponent,
  Layers,
  setComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { NodeID, NodeIDComponent } from '@ir-engine/engine/src/gltf/NodeIDComponent'
import { SourceID } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  applyCommandsToECS,
  computeCommands,
  getSourceSnapshot,
  HistoryCommand,
  SourceData
} from './EditorHistoryState'

const sourceID1 = 'source1' as SourceID
const sourceID2 = 'source2' as SourceID
const nodeID1 = 'node1' as NodeID
const nodeID2 = 'node2' as NodeID

describe('EditorHistoryState', () => {
  describe('computeCommands', () => {
    it('should handle undo and redo commands correctly', () => {
      const commands: HistoryCommand[] = [
        { type: 'snapshot', sourceID: sourceID1, partialState: {} },
        { type: 'undo', sourceID: sourceID1 },
        { type: 'redo', sourceID: sourceID1 }
      ]
      const { doneStack, redoStack } = computeCommands(commands)
      expect(doneStack).toHaveLength(1)
      expect(redoStack).toHaveLength(0)
    })

    it('should clear redo stack on new command', () => {
      const commands: HistoryCommand[] = [
        { type: 'snapshot', sourceID: sourceID1, partialState: {} },
        { type: 'undo', sourceID: sourceID1 },
        { type: 'snapshot', sourceID: sourceID1, partialState: {} }
      ]
      const { doneStack, redoStack } = computeCommands(commands)
      expect(doneStack).toHaveLength(1)
      expect(redoStack).toHaveLength(0)
    })

    it('should handle multiple undo and redo commands correctly', () => {
      const commands: HistoryCommand[] = [
        { type: 'snapshot', sourceID: sourceID1, partialState: {} },
        { type: 'snapshot', sourceID: sourceID1, partialState: {} },
        { type: 'undo', sourceID: sourceID1 },
        { type: 'redo', sourceID: sourceID1 },
        { type: 'undo', sourceID: sourceID1 }
      ]
      const { doneStack, redoStack } = computeCommands(commands)
      expect(doneStack).toHaveLength(1)
      expect(redoStack).toHaveLength(1)
    })

    it('should handle multiple undo and redo commands with commands between them correctly', () => {
      const commands: HistoryCommand[] = [
        { type: 'snapshot', sourceID: sourceID1, partialState: {} },
        { type: 'snapshot', sourceID: sourceID1, partialState: {} },
        { type: 'undo', sourceID: sourceID1 },
        { type: 'snapshot', sourceID: sourceID1, partialState: {} },
        { type: 'redo', sourceID: sourceID1 },
        { type: 'undo', sourceID: sourceID1 }
      ]
      const { doneStack, redoStack } = computeCommands(commands)
      expect(doneStack).toHaveLength(1)
      expect(redoStack).toHaveLength(1)
    })
  })

  describe('applyCommandsToECS', () => {
    const Component1 = defineComponent({ name: 'Component1' })
    const Component2 = defineComponent({ name: 'Component2' })

    beforeEach(() => {
      createEngine()
    })

    afterEach(() => {
      return destroyEngine()
    })

    describe('addEntity', () => {
      it('should add entity to ECS', () => {
        const currentState: SourceData = {}
        const finalState: SourceData = { [nodeID1]: {} }

        applyCommandsToECS(sourceID1, currentState, finalState)

        const node1UUID = NodeIDComponent.getUUIDBySourceAndNodeID(sourceID1, nodeID1)
        const node1Entity = UUIDComponent.getEntityByUUID(node1UUID, Layers.Authoring)

        expect(node1Entity).toBeDefined()
      })

      it('should add multiple entities to ECS', () => {
        const currentState: SourceData = {}
        const finalState: SourceData = { [nodeID1]: { [Component1.name]: {} }, [nodeID2]: { [Component2.name]: {} } }

        applyCommandsToECS(sourceID1, currentState, finalState)

        const node1UUID = NodeIDComponent.getUUIDBySourceAndNodeID(sourceID1, nodeID1)
        const node1Entity = UUIDComponent.getEntityByUUID(node1UUID, Layers.Authoring)
        const node2UUID = NodeIDComponent.getUUIDBySourceAndNodeID(sourceID1, nodeID2)
        const node2Entity = UUIDComponent.getEntityByUUID(node2UUID, Layers.Authoring)

        expect(node1Entity).toBeDefined()
        expect(node2Entity).toBeDefined()
      })

      it('should add entity with components to ECS', () => {
        const currentState: SourceData = {}
        const finalState: SourceData = { [nodeID1]: { [Component1.name]: {}, [Component2.name]: {} } }

        applyCommandsToECS(sourceID1, currentState, finalState)

        const node1UUID = NodeIDComponent.getUUIDBySourceAndNodeID(sourceID1, nodeID1)
        const node1Entity = UUIDComponent.getEntityByUUID(node1UUID, Layers.Authoring)

        expect(node1Entity).toBeDefined()
        expect(getComponent(node1Entity, Component1)).toBeDefined()
        expect(getComponent(node1Entity, Component2)).toBeDefined()
      })

      it('should add multiple entities with components to ECS', () => {
        const currentState: SourceData = {}
        const finalState: SourceData = {
          [nodeID1]: { [Component1.name]: {} },
          [nodeID2]: { [Component2.name]: {} }
        }

        applyCommandsToECS(sourceID1, currentState, finalState)

        const node1UUID = NodeIDComponent.getUUIDBySourceAndNodeID(sourceID1, nodeID1)
        const node1Entity = UUIDComponent.getEntityByUUID(node1UUID, Layers.Authoring)
        const node2UUID = NodeIDComponent.getUUIDBySourceAndNodeID(sourceID1, nodeID2)
        const node2Entity = UUIDComponent.getEntityByUUID(node2UUID, Layers.Authoring)

        expect(node1Entity).toBeDefined()
        expect(node2Entity).toBeDefined()
        expect(getComponent(node1Entity, Component1)).toBeDefined()
        expect(getComponent(node2Entity, Component2)).toBeDefined()
      })
    })

    describe('removeEntity', () => {
      it('should remove entity from ECS', () => {
        const entity1 = NodeIDComponent.create(sourceID1, nodeID1, Layers.Authoring)
        const currentState: SourceData = { [nodeID1]: {} }
        const finalState: SourceData = {}

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(entityExists(entity1)).toBe(false)
      })

      it('should remove multiple entities from ECS', () => {
        const entity1 = NodeIDComponent.create(sourceID1, nodeID1, Layers.Authoring)
        const entity2 = NodeIDComponent.create(sourceID1, nodeID2, Layers.Authoring)
        const currentState: SourceData = { [nodeID1]: {}, [nodeID2]: {} }
        const finalState: SourceData = {}

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(entityExists(entity1)).toBe(false)
        expect(entityExists(entity2)).toBe(false)
      })

      it('should remove entity with components from ECS', () => {
        const entity1 = NodeIDComponent.create(sourceID1, nodeID1, Layers.Authoring)
        const currentState: SourceData = { [nodeID1]: { [Component1.name]: {}, [Component2.name]: {} } }
        const finalState: SourceData = {}

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(entityExists(entity1)).toBe(false)
      })

      it('should remove multiple entities with components from ECS', () => {
        const entity1 = NodeIDComponent.create(sourceID1, nodeID1, Layers.Authoring)
        const entity2 = NodeIDComponent.create(sourceID1, nodeID2, Layers.Authoring)
        setComponent(entity1, Component1)
        setComponent(entity2, Component2)
        const currentState: SourceData = {
          [nodeID1]: { [Component1.name]: {} },
          [nodeID2]: { [Component2.name]: {} }
        }
        const finalState: SourceData = {}

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(entityExists(entity1)).toBe(false)
        expect(entityExists(entity2)).toBe(false)
      })
    })

    describe('setComponent', () => {
      it('should set component on entity in ECS', () => {
        const entity1 = NodeIDComponent.create(sourceID1, nodeID1, Layers.Authoring)
        const currentState: SourceData = { [nodeID1]: {} }
        const finalState: SourceData = { [nodeID1]: { [Component1.name]: {} } }

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(getComponent(entity1, Component1)).toBeDefined()
      })

      it('should set component on multiple entities in ECS', () => {
        const entity1 = NodeIDComponent.create(sourceID1, nodeID1, Layers.Authoring)
        const entity2 = NodeIDComponent.create(sourceID1, nodeID2, Layers.Authoring)
        const currentState: SourceData = { [nodeID1]: {}, [nodeID2]: {} }
        const finalState: SourceData = { [nodeID1]: { [Component1.name]: {} }, [nodeID2]: { [Component2.name]: {} } }

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(getComponent(entity1, Component1)).toBeDefined()
        expect(getComponent(entity2, Component2)).toBeDefined()
      })

      it('should set multiple components on entity in ECS', () => {
        const entity1 = NodeIDComponent.create(sourceID1, nodeID1, Layers.Authoring)
        const currentState: SourceData = { [nodeID1]: {} }
        const finalState: SourceData = { [nodeID1]: { [Component1.name]: {}, [Component2.name]: {} } }

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(getComponent(entity1, Component1)).toBeDefined()
        expect(getComponent(entity1, Component2)).toBeDefined()
      })

      it('should set multiple components on multiple entities in ECS', () => {
        const entity1 = NodeIDComponent.create(sourceID1, nodeID1, Layers.Authoring)
        const entity2 = NodeIDComponent.create(sourceID1, nodeID2, Layers.Authoring)
        const currentState: SourceData = { [nodeID1]: {}, [nodeID2]: {} }
        const finalState: SourceData = {
          [nodeID1]: { [Component1.name]: {}, [Component2.name]: {} },
          [nodeID2]: { [Component1.name]: {}, [Component2.name]: {} }
        }

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(getComponent(entity1, Component1)).toBeDefined()
        expect(getComponent(entity1, Component2)).toBeDefined()
        expect(getComponent(entity2, Component1)).toBeDefined()
        expect(getComponent(entity2, Component2)).toBeDefined()
      })

      it('should set component on entity with existing components in ECS', () => {
        const entity1 = NodeIDComponent.create(sourceID1, nodeID1, Layers.Authoring)
        setComponent(entity1, Component1)
        const currentState: SourceData = { [nodeID1]: { [Component1.name]: {} } }
        const finalState: SourceData = { [nodeID1]: { [Component1.name]: {}, [Component2.name]: {} } }

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(getComponent(entity1, Component1)).toBeDefined()
        expect(getComponent(entity1, Component2)).toBeDefined()
      })

      it('should set component on multiple entities with existing components in ECS', () => {
        const entity1 = NodeIDComponent.create(sourceID1, nodeID1, Layers.Authoring)
        const entity2 = NodeIDComponent.create(sourceID1, nodeID2, Layers.Authoring)
        setComponent(entity1, Component1)
        setComponent(entity2, Component2)
        const currentState: SourceData = {
          [nodeID1]: { [Component1.name]: {} },
          [nodeID2]: { [Component2.name]: {} }
        }
        const finalState: SourceData = {
          [nodeID1]: { [Component1.name]: {}, [Component2.name]: {} },
          [nodeID2]: { [Component1.name]: {}, [Component2.name]: {} }
        }

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(getComponent(entity1, Component1)).toBeDefined()
        expect(getComponent(entity1, Component2)).toBeDefined()
        expect(getComponent(entity2, Component1)).toBeDefined()
        expect(getComponent(entity2, Component2)).toBeDefined()
      })

      it('should set multiple components on entity with existing components in ECS', () => {
        const entity1 = NodeIDComponent.create(sourceID1, nodeID1, Layers.Authoring)
        setComponent(entity1, Component1)
        const currentState: SourceData = { [nodeID1]: { [Component1.name]: {} } }
        const finalState: SourceData = { [nodeID1]: { [Component1.name]: {}, [Component2.name]: {} } }

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(getComponent(entity1, Component1)).toBeDefined()
        expect(getComponent(entity1, Component2)).toBeDefined()
      })

      it('should set multiple components on multiple entities with existing components in ECS', () => {
        const entity1 = NodeIDComponent.create(sourceID1, nodeID1, Layers.Authoring)
        const entity2 = NodeIDComponent.create(sourceID1, nodeID2, Layers.Authoring)
        setComponent(entity1, Component1)
        setComponent(entity2, Component2)
        const currentState: SourceData = {
          [nodeID1]: { [Component1.name]: {} },
          [nodeID2]: { [Component2.name]: {} }
        }
        const finalState: SourceData = {
          [nodeID1]: { [Component1.name]: {}, [Component2.name]: {} },
          [nodeID2]: { [Component1.name]: {}, [Component2.name]: {} }
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
        const entity1 = NodeIDComponent.create(sourceID1, nodeID1, Layers.Authoring)
        setComponent(entity1, Component1)
        const currentState: SourceData = { [nodeID1]: { [Component1.name]: {} } }
        const finalState: SourceData = { [nodeID1]: {} }

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(getComponent(entity1, Component1)).toBeUndefined()
      })

      it('should remove component from multiple entities in ECS', () => {
        const entity1 = NodeIDComponent.create(sourceID1, nodeID1, Layers.Authoring)
        const entity2 = NodeIDComponent.create(sourceID1, nodeID2, Layers.Authoring)
        setComponent(entity1, Component1)
        setComponent(entity2, Component2)
        const currentState: SourceData = { [nodeID1]: { [Component1.name]: {} }, [nodeID2]: { [Component2.name]: {} } }
        const finalState: SourceData = { [nodeID1]: {}, [nodeID2]: {} }

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(getComponent(entity1, Component1)).toBeUndefined()
        expect(getComponent(entity2, Component2)).toBeUndefined()
      })

      it('should remove multiple components from entity in ECS', () => {
        const entity1 = NodeIDComponent.create(sourceID1, nodeID1, Layers.Authoring)
        setComponent(entity1, Component1)
        setComponent(entity1, Component2)
        const currentState: SourceData = { [nodeID1]: { [Component1.name]: {}, [Component2.name]: {} } }
        const finalState: SourceData = { [nodeID1]: {} }

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(getComponent(entity1, Component1)).toBeUndefined()
        expect(getComponent(entity1, Component2)).toBeUndefined()
      })

      it('should remove multiple components from multiple entities in ECS', () => {
        const entity1 = NodeIDComponent.create(sourceID1, nodeID1, Layers.Authoring)
        const entity2 = NodeIDComponent.create(sourceID1, nodeID2, Layers.Authoring)
        setComponent(entity1, Component1)
        setComponent(entity1, Component2)
        setComponent(entity2, Component1)
        setComponent(entity2, Component2)
        const currentState: SourceData = {
          [nodeID1]: { [Component1.name]: {}, [Component2.name]: {} },
          [nodeID2]: { [Component1.name]: {}, [Component2.name]: {} }
        }
        const finalState: SourceData = { [nodeID1]: {}, [nodeID2]: {} }

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(getComponent(entity1, Component1)).toBeUndefined()
        expect(getComponent(entity1, Component2)).toBeUndefined()
        expect(getComponent(entity2, Component1)).toBeUndefined()
        expect(getComponent(entity2, Component2)).toBeUndefined()
      })

      it('should remove component from entity with other components in ECS', () => {
        const entity1 = NodeIDComponent.create(sourceID1, nodeID1, Layers.Authoring)
        setComponent(entity1, Component1)
        setComponent(entity1, Component2)
        const currentState: SourceData = { [nodeID1]: { [Component1.name]: {}, [Component2.name]: {} } }
        const finalState: SourceData = { [nodeID1]: { [Component2.name]: {} } }

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(getComponent(entity1, Component1)).toBeUndefined()
        expect(getComponent(entity1, Component2)).toBeDefined()
      })

      it('should remove component from multiple entities with other components in ECS', () => {
        const entity1 = NodeIDComponent.create(sourceID1, nodeID1, Layers.Authoring)
        const entity2 = NodeIDComponent.create(sourceID1, nodeID2, Layers.Authoring)
        setComponent(entity1, Component1)
        setComponent(entity1, Component2)
        setComponent(entity2, Component1)
        setComponent(entity2, Component2)
        const currentState: SourceData = {
          [nodeID1]: { [Component1.name]: {}, [Component2.name]: {} },
          [nodeID2]: { [Component1.name]: {}, [Component2.name]: {} }
        }
        const finalState: SourceData = { [nodeID1]: { [Component2.name]: {} }, [nodeID2]: { [Component1.name]: {} } }

        applyCommandsToECS(sourceID1, currentState, finalState)

        expect(getComponent(entity1, Component1)).toBeUndefined()
        expect(getComponent(entity1, Component2)).toBeDefined()
        expect(getComponent(entity2, Component1)).toBeDefined()
        expect(getComponent(entity2, Component2)).toBeUndefined()
      })
    })
  })

  describe('getSourceSnapshot', () => {
    beforeEach(() => {
      createEngine()
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should return snapshot of source with correct component data', () => {
      const Component1 = defineComponent({ name: 'Component1', jsonID: 'Component1', toJSON: () => ({}) })
      const Component2 = defineComponent({ name: 'Component2', jsonID: 'Component2', toJSON: () => ({}) })
      const entity1 = NodeIDComponent.create(sourceID1, nodeID1, Layers.Authoring)
      const entity2 = NodeIDComponent.create(sourceID1, nodeID2, Layers.Authoring)
      setComponent(entity1, Component1)
      setComponent(entity2, Component2)

      const snapshot = getSourceSnapshot(sourceID1)

      expect(snapshot).toEqual({
        [nodeID1]: { [Component1.name]: {} },
        [nodeID2]: { [Component2.name]: {} }
      })
    })
  })
})
