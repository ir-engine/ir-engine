import { Sky } from '@xr3ngine/engine/src/scene/classes/Sky';
import { AmbientLight, DirectionalLight, DoubleSide, HemisphereLight, Mesh, MeshBasicMaterial, Plane, PlaneGeometry, PointLight, SpotLight } from 'three';
import { AssetLoader } from '../../assets/components/AssetLoader';
import { addComponentFromBehavior, addObject3DComponent, addTagComponentFromBehavior } from '../../common/behaviors/Object3DBehaviors';
import { VisibleTagComponent } from '../../common/components/Object3DTagComponents';
import { TransformComponent } from '../../transform/components/TransformComponent';
import CollidableTagComponent from '../components/Collidable';
import createSkybox from '../behaviors/createSkybox';
import ImageComponent from '../components/Image';
import WalkableTagComponent from '../components/Walkable';
import { LoadingSchema } from '../interfaces/LoadingSchema';
import { createBackground } from '../behaviors/createBackground';
import { createBoxCollider } from '../behaviors/createBoxCollider';
import { createGroup } from '../behaviors/createGroup';
import { createLink } from '../behaviors/createLink';
import { createScenePreviewCamera } from '../behaviors/createScenePreviewCamera';
import { createShadow } from '../behaviors/createShadow';
import { createSpawnPoint } from '../behaviors/createSpawnPoint';
import { createTriggerVolume } from '../behaviors/createTriggerVolume';
import { handleAudioSettings } from '../behaviors/handleAudioSettings';
import { setFog } from '../behaviors/setFog';
import { createImage } from '../behaviors/createImage';

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
  ["floor-plan"]: {
  // TODO
    behaviors: [
      {
        behavior: addObject3DComponent,
        args: { obj: Plane },
        values: ["color", "intensity"]
      }
    ]
  },
  'gltf-model': {
    behaviors: [
      {
        behavior: addComponentFromBehavior,
        args: {
          component: AssetLoader,
        },
        values: [{ from: 'src', to: 'url' }]
      }
    ]
  },
  'ground-plane': {
    behaviors: [
      {
        behavior: addObject3DComponent,
        args: {
          obj3d: Mesh,
          objArgs: [new PlaneGeometry(40000, 40000), new MeshBasicMaterial({ side: DoubleSide })]
        },
        values: ['color', 'material.color']
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
        behavior: createImage
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
        behavior: createSpawnPoint
      }
    ]
  },
  'scene-preview-camera': {
    behaviors: [
      {
        behavior: createScenePreviewCamera
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
        behavior: createBoxCollider
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
