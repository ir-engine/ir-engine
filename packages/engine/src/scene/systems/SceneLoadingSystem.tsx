/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { useEffect } from 'react'

import { EntityUUID, UUIDComponent } from '@etherealengine/ecs'
import {
  ErrorBoundary,
  NO_PROXY,
  State,
  dispatchAction,
  getMutableState,
  getState,
  useHookstate
} from '@etherealengine/hyperflux'
import { SystemImportType, getSystemsFromSceneData } from '@etherealengine/projects/loadSystemInjection'

import { SceneID } from '@etherealengine/common/src/schema.type.module'
import {
  ComponentJSONIDMap,
  Entity,
  PresentationSystemGroup,
  QueryReactor,
  UndefinedEntity,
  defineSystem,
  destroySystem,
  entityExists,
  getComponent,
  hasComponent,
  removeComponent,
  removeEntity,
  setComponent,
  useEntityContext,
  useOptionalComponent,
  useQuery
} from '@etherealengine/ecs'
import { SceneState } from '@etherealengine/engine/src/scene/Scene'
import { NetworkState, NetworkTopics, SceneUser } from '@etherealengine/network'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { PhysicsState } from '@etherealengine/spatial/src/physics/state/PhysicsState'
import { addObjectToGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@etherealengine/spatial/src/renderer/components/MeshComponent'
import { Object3DComponent } from '@etherealengine/spatial/src/renderer/components/Object3DComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { SpawnObjectActions } from '@etherealengine/spatial/src/transform/SpawnObjectActions'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'
import { Not } from 'bitecs'
import React from 'react'
import { Group } from 'three'
import { GLTFLoadedComponent } from '../components/GLTFLoadedComponent'
import { SceneAssetPendingTagComponent } from '../components/SceneAssetPendingTagComponent'
import { SceneComponent } from '../components/SceneComponent'
import { SceneDynamicLoadTagComponent } from '../components/SceneDynamicLoadTagComponent'
import { proxifyParentChildRelationships } from '../functions/loadGLTFModel'
import { ComponentJsonType, EntityJsonType } from '../types/SceneTypes'

export const SceneLoadingReactor = () => {
  const scenes = useHookstate(getMutableState(SceneState).scenes)

  const physicsWorld = useHookstate(getMutableState(PhysicsState).physicsWorld)
  if (!physicsWorld.value) return null

  return (
    <>
      <QueryReactor
        Components={[EntityTreeComponent, TransformComponent, UUIDComponent, SceneComponent, Not(GLTFLoadedComponent)]}
        ChildEntityReactor={NetworkedSceneObjectReactor}
      />
      {Object.keys(scenes.value).map((sceneID: SceneID) => (
        <SceneReactor key={sceneID} sceneID={sceneID} />
      ))}
    </>
  )
}

const NetworkedSceneObjectReactor = () => {
  const entity = useEntityContext()

  useEffect(() => {
    const uuid = getComponent(entity, UUIDComponent)
    const transform = getComponent(entity, TransformComponent)
    const isHostingWorldNetwork = !!NetworkState.worldNetwork?.isHosting
    dispatchAction(
      SpawnObjectActions.spawnObject({
        ownerID: SceneUser,
        entityUUID: uuid,
        position: transform.position.clone(),
        rotation: transform.rotation.clone(),
        $time: isHostingWorldNetwork ? undefined : 0,
        $topic: isHostingWorldNetwork ? NetworkTopics.world : undefined
      })
    )
  }, [])

  return null
}

const SceneReactor = (props: { sceneID: SceneID }) => {
  const sceneAssetPendingTagQuery = useQuery([SceneAssetPendingTagComponent])
  const assetLoadingState = useHookstate(SceneAssetPendingTagComponent.loadingProgress)
  const entities = useHookstate(UUIDComponent.entitiesByUUIDState)

  const currentSceneSnapshotState = SceneState.useScene(props.sceneID)
  const sceneEntities = currentSceneSnapshotState.entities
  const rootUUID = currentSceneSnapshotState.root.value

  const ready = useHookstate(false)
  const systemsLoaded = useHookstate([] as SystemImportType[])

  useEffect(() => {
    if (!ready.value || getState(SceneState).sceneLoaded) return

    const entitiesCount = sceneEntities.keys.map(UUIDComponent.getEntityByUUID).filter(Boolean).length
    if (entitiesCount <= 1) return

    const values = Object.values(assetLoadingState.value)
    const total = values.reduce((acc, curr) => acc + curr.totalAmount, 0)
    const loaded = values.reduce((acc, curr) => acc + curr.loadedAmount, 0)
    const progress = !sceneAssetPendingTagQuery.length || total === 0 ? 100 : Math.round((100 * loaded) / total)

    getMutableState(SceneState).loadingProgress.set(progress)

    if (!sceneAssetPendingTagQuery.length && !getState(SceneState).sceneLoaded) {
      getMutableState(SceneState).sceneLoaded.set(true)
      SceneAssetPendingTagComponent.loadingProgress.set({})
    }
  }, [sceneAssetPendingTagQuery.length, assetLoadingState, entities.keys])

  useEffect(() => {
    const { project, scene } = getState(SceneState).scenes[props.sceneID]
    const systemPromises = getSystemsFromSceneData(project, scene)
    if (!systemPromises) {
      ready.set(true)
      return
    }
    systemPromises.then((systems) => {
      systemsLoaded.set(systems)
      ready.set(true)
    })
  }, [])

  useEffect(() => {
    if (!systemsLoaded.length) return
    const systems = [...systemsLoaded.value]
    return () => {
      for (const system of systems) {
        destroySystem(system.systemUUID)
      }
    }
  }, [systemsLoaded.length])

  return (
    <>
      {ready.value &&
        Object.entries(sceneEntities.value).map(([entityUUID, data]) =>
          entityUUID === rootUUID ? (
            <EntitySceneRootLoadReactor
              key={entityUUID}
              sceneID={props.sceneID}
              entityUUID={entityUUID as EntityUUID}
            />
          ) : (
            <EntityLoadReactor
              key={props.sceneID + ' ' + entityUUID + ' ' + data.parent + ' ' + data.index}
              sceneID={props.sceneID}
              entityUUID={entityUUID as EntityUUID}
            />
          )
        )}
    </>
  )
}

/** @todo eventually, this will become redundant */
const EntitySceneRootLoadReactor = (props: { entityUUID: EntityUUID; sceneID: SceneID }) => {
  const entityState = SceneState.useScene(props.sceneID).entities[props.entityUUID]
  const selfEntity = useHookstate(UndefinedEntity)

  useEffect(() => {
    const entity = UUIDComponent.getOrCreateEntityByUUID(props.entityUUID)
    setComponent(entity, NameComponent, entityState.name.value)
    setComponent(entity, VisibleComponent, true)
    setComponent(entity, SceneComponent, props.sceneID)
    setComponent(entity, TransformComponent)
    setComponent(entity, EntityTreeComponent, { parentEntity: UndefinedEntity })

    selfEntity.set(entity)

    return () => {
      removeEntity(entity)
    }
  }, [])

  return null
}

const EntityLoadReactor = (props: { entityUUID: EntityUUID; sceneID: SceneID }) => {
  const entityState = SceneState.useScene(props.sceneID).entities[props.entityUUID]
  const parentEntity = UUIDComponent.useEntityByUUID(entityState.value.parent!)
  return (
    <>
      {parentEntity ? (
        <ErrorBoundary key={props.entityUUID + ' - ' + parentEntity}>
          <EntityChildLoadReactor
            parentEntity={parentEntity}
            entityUUID={props.entityUUID}
            sceneID={props.sceneID}
            entityJSONState={entityState}
          />
        </ErrorBoundary>
      ) : (
        <></>
      )}
    </>
  )
}

const EntityChildLoadReactor = (props: {
  parentEntity: Entity
  entityUUID: EntityUUID
  sceneID: SceneID
  entityJSONState: State<EntityJsonType>
}) => {
  const parentEntity = props.parentEntity
  const selfEntity = useHookstate(UndefinedEntity)
  const entityJSONState = props.entityJSONState
  const parentLoaded = !!useOptionalComponent(parentEntity, UUIDComponent)
  const dynamicParentState = useOptionalComponent(parentEntity, SceneDynamicLoadTagComponent)

  // console.log('EntityChildLoadReactor', parentLoaded, props.entityUUID, entityJSONState.components.get(NO_PROXY))

  useEffect(() => {
    // ensure parent has been deserialized before checking if dynamically loaded
    if (!parentLoaded) return

    // if parent is dynamically loaded, wait for it to be loaded
    if (!getState(EngineState).isEditor && dynamicParentState?.value && !dynamicParentState.loaded.value) return

    const entity = UUIDComponent.getOrCreateEntityByUUID(props.entityUUID)

    selfEntity.set(entity)

    setComponent(entity, EntityTreeComponent, {
      parentEntity,
      uuid: props.entityUUID,
      childIndex: entityJSONState.index.value
    })

    if (!hasComponent(entity, Object3DComponent) && !hasComponent(entity, MeshComponent)) {
      const obj3d = new Group()
      obj3d.entity = entity
      addObjectToGroup(entity, obj3d)
      proxifyParentChildRelationships(obj3d)
      setComponent(entity, Object3DComponent, obj3d)
    }

    setComponent(entity, SceneComponent, props.sceneID)
    loadComponents(entity, entityJSONState.components.get(NO_PROXY))

    return () => {
      removeEntity(entity)
    }
  }, [dynamicParentState?.loaded, parentLoaded])

  useEffect(() => {
    const entity = UUIDComponent.getEntityByUUID(props.entityUUID)
    if (!entity) return
    setComponent(entity, NameComponent, entityJSONState.name.value)
  }, [entityJSONState.name, selfEntity])

  useEffect(() => {
    const entity = UUIDComponent.getEntityByUUID(props.entityUUID)
    if (!entity) return
    const uuid = props.entityUUID
    setComponent(entity, EntityTreeComponent, {
      parentEntity,
      uuid,
      childIndex: entityJSONState.index.value
    })
  }, [entityJSONState.parent, entityJSONState.index, selfEntity])

  return (
    <>
      {selfEntity.value
        ? entityJSONState.components.map((compState) => (
            <ErrorBoundary key={compState.value.name + ' - ' + selfEntity.value}>
              <ComponentLoadReactor
                componentID={compState.value.name}
                entityUUID={props.entityUUID}
                componentJSONState={compState}
              />
            </ErrorBoundary>
          ))
        : null}
    </>
  )
}

const ComponentLoadReactor = (props: {
  componentID: string
  entityUUID: EntityUUID
  componentJSONState: State<ComponentJsonType>
}) => {
  const componentState = props.componentJSONState

  useEffect(() => {
    if (!componentState?.value) return
    const entity = UUIDComponent.getEntityByUUID(props.entityUUID)
    const component = componentState.get(NO_PROXY)
    return () => {
      // if entity has been removed, we don't need to remove components
      if (!entity || !entityExists(entity)) return
      removeComponent(entity, ComponentJSONIDMap.get(component.name)!)
    }
  }, [])

  useEffect(() => {
    /** @todo this is a hack fix for variants */
    if (!getState(EngineState).isEditing) return
    if (!componentState?.value) return
    const entity = UUIDComponent.getEntityByUUID(props.entityUUID)
    loadComponents(entity, [componentState.get(NO_PROXY)])
  }, [componentState.get(NO_PROXY)])

  return null
}

/** load all components synchronously to ensure no desync */
const loadComponents = (entity: Entity, components: ComponentJsonType[]) => {
  for (const component of components) {
    /** @todo - we have to check for existence here, as the dynamic loading parent component takes a re-render to load in */
    if (!entity || !entityExists(entity)) {
      console.trace('Entity does not exist', entity)
      continue
    }

    const Component = ComponentJSONIDMap.get(component.name)
    if (!Component) {
      console.warn('[SceneLoading] could not find component name', component.name)
      continue
    }

    try {
      setComponent(entity, Component, component.props)
    } catch (e) {
      console.error(`Error loading scene entity: `, getComponent(entity, UUIDComponent), entity, component)
      console.error(e)
      continue
    }
  }
}

export const SceneLoadingSystem = defineSystem({
  uuid: 'ee.engine.scene.SceneLoadingSystem',
  insert: { after: PresentationSystemGroup },
  reactor: SceneLoadingReactor
})
