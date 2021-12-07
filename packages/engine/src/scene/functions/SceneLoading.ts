import {
  AmbientLight,
  DirectionalLight,
  Euler,
  HemisphereLight,
  Object3D,
  PointLight,
  Quaternion,
  SpotLight,
  Vector3
} from 'three'
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
import { CopyTransformComponent } from '../../transform/components/CopyTransformComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { Clouds } from '../classes/Clouds'
import Image from '../classes/Image'
import { Interior } from '../classes/Interior'
import { Ocean } from '../classes/Ocean'
import { Water } from '../classes/Water'
import { PositionalAudioSettingsComponent } from '../components/AudioSettingsComponent'
import { NameComponent } from '../components/NameComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { PersistTagComponent } from '../components/PersistTagComponent'
import { ScenePreviewCameraTagComponent } from '../components/ScenePreviewCamera'
import { ShadowComponent } from '../components/ShadowComponent'
import { SpawnPointComponent } from '../components/SpawnPointComponent'
import { UpdatableComponent } from '../components/UpdatableComponent'
import { UserdataComponent } from '../components/UserdataComponent'
import { VisibleComponent } from '../components/VisibleComponent'
import { addObject3DComponent } from '../functions/addObject3DComponent'
import { createDirectionalLight } from '../functions/createDirectionalLight'
import { createGround } from '../functions/createGround'
import { createMap } from '../functions/createMap'
import { createAudio, createMediaServer, createVideo, createVolumetric } from '../functions/createMedia'
import { createPortal } from '../functions/createPortal'
import { createSkybox } from '../functions/createSkybox'
import { createTriggerVolume } from '../functions/createTriggerVolume'
import { createCSM, destroyCSM, handleRendererSettings } from '../functions/handleRendererSettings'
import { loadGLTFModel } from '../functions/loadGLTFModel'
import { loadModelAnimation } from '../functions/loadModelAnimation'
import { setCameraProperties } from '../functions/setCameraProperties'
import { setEnvMap } from '../functions/setEnvMap'
import { setFog } from '../functions/setFog'
import { BoxColliderProps } from '../interfaces/BoxColliderProps'
import { SceneJson, ComponentJson, EntityJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { NetworkWorldAction } from '../../networking/functions/NetworkWorldAction'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { matchActionOnce } from '../../networking/functions/matchActionOnce'
import { configureEffectComposer } from '../../renderer/functions/configureEffectComposer'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { dispatchFrom } from '../../networking/functions/dispatchFrom'

export interface SceneDataComponent extends ComponentJson {
  data: any
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
  destroyCSM()
  handleRendererSettings(null!, true)
  if (isClient) EngineRenderer.instance.postProcessingConfig = null

  Object.keys(sceneData.entities).forEach((key) => {
    const sceneEntity = sceneData.entities[key]
    const entity = createEntity()
    addComponent(entity, NameComponent, { name: sceneEntity.name })
    loadComponents(entity, key, sceneEntity)
  })
  await Promise.all(Engine.sceneLoadPromises)

  Engine.sceneLoaded = true
  createCSM()
  EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.SCENE_LOADED })
}

/**
 * Loads all the components from scene json for an entity
 * @param {Entity} entity
 * @param {string} sceneEntityId
 * @param {EntityJson} sceneEntity
 */
export const loadComponents = (entity: Entity, sceneEntityId: string, sceneEntity: EntityJson): void => {
  sceneEntity.components.forEach((component: any) => {
    component.data = component.props
    component.data.sceneEntityId = sceneEntityId
    loadComponent(entity, component)
  })
}

export const loadComponent = (entity: Entity, component: SceneDataComponent): void => {
  // remove '-1', '-2' etc suffixes
  // console.log(component)
  const name = component.name.replace(/(-\d+)|(\s)/g, '')
  const world = useWorld()
  switch (name) {
    case 'mtdata':
      //if (isClient && Engine.isBot) {
      const { meta_data } = component.data

      world.sceneMetadata = meta_data
      console.log('scene_metadata|' + meta_data)
      //}
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

    case 'directional-light':
      createDirectionalLight(entity, component)
      break

    case 'hemisphere-light':
      addObject3DComponent(entity, new HemisphereLight(), component.data)
      break

    case 'point-light':
      addObject3DComponent(entity, new PointLight(), component.data)
      break

    case 'spot-light':
      addObject3DComponent(entity, new SpotLight(), component.data)
      break

    case 'simple-materials':
      Engine.simpleMaterials = component.data.simpleMaterials
      break

    case 'gltf-model':
      registerSceneLoadPromise(loadGLTFModel(entity, component))
      break

    case 'wooCommerce':
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

    case 'ground-plane':
      createGround(entity, component.data, isClient)
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

    case 'transform':
      const { position, rotation, scale } = component.data
      addComponent(entity, TransformComponent, {
        position: new Vector3(position.x, position.y, position.z),
        rotation: new Quaternion().setFromEuler(
          new Euler().setFromVector3(new Vector3(rotation.x, rotation.y, rotation.z), 'XYZ')
        ),
        scale: new Vector3(scale.x, scale.y, scale.z)
      })
      break

    case 'fog':
      setFog(entity, component.data)
      break

    case 'skybox':
      createSkybox(entity, component.data as any)
      break

    case 'audio-settings':
      addComponent(entity, PositionalAudioSettingsComponent, component.data)
      break

    case 'renderer-settings':
      handleRendererSettings(component.data)
      Engine.isCSMEnabled = component.data.csm
      break

    case 'spawn-point':
      addComponent(entity, SpawnPointComponent, {})
      break

    case 'scene-preview-camera':
      addComponent(entity, ScenePreviewCameraTagComponent, {})
      if (isClient && Engine.activeCameraEntity) {
        addComponent(Engine.activeCameraEntity, CopyTransformComponent, { input: entity })
      }
      break

    case 'shadow':
      addComponent(entity, ShadowComponent, {
        castShadow: component.data.cast,
        receiveShadow: component.data.receive
      })
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

    case 'postprocessing':
      isClient && configureEffectComposer(component.data.options)
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

    case 'envmap':
      setEnvMap(entity, component.data)
      break

    case 'persist':
      if (isClient) addComponent(entity, PersistTagComponent, {})
      break

    case 'portal':
      createPortal(entity, component.data)
      break

    /* intentionally empty - these are only for the editor */
    case 'includeInCubemapBake':
    case 'cubemapbake':
    case 'group':
    case 'project': // loaded prior to engine init
      break

    case 'visible':
      if (isClient) {
        addComponent(entity, VisibleComponent, { value: component.data.visible })
      }
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
