import { cloneDeep } from 'lodash'
import { MathUtils, Vector3 } from 'three'

import { ComponentJson, EntityJson, SceneData, SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { dispatchAction, getState } from '@xrengine/hyperflux'
import { getSystemsFromSceneData } from '@xrengine/projects/loadSystemInjection'

import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { EntityTreeNode } from '../../ecs/classes/EntityTree'
import { World } from '../../ecs/classes/World'
import {
  addComponent,
  ComponentMap,
  defineQuery,
  getComponent,
  hasComponent,
  setComponent
} from '../../ecs/functions/ComponentFunctions'
import { unloadScene } from '../../ecs/functions/EngineFunctions'
import { createEntity, removeEntity } from '../../ecs/functions/EntityFunctions'
import {
  addEntityNodeInTree,
  createEntityNode,
  removeEntityNodeFromParent,
  traverseEntityNode
} from '../../ecs/functions/EntityTreeFunctions'
import { initSystems, SystemModuleType, unloadSystems } from '../../ecs/functions/SystemFunctions'
import { matchActionOnce } from '../../networking/functions/matchActionOnce'
import { configureEffectComposer } from '../../renderer/functions/configureEffectComposer'
import { SCENE_COMPONENT_TRANSFORM } from '../../transform/components/TransformComponent'
import { GLTFLoadedComponent } from '../components/GLTFLoadedComponent'
import { NameComponent } from '../components/NameComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { PostprocessingComponent } from '../components/PostprocessingComponent'
import { SceneAssetPendingTagComponent } from '../components/SceneAssetPendingTagComponent'
import { SCENE_COMPONENT_DYNAMIC_LOAD } from '../components/SceneDynamicLoadTagComponent'
import { SceneTagComponent } from '../components/SceneTagComponent'
import { VisibleComponent } from '../components/VisibleComponent'
import { ObjectLayers } from '../constants/ObjectLayers'
import { resetEngineRenderer } from '../functions/loaders/RenderSettingsFunction'
import { SceneDynamicLoadAction } from './SceneObjectDynamicLoadSystem'

export const createNewEditorNode = (entityNode: EntityTreeNode, prefabType: string): void => {
  const components = Engine.instance.currentWorld.scenePrefabRegistry.get(prefabType)
  if (!components) return console.warn(`[createNewEditorNode]: ${prefabType} is not a prefab`)

  // Clone the defualt values so that it will not be bound to newly created node
  loadSceneEntity(entityNode, { name: prefabType, components: cloneDeep(components) })
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

export const loadECSData = async (sceneData: SceneJson, assetRoot = undefined): Promise<EntityTreeNode[]> => {
  const entityMap = {} as { [key: string]: EntityTreeNode }
  const entities = Object.entries(sceneData.entities).filter(([uuid]) => uuid !== sceneData.root)
  const idMap = new Map<string, string>()
  const loadedEntities = Engine.instance.currentWorld.entityTree.uuidNodeMap

  const root = Engine.instance.currentWorld.entityTree.rootNode
  const rootId = sceneData.root

  entities.forEach(([_uuid]) => {
    //check if uuid already exists in scene
    let uuid = _uuid
    if (loadedEntities.has(uuid)) {
      uuid = MathUtils.generateUUID()
      idMap.set(_uuid, uuid)
    }
    entityMap[uuid] = createEntityNode(createEntity(), uuid)
  })
  entities.forEach(([_uuid, _data]) => {
    let uuid = _uuid
    if (idMap.has(uuid)) {
      uuid = idMap.get(uuid)!
    }
    const data = iterateReplaceID(_data, idMap)
    loadSceneEntity(entityMap[uuid], data)
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
      if (parentId === sceneData.root) {
        sceneEntity.parent = root.uuid
        parentId = root.uuid
        result.push(node)
      }
    }
    addEntityNodeInTree(node, parentId ? (parentId === root.uuid ? root : entityMap[parentId]) : undefined)
  })
  return result
}

const postProcessingQuery = defineQuery([PostprocessingComponent])

/**
 * Updates the scene based on serialized json data
 * @param oldSceneData
 * @param sceneData
 */
export const updateSceneFromJSON = async (sceneData: SceneData) => {
  const world = Engine.instance.currentWorld

  const sceneSystems = getSystemsFromSceneData(sceneData.project, sceneData.scene, true)
  const systemsToLoad = sceneSystems.filter(
    (systemToLoad) =>
      !Object.values(world.pipelines)
        .flat()
        .find((s) => s.uuid === systemToLoad.uuid)
  )
  const systemsToUnload = Object.keys(world.pipelines).map((p) =>
    world.pipelines[p].filter((loaded) => loaded.sceneSystem && !sceneSystems.find((s) => s.uuid === loaded.uuid))
  )

  /** unload old systems */
  for (const pipeline of systemsToUnload) {
    for (const system of pipeline) {
      /** @todo run cleanup hook for this system */
      const i = pipeline.indexOf(system)
      pipeline.splice(i, 1)
    }
  }
  await initSystems(world, systemsToLoad)

  resetEngineRenderer(true)

  const { entityLoadQueue, entityDynamicQueue } = splitLazyLoadedSceneEntities(sceneData.scene)

  /** load new non dynamic scene entities */
  const newNonDynamicEntityNodes = Object.entries(entityLoadQueue).filter(
    ([uuid]) => !world.entityTree.uuidNodeMap.has(uuid)
  )
  /** load new dynamic scene entities - these will not be in either map */
  const newUnloadedDynamicEntityNodes = Object.entries(entityDynamicQueue).filter(
    ([uuid]) =>
      !world.sceneDynamicallyUnloadedEntities.has(uuid) &&
      !Array.from(world.sceneDynamicallyLoadedEntities).find(([entity, node]) => node.uuid === uuid)
  )
  /** load changed scene entities - these will either be in the entityLoadQueue and the world, or in the entityDynamicQueue and the  */
  const changedEntityNodes = Object.entries(entityLoadQueue)
    .filter(([uuid]) => world.entityTree.uuidNodeMap.has(uuid))
    .concat(
      Object.entries(entityDynamicQueue).filter(([uuid]) =>
        Array.from(world.sceneDynamicallyLoadedEntities).find(([entity, node]) => node.uuid === uuid)
      )
    )

  /** remove old scene entities - GLTF loaded entities will be handled by their parents if removed */
  const oldLoadedEntityNodesToRemove = Array.from(world.entityTree.uuidNodeMap).filter(
    ([uuid, node]) =>
      !sceneData.scene.entities[uuid] && !getComponent(node.entity, GLTFLoadedComponent)?.includes('entity')
  )
  const oldUnloadedEntityNodesToRemove = Array.from(world.sceneDynamicallyUnloadedEntities).filter(
    ([uuid]) => !sceneData.scene.entities[uuid]
  )

  // debug
  // console.log({
  //   data: sceneData.scene.entities,
  //   systemsToLoad,
  //   systemsToUnload,
  //   changedEntityNodes,
  //   newNonDynamicEntityNodes,
  //   newUnloadedDynamicEntityNodes,
  //   oldLoadedEntityNodesToRemove,
  //   oldUnloadedEntityNodesToRemove
  // })
  for (const [uuid, entityJson] of newUnloadedDynamicEntityNodes) {
    addDynamicallyLoadedEntity(uuid, entityJson, world)
  }

  for (const [uuid, entityJson] of newNonDynamicEntityNodes) {
    createSceneEntity(uuid, entityJson, world, sceneData.scene)
  }

  /** remove entites that are no longer part of the scene */
  for (const [uuid, node] of oldLoadedEntityNodesToRemove) {
    traverseEntityNode(node, (node) => removeEntity(node.entity))
    removeEntityNodeFromParent(node)
  }

  /** remove dynamic entities that are no longer part of the scene and havent been loaded */
  for (const [uuid] of oldUnloadedEntityNodesToRemove) world.sceneDynamicallyUnloadedEntities.delete(uuid)

  /** modify entities that have been changed by deserializing all the data again */
  for (const [uuid, entityJson] of changedEntityNodes) {
    const existingEntity = world.entityTree.uuidNodeMap.get(uuid)?.entity!
    for (const component of entityJson.components) {
      loadComponent(existingEntity, component, world)
    }
  }

  if (!postProcessingQuery().length) {
    configureEffectComposer()
  }

  dispatchAction(
    EngineActions.sceneObjectUpdate({
      entities: changedEntityNodes.map(([uuid]) => world.entityTree.uuidNodeMap.get(uuid)?.entity!)
    })
  )
}

/**
 * Loads a scene from scene json, unloading the current scene if there is one already loaded
 * @param sceneData
 * @param sceneSystems an array of system modules to load
 * @param softReload a boolean to indicate if the unloading should only unload scene entities, rather than network objects
 */
export const loadSceneFromJSON = async (sceneData: SceneJson, sceneSystems: SystemModuleType<any>[]) => {
  const world = Engine.instance.currentWorld

  unloadScene(world)

  await initSystems(world, sceneSystems)

  // reset renderer settings for if we are teleporting and the new scene does not have an override
  resetEngineRenderer(true)

  const { entityLoadQueue, entityDynamicQueue } = splitLazyLoadedSceneEntities(sceneData)

  if (Engine.instance.isEditor) {
    for (const [key, val] of Object.entries(sceneData.entities)) createSceneEntity(key, val, world)
  } else {
    for (const [key, val] of Object.entries(entityDynamicQueue)) addDynamicallyLoadedEntity(key, val, world)
    for (const [key, val] of Object.entries(entityLoadQueue)) createSceneEntity(key, val, world, sceneData)
  }

  if (!sceneAssetPendingTagQuery().length) {
    dispatchAction(EngineActions.sceneLoaded({}))
  }
}

export const addDynamicallyLoadedEntity = (
  uuid: string,
  entityJson: EntityJson,
  world = Engine.instance.currentWorld
) => {
  const transform = entityJson.components.find((comp) => comp.name === SCENE_COMPONENT_TRANSFORM)
  const dynamicLoad = entityJson.components.find((comp) => comp.name === SCENE_COMPONENT_DYNAMIC_LOAD)!
  if (transform) {
    world.sceneDynamicallyUnloadedEntities.set(uuid, {
      json: entityJson,
      position: new Vector3().copy(transform.props.position),
      distance: dynamicLoad.props.distance * dynamicLoad.props.distance
    })
  } else {
    console.error('[SceneLoading]: Tried to lazily load scene object without a transform')
  }
}

/**
 * Creates a scene entity and loads the data for it
 */
export const createSceneEntity = (
  uuid: string,
  entityJson: EntityJson,
  world = Engine.instance.currentWorld,
  sceneJson?: SceneJson
) => {
  function creation() {
    const node = createEntityNode(createEntity(), uuid)
    addEntityNodeInTree(node, entityJson.parent ? world.entityTree.uuidNodeMap.get(entityJson.parent) : undefined)
    loadSceneEntity(node, entityJson)
    return node.entity
  }
  if (sceneJson === undefined || entityJson.parent === undefined) return creation()
  else {
    let hasDynamicAncestor = false
    let walker = entityJson.parent as string | undefined
    while (walker) {
      if (world.sceneDynamicallyUnloadedEntities.has(walker)) {
        hasDynamicAncestor = true
        break
      }
      walker = sceneJson.entities[walker].parent
    }
    if (hasDynamicAncestor) {
      matchActionOnce(
        SceneDynamicLoadAction.load.matches.validate((action) => action.uuid === walker, ''),
        () => {
          creation()
        }
      )
    } else return creation()
  }
}

/**
 * Loads all the components from scene json for an entity
 * @param {EntityTreeNode} entityNode
 * @param {EntityJson} sceneEntity
 */
export const loadSceneEntity = (entityNode: EntityTreeNode, sceneEntity: EntityJson): Entity => {
  addComponent(entityNode.entity, NameComponent, { name: sceneEntity.name })

  for (const component of sceneEntity.components) {
    try {
      loadComponent(entityNode.entity, component)
    } catch (e) {
      console.error(`Error loading scene entity: `, JSON.stringify(sceneEntity, null, '\t'))
      console.error(e)
    }
  }

  if (!hasComponent(entityNode.entity, VisibleComponent)) {
    const obj = getComponent(entityNode.entity, Object3DComponent)?.value
    if (obj) obj.visible = false
  }

  return entityNode.entity
}

export const loadComponent = (entity: Entity, component: ComponentJson, world = Engine.instance.currentWorld): void => {
  const sceneComponent = world.sceneLoadingRegistry.get(component.name)

  if (!sceneComponent) return

  const deserializer = sceneComponent.deserialize

  if (deserializer) {
    deserializer(entity, component.props)
  } else {
    const Component = Array.from(Engine.instance.currentWorld.sceneComponentRegistry).find(
      ([_, prefab]) => prefab === component.name
    )!
    if (!Component[0]) return console.warn('[ SceneLoading] could not find component name', Component)
    if (!ComponentMap.get(Component[0])) return console.warn('[ SceneLoading] could not find component', Component[0])

    const isTagComponent = !sceneComponent.defaultData
    setComponent(
      entity,
      ComponentMap.get(Component[0]),
      isTagComponent ? true : { ...sceneComponent.defaultData, ...component.props }
    )
  }
}

const sceneAssetPendingTagQuery = defineQuery([SceneAssetPendingTagComponent])
export default async function SceneLoadingSystem(world: World) {
  let totalPendingAssets = 0

  const onComplete = (pendingAssets: number) => {
    const promisesCompleted = totalPendingAssets - pendingAssets
    dispatchAction(
      EngineActions.sceneLoadingProgress({
        progress:
          promisesCompleted > totalPendingAssets ? 100 : Math.round((100 * promisesCompleted) / totalPendingAssets)
      })
    )
  }

  return () => {
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
}
