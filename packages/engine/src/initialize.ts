import { AmbientLight, Camera, GridHelper, PerspectiveCamera, Scene, AudioListener, Audio, PositionalAudio, AudioLoader } from 'three';
//import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js'
import { registerSystem } from './ecs/functions/SystemFunctions';
import { createEntity } from './ecs/functions/EntityFunctions';
import { Engine } from './ecs/classes/Engine';
import { execute, initialize, reset, startTimer } from './ecs/functions/EngineFunctions';
import { PhysicsSystem } from './physics/systems/PhysicsSystem';
import { CharacterInputSchema } from './templates/character/CharacterInputSchema';
import { CharacterSubscriptionSchema } from './templates/character/CharacterSubscriptionSchema';
import { TransformSystem } from './transform/systems/TransformSystem';
import { isBrowser } from './common/functions/isBrowser';
import { CameraSystem } from './camera/systems/CameraSystem';
import { InputSystem } from './input/systems/InputSystem';
import { NetworkSystem } from './networking/systems/NetworkSystem';
import { MediaStreamSystem } from './networking/systems/MediaStreamSystem';
import { StateSystem } from './state/systems/StateSystem';
import { SubscriptionSystem } from './subscription/systems/SubscriptionSystem';
import { ParticleSystem } from "./particles/systems/ParticleSystem";
import { WebGLRendererSystem } from './renderer/systems/WebGLRendererSystem';
import AssetLoadingSystem from './assets/systems/AssetLoadingSystem';
import { DefaultNetworkSchema } from './templates/networking/DefaultNetworkSchema';
import { CharacterStateSchema } from './templates/character/CharacterStateSchema';
import { Timer } from './common/functions/Timer';
import { addObject3DComponent } from './common/behaviors/Object3DBehaviors';
import _ from 'lodash';

import { Mesh, BufferGeometry } from "three";
import { acceleratedRaycast, computeBoundsTree } from "three-mesh-bvh";
import { InteractiveSystem } from "./interaction/systems/InteractiveSystem";
import { HighlightSystem } from './effects/systems/EffectSystem';
Mesh.prototype.raycast = acceleratedRaycast;
BufferGeometry.prototype["computeBoundsTree"] = computeBoundsTree;

export const DefaultInitializationOptions = {
  debug: true,
  withTransform: true,
  withWebXRInput: true,
  audio: {
    enabled: true,
    src: '',
    volume: 0.25,
    autoplay: true,
    loop: true,
    positional: true,
    refDistance: 20,
  },
  input: {
    enabled: true,
    schema: CharacterInputSchema
  },
  assets: {
    enabled: true
  },
  networking: {
    enabled: true,
    supportsMediaStreams: true,
    schema: DefaultNetworkSchema
  },
  state: {
    enabled: true,
    schema: CharacterStateSchema
  },
  subscriptions: {
    enabled: true,
    schema: CharacterSubscriptionSchema
  },
  physics: {
    enabled: true
  },
  particles: {
    enabled: false
  },
  camera: {
    enabled: true
  },
  transform: {
    enabled: true
  },
  renderer: {
    enabled: true
  },
  interactive: {
    enabled: true
  }
};

export function initializeEngine (initOptions: any = DefaultInitializationOptions) {
  const options = _.defaultsDeep({}, initOptions, DefaultInitializationOptions);

  // Create a new world -- this holds all of our simulation state, entities, etc
  initialize();

  if (isBrowser) {
    Engine.viewportElement = document.body;
  }

  // Create a new three.js scene
  const scene = new Scene();

  // Add the three.js scene to our manager -- it is now available anywhere
  Engine.scene = scene;

  // Asset Loading system
  if (options.assets && options.assets.enabled) {
    registerSystem(AssetLoadingSystem);
  }

  // Transform
  if (options.transform && options.transform.enabled) {
    registerSystem(TransformSystem, { priority: 900 });
  }

  // If we're a browser (we don't need to create or render on the server)
    // Camera system and component setup
    if (options.camera && options.camera.enabled) {
    // Create a new three.js camera
    const camera = new PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.3, 500);

    // Add the camera to the camera manager so it's available anywhere
    Engine.camera = camera;
    // Add the camera to the three.js scene
    scene.add(camera);
      registerSystem(CameraSystem);
    }
    if( options.audio?.enabled ){
      // console.log('Audio enabled')
      // const {src, refDistance, autoplay, positional, loop, volume} = options.audio
      // const listener = new AudioListener();
      // Engine.camera.add( listener );
      // // if( src ){
      //   const Sound:any = positional ? PositionalAudio : Audio;
      //   const sound =
      //         (Engine as any).sound = new Sound( listener );
      //   const audioLoader = new AudioLoader();
      //   audioLoader.load( src, buffer => {
      //     console.log('Audio loaded', sound)
      //     sound.setBuffer( buffer );
      //     if(refDistance && sound.setRefDistance){
      //       sound.setRefDistance( refDistance );
      //     }
      //     sound.setLoop(loop);
      //     if(volume) sound.setVolume(volume);
      //     if(autoplay) sound.play();
      //   });
      // }
    }
      
    registerSystem(StateSystem);

    registerSystem(PhysicsSystem);

  // Networking
  if (options.networking && options.networking.enabled) {
    registerSystem(NetworkSystem, { schema: options.networking.schema, app: options.networking.app });

    // Do we want audio and video streams?
    if (options.networking.supportsMediaStreams == true) {
      registerSystem(MediaStreamSystem);
    } else {
      console.warn('Does not support media streams');
    }
  }

  // Subscriptions
  if (options.subscriptions && options.subscriptions.enabled) {
    registerSystem(SubscriptionSystem);
  }
  // Particles
  if (options.particles && options.particles.enabled) {
    registerSystem(ParticleSystem);
  }

  //Object HighlightSystem
    registerSystem(HighlightSystem);

  // Rendering
  if (options.renderer && options.renderer.enabled) {
    registerSystem(WebGLRendererSystem, { priority: 999 });
    Engine.viewportElement = Engine.renderer.domElement;
  }

  // Input
  if (options.input && options.input.enabled && isBrowser) {
    registerSystem(InputSystem, { useWebXR: options.withWebXRInput });
  }

  if (options.interactive && options.interactive.enabled) {
    registerSystem(InteractiveSystem);
  }

  // if (options.debug === true) {
  //   // If we're in debug, add a gridhelper
  //   const gridHelper = new GridHelper(1000, 100, 0xffffff, 0xeeeeee);
  //   scene.add(gridHelper);
  //   const entity = createEntity();
  //   // Add an ambient light to the scene
  //   addObject3DComponent(entity, { obj3d: AmbientLight });
  // }

  // Start our timer!
    Engine.engineTimerTimeout = setTimeout(startTimer, 1000);
}
