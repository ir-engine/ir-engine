import _ from 'lodash';
import { detect, detectOS } from 'detect-browser';
import { BufferGeometry, Mesh, PerspectiveCamera, Scene } from 'three';
import { acceleratedRaycast, computeBoundsTree } from "three-mesh-bvh";
import { PositionalAudioSystem } from './audio/systems/PositionalAudioSystem';
import { CameraSystem } from './camera/systems/CameraSystem';
import { AnimationManager } from './character/AnimationManager';
import { CharacterControllerSystem } from './character/CharacterControllerSystem';
import { now } from './common/functions/now';
import { DebugHelpersSystem } from './debug/systems/DebugHelpersSystem';
import { DefaultInitializationOptions, InitializeOptions, EngineSystemPresets } from "./initializationOptions";
import { Engine } from './ecs/classes/Engine';
import { EngineEvents } from './ecs/classes/EngineEvents';
import { registerSystem } from './ecs/functions/SystemFunctions';
import { GameManagerSystem } from './game/systems/GameManagerSystem';
import { ActionSystem } from './input/systems/ActionSystem';
import { ClientInputSystem } from './input/systems/ClientInputSystem';
import { InteractiveSystem } from './interaction/systems/InteractiveSystem';
import { Network } from './networking/classes/Network';
import { ClientNetworkStateSystem } from './networking/systems/ClientNetworkStateSystem';
import { ClientNetworkSystem } from './networking/systems/ClientNetworkSystem';
import { MediaStreamSystem } from './networking/systems/MediaStreamSystem';
import { ParticleSystem } from './particles/systems/ParticleSystem';
import { PhysicsSystem } from './physics/systems/PhysicsSystem';
import { configCanvasElement } from './renderer/functions/canvas';
import { HighlightSystem } from './renderer/HighlightSystem';
import { TransformSystem } from './transform/systems/TransformSystem';
import { UIPanelSystem } from './ui/systems/UIPanelSystem';
import { XRSystem } from './xr/systems/XRSystem';
import { WebGLRendererSystem } from "./renderer/WebGLRendererSystem";
import { Timer } from './common/functions/Timer';
import { execute } from './ecs/functions/EngineFunctions';
import { SystemUpdateType } from './ecs/functions/SystemUpdateType';
import { isMobileOrTablet } from './common/functions/isMobile';
import { ServerNetworkIncomingSystem } from './networking/systems/ServerNetworkIncomingSystem';
import { ServerNetworkOutgoingSystem } from './networking/systems/ServerNetworkOutgoingSystem';
import { ServerSpawnSystem } from './scene/systems/ServerSpawnSystem';
import { SceneObjectSystem } from '@xrengine/engine/src/scene/systems/SceneObjectSystem';
import { ActiveSystems } from './ecs/classes/System';
import { FontManager } from './ui/classes/FontManager';


Mesh.prototype.raycast = acceleratedRaycast;
BufferGeometry.prototype["computeBoundsTree"] = computeBoundsTree;

const configureClient = async (options: InitializeOptions) => {
    const canvas = configCanvasElement(options.renderer.canvasId);

    // TODO: pipe network & entity data to main thread
    // const useOffscreen = !options.renderer.disabled && !Engine.xrSupported && 'transferControlToOffscreen' in canvas;
    const useOffscreen = false;

    if (useOffscreen) {
      // const { default: OffscreenWorker } = await import('./initializeOffscreen.ts?worker&inline');
      // const workerProxy: WorkerProxy = await createWorker(
      //   new OffscreenWorker(),
      //   (canvas),
      //   {
      //     postProcessing: options.renderer.postProcessing,
      //     useOfflineMode: options.networking.useOfflineMode,
      //   }
      // );
      // proxyEngineEvents(workerProxy);
      // Engine.viewportElement = canvas;
    } else {
      Engine.scene = new Scene();
      EngineEvents.instance.once(EngineEvents.EVENTS.JOINED_WORLD, () => {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl');
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        const enableRenderer = !(/SwiftShader/.test(renderer));
        canvas.remove();
        EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.ENABLE_SCENE, renderer: enableRenderer, physics: true });
      });

      if (options.renderer.disabled !== true) {

          Engine.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
          Engine.scene.add(Engine.camera);

          /** @todo for when we fix bundling */
          // if((window as any).safariWebBrowser) {
          //   physicsWorker = new Worker(options.physxWorkerPath);
          // } else {
          //     // @ts-ignore
          //     const { default: PhysXWorker } = await import('@xrengine/engine/src/physics/functions/loadPhysX.ts?worker&inline');
          //     physicsWorker = new PhysXWorker();
          // }

          new FontManager();
          new AnimationManager();
          await Promise.all([
              AnimationManager.instance.getDefaultModel(),
              AnimationManager.instance.getAnimations(),
          ]);

          Engine.workers.push(options.physxWorker);
      }
    }

    registerClientSystems(options, useOffscreen, canvas);
}

const configureEditor = async (options: InitializeOptions) => {
    Engine.scene = new Scene();

    Engine.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
    Engine.scene.add(Engine.camera);

    // let physicsWorker;

    /** @todo fix bundling */
    // if((window as any).safariWebBrowser) {
        // eslint-disable-next-line prefer-const
        // physicsWorker = new Worker(options.physxWorkerPath);
    // } else {
    //     // @ts-ignore
    //     const { default: PhysXWorker } = await import('./physics/functions/loadPhysX.ts?worker');
    //     physicsWorker = new PhysXWorker();
    // }

    Engine.workers.push(options.physxWorker);

    registerEditorSystems(options);
}

const configureServer = async (options: InitializeOptions) => {
    Engine.scene = new Scene();
    Network.instance = new Network();

    EngineEvents.instance.once(EngineEvents.EVENTS.JOINED_WORLD, () => {
        EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.ENABLE_SCENE, renderer: true, physics: true });
    });

    Engine.workers.push(options.physxWorker);

    registerServerSystems(options);
}

const registerClientSystems = (options: InitializeOptions, useOffscreen: boolean, canvas: HTMLCanvasElement) => {
    // Network Systems
    if (options.networking) {
        Network.instance = new Network();

        Network.instance.schema = options.networking.schema;
        if (!options.networking.useOfflineMode) {
            registerSystem(ClientNetworkSystem, { ...options.networking, priority: 0 });
            registerSystem(ClientNetworkStateSystem, { priority: 1 });
        }

        registerSystem(MediaStreamSystem, { priority: 2 });
    }

    if (options.renderer.disabled) return;


    // Input Systems
    if (options.input) registerSystem(ClientInputSystem, { useWebXR: Engine.xrSupported, priority: 1 });

    if (useOffscreen) return;

    // Render systems
    registerSystem(XRSystem, { priority: 1 }); // Free
    registerSystem(CameraSystem, { priority: 2 }); // Free
    registerSystem(WebGLRendererSystem, { priority: 3, canvas, postProcessing: options.renderer.postProcessing }); // Free

    // Input Systems
    registerSystem(UIPanelSystem, { priority: 2 });
    registerSystem(ActionSystem, { priority: 3 });
    registerSystem(CharacterControllerSystem, { priority: 4 });

    // Scene Systems
    registerSystem(InteractiveSystem, { priority: 5 });
    registerSystem(GameManagerSystem, { priority: 6 });
    registerSystem(TransformSystem, { priority: 7 }); // Free
    registerSystem(PhysicsSystem, { worker: options.physxWorker, physicsWorldConfig: options.physicsWorldConfig, priority: 8 });

    // Miscellaneous Systems
    registerSystem(HighlightSystem, { priority: 9 });
    registerSystem(ParticleSystem, { priority: 10 });
    registerSystem(DebugHelpersSystem, { priority: 11 });
    registerSystem(PositionalAudioSystem, { priority: 12 });
    registerSystem(SceneObjectSystem, { priority: 13 });
}

const registerEditorSystems = (options: InitializeOptions) => {
    // Scene Systems
    registerSystem(GameManagerSystem, { priority: 6 });
    registerSystem(TransformSystem, { priority: 7 });
    registerSystem(PhysicsSystem, { worker: options.physxWorker, physicsWorldConfig: options.physicsWorldConfig, priority: 8 });

    // Miscellaneous Systems
    registerSystem(ParticleSystem, { priority: 10 });
    registerSystem(DebugHelpersSystem, { priority: 11 });
}

const registerServerSystems = (options: InitializeOptions) => {
    // Network Systems
    registerSystem(ServerNetworkIncomingSystem, { ...options.networking, priority: 1 }); // first
    registerSystem(ServerNetworkOutgoingSystem, { ...options.networking, priority: 100 }); // last
    registerSystem(MediaStreamSystem, { priority: 3 });

    // Input Systems
    registerSystem(CharacterControllerSystem, { priority: 4 });

    // Scene Systems
    registerSystem(InteractiveSystem, { priority: 5 });
    registerSystem(GameManagerSystem, { priority: 6 });
    registerSystem(TransformSystem, { priority: 7 });
    registerSystem(PhysicsSystem, { worker: options.physxWorker, physicsWorldConfig: options.physicsWorldConfig, priority: 8 });

    // Miscellaneous Systems
    registerSystem(ServerSpawnSystem, { priority: 9 });
}

export const initializeEngine = async (initOptions: InitializeOptions): Promise<void> => {
    // Set options and state of engine.
    const options = _.defaultsDeep({}, initOptions, DefaultInitializationOptions);

    Engine.gameMode = options.gameMode;
    Engine.supportedGameModes = options.supportedGameModes;
    Engine.offlineMode = options.networking.useOfflineMode;
    Engine.publicPath = options.publicPath;
    Engine.lastTime = now() / 1000;
    Engine.activeSystems = new ActiveSystems();


    // Browser state set
    if (options.type !== EngineSystemPresets.SERVER && navigator && window) {
        const browser = detect();
        const os = detectOS(navigator.userAgent);

        // Add iOS and safari flag to window object -- To use it for creating an iOS compatible WebGLRenderer for example
        (window as any).iOS = os === 'iOS' || /iPad|iPhone|iPod/.test(navigator.platform) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        (window as any).safariWebBrowser = browser?.name === 'safari';

        Engine.isHMD = /Oculus/i.test(navigator.platform);  // TODO: more HMDs;
        Engine.xrSupported = await (navigator as any).xr?.isSessionSupported('immersive-vr');
    }


    // Config Engine based on passed type
    if (options.type === EngineSystemPresets.CLIENT) {
        await configureClient(options);
    } else if (options.type === EngineSystemPresets.EDITOR) {
        await configureEditor(options);
    } else if (options.type === EngineSystemPresets.SERVER) {
        await configureServer(options);
    }


    // Initialize all registered systems
    await Promise.all(Engine.systems.map(system => system.initialize()));


    // Set timer
    Engine.engineTimer = Timer({
        networkUpdate: (delta: number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Network),
        fixedUpdate: (delta: number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Fixed),
        update: (delta, elapsedTime) => execute(delta, elapsedTime, SystemUpdateType.Free)
    }, Engine.physicsFrameRate, Engine.networkFramerate);


    // Engine type specific post configuration work
    if (options.type === EngineSystemPresets.CLIENT) {
        EngineEvents.instance.once(EngineEvents.EVENTS.SCENE_LOADED, () => {
            Engine.engineTimer.start();
        });

        const engageType = isMobileOrTablet() ? 'touchstart' : 'click';
        const onUserEngage = () => {
            EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.USER_ENGAGE });
            document.removeEventListener(engageType, onUserEngage);
        };
        document.addEventListener(engageType, onUserEngage);

        EngineEvents.instance.once(ClientNetworkSystem.EVENTS.CONNECT, ({ id }) => {
            Network.instance.isInitialized = true;
            Network.instance.userId = id;
        });
    } else {
        Engine.engineTimer.start();
    }


    // Mark engine initialized
    Engine.isInitialized = true;
    EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.INITIALIZED_ENGINE });
};