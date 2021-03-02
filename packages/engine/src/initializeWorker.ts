import _ from 'lodash';
import { CharacterInputSchema } from './templates/character/CharacterInputSchema';
import { CharacterStateSchema } from './templates/character/CharacterStateSchema';
import { DefaultNetworkSchema } from './templates/networking/DefaultNetworkSchema';
import { createWorker, MessageType, WorkerProxy, Message } from './worker/MessageQueue';
import { createCanvas } from './renderer/functions/createCanvas';
import { EngineProxy } from './EngineProxy';
import { ClientNetworkSystem } from './networking/systems/ClientNetworkSystem';
import { MediaStreamSystem } from './networking/systems/MediaStreamSystem';
import { registerSystem } from './ecs/functions/SystemFunctions';
import { Engine } from './ecs/classes/Engine';
import { Timer } from './common/functions/Timer';
import { execute, initialize } from "./ecs/functions/EngineFunctions";
import { SystemUpdateType } from './ecs/functions/SystemUpdateType';
import { EngineEvents } from './worker/EngineEvents';
import { EngineEventsProxy } from './worker/EngineEventsProxy';
import { Network } from './networking/classes/Network';

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
  },
};

class WorkerEngineProxy extends EngineProxy {
  workerProxy: WorkerProxy;
  constructor(workerProxy: WorkerProxy) {
    super();
    this.workerProxy = workerProxy;
    this.workerProxy.addEventListener('sendData', (ev: any) => { this.sendData(ev.detail.buffer) })
  }
  transferNetworkBuffer(buffer, delta) { this.workerProxy.sendEvent('transferNetworkBuffer', { buffer, delta }, [buffer]); }
  setActorAvatar(entityID, avatarID) { 
    this.workerProxy.sendEvent('setActorAvatar', { entityID, avatarID });
  }
}

export async function initializeWorker(initOptions: any = DefaultInitializationOptions): Promise<void> {
  const options = _.defaultsDeep({}, initOptions, DefaultInitializationOptions);

  const workerProxy: WorkerProxy = await createWorker(
    // @ts-ignore
    new Worker(new URL('./entry.worker.ts', import.meta.url)),
    (options.renderer.canvas || createCanvas()),
    {
      env: {
        ...process?.env,
      },
      useWebXR: !isSafari
    }
  );
  EngineEvents.instance = new EngineEventsProxy(workerProxy);
  EngineProxy.instance = new WorkerEngineProxy(workerProxy);
  initialize()

  const networkSystemOptions = { schema: options.networking.schema, app: options.networking.app };
  registerSystem(ClientNetworkSystem, { ...networkSystemOptions, priority: -1 });
  registerSystem(MediaStreamSystem);
  // registerSystem(InputSystem, { useWebXR: DefaultInitializationOptions.input.useWebXR });
  Engine.engineTimer = Timer({
    networkUpdate: (delta:number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Network),
    fixedUpdate: (delta:number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Fixed),
    update: (delta, elapsedTime) => execute(delta, elapsedTime, SystemUpdateType.Free)
  }, Engine.physicsFrameRate, Engine.networkFramerate).start();

  // return await new Promise((resolve) => {
  const onNetworkConnect = (ev: any) => {
    EngineEvents.instance.dispatchEvent({ type: ClientNetworkSystem.EVENTS.INITIALIZE, userId: Network.instance.userId });
    window.removeEventListener('connectToWorld', onNetworkConnect)
  //     resolve()
    }
  window.addEventListener('connectToWorld', onNetworkConnect)
  // })
}