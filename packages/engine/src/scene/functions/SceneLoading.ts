import { cloneDeep } from 'lodash'
import { MathUtils, Vector3 } from 'three'

import { ComponentJson, EntityJson, SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { dispatchAction } from '@xrengine/hyperflux'

import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { EntityTreeNode } from '../../ecs/classes/EntityTree'
import { World } from '../../ecs/classes/World'
import { addComponent, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { unloadScene } from '../../ecs/functions/EngineFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { addEntityNodeInTree, createEntityNode } from '../../ecs/functions/EntityTreeFunctions'
import { initSystems, SystemModuleType } from '../../ecs/functions/SystemFunctions'
import { configureEffectComposer } from '../../renderer/functions/configureEffectComposer'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { EntityNodeComponent } from '../components/EntityNodeComponent'
import { NameComponent } from '../components/NameComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { SCENE_COMPONENT_SCENE_TAG, SceneTagComponent } from '../components/SceneTagComponent'
import { VisibleComponent } from '../components/VisibleComponent'
import { ObjectLayers } from '../constants/ObjectLayers'
import { SCENE_COMPONENT_DYNAMIC_LOAD } from './loaders/DynamicLoadFunctions'
import { resetEngineRenderer } from './loaders/RenderSettingsFunction'
import { SCENE_COMPONENT_TRANSFORM } from './loaders/TransformFunctions'
import { ScenePrefabTypes } from './registerPrefabs'

export const createNewEditorNode = (entityNode: EntityTreeNode, prefabType: ScenePrefabTypes): void => {
  // Clone the defualt values so that it will not be bound to newly created node
  const components = cloneDeep(Engine.instance.currentWorld.scenePrefabRegistry.get(prefabType))
  if (!components) return console.warn(`[createNewEditorNode]: ${prefabType} is not a prefab`)

  loadSceneEntity(entityNode, { name: prefabType, components })
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

/**
 * Loads a scene from scene json
 * @param sceneData
 */
export const loadSceneFromJSON = async (sceneData: SceneJson, sceneSystems: SystemModuleType<any>[]) => {
  const world = Engine.instance.currentWorld

  EngineActions.sceneLoadingProgress({ progress: 0 })

  // TODO: get more granular progress data based on percentage of each asset
  // we probably need to query for metadata to get the size of each request if we can
  const onProgress = () => {}

  let promisesCompleted = 0
  const onComplete = () => {
    promisesCompleted++
    dispatchAction(
      EngineActions.sceneLoadingProgress({
        progress:
          promisesCompleted > world.sceneLoadingPendingAssets.size
            ? 100
            : Math.round((100 * promisesCompleted) / world.sceneLoadingPendingAssets.size)
      })
    )
  }

  unloadScene(world)

  await initSystems(world, sceneSystems)

  const loadedEntities = [] as Array<Entity>

  // reset renderer settings for if we are teleporting and the new scene does not have an override
  resetEngineRenderer(true)

  const { entityLoadQueue, entityDynamicQueue } = splitLazyLoadedSceneEntities(sceneData)

  const entitiesToLoad = Engine.instance.isEditor ? sceneData.entities : entityLoadQueue

  for (const [key, val] of Object.entries(entitiesToLoad)) {
    loadedEntities.push(createSceneEntity(world, key, val))
  }

  if (!Engine.instance.isEditor) {
    for (const key of Object.keys(entityDynamicQueue)) {
      const entity = entityDynamicQueue[key]
      const transform = entity.components.find((comp) => comp.name === SCENE_COMPONENT_TRANSFORM)
      const dynamicLoad = entity.components.find((comp) => comp.name === SCENE_COMPONENT_DYNAMIC_LOAD)!
      if (transform) {
        world.sceneDynamicallyUnloadedEntities.set(key, {
          json: entity,
          position: new Vector3().copy(transform.props.position),
          distance: dynamicLoad.props.distance * dynamicLoad.props.distance
        })
      } else {
        console.error('[SceneLoading]: Tried to lazily load scene object without a transform')
      }
    }
  }

  for (const promise of world.sceneLoadingPendingAssets) {
    promise.then(onComplete)
  }

  await Promise.allSettled(world.sceneLoadingPendingAssets)
  world.sceneLoadingPendingAssets.clear()

  dispatchAction(EngineActions.sceneObjectUpdate({ entities: loadedEntities }))

  const tree = world.entityTree
  addComponent(tree.rootNode.entity, SceneTagComponent, {})
  getComponent(tree.rootNode.entity, EntityNodeComponent).components.push(SCENE_COMPONENT_SCENE_TAG)

  Engine.instance.currentWorld.camera?.layers.enable(ObjectLayers.Scene)

  dispatchAction(EngineActions.sceneLoaded({}))
  if (isClient) configureEffectComposer()
}

/**
 * Creates a scene entity and loads the data for it
 */
export const createSceneEntity = (world: World, uuid: string, json: EntityJson) => {
  const node = createEntityNode(createEntity(), uuid)
  addEntityNodeInTree(node, json.parent ? world.entityTree.uuidNodeMap.get(json.parent) : undefined)
  loadSceneEntity(node, json)
  return node.entity
}

/**
 * Loads all the components from scene json for an entity
 * @param {EntityTreeNode} entityNode
 * @param {EntityJson} sceneEntity
 */
export const loadSceneEntity = (entityNode: EntityTreeNode, sceneEntity: EntityJson): Entity => {
  addComponent(entityNode.entity, NameComponent, { name: sceneEntity.name })
  addComponent(entityNode.entity, EntityNodeComponent, { components: [] })

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

export const loadComponent = (entity: Entity, component: ComponentJson): void => {
  // remove '-1', '-2' etc suffixes
  const name = component.name.replace(/(-\d+)|(\s)/g, '')
  const world = Engine.instance.currentWorld

  const deserializer = world.sceneLoadingRegistry.get(name)?.deserialize

  if (deserializer) {
    deserializer(entity, component)
  }
}
