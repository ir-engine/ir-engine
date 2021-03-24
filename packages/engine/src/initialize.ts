import _ from 'lodash';
import { BufferGeometry, Mesh, PerspectiveCamera, Scene } from 'three';
import { acceleratedRaycast, computeBoundsTree } from "three-mesh-bvh";
import AssetLoadingSystem from './assets/systems/AssetLoadingSystem';
import { CameraSystem } from './camera/systems/CameraSystem';
import { Timer } from './common/functions/Timer';
import { DebugHelpersSystem } from './debug/systems/DebugHelpersSystem';
import { Engine, AudioListener } from './ecs/classes/Engine';
import { execute, initialize } from "./ecs/functions/EngineFunctions";
import { registerSystem } from './ecs/functions/SystemFunctions';
import { SystemUpdateType } from "./ecs/functions/SystemUpdateType";
import { EntityActionSystem } from './input/systems/EntityActionSystem';
import { InteractiveSystem } from "./interaction/systems/InteractiveSystem";
import { ClientNetworkSystem } from './networking/systems/ClientNetworkSystem';
import { MediaStreamSystem } from './networking/systems/MediaStreamSystem';
import { ServerNetworkIncomingSystem } from './networking/systems/ServerNetworkIncomingSystem';
import { ServerNetworkOutgoingSystem } from './networking/systems/ServerNetworkOutgoingSystem';
import { ParticleSystem } from './particles/systems/ParticleSystem';
import { PhysicsSystem } from './physics/systems/PhysicsSystem';
import { createCanvas } from './renderer/functions/createCanvas';
import { HighlightSystem } from './renderer/HighlightSystem';
import { WebGLRendererSystem } from './renderer/WebGLRendererSystem';
import { ServerSpawnSystem } from './scene/systems/SpawnSystem';
import { StateSystem } from './state/systems/StateSystem';
import { CharacterInputSchema } from './templates/character/CharacterInputSchema';
import { CharacterStateSchema } from './templates/character/CharacterStateSchema';
import { DefaultNetworkSchema } from './templates/networking/DefaultNetworkSchema';
import { TransformSystem } from './transform/systems/TransformSystem';
import { EngineEvents, addIncomingEvents, addOutgoingEvents, EngineEventsProxy } from './ecs/classes/EngineEvents';
import { ClientInputSystem } from './input/systems/ClientInputSystem';
import { XRSystem } from './xr/systems/XRSystem';
import { createWorker, WorkerProxy } from './worker/MessageQueue';
import { Network } from './networking/classes/Network';
import { isMobileOrTablet } from './common/functions/isMobile';
import { AnimationManager } from './templates/character/prefabs/NetworkPlayerCharacter';
import { applyNetworkStateToClient } from './networking/functions/applyNetworkStateToClient';
// import { PositionalAudioSystem } from './audio/systems/PositionalAudioSystem';

Mesh.prototype.raycast = acceleratedRaycast;
BufferGeometry.prototype["computeBoundsTree"] = computeBoundsTree;

if(typeof window !== 'undefined') {
  // Add iOS and safari flag to window object -- To use it for creating an iOS compatible WebGLRenderer for example
  (window as any).iOS = !window.MSStream && /iPad|iPhone|iPod/.test(navigator.userAgent);
  (window as any).safariWebBrowser = !window.MSStream && /Safari/.test(navigator.userAgent);
}

export const DefaultInitializationOptions = {
  input: {
    schema: CharacterInputSchema,
  },
  networking: {
    schema: DefaultNetworkSchema
  },
  state: {
    schema: CharacterStateSchema
  },
};

export const initializeEngine = async (initOptions: any = DefaultInitializationOptions): Promise<void> => {
  const options = _.defaultsDeep({}, initOptions, DefaultInitializationOptions);
  const canvas = options.renderer.canvas || createCanvas();

  Engine.xrSupported = await (navigator as any).xr?.isSessionSupported('immersive-vr')
  // offscreen is buggy still, disable it for now and opt in with url query
  // const useOffscreen = !Engine.xrSupported && 'transferControlToOffscreen' in canvas;
  const useOffscreen = (new URL(location.toString())).searchParams.get("offscreen");

  if(useOffscreen) {
    const workerProxy: WorkerProxy = await createWorker(
      // @ts-ignore
      new Worker(new URL('./worker/initializeOffscreen.ts', import.meta.url)),
      (options.renderer.canvas || createCanvas()),
      {

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

  initialize();

  const networkSystemOptions = { schema: options.networking.schema, app: options.networking.app };
  registerSystem(ClientNetworkSystem, { ...networkSystemOptions, priority: -1 });
  registerSystem(MediaStreamSystem);
  registerSystem(ClientInputSystem, { useWebXR: Engine.xrSupported });

  if(!useOffscreen) {

    await AnimationManager.instance.getDefaultModel()
    registerSystem(AssetLoadingSystem);
    registerSystem(PhysicsSystem);
    registerSystem(StateSystem);
    registerSystem(ServerSpawnSystem, { priority: 899 });
    registerSystem(TransformSystem, { priority: 900 });

    Engine.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
    Engine.scene.add(Engine.camera);
    registerSystem(HighlightSystem);
    registerSystem(EntityActionSystem, { useWebXR: Engine.xrSupported });

// audio breaks webxr currently
    // Engine.audioListener = new AudioListener();
    // Engine.camera.add(Engine.audioListener);
    // registerSystem(PositionalAudioSystem);

    registerSystem(InteractiveSystem);
    registerSystem(ParticleSystem);
    registerSystem(DebugHelpersSystem);
    registerSystem(CameraSystem);
    registerSystem(WebGLRendererSystem, { priority: 1001, canvas });
    registerSystem(XRSystem, { offscreen: useOffscreen });
    Engine.viewportElement = Engine.renderer.domElement;
    Engine.renderer.xr.enabled = Engine.xrSupported;
  }

  Engine.engineTimerTimeout = setTimeout(() => {
    Engine.engineTimer = Timer(
      {
        networkUpdate: (delta:number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Network),
        fixedUpdate: (delta:number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Fixed),
        update: (delta, elapsedTime) => execute(delta, elapsedTime, SystemUpdateType.Free)
      }, Engine.physicsFrameRate, Engine.networkFramerate).start();
  }, 1000);

  const engageType = isMobileOrTablet() ? 'touchstart' : 'click'
  const onUserEngage = () => {
    EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.USER_ENGAGE });
    document.removeEventListener(engageType, onUserEngage);
  }
  document.addEventListener(engageType, onUserEngage);

  const connectNetworkEvent = ({ id }) => {
    Network.instance.isInitialized = true;
    Network.instance.userId = id;
    EngineEvents.instance.removeEventListener(ClientNetworkSystem.EVENTS.CONNECT, connectNetworkEvent)
  }
  EngineEvents.instance.addEventListener(ClientNetworkSystem.EVENTS.CONNECT, connectNetworkEvent)
}

export const initializeServer = async (initOptions: any = DefaultInitializationOptions): Promise<void> => {
  const options = _.defaultsDeep({}, initOptions, DefaultInitializationOptions);

  EngineEvents.instance = new EngineEvents();
  Engine.scene = new Scene();

  addIncomingEvents()
  addOutgoingEvents()

  initialize();

  const networkSystemOptions = { schema: options.networking.schema, app: options.networking.app };
  registerSystem(ServerNetworkIncomingSystem, { ...networkSystemOptions, priority: -1 });
  registerSystem(ServerNetworkOutgoingSystem, { ...networkSystemOptions, priority: 10000 });
  registerSystem(MediaStreamSystem);
  registerSystem(AssetLoadingSystem);
  registerSystem(PhysicsSystem);
  registerSystem(StateSystem);
  registerSystem(ServerSpawnSystem, { priority: 899 });
  registerSystem(TransformSystem, { priority: 900 });

  Engine.engineTimerTimeout = setTimeout(() => {
    Engine.engineTimer = Timer(
      {
        networkUpdate: (delta:number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Network),
        fixedUpdate: (delta:number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Fixed),
        update: (delta, elapsedTime) => execute(delta, elapsedTime, SystemUpdateType.Free)
      }, Engine.physicsFrameRate, Engine.networkFramerate).start();
  }, 1000);
}
