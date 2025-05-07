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
  ComponentMap,
  deserializeComponent,
  EngineState,
  Entity,
  EntityID,
  EntityTreeComponent,
  EntityUUID,
  getAllComponents,
  getComponent,
  getOptionalComponent,
  hasComponent,
  Layers,
  QueryReactor,
  removeComponent,
  removeEntity,
  serializeComponent,
  setComponent,
  SourceID,
  UUIDComponent
} from '@ir-engine/ecs'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { NodeID, NodeIDComponent } from '@ir-engine/engine/src/gltf/NodeIDComponent'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import {
  defineAction,
  defineState,
  dispatchAction,
  ErrorBoundary,
  getMutableState,
  getState,
  matches,
  NO_PROXY,
  none,
  useMutableState,
  UserID,
  Validator
} from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import React, { Suspense, useEffect } from 'react'
import { applyPatch, createPatch, Operation, Patch } from 'rfc6902'

export type SourceData = Record<NodeID, object>

export type UndoCommand = {
  type: 'undo'
}

export type RedoCommand = {
  type: 'redo'
}

export type JSONPatchCommands = Record<SourceID, Patch>

export type HistoryCommand = UndoCommand | RedoCommand | JSONPatchCommands

export const AuthoringActions = {
  /**
   * Use to initialize the history state for a source
   */
  initialize: defineAction({
    type: 'ir.engine.authoring.INITIALIZE',
    sourceID: matches.string as Validator<unknown, SourceID>,
    partialState: matches.object as Validator<unknown, SourceData>
  }),

  /**
   * Use to uninitialize the history state for a source
   */
  uninitialize: defineAction({
    type: 'ir.engine.authoring.UNINITIALIZE',
    sourceID: matches.string as Validator<unknown, SourceID>
  }),

  /**
   * Use to undo the last done command
   */
  undo: defineAction({
    type: 'ir.engine.authoring.UNDO'
  }),

  /**
   * Use to redo the last undone command
   */
  redo: defineAction({
    type: 'ir.engine.authoring.REDO'
  }),

  /**
   * Use to add JSON patch operations to the history
   */
  ops: defineAction({
    type: 'ir.engine.authoring.OPS',
    ops: matches.object as Validator<unknown, Record<SourceID, Operation[]>>
  })
}

export const AuthoringState = defineState({
  name: 'ir.engine.authoring.AuthoringState',
  initial: {
    commands: {} as Record<UserID, HistoryCommand[]>,
    sources: {} as Record<SourceID, { initial: SourceData; latest: SourceData }>
  },

  receptors: {
    initialize: AuthoringActions.initialize.receive((action) => {
      getMutableState(AuthoringState).sources[action.sourceID].set({
        initial: action.partialState,
        latest: action.partialState
      })
    }),
    uninitialize: AuthoringActions.uninitialize.receive((action) => {
      getMutableState(AuthoringState).sources[action.sourceID].set(none)
    }),
    undo: AuthoringActions.undo.receive((action) => {
      if (!getState(AuthoringState).commands[action.$user]) {
        getMutableState(AuthoringState).commands[action.$user].set([])
      }
      const history = getMutableState(AuthoringState).commands[action.$user]
      history.merge([
        {
          type: 'undo'
        }
      ])
    }),
    redo: AuthoringActions.redo.receive((action) => {
      if (!getState(AuthoringState).commands[action.$user]) {
        getMutableState(AuthoringState).commands[action.$user].set([])
      }
      const history = getMutableState(AuthoringState).commands[action.$user]
      history.merge([
        {
          type: 'redo'
        }
      ])
    }),
    ops: AuthoringActions.ops.receive((action) => {
      if (!getState(AuthoringState).commands[action.$user]) {
        getMutableState(AuthoringState).commands[action.$user].set([])
      }
      const history = getMutableState(AuthoringState).commands[action.$user]
      history.merge([action.ops])
    })
  },

  reactor: () => {
    const state = useMutableState(AuthoringState)

    return (
      <>
        <QueryReactor Components={[GLTFComponent]} ChildEntityReactor={SourceReactor} layer={Layers.Authoring} />
        {state.sources.keys.map((sourceID: SourceID) => (
          <ErrorBoundary key={sourceID}>
            <Suspense>
              <SourceHistoryReactor sourceID={sourceID} />
            </Suspense>
          </ErrorBoundary>
        ))}
      </>
    )
  },

  canRedo: () => {
    const commands = getState(AuthoringState).commands
    const authoredCommands = commands[getState(EngineState).userID]
    const { redoStack } = computeCommands(authoredCommands)
    return redoStack.length > 0
  },

  canUndo: () => {
    const commands = getState(AuthoringState).commands
    const authoredCommands = commands[getState(EngineState).userID]
    const { doneStack } = computeCommands(authoredCommands)
    return doneStack.length > 0
  },

  snapshot: (sourceID: SourceID) => {
    const newData = getSourceSnapshot(sourceID)
    const patch = createPatch(getState(AuthoringState).sources[sourceID].latest, newData)
    dispatchAction(AuthoringActions.ops({ ops: { [sourceID]: patch } }))
  },

  snapshotEntities: (entities: Entity[]) => {
    const affectedSources = new Set<SourceID>(
      entities
        .filter((entity) => hasComponent(entity, UUIDComponent))
        .map((entity) => getComponent(entity, UUIDComponent).entitySourceID)
    )
    if (affectedSources.size === 0) return
    const ops = {} as Record<SourceID, Operation[]>
    for (const sourceID of affectedSources) {
      if (!sourceID) continue
      const newData = getSourceSnapshot(sourceID)
      const patch = createPatch(getState(AuthoringState).sources[sourceID].latest, newData)
      ops[sourceID] = patch
    }
    dispatchAction(AuthoringActions.ops({ ops }))
  },

  hasEdits: (sourceID: SourceID) => {
    if (!getState(AuthoringState).commands[getState(EngineState).userID]) return false
    return Object.values(getState(AuthoringState).commands[getState(EngineState).userID])
      .filter((command) => 'type' in command || command[sourceID])
      .some((command) => command[sourceID]?.length > 0)
  },

  useHasEdits: (sourceID: SourceID) => {
    const commands = useMutableState(AuthoringState).commands.get(NO_PROXY)
    const authoredCommands = commands[getState(EngineState).userID]
    return Object.values(authoredCommands)
      .filter((command) => 'type' in command || command[sourceID])
      .some((command) => command[sourceID]?.length > 0)
  }
})

const SourceReactor = (props: { entity: Entity }) => {
  const loaded = GLTFComponent.useSceneLoaded(props.entity)

  useEffect(() => {
    if (!loaded) return

    const sourceID = UUIDComponent.getAsSourceID(props.entity)
    const sourceData = getSourceSnapshot(sourceID)

    dispatchAction(AuthoringActions.initialize({ sourceID, partialState: sourceData }))

    return () => {
      dispatchAction(AuthoringActions.uninitialize({ sourceID }))
    }
  }, [loaded])

  return null
}

/**
 * Because our actions are an immutable event log, we can replay them to get the current state.
 * This component replays the history of a source to keep the current state in sync.
 */
const SourceHistoryReactor = (props: { sourceID: SourceID }) => {
  const commands = useMutableState(AuthoringState).commands.get(NO_PROXY)
  const sourceCommands = commands[getState(EngineState).userID]
    ? (Object.values(commands[getState(EngineState).userID])
        .filter((command) => 'type' in command || command[props.sourceID])
        .flat() as HistoryCommand[])
    : []

  const commandLength = sourceCommands.length

  useEffect(() => {
    if (commandLength === 0) return

    // parse our undo/redo stack and return a new list of commands that represent the final graph path
    const { doneStack } = computeCommands(sourceCommands, props.sourceID)

    const operations = doneStack.map((command) => command[props.sourceID]).flat()

    // get the readonly state and treat it as mutable so we have a non-reactive copy of the current state
    const readonlyState = getState(AuthoringState).sources[props.sourceID]

    // get the final state of the history
    const finalState = structuredClone(readonlyState.initial)
    applyPatch(finalState, operations)

    // update the state to the ECS
    applyCommandsToECS(props.sourceID, readonlyState.latest, finalState)

    readonlyState.latest = finalState
  }, [commandLength])

  return null
}

/**
 * Given a list of commands, compute the final state of the history.
 * @param commands
 * @returns
 */
export const computeCommands = (commands: HistoryCommand[], sourceID?: SourceID) => {
  const commandLength = commands.length
  const doneStack: JSONPatchCommands[] = []
  const redoStack: JSONPatchCommands[] = []
  for (let i = 0; i < commandLength; i++) {
    const command = commands[i]
    if ('type' in command) {
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
      }
    } else {
      // A normal command: push it onto the done stack
      // and clear the redo stack (as new commands invalidate the redo history).
      if (sourceID && !command[sourceID]) continue
      doneStack.push(command)
      redoStack.length = 0
    }
  }

  return { doneStack: doneStack.flat(), redoStack: redoStack.flat() }
}

/**
 * Given a final state, apply the commands to the ECS.
 * - Ensures that entities and components that are created or removed are reflected in the ECS with respect to the the last update.
 * @param sourceID
 * @param finalState
 */
export const applyCommandsToECS = (sourceID: SourceID, currentState: SourceData, finalState: SourceData) => {
  for (const nodeID of Object.keys(finalState) as EntityID[]) {
    if (finalState[nodeID]) {
      const uuid = UUIDComponent.join({ entitySourceID: sourceID, entityID: nodeID })
      if (!currentState[nodeID] && !UUIDComponent.getEntityByUUID(uuid, Layers.Authoring)) {
        // entity does not exist, add entity
        NodeIDComponent.create(
          UUIDComponent.getEntityByUUID(sourceID as any as EntityUUID, Layers.Authoring),
          nodeID as any as EntityID,
          Layers.Authoring
        )
      }
      const entity = UUIDComponent.getEntityByUUID(uuid, Layers.Authoring)
      for (const [componentName, componentData] of Object.entries(finalState[nodeID])) {
        const Component = ComponentMap.get(componentName)
        if (!Component) continue
        if (Component === EntityTreeComponent || Component === NameComponent) {
          setComponent(entity, Component, componentData)
        } else {
          deserializeComponent(entity, Component, componentData)
        }
      }
      if (currentState[nodeID]) {
        for (const componentName of Object.keys(currentState[nodeID])) {
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
  for (const nodeID of Object.keys(currentState) as EntityID[]) {
    if (!finalState[nodeID]) {
      // entity does not exist, remove entity
      const uuid = (sourceID + nodeID) as EntityUUID
      const entity = UUIDComponent.getEntityByUUID(uuid, Layers.Authoring)
      // ensure the entity has actually been removed, and not moved to another source
      if (getOptionalComponent(entity, UUIDComponent)?.entitySourceID === sourceID) {
        removeEntity(entity)
      }
    }
  }
}

export const getSourceSnapshot = (sourceID: SourceID) => {
  const sourceEntities = SourceComponent.getEntitiesBySource(
    UUIDComponent.getEntityByUUID(sourceID as string as EntityUUID, Layers.Authoring)
  )

  const sourceData = {} as SourceData

  for (const entity of sourceEntities) {
    const nodeID = getComponent(entity, NodeIDComponent)
    sourceData[nodeID] = {}

    const components = getAllComponents(entity)

    for (const component of components) {
      if (component === NodeIDComponent) continue
      const sceneComponentID = component.jsonID
      if (!sceneComponentID) continue
      const data = serializeComponent(entity, component)
      if (data) {
        sourceData[nodeID][component.name] = data
      }
    }

    // special case components that do not have a jsonID but are required if available
    if (hasComponent(entity, NameComponent)) {
      sourceData[nodeID][NameComponent.name] = getComponent(entity, NameComponent)
    }
    if (hasComponent(entity, EntityTreeComponent)) {
      sourceData[nodeID][EntityTreeComponent.name] = {
        parentEntity: getComponent(entity, EntityTreeComponent).parentEntity,
        childIndex: getComponent(entity, EntityTreeComponent).childIndex
      }
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
  }

  return sourceData
}
