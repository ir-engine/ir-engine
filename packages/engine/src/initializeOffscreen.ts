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
import { EngineProxy } from './EngineProxy';
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
import { MessageType, Message, MainProxy, MessageQueue } from './worker/MessageQueue';
import { InputSystem } from './input/systems/ClientInputSystem';
import { SystemProxy, SYSTEM_PROXY } from './worker/SystemProxy';

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

class MainEngineProxy extends EngineProxy {
  mainProxy: MainProxy
  constructor(mainProxy: MainProxy) {
    super()
    this.mainProxy = mainProxy;
    const initializeNetworkEvent = (ev: any) => {
      const { userId, userNetworkId } = ev.detail;
      Network.instance.userId = userId;
      Network.instance.userNetworkId = userNetworkId;
      console.log('NETWORK_INITIALIZE_EVENT', Network.instance, ev)
      this.mainProxy.removeEventListener('NETWORK_INITIALIZE_EVENT', initializeNetworkEvent)
    }
    this.mainProxy.addEventListener('NETWORK_INITIALIZE_EVENT', initializeNetworkEvent)
    const connectNetworkEvent = (ev: any) => {
      // const { } = ev.detail;
      Network.instance.isInitialized = true;
      console.log(Network.instance)
      this.mainProxy.removeEventListener('NETWORK_CONNECT_EVENT', connectNetworkEvent)
    }
    this.mainProxy.addEventListener('NETWORK_CONNECT_EVENT', connectNetworkEvent)
    const loadScene = (ev: any) => { 
      this.loadScene(ev.detail.result)
      this.mainProxy.removeEventListener('loadScene', loadScene)
    }
    this.mainProxy.addEventListener('loadScene', loadScene)
    this.mainProxy.addEventListener('transferNetworkBuffer', (ev: any) => { 
      const { buffer, delta } = ev.detail;
      this.transferNetworkBuffer(buffer, delta)
    })
    this.mainProxy.addEventListener('setActorAvatar', (ev: any) => { 
      const { entityID, avatarID } = ev.detail;
      this.setActorAvatar(entityID, avatarID)
    })

    this.mainProxy.addEventListener(SYSTEM_PROXY.EVENT_ADD, (ev: any) => {
      const { type, system } = ev.detail;
      const systemType = SystemProxy._getSystem(system)
      const listener = (event: any) => {
        this.mainProxy.sendEvent(SYSTEM_PROXY.EVENT, { event, system })
      };
      // @ts-ignore
      if(!systemType.instance.proxyListener) {
        // @ts-ignore
        systemType.instance.proxyListener = listener;
      }
      systemType.instance.addEventListener(type, listener)
    });
    this.mainProxy.addEventListener(SYSTEM_PROXY.EVENT_REMOVE, (ev: any) => {
      const { type, system } = ev.detail;
      const systemType = SystemProxy._getSystem(system)
      // @ts-ignore
      systemType.instance.removeEventListener(type, systemType.instance.proxyListener)
    });
    this.mainProxy.addEventListener(SYSTEM_PROXY.EVENT, (ev: any) => {
      ev.preventDefault = () => {};
      ev.stopPropagation = () => {};
      delete ev.target;
      const { event, system } = ev.detail;
      const systemType = SystemProxy._getSystem(system)
      // @ts-ignore
      systemType.instance.dispatchEvent(event, true);
    });
  }
  sendData(buffer) { this.mainProxy.sendEvent('sendData', { buffer }, [buffer]) }
}


export function initializeEngineOffscreen({ canvas, initOptions, env, useWebXR }, proxy: MainProxy): void {
  const options = _.defaultsDeep({}, initOptions, DefaultInitializationOptions);

  EngineProxy.instance = new MainEngineProxy(proxy);
  initialize();
  Engine.scene = new Scene();

  new Network();

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

  // Start our timer!
  Engine.engineTimerTimeout = setTimeout(() => {
    Engine.engineTimer = Timer(
      {
        networkUpdate: (delta:number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Network),
        fixedUpdate: (delta:number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Fixed),
        update: (delta, elapsedTime) => execute(delta, elapsedTime, SystemUpdateType.Free)
      }, Engine.physicsFrameRate, Engine.networkFramerate).start();
  }, 1000);
}
