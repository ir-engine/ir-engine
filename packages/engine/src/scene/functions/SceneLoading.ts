import { AmbientLight, CircleBufferGeometry, Color, HemisphereLight, Mesh, MeshPhongMaterial, MeshStandardMaterial, PointLight, Scene, SpotLight } from 'three';
// import { LOADER_STATUS } from "../../assets/constants/LoaderConstants";
import { isClient } from "../../common/functions/isClient";
import { Engine } from '../../ecs/classes/Engine';
import { EngineEvents } from '../../ecs/classes/EngineEvents';
import { Entity } from "../../ecs/classes/Entity";
import { addComponent, createEntity } from '../../ecs/functions/EntityFunctions';
import { SceneTagComponent } from '../components/Object3DTagComponents';
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


export class WorldScene {
  loadedModels = 0;
  loaders: Promise<void>[] = [];
  static isLoading = false;

  constructor(private onCompleted?: Function, private onProgress?: Function) { }

  loadScene = (scene: SceneData) => {
    WorldScene.isLoading = true;
    Object.keys(scene.entities).forEach(key => {
      const sceneEntity = scene.entities[key];
      const entity = createEntity();

      addComponent(entity, SceneTagComponent);
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
    });
  }

  _onModelLoaded = () => {
    this.loadedModels++;
    if (typeof this.onProgress === 'function') this.onProgress(this.loaders.length - this.loadedModels);
  }


  loadComponent = (entity: Entity, component: SceneDataComponent): void => {
    // remove '-1', '-2' etc suffixes
    const name = component.name.replace(/(-\d+)|(\s)/g, "");

    switch(name) {
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

      // case 'directional-light':
      //   addObject3DComponent(
      //     entity,
      //     {
      //       obj3d: DirectionalLight,
      //       objArgs: {
      //         'shadow.mapSize': component.data.shadowMapResolution,
      //         'shadow.bias': component.data.shadowBias,
      //         'shadow.radius': component.data.shadowRadius,
      //         intensity: component.data.intensity,
      //         color: component.data.color,
      //         castShadow: true,
      //       }
      //     },
      //   );
      //   addComponent(entity, LightTagComponent);
      //   break;

      case 'collidable':
        // console.warn("'Collidable' is not implemented");
        break;

      case 'floor-plan':
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
        const mesh = new Mesh(
          new CircleBufferGeometry(1000, 32).rotateX(-Math.PI / 2),
          new MeshStandardMaterial({
            color: new Color(0.313410553336143494, 0.31341053336143494, 0.30206481294706464),
            roughness:0,
          })
        );

        addObject3DComponent(
          entity,
          {
            obj3d: mesh,
            objArgs: { receiveShadow: true, 'material.color': component.data.color },
          },
        );
        break;

      case 'hemisphere-light':
        addObject3DComponent(entity, { obj3d: HemisphereLight, objArgs: component.data });
        break;

      case 'point-light':
        addObject3DComponent(entity, { obj3d: PointLight, objArgs: component.data });
        break;

      case 'skybox':
        createSkybox(entity, component.data);
        break;

      case 'image':
        addObject3DComponent(entity, { obj3d: Image, objArgs: component.data });
        break;

      case 'video':
        if (isClient) createVideo(entity, component.data);
        else createMediaServer(entity, component.data);
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
        createBackground(entity, component.data);
        break;

      case 'audio-settings':
        handleAudioSettings(entity, component.data);
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
        setReflectionProbe(entity,component.data);
        break;

      case 'persist':
        if(isClient) addComponent(entity, PersistTagComponent);
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
