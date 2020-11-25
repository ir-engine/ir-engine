import { addWorldColliders } from "@xr3ngine/engine/src/templates/world/behaviors/addWorldColliders";
import { AmbientLight, CircleBufferGeometry, Color, DirectionalLight, HemisphereLight, Mesh, MeshPhongMaterial, PointLight, SpotLight } from 'three';
import { AssetLoader } from '../../assets/components/AssetLoader';
import { addComponentFromBehavior, addObject3DComponent, addTagComponentFromBehavior } from '../../common/behaviors/Object3DBehaviors';
import { LightTagComponent, VisibleTagComponent } from '../../common/components/Object3DTagComponents';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { createBackground } from '../behaviors/createBackground';
import { createBoxCollider } from '../behaviors/createBoxCollider';
import { createGroup } from '../behaviors/createGroup';
import { createImage } from '../behaviors/createImage';
import { createLink } from '../behaviors/createLink';
import { createShadow } from '../behaviors/createShadow';
import createSkybox from '../behaviors/createSkybox';
import { createTriggerVolume } from '../behaviors/createTriggerVolume';
import { createVideo } from "../behaviors/createVideo";
import { createVolumetric } from "../behaviors/createVolumetric";
import { handleAudioSettings } from '../behaviors/handleAudioSettings';
import { setFog } from '../behaviors/setFog';
import CollidableTagComponent from '../components/Collidable';
import ScenePreviewCameraTagComponent from "../components/ScenePreviewCamera";
import SpawnPointComponent from "../components/SpawnPointComponent";
import WalkableTagComponent from '../components/Walkable';
import { LoadingSchema } from '../interfaces/LoadingSchema';
import { createCommonInteractive } from "../behaviors/createCommonInteractive";

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
    ],
        components: [{
          type: LightTagComponent
        }]
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
    ],
      components: [{
        type: LightTagComponent
      }]
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
        onLoaded: addWorldColliders
      }
    ]
  },
  'interact': {
    behaviors: [
      {
        behavior: createCommonInteractive,
        values: [
          { from: 'interactable', to: 'interactable' },
          { from: 'interactionType', to: 'interactionType' },
          { from: 'interactionText', to: 'interactionText' },
          { from: 'payloadName', to: 'payloadName' },
          { from: 'payloadUrl', to: 'payloadUrl' },
          { from: 'payloadBuyUrl', to: 'payloadBuyUrl' },
          { from: 'payloadLearnMoreUrl', to: 'payloadLearnMoreUrl' },
          { from: 'payloadHtmlContent', to: 'payloadHtmlContent' },
        ],
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
        // args: { obj3d: Sky },
        values: [
          { from: 'texture', to: 'texture' },
          { from: 'skytype', to: 'skytype' },
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
  'video': {
    behaviors: [
      {
        behavior: createVideo,
        values: [
          { from: 'src', to: 'src' },
          { from: 'projection', to: 'projection' },
          { from: 'controls', to: 'controls' },
          { from: 'autoPlay', to: 'autoPlay' },
          { from: 'loop', to: 'loop' },
          { from: 'audioType', to: 'audioType' },
          { from: 'volume', to: 'volume' },
          { from: 'distanceModel', to: 'distanceModel' },
          { from: 'rolloffFactor', to: 'rolloffFactor' },
          { from: 'refDistance', to: 'refDistance' },
          { from: 'maxDistance', to: 'maxDistance' },
          { from: 'coneInnerAngle', to: 'coneInnerAngle' },
          { from: 'coneOuterAngle', to: 'coneOuterAngle' },
          { from: 'coneOuterGain', to: 'coneOuterGain' }
        ]
      }
    ]
  },
  'volumetric': {
    behaviors: [
      {
        behavior: createVolumetric,
        values: [
          { from: 'src', to: 'src' },
          { from: 'controls', to: 'controls' },
          { from: 'autoPlay', to: 'alphaMode' },
          { from: 'loop', to: 'loop' },
          { from: 'audioType', to: 'audioType' },
          { from: 'volume', to: 'volume' },
          { from: 'distanceModel', to: 'distanceModel' },
          { from: 'rolloffFactor', to: 'rolloffFactor' },
          { from: 'refDistance', to: 'refDistance' },
          { from: 'maxDistance', to: 'maxDistance' },
          { from: 'coneInnerAngle', to: 'coneInnerAngle' },
          { from: 'coneOuterAngle', to: 'coneOuterAngle' },
          { from: 'coneOuterGain', to: 'coneOuterGain' }
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
        args: { component: SpawnPointComponent }
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
