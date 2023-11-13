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

import { cloneDeep, startCase } from 'lodash'
import { useEffect } from 'react'
import { MathUtils } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { ComponentJson, EntityJson, SceneData, SceneJson } from '@etherealengine/common/src/interfaces/SceneInterface'
import { LocalTransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import {
  NO_PROXY,
  State,
  defineActionQueue,
  dispatchAction,
  getMutableState,
  getState,
  useHookstate
} from '@etherealengine/hyperflux'
import { SystemImportType, getSystemsFromSceneData } from '@etherealengine/projects/loadSystemInjection'

import React from 'react'
import { AppLoadingState, AppLoadingStates } from '../../common/AppLoadingService'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { SceneState } from '../../ecs/classes/Scene'
import {
  ComponentJSONIDMap,
  ComponentMap,
  getComponent,
  removeComponent,
  serializeComponent,
  setComponent,
  useOptionalComponent,
  useQuery
} from '../../ecs/functions/ComponentFunctions'
import { createEntity, entityExists, removeEntity, useEntityContext } from '../../ecs/functions/EntityFunctions'
import { EntityTreeComponent } from '../../ecs/functions/EntityTree'
import { QueryReactor, defineSystem, disableSystems, startSystem } from '../../ecs/functions/SystemFunctions'
import { NetworkState } from '../../networking/NetworkState'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { SceneID, scenePath } from '../../schemas/projects/scene.schema'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { CameraSettingsComponent } from '../components/CameraSettingsComponent'
import { FogSettingsComponent } from '../components/FogSettingsComponent'
import { MediaSettingsComponent } from '../components/MediaSettingsComponent'
import { NameComponent } from '../components/NameComponent'
import { PostProcessingComponent } from '../components/PostProcessingComponent'
import { RenderSettingsComponent } from '../components/RenderSettingsComponent'
import { SceneAssetPendingTagComponent } from '../components/SceneAssetPendingTagComponent'
import { SceneDynamicLoadTagComponent } from '../components/SceneDynamicLoadTagComponent'
import { SceneObjectComponent } from '../components/SceneObjectComponent'
import { SceneTagComponent } from '../components/SceneTagComponent'
import { UUIDComponent } from '../components/UUIDComponent'
import { VisibleComponent } from '../components/VisibleComponent'
import { getUniqueName } from '../functions/getUniqueName'

export const createNewEditorNode = (
  entityNode: Entity,
  componentJson: Array<ComponentJson>,
  parentEntity = SceneState.getRootEntity(getState(SceneState).activeScene!) as Entity
): void => {
  const components = [
    ...componentJson,
    { name: ComponentMap.get(VisibleComponent.name)!.jsonID! },
    { name: ComponentMap.get(LocalTransformComponent.name)!.jsonID! }
  ]

  const name = getUniqueName(
    entityNode,
    componentJson.length ? `New ${startCase(componentJson[0].name.toLowerCase())}` : `New Entity`
  )
  const uuid = componentJson.find((comp) => comp.name === UUIDComponent.jsonID)?.props.uuid ?? MathUtils.generateUUID()

  setComponent(entityNode, EntityTreeComponent, { parentEntity })

  // Clone the defualt values so that it will not be bound to newly created node
  deserializeSceneEntity(entityNode, {
    name,
    components: cloneDeep(components)
  })

  setComponent(entityNode, UUIDComponent, uuid)

  const localTransform = getComponent(entityNode, LocalTransformComponent)
  setComponent(entityNode, TransformComponent, {
    position: localTransform.position,
    rotation: localTransform.rotation,
    scale: localTransform.scale
  })

  const transform = getComponent(entityNode, TransformComponent)
  setComponent(entityNode, LocalTransformComponent, {
    position: transform.position,
    rotation: transform.rotation,
    scale: transform.scale
  })
}

export const splitLazyLoadedSceneEntities = (json: SceneJson) => {
  const entityLoadQueue = {} as { [uuid: string]: EntityJson }
  const entityDynamicQueue = {} as { [uuid: string]: EntityJson }
  for (const [uuid, entity] of Object.entries(json.entities)) {
    if (entity.components.find((comp) => comp.name === SceneDynamicLoadTagComponent.jsonID))
      entityDynamicQueue[uuid] = entity
    else entityLoadQueue[uuid] = entity
  }
  return {
    entityLoadQueue,
    entityDynamicQueue
  }
}

const iterateReplaceID = (data: any, idMap: Map<string, string>) => {
  const frontier = [data]
  const changes: { obj: object; property: string; nu: string }[] = []
  while (frontier.length > 0) {
    const item = frontier.pop()
    Object.entries(item).forEach(([key, val]) => {
      if (val && typeof val === 'object') {
        frontier.push(val)
      }
      if (typeof val === 'string' && idMap.has(val)) {
        changes.push({ obj: item, property: key, nu: idMap.get(val)! })
      }
    })
  }
  for (const change of changes) {
    change.obj[change.property] = change.nu
  }
  return data
}

export const deserializeSceneEntity = (entity: Entity, sceneEntity: EntityJson) => {
  setComponent(entity, NameComponent, sceneEntity.name ?? 'entity-' + sceneEntity.index)
  for (const component of sceneEntity.components) {
    try {
      const Component = ComponentJSONIDMap.get(component.name)
      if (!Component) return console.warn('[ SceneLoading] could not find component name', component.name)
      setComponent(entity, Component, component.props)
    } catch (e) {
      console.error(`Error loading scene entity: `, JSON.stringify(sceneEntity, null, '\t'))
      console.error(e)
    }
  }
}

export const migrateSceneData = (sceneData: SceneData) => {
  const migratedSceneData = JSON.parse(JSON.stringify(sceneData)) as SceneData

  for (const [key, value] of Object.entries(migratedSceneData.scene.entities)) {
    const tempEntity = createEntity()
    for (const comp of Object.values(value.components)) {
      const { name, props } = comp
      const component = ComponentJSONIDMap.get(name)
      if (!component) {
        console.warn(`Component ${name} not found`)
        continue
      }
      setComponent(tempEntity, component, props)
      const data = serializeComponent(tempEntity, component)
      comp.props = data
    }
    /** ensure all scenes have all setting components */
    if (key === migratedSceneData.scene.root) {
      const ensureComponent = (component: any) => {
        if (!value.components.find((comp) => comp.name === component.jsonID)) {
          setComponent(tempEntity, component)
          value.components.push({
            name: component.jsonID,
            props: serializeComponent(tempEntity, component)
          })
          console.log(`Added ${component.jsonID} to scene root`)
        }
      }
      ;[
        CameraSettingsComponent,
        PostProcessingComponent,
        FogSettingsComponent,
        MediaSettingsComponent,
        RenderSettingsComponent
      ].map(ensureComponent)
    }
    removeEntity(tempEntity)
  }

  return JSON.parse(JSON.stringify(migratedSceneData))
}

const reactor = () => {
  const scenes = useHookstate(getMutableState(SceneState).scenes)
  const sceneAssetPendingTagQuery = useQuery([SceneAssetPendingTagComponent])
  const assetLoadingState = useHookstate(SceneAssetPendingTagComponent.loadingProgress)

  useEffect(() => {
    if (!getState(EngineState).sceneLoading) return

    const values = Object.values(assetLoadingState.value)
    const total = values.reduce((acc, curr) => acc + curr.totalAmount, 0)
    const loaded = values.reduce((acc, curr) => acc + curr.loadedAmount, 0)
    const progress = !sceneAssetPendingTagQuery.length || total === 0 ? 100 : Math.round((100 * loaded) / total)

    getMutableState(EngineState).loadingProgress.set(progress)

    if (!sceneAssetPendingTagQuery.length && !getState(EngineState).sceneLoaded) {
      for (const entity of sceneAssetPendingTagQuery) removeComponent(entity, SceneAssetPendingTagComponent)
      getMutableState(EngineState).merge({
        sceneLoading: false,
        sceneLoaded: true
      })
      dispatchAction(EngineActions.sceneLoaded({}))
      SceneAssetPendingTagComponent.loadingProgress.set({})
    }
  }, [sceneAssetPendingTagQuery.length, assetLoadingState])

  return (
    <>
      <QueryReactor
        Components={[EntityTreeComponent, TransformComponent, UUIDComponent, SceneObjectComponent]}
        ChildEntityReactor={NetworkedSceneObjectReactor}
      />
      {Object.keys(scenes.value).map((sceneID: SceneID) => (
        <SceneReactor key={sceneID} sceneID={sceneID} />
      ))}
    </>
  )
}

/** @todo - this needs to be rework according to #9105 # */
const NetworkedSceneObjectReactor = () => {
  const entity = useEntityContext()
  useEffect(() => {
    if (NetworkState.worldNetwork?.isHosting) {
      if (!entityExists(entity)) return
      const uuid = getComponent(entity, UUIDComponent)
      const transform = getComponent(entity, TransformComponent)
      dispatchAction(
        WorldNetworkAction.spawnObject({
          entityUUID: uuid,
          prefab: '',
          position: transform.position,
          rotation: transform.rotation
        })
      )
    }
  }, [])
  return null
}

const SceneReactor = (props: { sceneID: SceneID }) => {
  const currentSceneSnapshotState = SceneState.useScene(props.sceneID)
  const entities = currentSceneSnapshotState.scene.entities
  const rootUUID = currentSceneSnapshotState.scene.root.value

  const ready = useHookstate(false)
  const systemsLoaded = useHookstate([] as SystemImportType[])

  useEffect(() => {
    if (getState(AppLoadingState).state !== AppLoadingStates.SUCCESS) {
      getMutableState(AppLoadingState).merge({
        state: AppLoadingStates.SCENE_LOADING,
        loaded: false
      })
    }

    const { project, scene } =
      getState(SceneState).scenes[props.sceneID].snapshots[getState(SceneState).scenes[props.sceneID].index].data

    getSystemsFromSceneData(project, scene).then((systems) => {
      // wait to set scene loading state until systems are loaded
      getMutableState(EngineState).merge({
        sceneLoading: true,
        sceneLoaded: false
      })

      if (systems.length) {
        systemsLoaded.set(systems)
      } else {
        ready.set(true)
      }
    })

    const sceneUpdatedListener = async () => {
      const [projectName, sceneName] = props.sceneID.split('/')
      const sceneData = await Engine.instance.api
        .service(scenePath)
        .get(null, { query: { project: projectName, name: sceneName } })
      SceneState.loadScene(props.sceneID, sceneData)
    }
    // for testing
    // window.addEventListener('keydown', (ev) => {
    //   if (ev.code === 'KeyN') sceneUpdatedListener()
    // })

    Engine.instance.api.service(scenePath).on('updated', sceneUpdatedListener)

    return () => {
      Engine.instance.api.service(scenePath).off('updated', sceneUpdatedListener)
    }
  }, [])

  useEffect(() => {
    for (const system of systemsLoaded.value) {
      startSystem(system.systemUUID, { [system.insertOrder]: system.insertUUID })
    }
    ready.set(true)
    return () => {
      for (const system of systemsLoaded.value) {
        disableSystems([system.systemUUID])
      }
    }
  }, [systemsLoaded.length])

  return (
    <>
      {ready.value &&
        Object.keys(entities.value).map((entityUUID: EntityUUID) =>
          entityUUID === rootUUID ? (
            <EntitySceneRootLoadReactor key={entityUUID} sceneID={props.sceneID} entityUUID={entityUUID} />
          ) : (
            <EntityLoadReactor key={entityUUID} sceneID={props.sceneID} entityUUID={entityUUID} />
          )
        )}
    </>
  )
}

/** @todo eventually, this will become redundant */
const EntitySceneRootLoadReactor = (props: { entityUUID: EntityUUID; sceneID: SceneID }) => {
  const entityState = SceneState.useScene(props.sceneID).scene.entities[props.entityUUID]
  const selfEntityState = useHookstate(UUIDComponent.entitiesByUUIDState[props.entityUUID])

  useEffect(() => {
    const entity = createEntity()
    setComponent(entity, NameComponent, entityState.name.value)
    setComponent(entity, VisibleComponent, true)
    setComponent(entity, UUIDComponent, props.entityUUID)
    setComponent(entity, SceneTagComponent, true)
    setComponent(entity, TransformComponent)
    setComponent(entity, SceneObjectComponent)
    setComponent(entity, EntityTreeComponent, { parentEntity: null })

    return () => {
      removeEntity(entity)
    }
  }, [])

  return (
    <>
      {selfEntityState.value &&
        entityState.components.map((compState) => (
          <ComponentLoadReactor key={compState.name.value} componentState={compState} entity={selfEntityState.value} />
        ))}
    </>
  )
}

const EntityLoadReactor = (props: { entityUUID: EntityUUID; sceneID: SceneID }) => {
  const entityState = SceneState.useScene(props.sceneID).scene.entities[props.entityUUID]
  const parentEntityState = useHookstate(UUIDComponent.entitiesByUUIDState[entityState.value.parent!])

  return (
    <>
      {/* Ensure parent has loaded */}
      {parentEntityState.value && (
        <EntityChildLoadReactor
          /**
           * @todo key is needed as dynamic loading with { loaded: true } for some reason
           * will cause the entity to be removed immediately, causing react errors
           */
          key={props.entityUUID + ' - ' + parentEntityState.value}
          parentEntity={parentEntityState.value}
          entityUUID={props.entityUUID}
          sceneID={props.sceneID}
        />
      )}
    </>
  )
}

const EntityChildLoadReactor = (props: { parentEntity: Entity; entityUUID: EntityUUID; sceneID: SceneID }) => {
  const selfEntityState = useHookstate(UUIDComponent.entitiesByUUIDState[props.entityUUID])
  const entityJSONState = SceneState.useScene(props.sceneID).scene.entities[props.entityUUID]
  const parentEntityState = useHookstate(UUIDComponent.entitiesByUUIDState[entityJSONState.value.parent!])
  const parentLoaded = !!useOptionalComponent(props.parentEntity, SceneObjectComponent)
  const dynamicParentState = useOptionalComponent(props.parentEntity, SceneDynamicLoadTagComponent)

  useEffect(() => {
    // ensure parent has been deserialized before checking if dynamically loaded
    if (!parentLoaded) return

    // if parent is dynamically loaded, wait for it to be loaded
    if (!getState(EngineState).isEditor && dynamicParentState?.value && !dynamicParentState.loaded.value) return

    const entity = createEntity()

    const parentEntity = parentEntityState.value
    setComponent(entity, SceneObjectComponent)
    setComponent(entity, EntityTreeComponent, {
      parentEntity,
      uuid: props.entityUUID,
      childIndex: entityJSONState.index.value
    })
    setComponent(entity, NameComponent, entityJSONState.name.value)
    return () => {
      removeEntity(entity)
    }
  }, [dynamicParentState?.loaded, parentLoaded])

  useEffect(() => {
    const entity = UUIDComponent.entitiesByUUID[props.entityUUID]
    if (!entity) return
    const parentEntity = UUIDComponent.entitiesByUUID[entityJSONState.parent.value!]
    const uuid = props.entityUUID
    setComponent(entity, EntityTreeComponent, {
      parentEntity: parentEntity,
      uuid,
      childIndex: entityJSONState.index.value
    })
  }, [entityJSONState.parent, entityJSONState.index, selfEntityState])

  return (
    <>
      {selfEntityState.value &&
        entityJSONState.components.map((compState) => (
          <ComponentLoadReactor
            key={compState.name.value + ' - ' + selfEntityState.value}
            componentState={compState}
            entity={selfEntityState.value}
          />
        ))}
    </>
  )
}

const ComponentLoadReactor = (props: { componentState: State<ComponentJson>; entity: Entity }) => {
  useEffect(() => {
    const entity = props.entity
    /** @todo - we have to check for existence here, as the dynamic loading parent component takes a re-render to load in */
    if (!entity || !entityExists(entity)) return console.warn('Entity does not exist', entity)

    const component = props.componentState.get(NO_PROXY)

    const Component = ComponentJSONIDMap.get(component.name)
    if (!Component) return console.warn('[SceneLoading] could not find component name', component.name)

    try {
      setComponent(entity, Component, component.props)
    } catch (e) {
      console.error(`Error loading scene entity: `, getComponent(entity, UUIDComponent), entity, component)
      console.error(e)
      return
    }

    return () => {
      // if entity has been removed, we don't need to remove components
      if (!entity || !entityExists(entity)) return
      // if component still exists, we don't need to remove it in the return
      if (props.componentState.value) return
      removeComponent(entity, ComponentJSONIDMap.get(component.name)!)
    }
  }, [props.componentState, props.entity])

  return null
}

const sceneLoadedActionQueue = defineActionQueue(EngineActions.sceneLoaded.matches)

const execute = () => {
  if (sceneLoadedActionQueue().length) getMutableState(EngineState).merge({ sceneLoading: false, sceneLoaded: true })
}

export const SceneLoadingSystem = defineSystem({
  uuid: 'ee.engine.scene.SceneLoadingSystem',
  execute,
  reactor
})
