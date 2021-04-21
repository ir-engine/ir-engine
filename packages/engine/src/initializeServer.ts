import _ from 'lodash';
import { BufferGeometry, Mesh, Scene } from 'three';
import { acceleratedRaycast, computeBoundsTree } from "three-mesh-bvh";
import { CharacterControllerSystem } from './character/CharacterControllerSystem';
import { Timer } from './common/functions/Timer';
import { DefaultInitializationOptions } from './DefaultInitializationOptions';
import { Engine } from './ecs/classes/Engine';
import { addIncomingEvents, addOutgoingEvents, EngineEvents } from './ecs/classes/EngineEvents';
import { execute, initialize } from "./ecs/functions/EngineFunctions";
import { registerSystem } from './ecs/functions/SystemFunctions';
import { SystemUpdateType } from "./ecs/functions/SystemUpdateType";
import { Network } from './networking/classes/Network';
import { MediaStreamSystem } from './networking/systems/MediaStreamSystem';
import { ServerNetworkIncomingSystem } from './networking/systems/ServerNetworkIncomingSystem';
import { ServerNetworkOutgoingSystem } from './networking/systems/ServerNetworkOutgoingSystem';
import { PhysXInstance } from './physics/physx';
import { PhysicsSystem } from './physics/systems/PhysicsSystem';
import { ServerSpawnSystem } from './scene/systems/SpawnSystem';
import { StateSystem } from './state/systems/StateSystem';
import { TransformSystem } from './transform/systems/TransformSystem';
import { Worker } from 'worker_threads'
import { wrapNodeWorker } from './common/functions/wrapNodeWorker';
// import { PositionalAudioSystem } from './audio/systems/PositionalAudioSystem';

Mesh.prototype.raycast = acceleratedRaycast;
BufferGeometry.prototype["computeBoundsTree"] = computeBoundsTree;

export const initializeServer = async (initOptions: any = DefaultInitializationOptions): Promise<void> => {
  const options = _.defaultsDeep({}, initOptions, DefaultInitializationOptions);

  EngineEvents.instance = new EngineEvents();
  Engine.scene = new Scene();
  Engine.publicPath = options.publicPath;
  Network.instance = new Network();

  addIncomingEvents()
  addOutgoingEvents()

  initialize();

  const networkSystemOptions = { schema: options.networking.schema, app: options.networking.app };
  registerSystem(ServerNetworkIncomingSystem, { ...networkSystemOptions, priority: -1 });
  registerSystem(ServerNetworkOutgoingSystem, { ...networkSystemOptions, priority: 10000 });
  registerSystem(MediaStreamSystem);
  registerSystem(StateSystem);
  registerSystem(CharacterControllerSystem);
  registerSystem(PhysicsSystem);

  await PhysXInstance.instance.initPhysX(wrapNodeWorker(new Worker('./physics/physx/worker.js')), { jsPath: '/physx/physx.release.js', wasmPath: '/physx/physx.release.wasm' });

  registerSystem(ServerSpawnSystem, { priority: 899 });
  registerSystem(TransformSystem, { priority: 900 });

  Engine.engineTimerTimeout = setTimeout(() => {
    Engine.engineTimer = Timer(
      {
        networkUpdate: (delta: number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Network),
        fixedUpdate: (delta: number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Fixed),
        update: (delta, elapsedTime) => execute(delta, elapsedTime, SystemUpdateType.Free)
      }, Engine.physicsFrameRate, Engine.networkFramerate).start();
  }, 1000);
}
