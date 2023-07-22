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
import logger from '@etherealengine/common/src/logger'
import { setLocalTransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import {
  addActionReceptor,
  dispatchAction,
  getMutableState,
  getState,
  removeActionReceptor,
  useHookstate
} from '@etherealengine/hyperflux'
import { SystemImportType, getSystemsFromSceneData } from '@etherealengine/projects/loadSystemInjection'

import {
  AppLoadingAction,
  AppLoadingServiceReceptor,
  AppLoadingState,
  AppLoadingStates
} from '../../common/AppLoadingService'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { SceneState } from '../../ecs/classes/Scene'
import {
  ComponentJSONIDMap,
  ComponentMap,
  defineQuery,
  getAllComponents,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useQuery
} from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import {
  EntityTreeComponent,
  addEntityNodeChild,
  getAllEntitiesInTree,
  removeEntityNodeRecursively
} from '../../ecs/functions/EntityTree'
import { SystemDefinitions, defineSystem, disableSystems, startSystem } from '../../ecs/functions/SystemFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { FogSettingsComponent } from '../components/FogSettingsComponent'
import { GLTFLoadedComponent } from '../components/GLTFLoadedComponent'
import { GroupComponent } from '../components/GroupComponent'
import { MediaSettingsComponent } from '../components/MediaSettingsComponent'
import { NameComponent } from '../components/NameComponent'
import { PostProcessingComponent } from '../components/PostProcessingComponent'
import { RenderSettingsComponent } from '../components/RenderSettingsComponent'
import { SceneAssetPendingTagComponent } from '../components/SceneAssetPendingTagComponent'
import { SceneDynamicLoadTagComponent } from '../components/SceneDynamicLoadTagComponent'
import { SceneObjectComponent } from '../components/SceneObjectComponent'
import { UUIDComponent } from '../components/UUIDComponent'
import { VisibleComponent } from '../components/VisibleComponent'
import { getUniqueName } from '../functions/getUniqueName'

export const createNewEditorNode = (entityNode: Entity, componentName: string): void => {
  const components = [
    { name: ComponentMap.get(componentName)!.jsonID! },
    { name: ComponentMap.get(VisibleComponent.name)!.jsonID! },
    { name: ComponentMap.get(TransformComponent.name)!.jsonID! }
  ]
  const name = getUniqueName(entityNode, `New ${startCase(components[0].name.toLowerCase())}`)

  addEntityNodeChild(entityNode, getState(SceneState).sceneEntity)
  // Clone the defualt values so that it will not be bound to newly created node
  deserializeSceneEntity(entityNode, {
    name,
    type: componentName.toLowerCase().replace(/\s/, '_'),
    components: cloneDeep(components)
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
  const changes: { obj: Object; property: string; nu: string }[] = []
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

export const loadECSData = async (sceneData: SceneJson, assetRoot?: Entity): Promise<Entity[]> => {
  const entityMap = {} as { [key: string]: Entity }
  const entities = Object.entries(sceneData.entities).filter(([uuid]) => uuid !== sceneData.root) as [
    EntityUUID,
    EntityJson
  ][]
  const idMap = new Map<EntityUUID, EntityUUID>()
  const loadedEntities = UUIDComponent.entitiesByUUID

  const rootEntity = assetRoot ?? getState(SceneState).sceneEntity
  const rootId = sceneData.root

  entities.forEach(([_uuid, eJson]) => {
    //check if uuid already exists in scene
    let uuid = _uuid
    if (loadedEntities[uuid]) {
      uuid = MathUtils.generateUUID() as EntityUUID
      idMap.set(_uuid, uuid)
    }
    const eNode = createEntity()
    const parent = eJson.parent ? UUIDComponent.entitiesByUUID[eJson.parent] : rootEntity
    setComponent(eNode, EntityTreeComponent, { parentEntity: parent })
    setComponent(eNode, UUIDComponent, uuid)
    if (eJson.parent && loadedEntities[eJson.parent]) {
      addEntityNodeChild(eNode, parent)
    }
    entityMap[uuid] = eNode
  })
  entities.forEach(([_uuid, _data]) => {
    let uuid = _uuid
    if (idMap.has(uuid)) {
      uuid = idMap.get(uuid)!
    }
    const data = iterateReplaceID(_data, idMap)
    deserializeSceneEntity(entityMap[uuid], data)
  })
  const result = new Array()
  entities.forEach(([_uuid, data]) => {
    let uuid = _uuid
    if (idMap.has(uuid)) {
      uuid = idMap.get(uuid)!
    }
    const sceneEntity = data
    const node = entityMap[uuid]
    let parentId = sceneEntity.parent
    if (parentId) {
      if (idMap.has(parentId)) parentId = idMap.get(parentId)!
      if (parentId === rootId) {
        const rootUUID = getComponent(rootEntity, UUIDComponent)
        sceneEntity.parent = rootUUID
        parentId = rootUUID
        result.push(node)
      }
    }
    addEntityNodeChild(
      node,
      parentId ? (parentId === getComponent(rootEntity, UUIDComponent) ? rootEntity : entityMap[parentId]) : rootEntity
    )
  })
  hasComponent(rootEntity, TransformComponent) &&
    getComponent(rootEntity, EntityTreeComponent)
      .children.filter((child) => hasComponent(child, TransformComponent))
      .map((child) => {
        const transform = getComponent(child, TransformComponent)
        setLocalTransformComponent(child, rootEntity, transform.position, transform.rotation, transform.scale)
      })
  return result
}

/**
 * @param parent
 * @param world
 */
export const updateSceneEntitiesFromJSON = (parent: string) => {
  const sceneData = getState(SceneState).sceneData as SceneData
  const entitiesToLoad = Object.entries(sceneData.scene.entities).filter(
    ([uuid, entity]) => entity.parent === parent
  ) as [EntityUUID, EntityJson][]
  for (const [uuid, entityJson] of entitiesToLoad) {
    /** Dynamic loading handled by SceneObejctDynamicLoadSystem */
    const JSONEntityIsDynamic = !!entityJson.components.find(
      (comp) => comp.name === SceneDynamicLoadTagComponent.jsonID
    )
    if (JSONEntityIsDynamic && !getMutableState(EngineState).isEditor.value) continue
    /** Deserialize */
    updateSceneEntity(uuid, entityJson)
    /** Iterate Children */
    updateSceneEntitiesFromJSON(uuid)
  }
}

/** 2. remove old scene entities - GLTF loaded entities will be handled by their parents if removed */
export const removeSceneEntitiesFromOldJSON = () => {
  const sceneState = getState(SceneState)
  const sceneData = sceneState.sceneData
  const oldLoadedEntityNodesToRemove = getAllEntitiesInTree(sceneState.sceneEntity).filter(
    (entity) =>
      !sceneData?.scene.entities[getComponent(entity, UUIDComponent)] &&
      !getOptionalComponent(entity, GLTFLoadedComponent)?.includes('entity')
  )
  /** @todo this will not  */
  for (const node of oldLoadedEntityNodesToRemove) {
    if (node === sceneState.sceneEntity) continue
    removeEntityNodeRecursively(node)
  }
}

/**
 * Updates the scene based on serialized json data
 * @param sceneData
 */
export const updateSceneFromJSON = async () => {
  const sceneState = getState(SceneState)

  if (getState(AppLoadingState).state !== AppLoadingStates.SUCCESS)
    dispatchAction(AppLoadingAction.setLoadingState({ state: AppLoadingStates.SCENE_LOADING }))

  const sceneData = getState(SceneState).sceneData

  getMutableState(EngineState).merge({
    sceneLoading: true,
    sceneLoaded: false
  })

  const systemsToLoad = [] as SystemImportType[]

  if (!getState(EngineState).isEditor && sceneData) {
    /** get systems that have changed */
    const sceneSystems = await getSystemsFromSceneData(sceneData.project, sceneData.scene)
    systemsToLoad.push(
      ...sceneSystems.filter(
        (systemToLoad) => !Array.from(Engine.instance.activeSystems).find((uuid) => uuid === systemToLoad.systemUUID)
      )
    )
    const systemsToUnload = Array.from(Engine.instance.activeSystems)
      .filter(
        (systemUUID) =>
          SystemDefinitions.get(systemUUID)?.sceneSystem && !sceneSystems.find((s) => s.systemUUID === systemUUID)
      )
      .map((s) => s)

    /** 1. unload old systems */
    disableSystems(systemsToUnload)
  }

  removeSceneEntitiesFromOldJSON()

  if (!sceneData) {
    getMutableState(EngineState).merge({
      sceneLoading: false,
      sceneLoaded: false
    })
    return
  }

  /** 3. load new systems */
  if (!getState(EngineState).isEditor) {
    for (const system of systemsToLoad) {
      startSystem(system.systemUUID, { [system.insertOrder]: system.insertUUID })
    }
  }

  /** 4. update scene entities with new data, and load new ones */
  setComponent(sceneState.sceneEntity, EntityTreeComponent, { parentEntity: null!, uuid: sceneData.scene.root })
  updateSceneEntity(sceneData.scene.root, sceneData.scene.entities[sceneData.scene.root])
  updateSceneEntitiesFromJSON(sceneData.scene.root)

  // backwards compatibility
  if ((sceneData.scene as any).metadata) {
    for (const [key, val] of Object.entries((sceneData.scene as any).metadata) as any) {
      switch (key) {
        case 'renderSettings':
          setComponent(sceneState.sceneEntity, RenderSettingsComponent, val)
          break
        case 'postprocessing':
          setComponent(sceneState.sceneEntity, PostProcessingComponent, val)
          break
        case 'mediaSettings':
          setComponent(sceneState.sceneEntity, MediaSettingsComponent, val)
          break
        case 'fog':
          setComponent(sceneState.sceneEntity, FogSettingsComponent, val)
          break
      }
    }
  }

  if (!sceneAssetPendingTagQuery().length) {
    if (getState(EngineState).sceneLoading) {
      getMutableState(EngineState).merge({
        sceneLoading: false,
        sceneLoaded: true
      })
      dispatchAction(EngineActions.sceneLoaded({}))
    }
  }
}

/**
 * Updates or creates a scene entity and deserializes it's components
 * @param uuid
 * @param entityJson
 * @param world
 */
export const updateSceneEntity = (uuid: EntityUUID, entityJson: EntityJson) => {
  try {
    const existingEntity = UUIDComponent.entitiesByUUID[uuid]
    if (existingEntity) {
      setComponent(existingEntity, SceneObjectComponent)
      deserializeSceneEntity(existingEntity, entityJson)
      /** @todo handle reparenting due to changes in scene json */
      // const parent = existingEntity.parentEntity
      // if (parent && getComponent(parent, UUIDComponent) !== entityJson.parent)
      //   reparentEntityNode(existingEntity, UUIDComponent.entitiesBy[entityJson.parent])
    } else {
      const entity = createEntity()
      const parentEntity = UUIDComponent.entitiesByUUID[entityJson.parent!]
      setComponent(entity, SceneObjectComponent)
      setComponent(entity, EntityTreeComponent, { parentEntity, uuid, childIndex: entityJson.index })
      setLocalTransformComponent(entity, parentEntity)
      addEntityNodeChild(entity, parentEntity)
      deserializeSceneEntity(entity, entityJson)
    }
  } catch (e) {
    logger.error(e, `Failed to update scene entity ${uuid}`)
  }
}

/**
 * Loads all the components from scene json for an entity
 * @param {Entity} entityNode
 * @param {EntityJson} sceneEntity
 * @param {World} world
 */
export const deserializeSceneEntity = (entity: Entity, sceneEntity: EntityJson): Entity => {
  setComponent(entity, NameComponent, sceneEntity.name ?? 'entity-' + sceneEntity.index)

  /** remove ECS components that are in the scene register but not in the json */
  const componentsToRemove = getAllComponents(entity).filter(
    (C) =>
      C.jsonID && ComponentJSONIDMap.has(C.jsonID) && !sceneEntity.components.find((json) => C.jsonID === json.name)
  )
  for (const C of componentsToRemove) {
    if (entity === getState(SceneState).sceneEntity && C === VisibleComponent) continue
    if (C === GroupComponent || C === TransformComponent) continue
    removeComponent(entity, C)
  }
  for (const component of sceneEntity.components) {
    try {
      deserializeComponent(entity, component)
    } catch (e) {
      console.error(`Error loading scene entity: `, JSON.stringify(sceneEntity, null, '\t'))
      console.error(e)
    }
  }

  return entity
}

export const deserializeComponent = (entity: Entity, component: ComponentJson): void => {
  const Component = ComponentJSONIDMap.get(component.name)
  if (!Component) return console.warn('[ SceneLoading] could not find component name', component.name)

  setComponent(entity, Component, component.props)
}

const sceneAssetPendingTagQuery = defineQuery([SceneAssetPendingTagComponent])

const reactor = () => {
  const sceneData = useHookstate(getMutableState(SceneState).sceneData)
  const isEngineInitialized = useHookstate(getMutableState(EngineState).isEngineInitialized)
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
  }, [sceneAssetPendingTagQuery, assetLoadingState])

  useEffect(() => {
    if (isEngineInitialized.value) updateSceneFromJSON()
  }, [sceneData, isEngineInitialized])

  useEffect(() => {
    addActionReceptor(AppLoadingServiceReceptor)
    return () => {
      removeActionReceptor(AppLoadingServiceReceptor)
    }
  }, [])

  return null
}

export const SceneLoadingSystem = defineSystem({
  uuid: 'ee.engine.scene.SceneLoadingSystem',
  execute: () => {},
  reactor
})
