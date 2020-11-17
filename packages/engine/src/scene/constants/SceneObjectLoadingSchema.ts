import { AmbientLight, DirectionalLight, DoubleSide, HemisphereLight, Color, Matrix4, Vector3, Mesh, MeshBasicMaterial, MeshPhongMaterial, CircleBufferGeometry, PointLight, SpotLight } from 'three';
import { AssetLoader } from '../../assets/components/AssetLoader';
import { Entity } from '../../ecs/classes/Entity';
import { addComponentFromBehavior, addObject3DComponent, addTagComponentFromBehavior } from '../../common/behaviors/Object3DBehaviors';
import { VisibleTagComponent } from '../../common/components/Object3DTagComponents';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { createBackground } from '../behaviors/createBackground';
import { createBoxCollider } from '../behaviors/createBoxCollider';
import { createGroup } from '../behaviors/createGroup';
import { createImage } from '../behaviors/createImage';
import { createLink } from '../behaviors/createLink';
import { createScenePreviewCamera } from '../behaviors/createScenePreviewCamera';
import { createShadow } from '../behaviors/createShadow';
import createSkybox from '../behaviors/createSkybox';
import { createSpawnPoint } from '../behaviors/createSpawnPoint';
import { createTriggerVolume } from '../behaviors/createTriggerVolume';
import { handleAudioSettings } from '../behaviors/handleAudioSettings';
import { setFog } from '../behaviors/setFog';
import CollidableTagComponent from '../components/Collidable';
import WalkableTagComponent from '../components/Walkable';
import { LoadingSchema } from '../interfaces/LoadingSchema';
import { addWorldColliders } from "@xr3ngine/engine/src/templates/world/behaviors/addWorldColliders";
import { addCarPhysics } from "@xr3ngine/engine/src/physics/behaviors/addCarPhysics";
import { Sky } from '../classes/Sky';
import ScenePreviewCameraTagComponent from "../components/ScenePreviewCamera";
import SpawnPointTagComponent from "../components/SpawnPoint";

export const SceneObjectLoadingSchema: LoadingSchema = {
  'ambient-light': {
    behaviors: [
      {
        behavior: addObject3DComponent,
        args: { obj3d: AmbientLight },
        values: [
          { from: 'color', to: 'color' },
          { from: 'intensity', to: 'intensity' }
        ]
      }
    ]
  },
  'directional-light': {
    behaviors: [
      {
        behavior: addObject3DComponent,
        args: { obj3d: DirectionalLight, objArgs: { castShadow: true } },
        values: [
          { from: 'shadowMapResolution', to: 'shadow.mapSize' },
          { from: 'shadowBias', to: 'shadow.bias' },
          { from: 'shadowRadius', to: 'shadow.radius' },
          { from: 'intensity', to: 'intensity' },
          { from: 'color', to: 'color' }
        ]
      }
    ]
  },
  'collidable': {
    components: [
      {
        type: CollidableTagComponent
      }
    ]
  },
  "floor-plan": {}, // Doesn't do anything in client mode
  'gltf-model': {
    behaviors: [
      {
        behavior: addComponentFromBehavior,
        args: {
          component: AssetLoader,
        },
        values: [{ from: 'src', to: 'url' }],
        onLoaded: addWorldColliders
      }
    ]
  },
  'ground-plane': {
    behaviors: [
      {
        behavior: addObject3DComponent,
        args: {
          obj3d: new Mesh(
            new CircleBufferGeometry(1000, 32).rotateX(-Math.PI/2),
            new MeshPhongMaterial({
              color: new Color(0.313410553336143494, 0.31341053336143494, 0.30206481294706464)
            })
          )
        },
        values: [ { from: 'color', to: 'material.color' } ]
      }
    ]
  },
  'hemisphere-light': {
    behaviors: [
      {
        behavior: addObject3DComponent,
        args: { obj3d: HemisphereLight },
        values: [
          { from: 'skyColor', to: 'skyColor' },
          { from: 'groundColor', to: 'groundColor' },
          { from: 'intensity', to: 'intensity' }
        ]
      }
    ]
  },
  'point-light': {
    behaviors: [
      {
        behavior: addObject3DComponent,
        args: { obj3d: PointLight },
        values: [
          { from: 'color', to: 'color' },
          { from: 'intensity', to: 'intensity' },
          { from: 'distance', to: 'distance' },
          { from: 'decay', to: 'decay' }
        ]
      }
    ]
  },
  'skybox': {
    behaviors: [
      {
        behavior: createSkybox,
        args: { obj3d: Sky },
        values: [
          { from: 'distance', to: 'distance' },
          { from: 'inclination', to: 'inclination' },
          { from: 'azimuth', to: 'azimuth' },
          { from: 'mieCoefficient', to: 'mieCoefficient' },
          { from: 'mieDirectionalG', to: 'mieDirectionalG' },
          { from: 'rayleigh', to: 'rayleigh' },
          { from: 'turbidity', to: 'turbidity' }
        ]
      }
    ]
  },
  'image': {
    behaviors: [
      {
        behavior: createImage,
        values: [
          { from: 'src', to: 'src' },
          { from: 'projection', to: 'projection' },
          { from: 'controls', to: 'controls' },
          { from: 'alphaMode', to: 'alphaMode' },
          { from: 'alphaCutoff', to: 'alphaCutoff' }
        ]
      }
    ]
  },
  'spot-light': {
    behaviors: [
      {
        behavior: addObject3DComponent,
        args: { obj3d: SpotLight },
        values: ['color', 'intensity', 'distance', 'angle', 'penumbra', 'decay']
      }
    ]
  },
  'transform': {
    behaviors: [
      {
        // TODO: This is a js transform, we might need to handle binding this properly
        behavior: addComponentFromBehavior,
        args: { component: TransformComponent },
        values: ['position', 'rotation', 'scale']
      }
    ]
  },
  'visible': {
    behaviors: [
      {
        behavior: addTagComponentFromBehavior,
        args: { component: VisibleTagComponent }
      }
    ]
  },
  'walkable': {
    behaviors: [
      {
        behavior: addTagComponentFromBehavior,
        args: { component: WalkableTagComponent }
      }
    ]
  },
  'fog': {
    behaviors: [
      {
        behavior: setFog,
        // TODO: Get fog values and set
        values: ['position', 'rotation', 'scale']
      }
    ]
  },
  'background': {
    behaviors: [
      {
        behavior: createBackground
      }
    ]
  },
  'audio-settings': {
    behaviors: [
      {
        behavior: handleAudioSettings
      }
    ]
  },
  'spawn-point': {
    behaviors: [
      {
        behavior: addTagComponentFromBehavior,
        args: { component: SpawnPointTagComponent }
      }
    ]
  },
  'scene-preview-camera': {
    behaviors: [
      {
        behavior: addTagComponentFromBehavior,
        args: { component: ScenePreviewCameraTagComponent }
      }
    ]
  },
  'shadow': {
    behaviors: [
      {
        behavior: createShadow
      }
    ]
  },
  'group': {
    behaviors: [
      {
        behavior: createGroup
      }
    ]
  },
  'box-collider': {
    behaviors: [
      {
        behavior: createBoxCollider,
        values: ['type', 'position', 'rotation', 'scale', 'mass']
      }
    ]
  },
  'trigger-volume': {
    behaviors: [
      {
        behavior: createTriggerVolume
      }
    ]
  },
  'link': {
    behaviors: [
      {
        behavior: createLink
      }
    ]
  }
};
