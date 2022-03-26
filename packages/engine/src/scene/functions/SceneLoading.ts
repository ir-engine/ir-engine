import { ComponentJson, EntityJson, SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { Engine } from '../../ecs/classes/Engine'
import { accessEngineState, EngineActions } from '../../ecs/classes/EngineService'
import { Entity } from '../../ecs/classes/Entity'
import { EntityTreeNode } from '../../ecs/classes/EntityTree'
import { addComponent, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { addEntityNodeInTree, createEntityNode } from '../../ecs/functions/EntityTreeFunctions'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { dispatchLocal } from '../../networking/functions/dispatchFrom'
import { DisableTransformTagComponent } from '../../transform/components/DisableTransformTagComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { EntityNodeComponent } from '../components/EntityNodeComponent'
import { NameComponent } from '../components/NameComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { SCENE_COMPONENT_SCENE_TAG, SceneTagComponent } from '../components/SceneTagComponent'
import { ObjectLayers } from '../constants/ObjectLayers'
import { resetEngineRenderer } from './loaders/RenderSettingsFunction'
import { ScenePrefabTypes } from './registerPrefabs'

export const createNewEditorNode = (entity: Entity, prefabType: ScenePrefabTypes): void => {
  const world = useWorld()

  const components = world.scenePrefabRegistry.get(prefabType)
  if (!components) return console.warn(`[createNewEditorNode]: ${prefabType} is not a prefab`)

  loadSceneEntity(createEntityNode(entity), { name: prefabType, components })
}

export const preCacheAssets = (sceneData: SceneJson, onProgress) => {
  const promises: any[] = []
  for (const [key, val] of Object.entries(sceneData)) {
    if (val && typeof val === 'object') {
      promises.push(...preCacheAssets(val, onProgress))
    } else if (typeof val === 'string') {
      if (AssetLoader.isSupported(val)) {
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

/**
 * Loads a scene from scene json
 * @param sceneData
 */
export const loadSceneFromJSON = async (sceneData: SceneJson, world = useWorld()) => {
  dispatchLocal(EngineActions.sceneLoading())

  let promisesCompleted = 0
  const onProgress = () => {
    // TODO: get more granular progress data based on percentage of each asset
    // we probably need to query for metadata to get the size of each request if we can
  }
  const onComplete = () => {
    promisesCompleted++
    dispatchLocal(
      EngineActions.sceneLoadingProgress(
        promisesCompleted > promises.length ? 100 : Math.round((100 * promisesCompleted) / promises.length)
      )
    )
  }
  const promises = preCacheAssets(sceneData, onProgress)

  Engine.sceneLoadPromises = promises
  promises.forEach((promise) => promise.then(onComplete))
  await Promise.all(promises)

  const entityMap = {} as { [key: string]: EntityTreeNode }
  Engine.sceneLoadPromises = []

  // reset renderer settings for if we are teleporting and the new scene does not have an override
  resetEngineRenderer(true)

  Object.keys(sceneData.entities).forEach((key) => {
    entityMap[key] = createEntityNode(createEntity(), key)
    loadSceneEntity(entityMap[key], sceneData.entities[key])
  })

  const tree = world.entityTree

  Object.keys(sceneData.entities).forEach((key) => {
    const sceneEntity = sceneData.entities[key]
    const node = entityMap[key]
    addEntityNodeInTree(node, sceneEntity.parent ? entityMap[sceneEntity.parent] : undefined)
  })

  addComponent(tree.rootNode.entity, Object3DComponent, { value: Engine.scene })
  addComponent(tree.rootNode.entity, SceneTagComponent, {})
  if (Engine.isEditor) {
    getComponent(tree.rootNode.entity, EntityNodeComponent).components.push(SCENE_COMPONENT_SCENE_TAG)
  }

  // todo: move these layer enable & disable to loading screen thing or something so they work with portals properly
  if (!accessEngineState().isTeleporting.value) Engine.camera?.layers.disable(ObjectLayers.Scene)

  await Promise.all(Engine.sceneLoadPromises)

  if (!accessEngineState().isTeleporting.value) Engine.camera?.layers.enable(ObjectLayers.Scene)

  dispatchLocal(EngineActions.sceneLoaded()).delay(2)
}

/**
 * Loads all the components from scene json for an entity
 * @param {EntityTreeNode} entityNode
 * @param {EntityJson} sceneEntity
 */
export const loadSceneEntity = (entityNode: EntityTreeNode, sceneEntity: EntityJson): Entity => {
  addComponent(entityNode.entity, NameComponent, { name: sceneEntity.name })
  if (Engine.isEditor) addComponent(entityNode.entity, EntityNodeComponent, { components: [] })

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

  return entityNode.entity
}

export const loadComponent = (entity: Entity, component: ComponentJson): void => {
  // remove '-1', '-2' etc suffixes
  const name = component.name.replace(/(-\d+)|(\s)/g, '')
  const world = useWorld()

  const deserializer = world.sceneLoadingRegistry.get(name)?.deserialize

  if (deserializer) {
    deserializer(entity, component)
  }
}
