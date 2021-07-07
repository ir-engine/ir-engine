import { AmbientLight, AnimationClip, AnimationMixer, DirectionalLight, HemisphereLight, LoopRepeat, PointLight, SpotLight } from 'three';
import { isClient } from "../../common/functions/isClient";
import { Engine } from '../../ecs/classes/Engine';
import { EngineEvents } from '../../ecs/classes/EngineEvents';
import { Entity } from "../../ecs/classes/Entity";
import { addComponent, createEntity, getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { SceneData } from "../interfaces/SceneData";
import { SceneDataComponent } from "../interfaces/SceneDataComponent";
import { addObject3DComponent } from '../behaviors/addObject3DComponent';
import { createGame, createGameObject } from "../behaviors/createGame";
import { LightTagComponent, VisibleTagComponent } from '../components/Object3DTagComponents';
import { AssetLoader } from '../../assets/classes/AssetLoader';
import { parseModelColliders, clearFromColliders } from '../../physics/behaviors/parseModelColliders';
import { createVehicleFromSceneData } from '../../vehicle/prefabs/NetworkVehicle';
import { createParticleEmitterObject } from '../../particles/functions/particleHelpers';
import { createBackground } from '../behaviors/createBackground';
import { createBoxCollider } from '../behaviors/createBoxCollider';
import { createMeshCollider } from '../behaviors/createMeshCollider';
import { createCommonInteractive } from "../behaviors/createCommonInteractive";
import { createGroup } from '../behaviors/createGroup';
import { createLink } from '../behaviors/createLink';
import { createAudio, createMediaServer, createVideo, createVolumetric } from "../behaviors/createMedia";
import { createShadow } from '../behaviors/createShadow';
import createSkybox from '../behaviors/createSkybox';
import { createTransformComponent } from "../behaviors/createTransformComponent";
import { createTriggerVolume } from '../behaviors/createTriggerVolume';
import { handleAudioSettings } from '../behaviors/handleAudioSettings';
import { setFog } from '../behaviors/setFog';
import ScenePreviewCameraTagComponent from "../components/ScenePreviewCamera";
import SpawnPointComponent from "../components/SpawnPointComponent";
import WalkableTagComponent from '../components/Walkable';
import Image from '../classes/Image';
import { setPostProcessing } from "../behaviors/setPostProcessing";
import { CameraSystem } from "../../camera/systems/CameraSystem";
import { CopyTransformComponent } from "../../transform/components/CopyTransformComponent";
import { setReflectionProbe } from '../behaviors/setReflectionProbe';
import { PersistTagComponent } from '../components/PersistTagComponent';
import { createPortal } from '../behaviors/createPortal';
import { createGround } from '../behaviors/createGround';
import { handleRendererSettings } from '../behaviors/handleRendererSettings';
import { WebGLRendererSystem } from '../../renderer/WebGLRendererSystem';
import { Object3DComponent } from '../components/Object3DComponent';
import { DJAnimationName, DJModelName } from '../../character/AnimationManager';
import { CharacterComponent } from '../../character/components/CharacterComponent';
import { AnimationComponent } from '../../character/components/AnimationComponent';
import { AnimationState } from '../../character/animations/AnimationState';

export enum SCENE_ASSET_TYPES {
  ENVMAP,
}
export class WorldScene {
  loadedModels = 0;
  loaders: Promise<void>[] = [];
  static callbacks: any
  static isLoading = false;

  constructor(private onCompleted?: Function, private onProgress?: Function) { }

  loadScene = (scene: SceneData) => {
    WorldScene.callbacks = {}
    WorldScene.isLoading = true
    // reset renderer settings for if we are teleporting and the new scene does not have an override
    handleRendererSettings();
    Object.keys(scene.entities).forEach(key => {
      const sceneEntity = scene.entities[key];
      const entity = createEntity();
      entity.name = sceneEntity.name;

      sceneEntity.components.forEach(component => {
        component.data.sceneEntityId = sceneEntity.entityId;
        this.loadComponent(entity, component);
      });
    });

    Promise.all(this.loaders).then(() => {
      WorldScene.isLoading = false;
      Engine.sceneLoaded = true;
      EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.SCENE_LOADED });

      this.onCompleted();
    }).catch((err) => {
      console.error('Error while loading the scene entities =>', err);
    });
  }

  _onModelLoaded = () => {
    this.loadedModels++;
    if (typeof this.onProgress === 'function') this.onProgress(this.loaders.length - this.loadedModels);
  }

  static pushAssetTypeLoadCallback = (assetType: SCENE_ASSET_TYPES, callback: () => void): void => {
    if (!WorldScene.callbacks[assetType]) WorldScene.callbacks[assetType] = [];
    WorldScene.callbacks[assetType].push(callback)
  }

  static executeAssetTypeLoadCallback = (assetType: SCENE_ASSET_TYPES, ...args: any[]): void => {
    WorldScene.callbacks[assetType]?.forEach((cb) => { cb(...args); })
  }

  loadComponent = (entity: Entity, component: SceneDataComponent): void => {
    // remove '-1', '-2' etc suffixes
    const name = component.name.replace(/(-\d+)|(\s)/g, "");

    switch (name) {
      case 'game':
        createGame(entity, component.data);
        break;

      case 'game-object':
        createGameObject(entity, component.data);
        break;

      case 'ambient-light':
        addObject3DComponent(entity, { obj3d: AmbientLight, objArgs: component.data });
        addComponent(entity, LightTagComponent);
        break;

      case 'directional-light':
        if (isClient && WebGLRendererSystem.instance.csm) return console.warn('SCENE LOADING - Custom directional lights are not supported when CSM is enabled.');
        addObject3DComponent(
          entity,
          {
            obj3d: DirectionalLight,
            objArgs: {
              'shadow.mapSize': component.data.shadowMapResolution,
              'shadow.bias': component.data.shadowBias,
              'shadow.radius': component.data.shadowRadius,
              intensity: component.data.intensity,
              color: component.data.color,
              castShadow: true,
            }
          },
        );
        addComponent(entity, LightTagComponent);
        break;

      case 'hemisphere-light':
        addObject3DComponent(entity, { obj3d: HemisphereLight, objArgs: component.data });
        break;

      case 'point-light':
        addObject3DComponent(entity, { obj3d: PointLight, objArgs: component.data });
        break;

      case 'collidable':
        // console.warn("'Collidable' is not implemented");
        break;

      case 'floor-plan':
        break;

      case 'simple-materials':
        Engine.simpleMaterials = component.data.simpleMaterials;
        break;

      case 'gltf-model':
        // TODO: get rid of or rename dontParseModel
        if (!isClient && component.data.dontParseModel) return;
        this.loaders.push(new Promise<void>(resolve => {
          AssetLoader.load({
            url: component.data.src,
            entity,
          }, (res) => {
            if (component.data.dontParseModel) {
              clearFromColliders(res);
            } else {
              parseModelColliders(entity, { asset: res, uniqueId: component.data.sceneEntityId });
            }

            if (isClient) {
              if (component.data.textureOverride) {
                setTimeout(() => {
                  Engine.scene.children.find((obj: any) => {
                    if (obj.sceneEntityId === component.data.textureOverride) return true;
                  })?.traverse((videoMesh: any) => {
                    if (videoMesh.name === 'VideoMesh') {
                      getComponent(entity, Object3DComponent)?.value?.traverse((obj: any) => {
                        if (obj.material) {
                          obj.material = videoMesh.material
                        }
                      })
                    }
                  })
                }, 1000);
              }

              // For DJ animations
              if (entity.name === DJModelName) {
                addComponent(entity, CharacterComponent);
                addComponent(entity, AnimationComponent, { onlyUpdateMixerTime: true }); // We only have to update the mixer time for this animations on each frame

                const actor = getMutableComponent(entity, CharacterComponent);
                const animationComponent = getMutableComponent(entity, AnimationComponent);
                const object3d = getMutableComponent(entity, Object3DComponent);

                actor.mixer = new AnimationMixer(object3d.value.children[0]);

                // Create a new animation state and set DJ animation
                // This animation will not be played until the user engagement
                animationComponent.currentState = new AnimationState();
                const action = actor.mixer.clipAction(AnimationClip.findByName(res.animations, DJAnimationName));
                action.setEffectiveWeight(1);
                action.setEffectiveTimeScale(0.2);
                animationComponent.currentState.animations = [
                  {
                    name: DJAnimationName,
                    weight: 1,
                    loopType: LoopRepeat,
                    action,
                  }
                ];
              }
            }
            this._onModelLoaded();
            resolve();
          }, null, (err) => {
            this._onModelLoaded();
            resolve();
          });
        }));
        break;

      case 'interact':
        createCommonInteractive(entity, component.data);
        break;

      case 'ground-plane':
        createGround(entity, component.data)
        break;

      case 'skybox':
        createSkybox(entity, component.data);
        break;

      case 'image':
        addObject3DComponent(entity, { obj3d: Image, objArgs: component.data });
        break;

      case 'video':
        // if livestream, server will send the video info to the client
        if (isClient) {
          // if(!component.data.isLivestream) {
          createVideo(entity, component.data);
          // }
          // addComponent(entity, LivestreamComponent)
          // } else if(component.data.isLivestream) {
          // @todo
          // addComponent(entity, LivestreamProxyComponent, { src: component.data.src })
        } else {
          createMediaServer(entity, component.data);
        }
        break;

      case 'audio':
        if (isClient) createAudio(entity, component.data);
        else createMediaServer(entity, component.data);
        break;

      case 'volumetric':
        if (isClient) createVolumetric(entity, component.data);
        else createMediaServer(entity, component.data);
        break;

      case 'spot-light':
        addObject3DComponent(entity, { obj3d: SpotLight, objArgs: component.data });
        break;

      case 'transform':
        createTransformComponent(entity, component.data);
        break;

      case 'visible':
        addComponent(entity, VisibleTagComponent);
        break;

      case 'walkable':
        addComponent(entity, WalkableTagComponent);
        break;

      case 'fog':
        setFog(entity, component.data);
        break;

      case 'background':
        createBackground(entity, component.data as any);
        break;

      case 'audio-settings':
        handleAudioSettings(entity, component.data);
        break;

      case 'renderer-settings':
        handleRendererSettings(component.data);
        break;

      case 'spawn-point':
        addComponent(entity, SpawnPointComponent);
        break;

      case 'scene-preview-camera':
        addComponent(entity, ScenePreviewCameraTagComponent);
        if (isClient && CameraSystem.instance.activeCamera) {
          addComponent(CameraSystem.instance.activeCamera, CopyTransformComponent, { input: entity });
        }
        break;

      case 'shadow':
        createShadow(entity, {
          castShadow: component.data.cast,
          receiveShadow: component.data.receive,
        });
        break;

      case 'group':
        createGroup(entity, component.data);
        break;

      case 'box-collider':
        createBoxCollider(entity, component.data);
        break;

      case 'mesh-collider':
        createMeshCollider(entity, component.data);
        break;

      case 'vehicle-saved-in-scene':
        createVehicleFromSceneData(entity, component.data);
        break;

      case 'trigger-volume':
        createTriggerVolume(entity, component.data);
        break;

      case 'link':
        createLink(entity, component.data);
        break;

      case 'particle-emitter':
        createParticleEmitterObject(entity, component.data);
        break;

      case 'postprocessing':
        setPostProcessing(entity, component.data);
        break;

      case 'reflectionprobe':
        setReflectionProbe(entity, component.data);
        break;

      case 'persist':
        if (isClient) addComponent(entity, PersistTagComponent);
        break;

      case 'portal':
        createPortal(entity, component.data)
        break;

      default: return console.warn("Couldn't load Component", name);
    }
  }

  static load = (scene: SceneData, onCompleted: Function, onProgress?: Function) => {
    const world = new WorldScene(onCompleted, onProgress);
    world.loadScene(scene);
  }
}