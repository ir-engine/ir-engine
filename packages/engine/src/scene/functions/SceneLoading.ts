import { AmbientLight, Object3D, PointLight, SpotLight } from 'three'
import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { InteractableComponent } from '../../interaction/components/InteractableComponent'
import { createParticleEmitterObject } from '../../particles/functions/particleHelpers'
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
import { deserializeDirectionalLight } from './DirectionalLightFunctions'
import { deserializeGround } from './GroundPlaneFunctions'
import { createMap } from '../functions/createMap'
import { createAudio, createMediaServer, createVideo, createVolumetric } from '../functions/createMedia'
import { createPortal } from '../functions/createPortal'
import { deserializeSkybox } from './SkyboxFunctions'
import { createTriggerVolume } from '../functions/createTriggerVolume'
import { loadGLTFModel } from '../functions/loadGLTFModel'
import { loadModelAnimation } from '../functions/loadModelAnimation'
import { setCameraProperties } from '../functions/setCameraProperties'
import { deserializeEnvMap } from './EnvMapFunctions'
import { deserializeFog } from './FogFunctions'
import { BoxColliderProps } from '../interfaces/BoxColliderProps'
import { SceneJson, ComponentJson, EntityJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { NetworkWorldAction } from '../../networking/functions/NetworkWorldAction'
import { useWorld } from '../../ecs/functions/SystemHooks'
import EntityTree from '../../ecs/classes/EntityTree'
import { matchActionOnce } from '../../networking/functions/matchActionOnce'
import { deserializeScenePreviewCamera } from './ScenePreviewCameraFunctions'
import { deserializeSpawnPoint } from './SpawnPointFunctions'
import { deserializePostprocessing } from './PostprocessingFunctions'
import { deserializeHemisphereLight } from './HemisphereLightFunctions'
import { EntityNodeType } from '../constants/EntityNodeType'
import { deserializeShadow } from './ShadowFunctions'
import { deserializeMetaData } from './MetaDataFunctions'
import { deserializeRenderSetting, updateRenderSetting } from './RenderSettingsFunction'
import { resetEngineRenderer } from './RenderSettingsFunction'
import { ComponentName } from '../../common/constants/ComponentNames'
import { deserializeAudioSetting } from './AudioSettingFunctions'
import { deserializeSimpleMaterial } from './SimpleMaterialFunctions'
import { deserializeTransform } from './TransformFunctions'
import { deserializeVisible } from './VisibleFunctions'
import { deserializePersist } from './PersistFunctions'
import { deserializeIncludeInCubeMapBake } from './IncludeInCubemapBakeFunctions'
import { deserializeWalkable } from './WalkableFunctions'

export interface SceneDataComponent extends ComponentJson {
  data: any
}

export interface EntityData extends EntityJson {
  entityType: EntityNodeType
}

export interface SceneData extends SceneJson {
  data: any
}

/**
 * Loads a scene from scene json
 * @param sceneData
 */
export const loadSceneFromJSON = async (sceneData: SceneJson) => {
  Engine.sceneLoadPromises = []

  // reset renderer settings for if we are teleporting and the new scene does not have an override
  resetEngineRenderer(true)

  const entityMap = {}

  Object.keys(sceneData.entities).forEach((key) => {
    const sceneEntity = sceneData.entities[key] as EntityData
    const entity = createEntity()
    entityMap[key] = entity
    addComponent(entity, NameComponent, { name: sceneEntity.name })
    loadComponents(entity, key, sceneEntity)
    addComponent(entity, EntityNodeComponent, { type: sceneEntity.entityType ?? EntityNodeType.DEFAULT, uuid: key })
  })

  // Create Entity Tree
  const world = useWorld()
  if (!world.entityTree) world.entityTree = new EntityTree()

  const tree = world.entityTree
  Object.keys(sceneData.entities).forEach((key) => {
    const sceneEntity = sceneData.entities[key]
    tree.addEntity(entityMap[key], sceneEntity.parent ? entityMap[sceneEntity.parent] : undefined)
  })

  await Promise.all(Engine.sceneLoadPromises)

  Engine.sceneLoaded = true

  // Configure CSM
  updateRenderSetting(world.entityTree.rootNode.entity)

  EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.SCENE_LOADED })
}

/**
 * Loads all the components from scene json for an entity
 * @param {Entity} entity
 * @param {string} sceneEntityId
 * @param {EntityJson} sceneEntity
 */
export const loadComponents = (entity: Entity, sceneEntityId: string, sceneEntity: EntityData): void => {
  sceneEntity.components.forEach((component: any) => {
    component.data = component.props
    component.data.sceneEntityId = sceneEntityId
    loadComponent(entity, component, sceneEntity)
  })
}

export const loadComponent = (entity: Entity, component: SceneDataComponent, sceneEntity: EntityData): void => {
  // remove '-1', '-2' etc suffixes
  const name = component.name.replace(/(-\d+)|(\s)/g, '')
  const world = useWorld()

  switch (name) {
    case ComponentName.MT_DATA:
      deserializeMetaData(entity, component)
      sceneEntity.entityType = EntityNodeType.SCENE
      break

    case '_metadata':
      {
        addObject3DComponent(entity, new Object3D(), component.data)
        addComponent(entity, InteractableComponent, { data: { action: '_metadata' } })
        const transform = getComponent(entity, TransformComponent)

        // if (isClient && Engine.isBot) {
        const { _data } = component.data
        const { x, y, z } = transform.position
        world.worldMetadata[_data] = x + ',' + y + ',' + z
        console.log('metadata|' + x + ',' + y + ',' + z + '|' + _data)
        // }
      }
      break

    case 'userdata':
      addComponent(entity, UserdataComponent, { data: component.data })
      break

    case 'ambient-light':
      addObject3DComponent(entity, new AmbientLight(), component.data)
      break

    case ComponentName.DIRECTIONAL_LIGHT:
      deserializeDirectionalLight(entity, component)
      sceneEntity.entityType = EntityNodeType.DIRECTIONAL_LIGHT
      break

    case ComponentName.HEMISPHERE_LIGHT:
      deserializeHemisphereLight(entity, component)
      sceneEntity.entityType = EntityNodeType.HEMISPHERE_LIGHT
      break

    case 'point-light':
      addObject3DComponent(entity, new PointLight(), component.data)
      break

    case 'spot-light':
      addObject3DComponent(entity, new SpotLight(), component.data)
      break

    case ComponentName.SIMPLE_MATERIALS:
      deserializeSimpleMaterial(entity, component)
      sceneEntity.entityType = EntityNodeType.SCENE
      break

    case 'gltf-model':
      registerSceneLoadPromise(loadGLTFModel(entity, component))
      sceneEntity.entityType = EntityNodeType.MODEL
      break

    case 'wooCommerce':
    case 'shopify':
      if (component.data && component.data.extend) {
        if (component.data.extendType == 'video') {
          // if livestream, server will send the video info to the client
          if (isClient) {
            createVideo(entity, component.data.extend)
          } else {
            createMediaServer(entity, component.data.extend)
          }
        } else if (component.data.extendType == 'image') {
          addObject3DComponent(entity, new Image(), component.data.extend)
        } else if (component.data.extendType == 'model') {
          Object.keys(component.data.extend).forEach((key) => {
            component.data[key] = component.data.extend[key]
          })
          console.log(component.data)
          registerSceneLoadPromise(loadGLTFModel(entity, component))
        }
      }
      break

    case 'loop-animation':
      loadModelAnimation(entity, component)
      break

    case 'interact':
      console.log(component.data)
      if (component.data.interactable) addComponent(entity, InteractableComponent, { data: component.data })
      break

    case ComponentName.GROUND_PLANE:
      deserializeGround(entity, component)
      sceneEntity.entityType = EntityNodeType.GROUND_PLANE
      break

    case 'image':
      addObject3DComponent(entity, new Image(), component.data)
      break

    case 'video':
      // if livestream, server will send the video info to the client
      if (isClient) {
        // if(!component.data.isLivestream) {
        createVideo(entity, component.data)
        // }
        // addComponent(entity, LivestreamComponent)
        // } else if(component.data.isLivestream) {
        // @todo
        // addComponent(entity, LivestreamProxyComponent, { src: component.data.src })
      } else {
        createMediaServer(entity, component.data)
      }
      break

    case 'map':
      if (isClient) registerSceneLoadPromise(createMap(entity, component.data))
      break

    case 'audio':
      if (isClient) createAudio(entity, component.data)
      else createMediaServer(entity, component.data)
      break

    case 'volumetric':
      if (isClient) createVolumetric(entity, component.data)
      else createMediaServer(entity, component.data)
      break

    case ComponentName.TRANSFORM:
      deserializeTransform(entity, component)
      break

    case ComponentName.FOG:
      deserializeFog(entity, component)
      sceneEntity.entityType = EntityNodeType.SCENE
      break

    case ComponentName.SKYBOX:
      deserializeSkybox(entity, component)
      sceneEntity.entityType = EntityNodeType.SKYBOX
      break

    case ComponentName.AUDIO_SETTINGS:
      deserializeAudioSetting(entity, component)
      sceneEntity.entityType = EntityNodeType.SCENE
      break

    case ComponentName.RENDERER_SETTINGS:
      deserializeRenderSetting(entity, component)
      sceneEntity.entityType = EntityNodeType.SCENE
      break

    case ComponentName.SPAWN_POINT:
      deserializeSpawnPoint(entity, component)
      sceneEntity.entityType = EntityNodeType.SPAWN_POINT
      break

    case ComponentName.SCENE_PREVIEW_CAMERA:
      deserializeScenePreviewCamera(entity, component)
      sceneEntity.entityType = EntityNodeType.SCENE_PREVIEW_CAMERA
      break

    case ComponentName.SHADOW:
      deserializeShadow(entity, component)
      break

    case 'collider': {
      const object3d = getComponent(entity, Object3DComponent)
      if (object3d) {
        const shapes = getAllShapesFromObject3D(entity, object3d.value as any, component.data)
        const body = createBody(entity, component.data, shapes)
        addComponent(entity, ColliderComponent, { body })
        addComponent(entity, CollisionComponent, { collisions: [] })
      }
      break
    }

    case 'box-collider': {
      const boxColliderProps: BoxColliderProps = component.data
      const transform = getComponent(entity, TransformComponent)

      const shape = world.physics.createShape(
        new PhysX.PxBoxGeometry(transform.scale.x, transform.scale.y, transform.scale.z),
        undefined,
        boxColliderProps as any
      )

      const body = createBody(entity, { bodyType: 0 }, [shape])
      addComponent(entity, ColliderComponent, { body })
      addComponent(entity, CollisionComponent, { collisions: [] })

      if (
        boxColliderProps.removeMesh === 'true' ||
        (typeof boxColliderProps.removeMesh === 'boolean' && boxColliderProps.removeMesh === true)
      ) {
        const obj = getComponent(entity, Object3DComponent)
        if (obj?.value) {
          if (obj.value.parent) obj.value.removeFromParent()
          removeComponent(entity, Object3DComponent)
        }
      }
      break
    }

    case 'trigger-volume':
      createTriggerVolume(entity, component.data)
      break

    case 'link':
      addObject3DComponent(entity, new Object3D(), component.data)
      addComponent(entity, InteractableComponent, { data: { action: 'link' } })
      break

    case 'particle-emitter':
      createParticleEmitterObject(entity, component.data)
      break

    case 'clouds':
      isClient && addObject3DComponent(entity, new Clouds(), component.data)
      isClient && addComponent(entity, UpdatableComponent, {})
      break

    case 'ocean':
      isClient && addObject3DComponent(entity, new Ocean(), component.data)
      isClient && addComponent(entity, UpdatableComponent, {})
      break

    case 'water':
      isClient && addObject3DComponent(entity, new Water(), component.data)
      isClient && addComponent(entity, UpdatableComponent, {})
      break

    case 'interior':
      isClient && addObject3DComponent(entity, new Interior(), component.data)
      break

    case ComponentName.POSTPROCESSING:
      deserializePostprocessing(entity, component)
      sceneEntity.entityType = EntityNodeType.POSTPROCESSING
      break

    case 'cameraproperties':
      if (isClient) {
        matchActionOnce(NetworkWorldAction.spawnAvatar.matches, (spawnAction) => {
          if (spawnAction.userId === Engine.userId) {
            setCameraProperties(useWorld().localClientEntity, component.data)
            return true
          }
          return false
        })
      }
      break

    case ComponentName.ENVMAP:
      deserializeEnvMap(entity, component)
      sceneEntity.entityType = EntityNodeType.SCENE
      break

    case ComponentName.PERSIST:
      deserializePersist(entity, component)
      break

    case 'portal':
      createPortal(entity, component.data)
      break

    /* intentionally empty - these are only for the editor */
    case ComponentName.INCLUDE_IN_CUBEMAP_BAKE:
      deserializeIncludeInCubeMapBake(entity, component)
      break

    case 'cubemapbake':
    case 'group':
    case 'project': // loaded prior to engine init
      break

    case ComponentName.VISIBILE:
      deserializeVisible(entity, component)
      break

    case ComponentName.WALKABLE:
      deserializeWalkable(entity, component)
      break

    /* deprecated */
    case 'mesh-collider':
    case 'collidable':
    case 'floor-plan':
      console.log("[Scene Loader] WARNING: '", name, ' is deprecated')
      break

    default:
      console.log("[Scene Loader] WARNING: Couldn't load component'", name, "'")
  }
}

export const registerSceneLoadPromise = (promise: Promise<any>) => {
  Engine.sceneLoadPromises.push(promise)
  promise.then(() => {
    Engine.sceneLoadPromises.splice(Engine.sceneLoadPromises.indexOf(promise), 1)
    EngineEvents.instance.dispatchEvent({
      type: EngineEvents.EVENTS.SCENE_ENTITY_LOADED,
      entitiesLeft: Engine.sceneLoadPromises.length
    })
  })
}
