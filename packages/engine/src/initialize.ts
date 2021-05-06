import { detect, detectOS } from 'detect-browser';
import { BufferGeometry, Mesh, PerspectiveCamera, Scene } from 'three';
import { acceleratedRaycast, computeBoundsTree } from "three-mesh-bvh";
import { CameraSystem } from './camera/systems/CameraSystem';
import { CharacterControllerSystem } from './templates/character/CharacterControllerSystem';
import { isMobileOrTablet } from './common/functions/isMobile';
import { Timer } from './common/functions/Timer';
import { DebugHelpersSystem } from './debug/systems/DebugHelpersSystem';
import { Engine } from './ecs/classes/Engine';
import { addIncomingEvents, addOutgoingEvents, EngineEvents, proxyEngineEvents as proxyEngineEvents } from './ecs/classes/EngineEvents';
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
import { PhysXInstance } from "three-physx";
//@ts-ignore
import OffscreenWorker from './worker/initializeOffscreen.ts?worker';
import { GameManagerSystem } from './game/systems/GameManagerSystem';
import { DefaultInitializationOptions } from './DefaultInitializationOptions';
import _ from 'lodash';
// import { PositionalAudioSystem } from './audio/systems/PositionalAudioSystem';

Mesh.prototype.raycast = acceleratedRaycast;
BufferGeometry.prototype["computeBoundsTree"] = computeBoundsTree;

const browser = detect();
const os = detectOS(navigator.userAgent);
if (typeof window !== 'undefined') {
  // Add iOS and safari flag to window object -- To use it for creating an iOS compatible WebGLRenderer for example
  (window as any).iOS = os === 'iOS' || /iPad|iPhone|iPod/.test(navigator.platform) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  (window as any).safariWebBrowser = browser?.name === 'safari';
}

/**
 *
 * @author Avaer Kazmer
 * @param initOptions
 */

export const initializeEngine = async (initOptions): Promise<void> => {
  const options = _.defaultsDeep({}, initOptions, DefaultInitializationOptions);

  const canvas = options.renderer && options.renderer.canvas ? options.renderer.canvas : null;

  Engine.gameModes = options.gameModes;

  const { useCanvas, postProcessing, useOfflineMode } = options;

  Engine.offlineMode = useOfflineMode;

  Engine.xrSupported = await (navigator as any).xr?.isSessionSupported('immersive-vr')

  // TODO: pipe network & entity data to main thread
  // const useOffscreen = useCanvas && !Engine.xrSupported && 'transferControlToOffscreen' in canvas;
  const useOffscreen = false;
  if (!options.renderer) options.renderer = {};

  if (useOffscreen) {
    const workerProxy: WorkerProxy = await createWorker(
      new OffscreenWorker(),
      (canvas),
      {
        postProcessing,
        useOfflineMode
      }
    );
    proxyEngineEvents(workerProxy);
    Engine.viewportElement = options.renderer.canvas;

  } else {
    Engine.scene = new Scene();
    addIncomingEvents()
  }
  addOutgoingEvents()

  Engine.publicPath = location.origin;

  if (options.networking) {
    const networkSystemOptions = { schema: options.networking.schema, app: options.networking.app };
    // console.log("Network system options are", networkSystemOptions);
    // console.log("Network system schema is", networkSystemOptions.schema);
    Network.instance = new Network();

    Network.instance.schema = networkSystemOptions.schema;
    if (!useOfflineMode) {
      registerSystem(ClientNetworkSystem, { ...networkSystemOptions, priority: -1 });
    }
    registerSystem(MediaStreamSystem);
  }

  initialize();

  if(useCanvas) {
    if (options.input) {
      registerSystem(ClientInputSystem, { useWebXR: Engine.xrSupported });
    }

    if (!useOffscreen) {

      Engine.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
      Engine.scene.add(Engine.camera);

      // promise in parallel to speed things up
      await Promise.all([
        AnimationManager.instance.getDefaultModel(),
        AnimationManager.instance.getAnimations(),
        new Promise<void>(async (resolve) => {
          // if((window as any).safariWebBrowser) {
            await PhysXInstance.instance.initPhysX(new Worker('/scripts/loadPhysXClassic.js'));
          // } else {
          //   //@ts-ignore
          //   const { default: PhysXWorker } = await import('./physics/functions/loadPhysX.ts?worker&inline');
          //   await PhysXInstance.instance.initPhysX(new PhysXWorker(), { });
          // }
          resolve()
        })
      ]);

      registerSystem(CharacterControllerSystem);
      registerSystem(ServerSpawnSystem, { priority: 899 });
      registerSystem(HighlightSystem);
      registerSystem(ActionSystem, { useWebXR: Engine.xrSupported });

      registerSystem(PhysicsSystem);
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
      registerSystem(GameManagerSystem);

      Engine.viewportElement = Engine.renderer.domElement;
      Engine.renderer.xr.enabled = Engine.xrSupported;
    }
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
    console.log('userId', id)
    Network.instance.isInitialized = true;
    Network.instance.userId = id;
  })

  Engine.isInitialized = true;
}


export const initializeEditor = async (initOptions): Promise<void> => {

  const options = _.defaultsDeep({}, initOptions, DefaultInitializationOptions);

  Engine.scene = new Scene();

  Engine.gameModes = initOptions.gameModes;
  Engine.publicPath = location.origin;

  initialize();

  Engine.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
  Engine.scene.add(Engine.camera);

  // if((window as any).safariWebBrowser) {
    await PhysXInstance.instance.initPhysX(new Worker('/scripts/loadPhysXClassic.js'));
  // } else {
  //   //@ts-ignore
  //   const { default: PhysXWorker } = await import('./physics/functions/loadPhysX.ts?worker');
  //   await PhysXInstance.instance.initPhysX(new PhysXWorker(), { });
  // }

  registerSystem(PhysicsSystem);
  registerSystem(TransformSystem, { priority: 900 });
  registerSystem(ParticleSystem);
  registerSystem(DebugHelpersSystem);
  registerSystem(GameManagerSystem);

  Engine.engineTimer = Timer({
    networkUpdate: (delta: number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Network),
    fixedUpdate: (delta: number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Fixed),
    update: (delta, elapsedTime) => execute(delta, elapsedTime, SystemUpdateType.Free)
  }, Engine.physicsFrameRate, Engine.networkFramerate).start();

  Engine.isInitialized = true;
}
