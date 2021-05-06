import _ from 'lodash';
import { BufferGeometry, Mesh, Scene } from 'three';
import { acceleratedRaycast, computeBoundsTree } from "three-mesh-bvh";
import { CharacterControllerSystem } from './templates/character/CharacterControllerSystem';
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
import { PhysXInstance } from "three-physx";
import { PhysicsSystem } from './physics/systems/PhysicsSystem';
import { ServerSpawnSystem } from './scene/systems/SpawnSystem';
import { StateSystem } from './state/systems/StateSystem';
import { GameManagerSystem } from './game/systems/GameManagerSystem';
import { TransformSystem } from './transform/systems/TransformSystem';
import Worker from 'web-worker'
import path from 'path';
// import { PositionalAudioSystem } from './audio/systems/PositionalAudioSystem';

Mesh.prototype.raycast = acceleratedRaycast;
BufferGeometry.prototype["computeBoundsTree"] = computeBoundsTree;

export const initializeServer = async (initOptions: any = DefaultInitializationOptions): Promise<void> => {
  const options = _.defaultsDeep({}, initOptions, DefaultInitializationOptions);

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

  const currentPath = path.dirname(__filename);

  await PhysXInstance.instance.initPhysX(new Worker(currentPath + "/physics/functions/loadPhysXNode.ts"), { });
  //for windows
  //await PhysXInstance.instance.initPhysX(new Worker("file:///" + currentPath + "/physics/functions/loadPhysXNode.ts"), {});
  registerSystem(PhysicsSystem);
  registerSystem(CharacterControllerSystem);

  registerSystem(ServerSpawnSystem, { priority: 899 });
  registerSystem(TransformSystem, { priority: 900 });
  registerSystem(GameManagerSystem);// { priority: 901 });

  Engine.engineTimer = Timer({
    networkUpdate: (delta: number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Network),
    fixedUpdate: (delta: number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Fixed),
    update: (delta, elapsedTime) => execute(delta, elapsedTime, SystemUpdateType.Free)
  }, Engine.physicsFrameRate, Engine.networkFramerate).start();

  Engine.isInitialized = true;
  console.log('initializeServer finished');
  console.log('Engine.isInitialized:', Engine.isInitialized);
}
