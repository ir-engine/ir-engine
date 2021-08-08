import { AmbientLight, DirectionalLight, HemisphereLight, Object3D, PointLight, SpotLight } from 'three'
import { switchCameraMode } from '../../avatar/functions/switchCameraMode'
import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, createEntity } from '../../ecs/functions/EntityFunctions'
import { GameObject } from '../../game/components/GameObject'
import { Interactable } from '../../interaction/components/Interactable'
import { Network } from '../../networking/classes/Network'
import { createParticleEmitterObject } from '../../particles/functions/particleHelpers'
import { createCollider } from '../../physics/behaviors/createCollider'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { CopyTransformComponent } from '../../transform/components/CopyTransformComponent'
import { addObject3DComponent } from '../behaviors/addObject3DComponent'
import { createDirectionalLight } from '../behaviors/createDirectionalLight'
import { createGame } from '../behaviors/createGame'
import { createGround } from '../behaviors/createGround'
import { createGroup } from '../behaviors/createGroup'
import { createMap } from '../behaviors/createMap'
import { createAudio, createMediaServer, createVideo, createVolumetric } from '../behaviors/createMedia'
import { createPortal } from '../behaviors/createPortal'
import { createSkybox } from '../behaviors/createSkybox'
import { createTransformComponent } from '../behaviors/createTransformComponent'
import { createTriggerVolume } from '../behaviors/createTriggerVolume'
import { handleAudioSettings } from '../behaviors/handleAudioSettings'
import { configureCSM, handleRendererSettings } from '../behaviors/handleRendererSettings'
import { loadGLTFModel } from '../behaviors/loadGLTFModel'
import { loadModelAnimation } from '../behaviors/loadModelAnimation'
import { setCameraProperties } from '../behaviors/setCameraProperties'
import { setEnvMap } from '../behaviors/setEnvMap'
import { setFog } from '../behaviors/setFog'
import { Clouds } from '../classes/Clouds'
import Image from '../classes/Image'
import { PersistTagComponent } from '../components/PersistTagComponent'
import ScenePreviewCameraTagComponent from '../components/ScenePreviewCamera'
import { ShadowComponent } from '../components/ShadowComponent'
import { SpawnPointComponent } from '../components/SpawnPointComponent'
import { VisibleComponent } from '../components/VisibleComponent'
import WalkableTagComponent from '../components/Walkable'
import { BoxColliderProps } from '../interfaces/BoxColliderProps'
import { SceneData } from '../interfaces/SceneData'
import { SceneDataComponent } from '../interfaces/SceneDataComponent'

export enum SCENE_ASSET_TYPES {
  ENVMAP
}

export type ScenePropertyType = {
  directionalLights: DirectionalLight[]
  isCSMEnabled: boolean
}

export class WorldScene {
  loadedModels = 0
  loaders: Promise<void>[] = []
  static callbacks: any
  static isLoading = false

  constructor(private onCompleted?: Function, private onProgress?: Function) {}

  loadScene = (scene: SceneData) => {
    WorldScene.callbacks = {}
    WorldScene.isLoading = true

    // reset renderer settings for if we are teleporting and the new scene does not have an override
    handleRendererSettings(null, true)

    const sceneProperty: ScenePropertyType = {
      directionalLights: [],
      isCSMEnabled: true
    }

    Object.keys(scene.entities).forEach((key) => {
      const sceneEntity = scene.entities[key]
      const entity = createEntity()
      entity.name = sceneEntity.name

      sceneEntity.components.forEach((component) => {
        component.data.sceneEntityId = sceneEntity.entityId
        this.loadComponent(entity, component, sceneProperty)
      })
    })

    Promise.all(this.loaders)
      .then(() => {
        WorldScene.isLoading = false
        Engine.sceneLoaded = true

        configureCSM(sceneProperty.directionalLights, !sceneProperty.isCSMEnabled)

        EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.SCENE_LOADED })

        this.onCompleted()
      })
      .catch((err) => {
        console.error('Error while loading the scene entities =>', err)
      })
  }

  _onModelLoaded = () => {
    this.loadedModels++
    if (typeof this.onProgress === 'function') this.onProgress(this.loaders.length - this.loadedModels)
  }

  static pushAssetTypeLoadCallback = (assetType: SCENE_ASSET_TYPES, callback: () => void): void => {
    if (!WorldScene.callbacks[assetType]) WorldScene.callbacks[assetType] = []
    WorldScene.callbacks[assetType].push(callback)
  }

  static executeAssetTypeLoadCallback = (assetType: SCENE_ASSET_TYPES, ...args: any[]): void => {
    WorldScene.callbacks[assetType]?.forEach((cb) => {
      cb(...args)
    })
  }

  loadComponent = (entity: Entity, component: SceneDataComponent, sceneProperty: ScenePropertyType): void => {
    // remove '-1', '-2' etc suffixes
    const name = component.name.replace(/(-\d+)|(\s)/g, '')
    console.log('LOADING COMPONENT', component)
    switch (name) {
      case 'game':
        createGame(entity, component.data)
        break

      case 'game-object':
        addComponent(entity, GameObject, {
          gameName: component.data.gameName,
          role: component.data.role,
          uuid: component.data.sceneEntityId
        })
        break

      case 'ambient-light':
        addObject3DComponent(entity, new AmbientLight(), component.data)
        break

      case 'directional-light':
        createDirectionalLight(entity, component, sceneProperty)
        break

      case 'hemisphere-light':
        addObject3DComponent(entity, new HemisphereLight(), component.data)
        break

      case 'point-light':
        addObject3DComponent(entity, new PointLight(), component.data)
        break

      case 'collidable':
        // console.warn("'Collidable' is not implemented");
        break

      case 'floor-plan':
        break

      case 'simple-materials':
        Engine.simpleMaterials = component.data.simpleMaterials
        break

      case 'gltf-model':
        loadGLTFModel(this, entity, component, sceneProperty)
        break

      case 'loop-animation':
        loadModelAnimation(entity, component)
        break

      case 'interact':
        if (component.data.interactable) addComponent(entity, Interactable, { data: component.data })
        break

      case 'ground-plane':
        createGround(entity, component.data)
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
        if (isClient) createMap(entity, component.data)
        break

      case 'audio':
        if (isClient) createAudio(entity, component.data)
        else createMediaServer(entity, component.data)
        break

      case 'volumetric':
        if (isClient) createVolumetric(entity, component.data)
        else createMediaServer(entity, component.data)
        break

      case 'spot-light':
        addObject3DComponent(entity, new SpotLight(), component.data)
        break

      case 'transform':
        createTransformComponent(entity, component.data)
        break

      case 'walkable':
        addComponent(entity, WalkableTagComponent)
        break

      case 'fog':
        setFog(entity, component.data)
        break

      case 'skybox':
        createSkybox(entity, component.data as any)
        break

      case 'audio-settings':
        handleAudioSettings(entity, component.data)
        break

      case 'renderer-settings':
        handleRendererSettings(component.data)
        sceneProperty.isCSMEnabled = component.data.csm
        break

      case 'spawn-point':
        addComponent(entity, SpawnPointComponent)
        break

      case 'scene-preview-camera':
        addComponent(entity, ScenePreviewCameraTagComponent)
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

      case 'group':
        createGroup(entity, component.data)
        break

      case 'box-collider':
        const boxColliderProps: BoxColliderProps = component.data
        createCollider(
          {
            userData: {
              type: 'box',
              ...boxColliderProps
            }
          },
          boxColliderProps.position,
          boxColliderProps.quaternion,
          boxColliderProps.scale
        )
        break

      case 'trigger-volume':
        createTriggerVolume(entity, component.data)
        break

      case 'link':
        addObject3DComponent(entity, new Object3D(), component.data)
        addComponent(entity, Interactable, { data: { action: 'link' } })
        break

      case 'particle-emitter':
        createParticleEmitterObject(entity, component.data)
        break

      case 'cloud':
        addObject3DComponent(entity, new Clouds(), component.data)
        break

      case 'postprocessing':
        EngineRenderer.instance?.configurePostProcessing(component.data.options)
        break

      case 'cameraproperties':
        if (isClient) {
          EngineEvents.instance.once(EngineEvents.EVENTS.CLIENT_USER_LOADED, async () => {
            setCameraProperties(Network.instance.localClientEntity, component.data)
            switchCameraMode(Network.instance.localClientEntity, component.data, true)
          })
        }
        break

      case 'envmap':
        setEnvMap(entity, component.data)
        break

      case 'persist':
        if (isClient) addComponent(entity, PersistTagComponent)
        break

      case 'portal':
        createPortal(entity, component.data)
        break

      /* intentionally empty - these are only for the editor */
      case 'reflectionprobestatic':
      case 'reflectionprobe':
        break

      case 'visible':
        if (isClient) {
          addComponent(entity, VisibleComponent, { value: component.data.visible })
        }
        break

      /* deprecated */
      case 'mesh-collider':
        break

      default:
        return console.warn("Couldn't load Component", name)
    }
  }

  static load = (scene: SceneData, onCompleted: Function, onProgress?: Function) => {
    const world = new WorldScene(onCompleted, onProgress)
    world.loadScene(scene)
  }
}
