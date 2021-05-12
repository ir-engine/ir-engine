import _ from 'lodash';
import { BufferGeometry, Mesh, Scene } from 'three';
import { acceleratedRaycast, computeBoundsTree } from "three-mesh-bvh";
import { CharacterControllerSystem } from '@xrengine/engine/src/character/CharacterControllerSystem';
import { Timer } from '@xrengine/engine/src/common/functions/Timer';
import { DefaultInitializationOptions, InitializeOptions } from '@xrengine/engine/src/DefaultInitializationOptions';
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine';
import { execute } from "@xrengine/engine/src/ecs/functions/EngineFunctions";
import { registerSystem } from '@xrengine/engine/src/ecs/functions/SystemFunctions';
import { SystemUpdateType } from "@xrengine/engine/src/ecs/functions/SystemUpdateType";
import { Network } from '@xrengine/engine/src/networking/classes/Network';
import { MediaStreamSystem } from '@xrengine/engine/src/networking/systems/MediaStreamSystem';
import { ServerNetworkIncomingSystem } from '@xrengine/engine/src/networking/systems/ServerNetworkIncomingSystem';
import { ServerNetworkOutgoingSystem } from '@xrengine/engine/src/networking/systems/ServerNetworkOutgoingSystem';
import { PhysXInstance } from "three-physx";
import { PhysicsSystem } from '@xrengine/engine/src/physics/systems/PhysicsSystem';
import { ServerSpawnSystem } from '@xrengine/engine/src/scene/systems/ServerSpawnSystem';
import { StateSystem } from '@xrengine/engine/src/state/systems/StateSystem';
import { GameManagerSystem } from '@xrengine/engine/src/game/systems/GameManagerSystem';
import { TransformSystem } from '@xrengine/engine/src/transform/systems/TransformSystem';
import Worker from 'web-worker';
import path from 'path';
import { now } from '@xrengine/engine/src/common/functions/now';
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents';
import { loadScene } from '@xrengine/engine/src/scene/functions/SceneLoading';
import { AnimationManager } from '@xrengine/engine/src/character/AnimationManager';
// import { PositionalAudioSystem } from './audio/systems/PositionalAudioSystem';

const isWindows = process.platform === "win32";

Mesh.prototype.raycast = acceleratedRaycast;
BufferGeometry.prototype["computeBoundsTree"] = computeBoundsTree;

export const initializeEngineServer = async (initOptions: InitializeOptions = DefaultInitializationOptions): Promise<void> => {
  const options = _.defaultsDeep({}, initOptions, DefaultInitializationOptions);

  Engine.scene = new Scene();
  Engine.publicPath = options.publicPath;
  Network.instance = new Network();

  EngineEvents.instance.once(EngineEvents.EVENTS.LOAD_SCENE, ({ sceneData }) => { loadScene(sceneData); });
  EngineEvents.instance.once(EngineEvents.EVENTS.JOINED_WORLD, () => {
    EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.ENABLE_SCENE, enable: true });
  });

  Engine.lastTime = now() / 1000;

  const networkSystemOptions = { schema: options.networking.schema, app: options.networking.app };
  registerSystem(ServerNetworkIncomingSystem, { ...networkSystemOptions, priority: -1 });
  registerSystem(ServerNetworkOutgoingSystem, { ...networkSystemOptions, priority: 10000 });
  registerSystem(MediaStreamSystem);
  registerSystem(StateSystem);

  new AnimationManager();

  const currentPath = (isWindows ? 'file:///' : '') + path.dirname(__filename);

  const worker = new Worker(currentPath + "/physics/functions/loadPhysXNode.ts");
  Engine.workers.push(worker);
  await Promise.all([
    // AnimationManager.instance.getDefaultModel(),
    // AnimationManager.instance.getAnimations(),
    PhysXInstance.instance.initPhysX(worker, { })
  ]);

  registerSystem(PhysicsSystem);
  registerSystem(CharacterControllerSystem);

  registerSystem(ServerSpawnSystem, { priority: 899 });
  registerSystem(TransformSystem, { priority: 900 });
  registerSystem(GameManagerSystem);// { priority: 901 });

  await Promise.all(Engine.systems.map((system) => { 
    return new Promise<void>(async (resolve) => { await system.initialize(); system.initialized = true; resolve(); }); 
  }));

  Engine.engineTimer = Timer({
    networkUpdate: (delta: number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Network),
    fixedUpdate: (delta: number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Fixed),
    update: (delta, elapsedTime) => execute(delta, elapsedTime, SystemUpdateType.Free)
  }, Engine.physicsFrameRate, Engine.networkFramerate).start();

  Engine.isInitialized = true;
};
