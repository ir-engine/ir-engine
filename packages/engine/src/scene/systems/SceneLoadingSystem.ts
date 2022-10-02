import { cloneDeep } from 'lodash'
import { MathUtils } from 'three'

import { ComponentJson, EntityJson, SceneData, SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import logger from '@xrengine/common/src/logger'
import { dispatchAction } from '@xrengine/hyperflux'
import { getSystemsFromSceneData } from '@xrengine/projects/loadSystemInjection'

import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import {
  ComponentMap,
  defineQuery,
  getAllComponents,
  getComponent,
  hasComponent,
  removeComponent,
  removeQuery,
  setComponent
} from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { EntityTreeNode } from '../../ecs/functions/EntityTree'
import {
  addEntityNodeChild,
  createEntityNode,
  removeEntityNode,
  removeEntityNodeRecursively,
  updateRootNodeUuid
} from '../../ecs/functions/EntityTree'
import { initSystems } from '../../ecs/functions/SystemFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { GLTFLoadedComponent } from '../components/GLTFLoadedComponent'
import { GroupComponent } from '../components/GroupComponent'
import { NameComponent } from '../components/NameComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { SceneAssetPendingTagComponent } from '../components/SceneAssetPendingTagComponent'
import { SCENE_COMPONENT_DYNAMIC_LOAD, SceneDynamicLoadTagComponent } from '../components/SceneDynamicLoadTagComponent'
import { VisibleComponent } from '../components/VisibleComponent'

export const createNewEditorNode = (entityNode: EntityTreeNode, prefabType: string): void => {
  const components = Engine.instance.currentWorld.scenePrefabRegistry.get(prefabType)
  if (!components) return console.warn(`[createNewEditorNode]: ${prefabType} is not a prefab`)

  addEntityNodeChild(entityNode, Engine.instance.currentWorld.entityTree.rootNode)
  // Clone the defualt values so that it will not be bound to newly created node
  deserializeSceneEntity(entityNode, { name: prefabType, components: cloneDeep(components) })
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

export const loadECSData = async (sceneData: SceneJson, assetRoot?: EntityTreeNode): Promise<EntityTreeNode[]> => {
  const entityMap = {} as { [key: string]: EntityTreeNode }
  const entities = Object.entries(sceneData.entities).filter(([uuid]) => uuid !== sceneData.root)
  const idMap = new Map<string, string>()
  const loadedEntities = Engine.instance.currentWorld.entityTree.uuidNodeMap

  const root = assetRoot ?? Engine.instance.currentWorld.entityTree.rootNode
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
        sceneEntity.parent = root.uuid
        parentId = root.uuid
        result.push(node)
      }
    }
    addEntityNodeChild(node, parentId ? (parentId === root.uuid ? root : entityMap[parentId]) : root)
  })
  return result
}

/**
 * @param parent
 * @param world
 */
export const updateSceneEntitiesFromJSON = (parent: string, world = Engine.instance.currentWorld) => {
  const entitiesToLoad = Object.entries(world.sceneJson.entities).filter(([uuid, entity]) => entity.parent === parent)
  for (const [uuid, entityJson] of entitiesToLoad) {
    updateSceneEntity(uuid, entityJson, world)
    const JSONEntityIsDynamic = !!entityJson.components.find((comp) => comp.name === SCENE_COMPONENT_DYNAMIC_LOAD)

    if (JSONEntityIsDynamic && !Engine.instance.isEditor) {
      const existingEntity = world.entityTree.uuidNodeMap.get(uuid)
      if (existingEntity) {
        const previouslyNotDynamic = !getComponent(existingEntity.entity, SceneDynamicLoadTagComponent)?.loaded
        if (previouslyNotDynamic) {
          // remove children from world (get from entity tree)
          // these are children who have potentially been previously loaded and are now to be dynamically loaded
          const nodes = world.entityTree.uuidNodeMap
            .get(uuid!)
            ?.children.map((entity) => world.entityTree.entityNodeMap.get(entity)!)!
          for (const node of nodes) removeEntityNode(node, false, world.entityTree)
        }
      }
    } else {
      // iterate children
      updateSceneEntitiesFromJSON(uuid, world)
    }
  }
}

/**
 * Updates the scene based on serialized json data
 * @param oldSceneData
 * @param sceneData
 */
export const updateSceneFromJSON = async (sceneData: SceneData) => {
  const world = Engine.instance.currentWorld

  /** get systems that have changed */
  const sceneSystems = getSystemsFromSceneData(sceneData.project, sceneData.scene)
  const systemsToLoad = sceneSystems.filter(
    (systemToLoad) =>
      !Object.values(world.pipelines)
        .flat()
        .find((s) => s.uuid === systemToLoad.uuid)
  )
  const systemsToUnload = Object.keys(world.pipelines).map((p) =>
    world.pipelines[p].filter((loaded) => loaded.sceneSystem && !sceneSystems.find((s) => s.uuid === loaded.uuid))
  )

  /** 1. unload old systems */
  await Promise.all(systemsToUnload.flat().map((system) => system.cleanup()))
  for (const pipeline of systemsToUnload) {
    for (const system of pipeline) {
      /** @todo run cleanup hook for this system */
      const i = pipeline.indexOf(system)
      pipeline.splice(i, 1)
    }
  }

  /** 2. remove old scene entities - GLTF loaded entities will be handled by their parents if removed */
  const oldLoadedEntityNodesToRemove = Array.from(world.entityTree.uuidNodeMap).filter(
    ([uuid, node]) =>
      !sceneData.scene.entities[uuid] && !getComponent(node.entity, GLTFLoadedComponent)?.includes('entity')
  )
  /** @todo this will not  */
  for (const [uuid, node] of oldLoadedEntityNodesToRemove) {
    if (node === world.entityTree.rootNode) continue
    removeEntityNodeRecursively(node, false, world.entityTree)
  }

  /** 3. load new systems */
  if (!Engine.instance.isEditor) {
    await initSystems(world, systemsToLoad)
  }

  world.sceneJson = sceneData.scene

  /** 4. update scene entities with new data, and load new ones */
  updateRootNodeUuid(sceneData.scene.root, world.entityTree)
  updateSceneEntity(sceneData.scene.root, sceneData.scene.entities[sceneData.scene.root], world)
  updateSceneEntitiesFromJSON(sceneData.scene.root, world)

  if (!sceneAssetPendingTagQuery().length) {
    dispatchAction(EngineActions.sceneLoaded({}))
  }
}

/**
 * Updates or creates a scene entity and deserializes it's components
 * @param uuid
 * @param entityJson
 * @param world
 */
export const updateSceneEntity = (uuid: string, entityJson: EntityJson, world = Engine.instance.currentWorld) => {
  try {
    const existingEntity = world.entityTree.uuidNodeMap.get(uuid)
    if (existingEntity) {
      deserializeSceneEntity(existingEntity, entityJson)
      /** @todo handle reparenting due to changes in scene json */
      // const parent = world.entityTree.entityNodeMap.get(existingEntity!.parentEntity!)
      // if (parent && parent.uuid !== entityJson.parent)
      //   reparentEntityNode(existingEntity, world.entityTree.uuidNodeMap.get(entityJson.parent!)!)
    } else {
      const node = createEntityNode(createEntity(), uuid)
      addEntityNodeChild(node, world.entityTree.uuidNodeMap.get(entityJson.parent!)!)
      deserializeSceneEntity(node, entityJson)
    }
  } catch (e) {
    logger.error(e, `Failed to update scene entity ${uuid}`)
  }
}

/**
 * Loads all the components from scene json for an entity
 * @param {EntityTreeNode} entityNode
 * @param {EntityJson} sceneEntity
 */
export const deserializeSceneEntity = (
  entityNode: EntityTreeNode,
  sceneEntity: EntityJson,
  world = Engine.instance.currentWorld
): Entity => {
  setComponent(entityNode.entity, NameComponent, { name: sceneEntity.name })

  /** remove ECS components that are in the scene register but not in the json */
  /** @todo we need to handle the case where a system is unloaded and an existing component no longer exists in the registry */
  const componentsToRemove = getAllComponents(entityNode.entity).filter(
    (C) =>
      world.sceneComponentRegistry.has(C.name) &&
      !sceneEntity.components.find((json) => world.sceneComponentRegistry.get(C.name) === json.name)
  )
  for (const C of componentsToRemove) {
    if (entityNode.entity === world.sceneEntity) if (C === VisibleComponent) continue
    if (C === GroupComponent || C === TransformComponent) continue
    console.log('removing component', C.name, C, entityNode.entity)
    removeComponent(entityNode.entity, C)
  }
  for (const component of sceneEntity.components) {
    try {
      deserializeComponent(entityNode.entity, component)
    } catch (e) {
      console.error(`Error loading scene entity: `, JSON.stringify(sceneEntity, null, '\t'))
      console.error(e)
    }
  }

  return entityNode.entity
}

export const deserializeComponent = (
  entity: Entity,
  component: ComponentJson,
  world = Engine.instance.currentWorld
): void => {
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
      ComponentMap.get(Component[0])!,
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
          promisesCompleted >= totalPendingAssets ? 100 : Math.round((100 * promisesCompleted) / totalPendingAssets)
      })
    )
  }

  const execute = () => {
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
    removeQuery(world, sceneAssetPendingTagQuery)
  }

  return { execute, cleanup }
}
