import _ from 'lodash';
import { BufferGeometry, Mesh, PerspectiveCamera, Scene } from 'three';
import { acceleratedRaycast, computeBoundsTree } from "three-mesh-bvh";
import { CameraSystem } from './camera/systems/CameraSystem';
import { CharacterControllerSystem } from './character/CharacterControllerSystem';
import { isMobileOrTablet } from './common/functions/isMobile';
import { Timer } from './common/functions/Timer';
import { DebugHelpersSystem } from './debug/systems/DebugHelpersSystem';
import { Engine } from './ecs/classes/Engine';
import { addIncomingEvents, addOutgoingEvents, EngineEvents, EngineEventsProxy } from './ecs/classes/EngineEvents';
import { execute, initialize } from "./ecs/functions/EngineFunctions";
import { registerSystem } from './ecs/functions/SystemFunctions';
import { SystemUpdateType } from "./ecs/functions/SystemUpdateType";
import { ActionSystem } from './input/systems/ActionSystem';
import { ClientInputSystem } from './input/systems/ClientInputSystem';
import { InteractiveSystem } from "./interaction/systems/InteractiveSystem";
import { Network } from './networking/classes/Network';
import { ClientNetworkSystem } from './networking/systems/ClientNetworkSystem';
import { MediaStreamSystem } from './networking/systems/MediaStreamSystem';
import { ParticleSystem } from './particles/systems/ParticleSystem';
import { PhysicsSystem } from './physics/systems/PhysicsSystem';
import { HighlightSystem } from './renderer/HighlightSystem';
import { WebGLRendererSystem } from './renderer/WebGLRendererSystem';
import { ServerSpawnSystem } from './scene/systems/SpawnSystem';
import { AnimationManager } from './templates/character/prefabs/NetworkPlayerCharacter';
import { TransformSystem } from './transform/systems/TransformSystem';
import { createWorker, WorkerProxy } from './worker/MessageQueue';
import { XRSystem } from './xr/systems/XRSystem';
import PhysXWorker from './physics/functions/loadPhysX.ts?worker';
import { PhysXInstance } from "@xr3ngine/three-physx";

// import { PositionalAudioSystem } from './audio/systems/PositionalAudioSystem';

Mesh.prototype.raycast = acceleratedRaycast;
BufferGeometry.prototype["computeBoundsTree"] = computeBoundsTree;

if (typeof window !== 'undefined') {
  // Add iOS and safari flag to window object -- To use it for creating an iOS compatible WebGLRenderer for example
  (window as any).iOS = !window.MSStream && /iPad|iPhone|iPod/.test(navigator.userAgent);
  (window as any).safariWebBrowser = !window.MSStream && /Safari/.test(navigator.userAgent);
}

export const initializeEngine = async (options): Promise<void> => {
  // const options = _.defaultsDeep({}, initOptions, DefaultInitializationOptions);
  const canvas = options.renderer && options.renderer.canvas ? options.renderer.canvas : null;

  Engine.gameModes = options.gameModes;

  const { postProcessing } = options;
  const { useOfflineMode } = options;

  Engine.offlineMode = useOfflineMode;

  Engine.xrSupported = await (navigator as any).xr?.isSessionSupported('immersive-vr')
  // offscreen is buggy still, disable it for now and opt in with url query
  // const useOffscreen = !Engine.xrSupported && 'transferControlToOffscreen' in canvas;
  const useOffscreen = false;
  if (!options.renderer) options.renderer = {};

  if (useOffscreen) {
    const workerProxy: WorkerProxy = await createWorker(
      // @ts-ignore
      new Worker(new URL('./worker/initializeOffscreen.ts', import.meta.url)),
      (canvas),
      {
        postProcessing,
        useOfflineMode
      }
    );
    EngineEvents.instance = new EngineEventsProxy(workerProxy);
    Engine.viewportElement = options.renderer.canvas;

  } else {
    EngineEvents.instance = new EngineEvents();
    Engine.scene = new Scene();
    addIncomingEvents()
  }
  addOutgoingEvents()

  Engine.publicPath = location.origin;

  if (options.networking) {
    const networkSystemOptions = { schema: options.networking.schema, app: options.networking.app };
    console.log("Network system options are", networkSystemOptions);
    console.log("Network system schema is", networkSystemOptions.schema);
    Network.instance = new Network();

    Network.instance.schema = networkSystemOptions.schema;
    if (!useOfflineMode) {
      registerSystem(ClientNetworkSystem, { ...networkSystemOptions, priority: -1 });
    }
    registerSystem(MediaStreamSystem);
  }

  initialize();

  if (options.input) {
    registerSystem(ClientInputSystem, { useWebXR: Engine.xrSupported });
  }

  if (!useOffscreen) {

    Engine.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
    Engine.scene.add(Engine.camera);

    await AnimationManager.instance.getDefaultModel()

    registerSystem(CharacterControllerSystem);
    registerSystem(ServerSpawnSystem, { priority: 899 });
    registerSystem(HighlightSystem);
    registerSystem(ActionSystem, { useWebXR: Engine.xrSupported });
    registerSystem(PhysicsSystem);
    
    await PhysXInstance.instance.initPhysX(new PhysXWorker(), { });

    registerSystem(TransformSystem, { priority: 900 });

    // audio breaks webxr currently
    // Engine.audioListener = new AudioListener();
    // Engine.camera.add(Engine.audioListener);
    // registerSystem(PositionalAudioSystem);

    registerSystem(ParticleSystem);
    registerSystem(DebugHelpersSystem);
    registerSystem(InteractiveSystem);
    registerSystem(CameraSystem);
    registerSystem(WebGLRendererSystem, { priority: 1001, canvas, postProcessing });
    registerSystem(XRSystem);
    Engine.viewportElement = Engine.renderer.domElement;
    Engine.renderer.xr.enabled = Engine.xrSupported;
  }

  Engine.engineTimer = Timer({
    networkUpdate: (delta: number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Network),
    fixedUpdate: (delta: number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Fixed),
    update: (delta, elapsedTime) => execute(delta, elapsedTime, SystemUpdateType.Free)
  }, Engine.physicsFrameRate, Engine.networkFramerate).start();

  const engageType = isMobileOrTablet() ? 'touchstart' : 'click'
  const onUserEngage = () => {
    EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.USER_ENGAGE });
    document.removeEventListener(engageType, onUserEngage);
  }
  document.addEventListener(engageType, onUserEngage);

  EngineEvents.instance.once(ClientNetworkSystem.EVENTS.CONNECT, ({ id }) => {
    Network.instance.isInitialized = true;
    Network.instance.userId = id;
  })
}


export const initializeEditor = async (options): Promise<void> => {

  EngineEvents.instance = new EngineEvents();
  Engine.scene = new Scene();

  Engine.gameModes = options.gameModes;
  Engine.publicPath = location.origin;

  initialize();

  Engine.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
  Engine.scene.add(Engine.camera);

  registerSystem(PhysicsSystem);

  await PhysXInstance.instance.initPhysX(new PhysXWorker(), { });
  
  registerSystem(TransformSystem, { priority: 900 });

  registerSystem(ParticleSystem);
  registerSystem(DebugHelpersSystem);

  Engine.engineTimer = Timer({
    networkUpdate: (delta: number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Network),
    fixedUpdate: (delta: number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Fixed),
    update: (delta, elapsedTime) => execute(delta, elapsedTime, SystemUpdateType.Free)
  }, Engine.physicsFrameRate, Engine.networkFramerate).start();
}