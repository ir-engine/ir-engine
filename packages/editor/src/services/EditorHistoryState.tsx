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
  Component,
  ComponentMap,
  deserializeComponent,
  Entity,
  EntityTreeComponent,
  getAllComponents,
  getComponent,
  hasComponent,
  Layers,
  QueryReactor,
  removeComponent,
  removeEntity,
  serializeComponent,
  SetComponentType,
  UUIDComponent
} from '@ir-engine/ecs'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { NodeID, NodeIDComponent } from '@ir-engine/engine/src/gltf/NodeIDComponent'
import { SourceComponent, SourceID } from '@ir-engine/engine/src/scene/components/SourceComponent'
import {
  defineAction,
  defineState,
  dispatchAction,
  ErrorBoundary,
  getMutableState,
  getState,
  matches,
  NO_PROXY,
  PeerID,
  useMutableState,
  Validator
} from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import React, { Suspense, useEffect } from 'react'
import { EditorControlFunctions } from '../functions/EditorControlFunctions'
import { EditorState } from './EditorServices'

export type HistoryCommandTypes = 'undo' | 'redo' | 'addEntity' | 'snapshot'

export type NodeData = Record<string, string | number | object | undefined> // ComponentName => SerializableComponent

export type SourceData = Record<NodeID, NodeData>

export type UndoCommand = {
  type: 'undo'
  sourceID: SourceID
}

export type RedoCommand = {
  type: 'redo'
  sourceID: SourceID
}

/**
 * We need to use snapshots instead of specific reversable commands, since the ECS can be
 */
export type StateSnapshotCommand = {
  type: 'snapshot'
  sourceID: SourceID
  partialState: SourceData
}

export type HistoryCommand = UndoCommand | RedoCommand | StateSnapshotCommand

export const EditorHistoryActions = {
  undo: defineAction({
    type: 'ir.editor.history.UNDO',
    sourceID: matches.string as Validator<unknown, SourceID>
  }),

  redo: defineAction({
    type: 'ir.editor.history.REDO',
    sourceID: matches.string as Validator<unknown, SourceID>
  }),

  snapshot: defineAction({
    type: 'ir.editor.history.SNAPSHOT',
    sourceID: matches.string as Validator<unknown, SourceID>,
    partialState: matches.object as Validator<unknown, SourceData>
  })
}

export const EditorHistoryState = defineState({
  name: 'ir.editor.history.EditorHistoryState',
  initial: {} as Record<
    SourceID,
    { commands: Record<PeerID, HistoryCommand[]>; initial: SourceData; current: SourceData }
  >,

  receptors: {
    undo: EditorHistoryActions.undo.receive((action) => {
      const history = getMutableState(EditorHistoryState)[action.sourceID]
      if (!history.value.commands) history.commands.set({})
      const peerID = action.$peer
      if (!history.commands.value[peerID]) history.commands[peerID].set([])

      const commands = history.commands[peerID]
      commands.merge([
        {
          type: 'undo',
          sourceID: action.sourceID
        }
      ])
    }),
    redo: EditorHistoryActions.redo.receive((action) => {
      const history = getMutableState(EditorHistoryState)[action.sourceID]
      if (!history.value.commands) history.commands.set({})
      const peerID = action.$peer
      if (!history.commands.value[peerID]) history.commands[peerID].set([])

      const commands = history.commands[peerID]
      commands.merge([
        {
          type: 'redo',
          sourceID: action.sourceID
        }
      ])
    }),
    snapshot: EditorHistoryActions.snapshot.receive((action) => {
      if (!getState(EditorHistoryState)[action.sourceID]) {
        getMutableState(EditorHistoryState)[action.sourceID].set({
          commands: {},
          initial: action.partialState,
          current: action.partialState
        })
      }
      const history = getMutableState(EditorHistoryState)[action.sourceID]
      if (!history.value.commands) history.commands.set({})
      const peerID = action.$peer
      if (!history.commands.value[peerID]) history.commands[peerID].set([])

      const commands = history.commands[peerID]
      commands.merge([
        {
          type: 'snapshot',
          sourceID: action.sourceID,
          partialState: action.partialState
        }
      ])
    })
  },

  reactor: () => {
    const state = useMutableState(EditorHistoryState)

    return (
      <>
        <QueryReactor
          Components={[SceneComponent, GLTFComponent]}
          ChildEntityReactor={SourceReactor}
          layer={Layers.Authoring}
        />
        {state.keys.map((sourceID: SourceID) => (
          <ErrorBoundary key={sourceID}>
            <Suspense>
              <SourceHistoryReactor sourceID={sourceID} />
            </Suspense>
          </ErrorBoundary>
        ))}
      </>
    )
  },

  canRedo: (sourceID: SourceID) => {
    const history = getState(EditorHistoryState)[sourceID]
    const commands = Object.values(history.commands).flat() as HistoryCommand[]
    const { redoStack } = computeCommands(commands)
    return redoStack.length > 0
  },

  canUndo: (sourceID: SourceID) => {
    const history = getState(EditorHistoryState)[sourceID]
    const commands = Object.values(history.commands).flat() as HistoryCommand[]
    const { doneStack } = computeCommands(commands)
    return doneStack.length > 1 // 1 such that you cannot undo the first snapshot
  }
})

const SourceReactor = (props: { entity: Entity }) => {
  const loaded = GLTFComponent.useSceneLoaded(props.entity)

  useEffect(() => {
    if (!loaded) return

    const sourceID = GLTFComponent.getInstanceID(props.entity)

    const sourceData = getSourceSnapshot(sourceID)

    dispatchAction(EditorHistoryActions.snapshot({ sourceID, partialState: sourceData }))
  }, [loaded])

  return null
}

/**
 * Because our actions are an immutable event log, we can replay them to get the current state.
 * This component replays the history of a source to keep the current state in sync.
 */
const SourceHistoryReactor = (props: { sourceID: SourceID }) => {
  const state = useMutableState(EditorHistoryState)[props.sourceID]
  const commands = Object.values(state.commands.get(NO_PROXY)).flat() as HistoryCommand[]
  const commandLength = commands.length

  useEffect(() => {
    if (commandLength === 0) return

    /** @todo support editing models loaded as part of the base scene */
    if (props.sourceID !== GLTFComponent.getInstanceID(getState(EditorState).rootEntity)) return

    // parse our undo/redo stack and return a new list of commands that represent the final graph path
    const { doneStack } = computeCommands(commands)
    if (!doneStack.length) return

    // get the final state of the history
    const finalState = doneStack[doneStack.length - 1] as StateSnapshotCommand

    // get the readonly state and treat it as mutable so we have a non-reactive copy of the current state
    const readonlyState = getState(EditorHistoryState)[props.sourceID] as { current: SourceData }

    // update the state to the ECS
    applyCommandsToECS(props.sourceID, readonlyState.current, finalState.partialState)

    readonlyState.current = finalState.partialState
  }, [commandLength])

  return null
}

/**
 * Given a list of commands, compute the final state of the history.
 * @param commands
 * @returns
 */
export const computeCommands = (commands: HistoryCommand[]) => {
  const commandLength = commands.length
  const doneStack: HistoryCommand[] = []
  const redoStack: HistoryCommand[] = []
  for (let i = 0; i < commandLength; i++) {
    const command = commands[i]
    if (command.type === 'undo') {
      // Undo the most recent command, if there is one.
      if (doneStack.length > 0) {
        const undoneCmd = doneStack.pop()!
        redoStack.push(undoneCmd)
      }
    } else if (command.type === 'redo') {
      // Redo the most recent undone command.
      if (redoStack.length > 0) {
        const redoneCmd = redoStack.pop()!
        doneStack.push(redoneCmd)
      }
    } else {
      // A normal command: push it onto the done stack
      // and clear the redo stack (as new commands invalidate the redo history).
      doneStack.push(command)
      redoStack.length = 0
    }
  }

  return { doneStack, redoStack }
}

/**
 * Given a final state, apply the commands to the ECS.
 * - Ensures that entities and components that are created or removed are reflected in the ECS with respect to the the last update.
 * @param sourceID
 * @param finalState
 */
export const applyCommandsToECS = (sourceID: SourceID, currentState: SourceData, finalState: SourceData) => {
  for (const nodeID of Object.keys(finalState) as NodeID[]) {
    if (finalState[nodeID]) {
      const uuid = NodeIDComponent.getUUIDBySourceAndNodeID(sourceID, nodeID)
      if (!currentState[nodeID] && !UUIDComponent.getEntityByUUID(uuid, Layers.Authoring)) {
        // entity does not exist, add entity
        NodeIDComponent.create(sourceID, nodeID, Layers.Authoring)
      }
      const entity = UUIDComponent.getEntityByUUID(uuid, Layers.Authoring)
      for (const [componentName, componentData] of Object.entries(finalState[nodeID])) {
        const Component = ComponentMap.get(componentName)
        if (!Component) continue
        deserializeComponent(entity, Component, componentData)
      }
      if (currentState[nodeID]) {
        for (const componentName of Object.keys(currentState[nodeID] as NodeData)) {
          if (!finalState[nodeID][componentName]) {
            // component does not exist, remove component
            const Component = ComponentMap.get(componentName)
            if (!Component) continue
            removeComponent(entity, Component)
          }
        }
      }
    }
  }
  for (const nodeID of Object.keys(currentState) as NodeID[]) {
    if (!finalState[nodeID]) {
      // entity does not exist, remove entity
      const uuid = NodeIDComponent.getUUIDBySourceAndNodeID(sourceID, nodeID)
      const entity = UUIDComponent.getEntityByUUID(uuid, Layers.Authoring)
      // ensure the entity has actually been removed, and not moved to another source
      if (getComponent(entity, SourceComponent) === sourceID) {
        removeEntity(entity)
      }
    }
  }
}

export const getSourceSnapshot = (sourceID: SourceID) => {
  const sourceEntities = SourceComponent.getEntitiesBySource(sourceID, Layers.Authoring)

  const sourceData = {} as SourceData

  for (const entity of sourceEntities) {
    const nodeID = getComponent(entity, NodeIDComponent)
    sourceData[nodeID] = {}

    const components = getAllComponents(entity)

    for (const component of components) {
      if (component === NodeIDComponent) continue
      const sceneComponentID = component.jsonID
      if (sceneComponentID) {
        const data = serializeComponent(entity, component)
        if (data) {
          sourceData[nodeID][component.name] = data
        }
      }
    }

    // special case components that do not have a jsonID but are required if available
    if (hasComponent(entity, NameComponent)) {
      sourceData[nodeID][NameComponent.name] = getComponent(entity, NameComponent)
    }
    if (hasComponent(entity, TransformComponent)) {
      const component = getComponent(entity, TransformComponent)
      sourceData[nodeID][TransformComponent.name] = {
        position: {
          x: component.position.x,
          y: component.position.y,
          z: component.position.z
        },
        rotation: {
          x: component.rotation.x,
          y: component.rotation.y,
          z: component.rotation.z,
          w: component.rotation.w
        },
        scale: {
          x: component.scale.x,
          y: component.scale.y,
          z: component.scale.z
        }
      }
    }
    if (hasComponent(entity, EntityTreeComponent)) {
      sourceData[nodeID][EntityTreeComponent.name] = {
        parentEntity: getComponent(entity, EntityTreeComponent).parentEntity,
        childIndex: getComponent(entity, EntityTreeComponent).childIndex
      }
    }
  }

  return sourceData
}

export const EditorHistoryFunctions = {
  setComponent: <C extends Component<any, any>>(
    entities: Entity[],
    component: C,
    args: SetComponentType<C> | undefined = undefined
  ) => {
    const affectedNodes = EditorControlFunctions.addOrRemoveComponent(entities, component, true, args)
    const sourceID = GLTFComponent.getInstanceID(getState(EditorState).rootEntity)
    dispatchAction(
      EditorHistoryActions.snapshot({
        sourceID,
        /** @todo make this a partial */
        partialState: getSourceSnapshot(sourceID)
      })
    )
    return affectedNodes
  },
  removeComponent: <C extends Component<any, any>>(entities: Entity[], component: C) => {
    const affectedNodes = EditorControlFunctions.addOrRemoveComponent(entities, component, false)
    const sourceID = GLTFComponent.getInstanceID(getState(EditorState).rootEntity)
    dispatchAction(
      EditorHistoryActions.snapshot({
        sourceID,
        /** @todo make this a partial */
        partialState: getSourceSnapshot(sourceID)
      })
    )
    return affectedNodes
  },
  createEntity: (nodeID: NodeID, components: NodeData) => {
    const componentJson = Object.entries(components).map(([componentName, componentData]) => {
      const Component = ComponentMap.get(componentName)
      if (!Component?.jsonID) return
      return { name: Component.jsonID, props: componentData } as any
    })
    componentJson[NodeIDComponent.jsonID] = { name: NodeIDComponent.jsonID, props: nodeID }
    const root = getState(EditorState).rootEntity
    EditorControlFunctions.createObjectFromSceneElement(componentJson, root)
    const sourceID = GLTFComponent.getInstanceID(root)
    dispatchAction(
      EditorHistoryActions.snapshot({
        sourceID,
        /** @todo make this a partial */
        partialState: getSourceSnapshot(sourceID)
      })
    )
  },
  removeEntity: (entities: Entity[]) => {
    EditorControlFunctions.removeObject(entities)
    const sourceID = GLTFComponent.getInstanceID(getState(EditorState).rootEntity)
    dispatchAction(
      EditorHistoryActions.snapshot({
        sourceID,
        /** @todo make this a partial */
        partialState: getSourceSnapshot(sourceID)
      })
    )
  },
  snapshot: (sourceID?: SourceID) => {
    if (!sourceID) sourceID = GLTFComponent.getInstanceID(getState(EditorState).rootEntity)
    dispatchAction(
      EditorHistoryActions.snapshot({
        sourceID,
        /** @todo make this a partial */
        partialState: getSourceSnapshot(sourceID)
      })
    )
  }
}
