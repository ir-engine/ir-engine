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

import React, { useEffect } from 'react'

import {
  defineComponent,
  deserializeComponent,
  Entity,
  EntityUUID,
  getComponent,
  Static,
  TObjectSchema,
  TProperties,
  useComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import {
  defineAction,
  defineState,
  dispatchAction,
  getMutableState,
  matches,
  NO_PROXY,
  none,
  useHookstate,
  useImmediateEffect,
  useMutableState,
  Validator
} from '@ir-engine/hyperflux'
import { NetworkState, NetworkTopics, WorldNetworkAction } from '@ir-engine/network'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { SpawnObjectActions } from '@ir-engine/spatial/src/transform/SpawnObjectActions'
import { Quaternion, Vector3 } from 'three'

/**
 * Creates a prefab definition that can be used both statically in scenes and dynamically at runtime.
 *
 * A prefab is a spawnable networked ECS component.
 * This function creates the necessary components, state management, and spawn functionality
 * for a prefab type.
 *
 * @param definition - Definition object
 * @param definition.name - Prefab name
 * @param definition.jsonID - JSON identifier string for serialization/deserialization
 * @param definition.schema - JSON Schema defining the prefab's properties and its types
 * @param definition.reactor - Reactor for component functionality
 *
 * @returns Component: The ECS component for using the prefab in static scenes,
 *  with Component.spawn: The function to spawn the prefab dynamically at runtime.
 *
 * @example
 * // Define a prefab
 * const MyPrefabComponent = definePrefab({
 *   name: 'MyPrefab',
 *   jsonID: 'my-prefab',
 *   schema: S.Object({
 *     name: S.String()
 *   }),
 *   reactor: ({ entity, prefab }) => {
 *     useEffect(() => {
 *       setComponent(entity, NameComponent, name)
 *     }, [prefab.name])
 *     return null
 *   }
 * })
 *
 * // Spawn dynamically at runtime
 * MyPrefabComponent.spawn({
 *   entityUUID: 'unique-id',
 *   parentUUID: 'parent-id',
 *   position: new Vector3(0, 0, 0),
 *   rotation: new Quaternion(),
 *   data: { name: "Prefab Instance 123" }
 * })
 */
export const definePrefab = <S extends TObjectSchema<P>, P extends TProperties>(definition: {
  name: string
  jsonID: string
  schema: S
  reactor?: (props: { entity: Entity; prefab: Static<S> }) => null | JSX.Element
}) => {
  const $Actions = {
    spawn: defineAction({
      type: 'ir.engine.prefab_' + definition.name,
      entityUUID: matches.string,
      /** @todo once actions use JSON Schemas, we can include that strictness here */
      data: matches.object as Validator<unknown, Static<S>>
    })
  }

  const $State = defineState({
    name: 'ir.engine.prefab_' + definition.name,

    initial: {} as Record<EntityUUID, Static<S>>,

    receptors: {
      onSpawn: $Actions.spawn.receive((action) => {
        getMutableState($State)[action.entityUUID].set(
          Object.fromEntries(Object.keys(definition.schema.properties).map((k) => [k, action.data[k]]))
        )
      }),
      onDestroyObject: WorldNetworkAction.destroyEntity.receive((action) => {
        getMutableState($State)[action.entityUUID].set(none)
      })
    },

    reactor: () => {
      const prefabState = useMutableState($State)
      return (
        <>
          {prefabState.keys.map((entityUUID: EntityUUID) => (
            <EntityExistsReactor key={entityUUID} entityUUID={entityUUID} />
          ))}
        </>
      )
    }
  })

  const EntityExistsReactor = (props: { entityUUID: EntityUUID }) => {
    /** Suspend context until entity exists */
    const entity = UUIDComponent.useEntityByUUID(props.entityUUID)
    if (!entity) return null
    return <EntityReadyReactor entityUUID={props.entityUUID} />
  }

  const EntityReadyReactor = (props: { entityUUID: EntityUUID }) => {
    /** Suspend context until entity exists */
    const entity = UUIDComponent.useEntityByUUID(props.entityUUID)
    useComponent(entity, TransformComponent)
    const prefab = useHookstate(getMutableState($State)[props.entityUUID]).get(NO_PROXY)
    useImmediateEffect(() => {
      deserializeComponent(entity, $Component, prefab)
    }, [])
    if (!definition.reactor) return null
    return <definition.reactor entity={entity} prefab={prefab} />
  }

  /**
   * Spawns a prefab instance dynamically at runtime.
   *
   * This function dispatches both the prefab-specific action and the world network action
   * to create and position the entity in the scene network.
   *
   * @param props - The properties for spawning the prefab
   * @param props.entityUUID - Unique identifier for the entity
   * @param props.parentUUID - Unique identifier of the parent entity
   * @param props.position - The initial position vector
   * @param props.rotation - The initial rotation quaternion
   * @param props.data - The prefab data matching the schema definition
   */
  const spawnPrefab = (props: {
    entityUUID: EntityUUID
    parentUUID: EntityUUID
    position: Vector3
    rotation: Quaternion
    data: Static<S>
  }) => {
    dispatchAction(
      $Actions.spawn({
        entityUUID: props.entityUUID,
        /** @todo fix when actions use JSON Schemas */
        // @ts-ignore
        data: props.data
      })
    )
    dispatchAction(
      SpawnObjectActions.spawnObject({
        entityUUID: props.entityUUID,
        parentUUID: props.parentUUID,
        position: props.position,
        rotation: props.rotation,
        $network: NetworkState.worldNetwork.id,
        $topic: NetworkTopics.world
      })
    )
  }

  const $Component = defineComponent({
    name: definition.name,
    jsonID: definition.jsonID,

    schema: definition.schema,

    spawn: spawnPrefab,

    reactor: ({ entity }) => {
      /** Suspend the context if this component is not spawned as part of a scene */
      useComponent(entity, SourceComponent)

      /** If from a scene, implicitly utilizes the SceneNetworkSystem to create the entity on the network */
      useEffect(() => {
        const entityUUID = getComponent(entity, UUIDComponent)

        dispatchAction(
          $Actions.spawn({
            entityUUID,
            /** @todo fix when actions use JSON Schemas */
            // @ts-ignore
            data: getComponent(entity, $Component)
          })
        )
        return () => {
          dispatchAction(WorldNetworkAction.destroyEntity({ entityUUID }))
        }
      }, [])
    }
  })

  return $Component
}
