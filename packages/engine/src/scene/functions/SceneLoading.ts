import { Object3D, PointLight, SpotLight } from 'three'
import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { InteractableComponent } from '../../interaction/components/InteractableComponent'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { CollisionComponent } from '../../physics/components/CollisionComponent'
import { createBody, getAllShapesFromObject3D } from '../../physics/functions/createCollider'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { Clouds } from '../classes/Clouds'
import Image from '../classes/Image'
import { Interior } from '../classes/Interior'
import { Ocean } from '../classes/Ocean'
import { Water } from '../classes/Water'
import { NameComponent } from '../components/NameComponent'
import { EntityNodeComponent } from '../components/EntityNodeComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { UpdatableComponent } from '../components/UpdatableComponent'
import { UserdataComponent } from '../components/UserdataComponent'
import { addObject3DComponent } from '../functions/addObject3DComponent'
import { createAudio, createMediaServer, createVideo, createVolumetric } from '../functions/createMedia'
import { BoxColliderProps } from '../interfaces/BoxColliderProps'
import { SceneJson, ComponentJson, EntityJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { useWorld } from '../../ecs/functions/SystemHooks'
import EntityTree, { EntityTreeNode } from '../../ecs/classes/EntityTree'
import { updateRenderSetting, resetEngineRenderer } from './loaders/RenderSettingsFunction'
import { registerDefaultSceneFunctions } from './registerSceneFunctions'
import { ScenePrefabTypes } from './registerPrefabs'
import { DisableTransformTagComponent } from '../../transform/components/DisableTransformTagComponent'
import { SceneTagComponent, SCENE_COMPONENT_SCENE_TAG } from '../components/SceneTagComponent'
import { reparentObject3D } from './ReparentFunction'
import { dispatchLocal } from '../../networking/functions/dispatchFrom'
import { EngineActions } from '../../ecs/classes/EngineService'
import { CollisionGroups, DefaultCollisionMask } from '../../physics/enums/CollisionGroups'

export const createNewEditorNode = (entity: Entity, prefabType: ScenePrefabTypes): void => {
  const world = useWorld()

  const components = world.scenePrefabRegistry.get(prefabType)
  if (!components) return console.warn(`[createNewEditorNode]: ${prefabType} is not a prefab`)

  loadSceneEntity(new EntityTreeNode(entity), { name: prefabType, components })
}

/**
 * Loads a scene from scene json
 * @param sceneData
 */
export const loadSceneFromJSON = async (sceneData: SceneJson, world = useWorld()) => {
  const entityMap = {} as { [key: string]: EntityTreeNode }
  Engine.sceneLoadPromises = []

  // reset renderer settings for if we are teleporting and the new scene does not have an override
  resetEngineRenderer(true)

  world.sceneLoadingRegistry.clear()
  registerDefaultSceneFunctions(world)

  Object.keys(sceneData.entities).forEach((key) => {
    entityMap[key] = new EntityTreeNode(createEntity(), key)
    loadSceneEntity(entityMap[key], sceneData.entities[key])
  })

  // Create Entity Tree
  if (!world.entityTree) world.entityTree = new EntityTree()
  const tree = world.entityTree

  Object.keys(sceneData.entities).forEach((key) => {
    const sceneEntity = sceneData.entities[key]
    const node = entityMap[key]
    tree.addEntityNode(node, sceneEntity.parent ? entityMap[sceneEntity.parent] : undefined)
    console.log(sceneEntity.name, node)
    reparentObject3D(node, node.parentNode)
  })

  addComponent(world.entityTree.rootNode.entity, SceneTagComponent, {})
  if (Engine.isEditor) {
    getComponent(world.entityTree.rootNode.entity, EntityNodeComponent).components.push(SCENE_COMPONENT_SCENE_TAG)
  }

  await Promise.all(Engine.sceneLoadPromises)
  Engine.sceneLoaded = true

  // Configure CSM
  isClient && updateRenderSetting(world.entityTree.rootNode.entity)
  dispatchLocal(EngineActions.sceneLoaded(true) as any)
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
    loadComponent(entityNode.entity, component)
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
    return
  }

  switch (name) {
    case '_metadata':
      {
        addObject3DComponent(entity, new Object3D(), component.props)
        addComponent(entity, InteractableComponent, { action: '_metadata' })
        const transform = getComponent(entity, TransformComponent)

        // if (isClient && Engine.isBot) {
        const { _data } = component.props
        const { x, y, z } = transform.position
        world.worldMetadata[_data] = x + ',' + y + ',' + z
        console.log('metadata|' + x + ',' + y + ',' + z + '|' + _data)
        // }
      }
      break

    case 'userdata':
      addComponent(entity, UserdataComponent, { data: component.props })
      break
    // TODO: we can remove these entirely when we have a more composable solution than the mixin nodes
    // case 'wooCommerce':
    // case 'shopify':
    //   if (component.props && component.props.extend) {
    //     if (component.props.extendType == 'video') {
    //       // if livestream, server will send the video info to the client
    //       if (isClient) {
    //         createVideo(entity, component.props.extend)
    //       } else {
    //         createMediaServer(entity, component.props.extend)
    //       }
    //     } else if (component.props.extendType == 'image') {
    //       addObject3DComponent(entity, new Image(), component.props.extend)
    //     } else if (component.props.extendType == 'model') {
    //       Object.keys(component.props.extend).forEach((key) => {
    //         component.props[key] = component.props.extend[key]
    //       })
    //       registerSceneLoadPromise(loadGLTFModel(entity, component))
    //     }
    //   }
    //   break

    case 'interact':
      if (component.props.interactable) addComponent(entity, InteractableComponent, component.props)
      break

    case 'image':
      addObject3DComponent(entity, new Image(), component.props)
      break

    case 'video':
      // if livestream, server will send the video info to the client
      if (isClient) {
        // if(!component.props.isLivestream) {
        createVideo(entity, component.props)
        // }
        // addComponent(entity, LivestreamComponent)
        // } else if(component.props.isLivestream) {
        // @todo
        // addComponent(entity, LivestreamProxyComponent, { src: component.props.src })
      } else {
        createMediaServer(entity, component.props)
      }
      break

    case 'audio':
      if (isClient) createAudio(entity, component.props)
      else createMediaServer(entity, component.props)
      break

    case 'volumetric':
      if (isClient) createVolumetric(entity, component.props)
      else createMediaServer(entity, component.props)
      break

    case 'clouds':
      isClient && addObject3DComponent(entity, new Clouds(), component.props)
      isClient && addComponent(entity, UpdatableComponent, {})
      break

    case 'ocean':
      isClient && addObject3DComponent(entity, new Ocean(), component.props)
      isClient && addComponent(entity, UpdatableComponent, {})
      break

    case 'water':
      isClient && addObject3DComponent(entity, new Water(), component.props)
      isClient && addComponent(entity, UpdatableComponent, {})
      break

    case 'interior':
      isClient && addObject3DComponent(entity, new Interior(), component.props)
      break
  }
}

export const registerSceneLoadPromise = (promise: Promise<any>) => {
  Engine.sceneLoadPromises.push(promise)
  promise.then(() => {
    Engine.sceneLoadPromises.splice(Engine.sceneLoadPromises.indexOf(promise), 1)
    dispatchLocal(EngineActions.sceneEntityLoaded(Engine.sceneLoadPromises.length) as any)
  })
}
