import { Sky } from '@xr3ngine/engine/src/scene/classes/Sky';
import { AmbientLight, DirectionalLight, DoubleSide, HemisphereLight, Mesh, MeshBasicMaterial, PlaneGeometry, PointLight, SpotLight } from 'three';
import { AssetLoader } from '../../assets/components/AssetLoader';
import { addComponentFromBehavior, addObject3DComponent, addTagComponentFromBehavior } from '../../common/behaviors/Object3DBehaviors';
import { VisibleTagComponent } from '../../common/components/Object3DTagComponents';
import { TransformComponent } from '../../transform/components/TransformComponent';
import CollidableTagComponent from '../components/Collidable';
import createSkybox from '../components/createSkybox';
import Image from '../components/Image';
import WalkableTagComponent from '../components/Walkable';
import { LoadingSchema } from '../interfaces/LoadingSchema';

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
  // ["floor-plan"]: {
  // TODO
  //   behaviors: [
  //     {
  //       behavior: addObject3DComponent,
  //       args: { obj: Plane },
  //       values: ["color", "intensity"]
  //     }
  //   ]
  // },
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
        behavior: addObject3DComponent,
        args: { obj3d: Image },
        values: ['src', 'projection', 'parent']
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
  }
};
