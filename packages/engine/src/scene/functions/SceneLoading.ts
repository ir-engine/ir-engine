import { cloneDeep } from 'lodash'
import { MathUtils } from 'three'

import { ComponentJson, EntityJson, SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { precacheSupport } from '@xrengine/engine/src/assets/enum/AssetType'
import { dispatchAction } from '@xrengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { delay } from '../../common/functions/delay'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, getEngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { EntityTreeNode } from '../../ecs/classes/EntityTree'
import { addComponent, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { unloadScene } from '../../ecs/functions/EngineFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { addEntityNodeInTree, createEntityNode } from '../../ecs/functions/EntityTreeFunctions'
import { initSystems, SystemModuleType } from '../../ecs/functions/SystemFunctions'
import { DisableTransformTagComponent } from '../../transform/components/DisableTransformTagComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { EntityNodeComponent } from '../components/EntityNodeComponent'
import { NameComponent } from '../components/NameComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { PostprocessingComponent } from '../components/PostprocessingComponent'
import { SCENE_COMPONENT_SCENE_TAG, SceneTagComponent } from '../components/SceneTagComponent'
import { VisibleComponent } from '../components/VisibleComponent'
import { ObjectLayers } from '../constants/ObjectLayers'
import { resetEngineRenderer } from './loaders/RenderSettingsFunction'
import { ScenePrefabTypes } from './registerPrefabs'

export const createNewEditorNode = (entityNode: EntityTreeNode, prefabType: ScenePrefabTypes): void => {
  // Clone the defualt values so that it will not be bound to newly created node
  const components = cloneDeep(Engine.instance.currentWorld.scenePrefabRegistry.get(prefabType))
  if (!components) return console.warn(`[createNewEditorNode]: ${prefabType} is not a prefab`)

  loadSceneEntity(entityNode, { name: prefabType, components })
}

export const preCacheAssets = (sceneData: any, onProgress) => {
  const promises: any[] = []
  for (const [key, val] of Object.entries(sceneData)) {
    if (val && typeof val === 'object') {
      promises.push(...preCacheAssets(val, onProgress))
    } else if (typeof val === 'string') {
      if (AssetLoader.isSupported(val)) {
        if (!precacheSupport[AssetLoader.getAssetType(val)]) continue
        try {
          const promise = AssetLoader.loadAsync(val, onProgress)
          promises.push(promise)
        } catch (e) {
          console.log(e)
        }
      }
    }
  }
  return promises
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
  await Promise.all(preCacheAssets(sceneData, () => {}))
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

  let promisesCompleted = 0
  const onProgress = () => {
    // TODO: get more granular progress data based on percentage of each asset
    // we probably need to query for metadata to get the size of each request if we can
  }
  const onComplete = () => {
    promisesCompleted++
    dispatchAction(
      EngineActions.sceneLoadingProgress({
        progress: promisesCompleted > promises.length ? 100 : Math.round((100 * promisesCompleted) / promises.length)
      })
    )
  }
  const promises = preCacheAssets(sceneData, onProgress)

  promises.forEach((promise) => promise.then(onComplete))
  await Promise.allSettled(promises)

  // todo: move these layer enable & disable to loading screen thing or something so they work with portals properly
  if (!getEngineState().isTeleporting.value) world.camera?.layers.disable(ObjectLayers.Scene)

  // this needs to occur after the asset promises
  await unloadScene(world)

  await initSystems(world, sceneSystems)

  const entityMap = {} as { [key: string]: EntityTreeNode }

  // reset renderer settings for if we are teleporting and the new scene does not have an override
  resetEngineRenderer(true)

  Object.keys(sceneData.entities).forEach((key) => {
    entityMap[key] = createEntityNode(createEntity(), key)
    const sceneEntity = sceneData.entities[key]
    const node = entityMap[key]
    addEntityNodeInTree(node, sceneEntity.parent ? entityMap[sceneEntity.parent] : undefined)
    loadSceneEntity(entityMap[key], sceneData.entities[key])
  })

  const tree = world.entityTree
  addComponent(tree.rootNode.entity, Object3DComponent, { value: world.scene })
  addComponent(tree.rootNode.entity, SceneTagComponent, {})
  getComponent(tree.rootNode.entity, EntityNodeComponent).components.push(SCENE_COMPONENT_SCENE_TAG)

  if (!getEngineState().isTeleporting.value) Engine.instance.currentWorld.camera?.layers.enable(ObjectLayers.Scene)

  // TODO: Have to wait because scene is not being fully loaded at this moment
  await delay(200)
  dispatchAction(EngineActions.sceneLoaded())
}

/**
 * Loads all the components from scene json for an entity
 * @param {EntityTreeNode} entityNode
 * @param {EntityJson} sceneEntity
 */
export const loadSceneEntity = (entityNode: EntityTreeNode, sceneEntity: EntityJson): Entity => {
  addComponent(entityNode.entity, NameComponent, { name: sceneEntity.name })
  addComponent(entityNode.entity, EntityNodeComponent, { components: [] })

  sceneEntity.components.forEach((component) => {
    try {
      loadComponent(entityNode.entity, component)
    } catch (e) {
      console.error(`Error loading scene entity: `, JSON.stringify(sceneEntity, null, '\t'))
      console.error(e)
    }
  })

  if (!hasComponent(entityNode.entity, TransformComponent))
    addComponent(entityNode.entity, DisableTransformTagComponent, {})

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
