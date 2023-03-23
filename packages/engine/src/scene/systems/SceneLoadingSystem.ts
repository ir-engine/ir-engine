import { cloneDeep, merge } from 'lodash'
import { useEffect } from 'react'
import { MathUtils } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { ComponentJson, EntityJson, SceneData, SceneJson } from '@etherealengine/common/src/interfaces/SceneInterface'
import logger from '@etherealengine/common/src/logger'
import { setLocalTransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import {
  dispatchAction,
  getMutableState,
  getState,
  NO_PROXY,
  startReactor,
  State,
  useHookstate
} from '@etherealengine/hyperflux'
import { getSystemsFromSceneData } from '@etherealengine/projects/loadSystemInjection'

import { AppLoadingAction, AppLoadingState, AppLoadingStates } from '../../common/AppLoadingService'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { SceneMetadata, SceneState } from '../../ecs/classes/Scene'
import {
  ComponentMap,
  defineQuery,
  getAllComponents,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  removeQuery,
  setComponent
} from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import {
  addEntityNodeChild,
  EntityTreeComponent,
  getAllEntitiesInTree,
  removeEntityNode,
  removeEntityNodeRecursively
} from '../../ecs/functions/EntityTree'
import { initSystems, SystemModuleType, unloadSystems } from '../../ecs/functions/SystemFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { GLTFLoadedComponent } from '../components/GLTFLoadedComponent'
import { GroupComponent } from '../components/GroupComponent'
import { NameComponent } from '../components/NameComponent'
import { SceneAssetPendingTagComponent } from '../components/SceneAssetPendingTagComponent'
import { SCENE_COMPONENT_DYNAMIC_LOAD, SceneDynamicLoadTagComponent } from '../components/SceneDynamicLoadTagComponent'
import { UUIDComponent } from '../components/UUIDComponent'
import { VisibleComponent } from '../components/VisibleComponent'
import { getUniqueName } from '../functions/getUniqueName'

const toCapitalCase = (str: string) =>
  str
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

export const createNewEditorNode = (entityNode: Entity, prefabType: string): void => {
  const components = Engine.instance.scenePrefabRegistry.get(prefabType)
  if (!components) return console.warn(`[createNewEditorNode]: ${prefabType} is not a prefab`)

  const name = getUniqueName(entityNode, `New ${toCapitalCase(prefabType)}`)

  addEntityNodeChild(entityNode, getState(SceneState).sceneEntity)
  // Clone the defualt values so that it will not be bound to newly created node
  deserializeSceneEntity(entityNode, {
    name,
    type: prefabType.toLowerCase().replace(/\s/, '_'),
    components: cloneDeep(components)
  })
}

export const splitLazyLoadedSceneEntities = (json: SceneJson) => {
  const entityLoadQueue = {} as { [uuid: string]: EntityJson }
  const entityDynamicQueue = {} as { [uuid: string]: EntityJson }
  for (const [uuid, entity] of Object.entries(json.entities)) {
    if (entity.components.find((comp) => comp.name === SCENE_COMPONENT_DYNAMIC_LOAD)) entityDynamicQueue[uuid] = entity
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
  const loadedEntities = UUIDComponent.entitiesByUUID.get(NO_PROXY)

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
    const parent = eJson.parent ? UUIDComponent.entitiesByUUID[eJson.parent].value : rootEntity
    setComponent(eNode, EntityTreeComponent, { parentEntity: parent, uuid })
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
    updateSceneEntity(uuid, entityJson)
    const JSONEntityIsDynamic = !!entityJson.components.find((comp) => comp.name === SCENE_COMPONENT_DYNAMIC_LOAD)

    if (JSONEntityIsDynamic && !getMutableState(EngineState).isEditor.value) {
      const existingEntity = UUIDComponent.entitiesByUUID[uuid].value
      if (existingEntity) {
        const previouslyNotDynamic = !getOptionalComponent(existingEntity, SceneDynamicLoadTagComponent)?.loaded
        if (previouslyNotDynamic) {
          // remove children from world (get from entity tree)
          // these are children who have potentially been previously loaded and are now to be dynamically loaded
          const nodes = getComponent(existingEntity, EntityTreeComponent).children
          for (const node of nodes) removeEntityNode(node, false)
        }
      }
    } else {
      // iterate children
      updateSceneEntitiesFromJSON(uuid)
    }
  }
}

/**
 * Updates the scene based on serialized json data
 * @param sceneData
 */
export const updateSceneFromJSON = async () => {
  const sceneState = getMutableState(SceneState)

  if (getState(AppLoadingState).state !== AppLoadingStates.SUCCESS)
    dispatchAction(AppLoadingAction.setLoadingState({ state: AppLoadingStates.SCENE_LOADING }))

  const sceneData = getState(SceneState).sceneData as SceneData

  getMutableState(EngineState).sceneLoading.set(true)

  const systemsToLoad = [] as SystemModuleType<any>[]

  if (!getMutableState(EngineState).isEditor.value) {
    /** get systems that have changed */
    const sceneSystems = getSystemsFromSceneData(sceneData.project, sceneData.scene)
    systemsToLoad.push(
      ...sceneSystems.filter(
        (systemToLoad) =>
          !Object.values(Engine.instance.pipelines)
            .flat()
            .find((s) => s.uuid === systemToLoad.uuid)
      )
    )
    const systemsToUnload = Object.keys(Engine.instance.pipelines).map((p) =>
      Engine.instance.pipelines[p].filter(
        (loaded) => loaded.sceneSystem && !sceneSystems.find((s) => s.uuid === loaded.uuid)
      )
    )

    /** 1. unload old systems */
    await unloadSystems(systemsToUnload.flat().map((s) => s.uuid))
  }

  /** 2. remove old scene entities - GLTF loaded entities will be handled by their parents if removed */
  const oldLoadedEntityNodesToRemove = getAllEntitiesInTree(sceneState.sceneEntity.value).filter(
    (entity) =>
      !sceneData.scene.entities[getComponent(entity, UUIDComponent)] &&
      !getOptionalComponent(entity, GLTFLoadedComponent)?.includes('entity')
  )
  /** @todo this will not  */
  for (const node of oldLoadedEntityNodesToRemove) {
    if (node === sceneState.sceneEntity.value) continue
    removeEntityNodeRecursively(node, false)
  }

  /** 3. load new systems */
  if (!getMutableState(EngineState).isEditor.value) {
    await initSystems(systemsToLoad)
  }

  if (sceneData.scene.metadata) {
    for (const [key, val] of Object.entries(sceneData.scene.metadata)) {
      const metadata = sceneState.sceneMetadataRegistry[key] as State<SceneMetadata<unknown>>
      if (!metadata.value) continue
      metadata.data.set(merge({}, metadata.data.value, val))
    }
  }

  /** 4. update scene entities with new data, and load new ones */
  setComponent(sceneState.sceneEntity.value, EntityTreeComponent, { parentEntity: null!, uuid: sceneData.scene.root })
  updateSceneEntity(sceneData.scene.root, sceneData.scene.entities[sceneData.scene.root])
  updateSceneEntitiesFromJSON(sceneData.scene.root)

  if (!sceneAssetPendingTagQuery().length) {
    if (getMutableState(EngineState).sceneLoading.value) dispatchAction(EngineActions.sceneLoaded({}))
  }

  if (getState(AppLoadingState).state !== AppLoadingStates.SUCCESS)
    dispatchAction(AppLoadingAction.setLoadingState({ state: AppLoadingStates.SUCCESS }))
}

/**
 * Updates or creates a scene entity and deserializes it's components
 * @param uuid
 * @param entityJson
 * @param world
 */
export const updateSceneEntity = (uuid: EntityUUID, entityJson: EntityJson) => {
  try {
    const existingEntity = UUIDComponent.entitiesByUUID[uuid].value
    if (existingEntity) {
      deserializeSceneEntity(existingEntity, entityJson)
      /** @todo handle reparenting due to changes in scene json */
      // const parent = existingEntity.parentEntity
      // if (parent && getComponent(parent, UUIDComponent) !== entityJson.parent)
      //   reparentEntityNode(existingEntity, UUIDComponent.entitiesByUUID[entityJson.parent].value)
    } else {
      const entity = createEntity()
      const parentEntity = UUIDComponent.entitiesByUUID[entityJson.parent!].value
      setComponent(entity, EntityTreeComponent, { parentEntity, uuid })
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
  /** @todo we need to handle the case where a system is unloaded and an existing component no longer exists in the registry */
  const componentsToRemove = getAllComponents(entity).filter(
    (C) =>
      Engine.instance.sceneComponentRegistry.has(C.name) &&
      !sceneEntity.components.find((json) => Engine.instance.sceneComponentRegistry.get(C.name) === json.name)
  )
  for (const C of componentsToRemove) {
    if (entity === getState(SceneState).sceneEntity) if (C === VisibleComponent) continue
    if (C === GroupComponent || C === TransformComponent) continue
    console.log('removing component', C.name, C, entity)
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
  const sceneComponent = Engine.instance.sceneLoadingRegistry.get(component.name)

  if (!sceneComponent) return

  const deserializer = sceneComponent.deserialize

  if (deserializer) {
    deserializer(entity, component.props)
  } else {
    const Component = Array.from(Engine.instance.sceneComponentRegistry).find(
      ([_, prefab]) => prefab === component.name
    )!
    if (!Component[0]) return console.warn('[ SceneLoading] could not find component name', Component)
    if (!ComponentMap.get(Component[0])) return console.warn('[ SceneLoading] could not find component', Component[0])

    const isTagComponent = !sceneComponent.defaultData
    setComponent(
      entity,
      ComponentMap.get(Component[0])!,
      isTagComponent ? true : { ...sceneComponent.defaultData, ...component.props }
    )
  }
}

const sceneAssetPendingTagQuery = defineQuery([SceneAssetPendingTagComponent])

export default async function SceneLoadingSystem() {
  let totalPendingAssets = 0

  const sceneDataReactor = startReactor(() => {
    const sceneData = useHookstate(getMutableState(SceneState).sceneData)
    const isEngineInitialized = useHookstate(getMutableState(EngineState).isEngineInitialized)

    useEffect(() => {
      if (sceneData.value && isEngineInitialized.value) updateSceneFromJSON()
    }, [sceneData, isEngineInitialized])

    return null
  })

  const onComplete = (pendingAssets: number) => {
    const promisesCompleted = totalPendingAssets - pendingAssets
    dispatchAction(
      EngineActions.sceneLoadingProgress({
        progress:
          promisesCompleted >= totalPendingAssets ? 100 : Math.round((100 * promisesCompleted) / totalPendingAssets)
      })
    )
  }

  const execute = () => {
    if (!getMutableState(EngineState).sceneLoading.value) return

    const pendingAssets = sceneAssetPendingTagQuery().length

    for (const entity of sceneAssetPendingTagQuery.enter()) {
      totalPendingAssets++
    }

    for (const entity of sceneAssetPendingTagQuery.exit()) {
      onComplete(pendingAssets)
      if (pendingAssets === 0) {
        totalPendingAssets = 0
        dispatchAction(EngineActions.sceneLoaded({}))
      }
    }
  }

  const cleanup = async () => {
    removeQuery(sceneAssetPendingTagQuery)
    await sceneDataReactor.stop()
  }

  return { execute, cleanup }
}
