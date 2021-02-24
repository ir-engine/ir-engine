import _ from 'lodash';
import { AudioListener, BufferGeometry, Mesh, PerspectiveCamera, Scene } from 'three';
import { acceleratedRaycast, computeBoundsTree } from "three-mesh-bvh";
import AssetLoadingSystem from './assets/systems/AssetLoadingSystem';
import { PositionalAudioSystem } from './audio/systems/PositionalAudioSystem';
import { CameraSystem } from './camera/systems/CameraSystem';
import { IKTimer } from './common/functions/IKTimer';
import { isClient } from './common/functions/isClient';
import { Timer } from './common/functions/Timer';
import { DebugHelpersSystem } from './debug/systems/DebugHelpersSystem';
import { Engine } from './ecs/classes/Engine';
import { execute, initialize } from "./ecs/functions/EngineFunctions";
import { registerSystem } from './ecs/functions/SystemFunctions';
import { SystemUpdateType } from "./ecs/functions/SystemUpdateType";
import { InputSystem } from './input/systems/ClientInputSystem';
import { InteractiveSystem } from "./interaction/systems/InteractiveSystem";
import { ClientNetworkSystem } from './networking/systems/ClientNetworkSystem';
import { MediaStreamSystem } from './networking/systems/MediaStreamSystem';
import { ServerNetworkIncomingSystem } from './networking/systems/ServerNetworkIncomingSystem';
import { ServerNetworkOutgoingSystem } from './networking/systems/ServerNetworkOutgoingSystem';
import { ParticleSystem } from './particles/systems/ParticleSystem';
import { PhysicsSystem } from './physics/systems/PhysicsSystem';
import { HighlightSystem } from './renderer/HighlightSystem';
import { WebGLRendererSystem } from './renderer/WebGLRendererSystem';
import { ServerSpawnSystem } from './scene/systems/SpawnSystem';
import { StateSystem } from './state/systems/StateSystem';
import { CharacterInputSchema } from './templates/character/CharacterInputSchema';
import { CharacterStateSchema } from './templates/character/CharacterStateSchema';
import { DefaultNetworkSchema } from './templates/networking/DefaultNetworkSchema';
import { TransformSystem } from './transform/systems/TransformSystem';

Mesh.prototype.raycast = acceleratedRaycast;
BufferGeometry.prototype["computeBoundsTree"] = computeBoundsTree;

const isSafari = typeof navigator !== 'undefined' && /Version\/[\d\.]+.*Safari/.test(window.navigator.userAgent);

export const DefaultInitializationOptions = {
  input: {
    schema: CharacterInputSchema,
    useWebXR: !isSafari,
  },
  networking: {
    schema: DefaultNetworkSchema
  },
  state: {
    schema: CharacterStateSchema
  }
};

export function initializeEngine(initOptions: any = DefaultInitializationOptions): void {
  const options = _.defaultsDeep({}, initOptions, DefaultInitializationOptions);

  // Create a new world -- this holds all of our simulation state, entities, etc
  initialize();

  // Create a new three.js scene
  const scene = new Scene();

  // Add the three.js scene to our manager -- it is now available anywhere
  Engine.scene = scene;

  if(typeof window !== 'undefined') {
    (window as any).engine = Engine;
    // Add iOS and safari flag to window object -- To use it for creating an iOS compatible WebGLRenderer for example
    (window as any).iOS = !window.MSStream && /iPad|iPhone|iPod/.test(navigator.userAgent);
    (window as any).safariWebBrowser = !window.MSStream && /Safari/.test(navigator.userAgent);
  }

  // Networking
  const networkSystemOptions = { schema: options.networking.schema, app: options.networking.app };
  if (isClient) {
    registerSystem(ClientNetworkSystem, { ...networkSystemOptions, priority: -1 });
  } else {
    registerSystem(ServerNetworkIncomingSystem, { ...networkSystemOptions, priority: -1 });
    registerSystem(ServerNetworkOutgoingSystem, { ...networkSystemOptions, priority: 10000 });
  }

  // Do we want audio and video streams?
  registerSystem(MediaStreamSystem);

  registerSystem(AssetLoadingSystem);

  registerSystem(PhysicsSystem);

  if(isClient) registerSystem(InputSystem, { useWebXR: DefaultInitializationOptions.input.useWebXR });

  registerSystem(StateSystem);

  registerSystem(ServerSpawnSystem, { priority: 899 });

  registerSystem(TransformSystem, { priority: 900 });

  //Object HighlightSystem
  if (isClient) {
    // Create a new camera
    const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.3, 750);
    // Add the camera to the camera manager so it's available anywhere
    Engine.camera = camera;
    // Add the camera to the three.js scene
    scene.add(camera);

  //  const listener = new AudioListener();
  //  camera.add( listener);

  //  Engine.audioListener = listener;

    registerSystem(HighlightSystem);
  //  registerSystem(PositionalAudioSystem);
    registerSystem(InteractiveSystem);
    registerSystem(ParticleSystem);
    if (process.env.NODE_ENV === 'development') {
      //registerSystem(DebugHelpersSystem);
    }
    registerSystem(CameraSystem);
    registerSystem(WebGLRendererSystem, { priority: 1001 });
    Engine.viewportElement = Engine.renderer.domElement;
  }

  // Start our timer!
  Engine.engineTimerTimeout = setTimeout(() => {
    Engine.engineTimer = Timer(
      {
        networkUpdate: (delta:number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Network),
        fixedUpdate: (delta:number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Fixed),
        update: (delta, elapsedTime) => execute(delta, elapsedTime, SystemUpdateType.Free)
      }, Engine.physicsFrameRate, Engine.networkFramerate).start();
/*
    Engine.engineTimer = IKTimer(
      {
        networkUpdate: (delta:number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Network),
        fixedUpdate: (delta:number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Fixed),
        update: (delta, elapsedTime) => execute(delta, elapsedTime, SystemUpdateType.Free)
      }, Engine.physicsFrameRate, Engine.networkFramerate).start();
      */
  }, 1000);
}
