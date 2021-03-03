import _ from 'lodash';
import { AudioListener, BufferGeometry, Mesh, PerspectiveCamera, Scene } from 'three';
import { acceleratedRaycast, computeBoundsTree } from "three-mesh-bvh";
import AssetLoadingSystem from './assets/systems/AssetLoadingSystem';
import { CameraSystem } from './camera/systems/CameraSystem';
import { Timer } from './common/functions/Timer';
import { DebugHelpersSystem } from './debug/systems/DebugHelpersSystem';
import { Engine } from './ecs/classes/Engine';
import { execute, initialize } from "./ecs/functions/EngineFunctions";
import { registerSystem } from './ecs/functions/SystemFunctions';
import { SystemUpdateType } from "./ecs/functions/SystemUpdateType";
import { InteractiveSystem } from "./interaction/systems/InteractiveSystem";
import { Network } from './networking/classes/Network';
import { ClientNetworkSystem } from './networking/systems/ClientNetworkSystem';
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
import { MainProxy } from './worker/MessageQueue';
import { InputSystem } from './input/systems/ClientInputSystem';
import { EngineEvents } from './ecs/classes/EngineEvents';
import { EngineEventsProxy, addIncomingEvents } from './ecs/classes/EngineEvents';

Mesh.prototype.raycast = acceleratedRaycast;
BufferGeometry.prototype["computeBoundsTree"] = computeBoundsTree;

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

export function initializeEngineOffscreen({ canvas, initOptions, env, useWebXR }, proxy: MainProxy): void {
  const options = _.defaultsDeep({}, initOptions, DefaultInitializationOptions);

  EngineEvents.instance = new EngineEventsProxy(proxy);
  addIncomingEvents();
  
  initialize();
  Engine.scene = new Scene();

  Network.instance.schema = options.networking.schema;
  // @ts-ignore
  Network.instance.transport = { isServer: false }

  // Do we want audio and video streams?
  // registerSystem(MediaStreamSystemProxy);

  registerSystem(AssetLoadingSystem);

  registerSystem(PhysicsSystem);

  registerSystem(InputSystem, { useWebXR });

  registerSystem(StateSystem);

  registerSystem(ServerSpawnSystem, { priority: 899 });

  registerSystem(TransformSystem, { priority: 900 });

  Engine.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.3, 750);
  Engine.scene.add(Engine.camera);

//  const listener = new AudioListener();
//  camera.add( listener);

//  Engine.audioListener = listener;

  registerSystem(HighlightSystem);
//  registerSystem(PositionalAudioSystem);
  registerSystem(InteractiveSystem);
  registerSystem(ParticleSystem);
  if (env.NODE_ENV === 'development') {
    registerSystem(DebugHelpersSystem);
  }
  registerSystem(CameraSystem);
  registerSystem(WebGLRendererSystem, { priority: 1001, canvas });
  Engine.viewportElement = Engine.renderer.domElement;

  Engine.engineTimer = Timer({
    networkUpdate: (delta:number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Network),
    fixedUpdate: (delta:number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Fixed),
    update: (delta, elapsedTime) => execute(delta, elapsedTime, SystemUpdateType.Free)
  }, Engine.physicsFrameRate, Engine.networkFramerate).start();


  const connectNetworkEvent = (ev: any) => {
    Network.instance.isInitialized = true;
    EngineEvents.instance.removeEventListener(ClientNetworkSystem.EVENTS.CONNECT, connectNetworkEvent)
  }
  EngineEvents.instance.addEventListener(ClientNetworkSystem.EVENTS.CONNECT, connectNetworkEvent)

  const initializeNetworkEvent = (ev: any) => {
    Network.instance.userId = ev.userId;
    EngineEvents.instance.removeEventListener(ClientNetworkSystem.EVENTS.INITIALIZE, initializeNetworkEvent)
  }
  EngineEvents.instance.addEventListener(ClientNetworkSystem.EVENTS.INITIALIZE, initializeNetworkEvent)

}