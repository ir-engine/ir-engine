import _ from 'lodash';
import { CharacterInputSchema } from './templates/character/CharacterInputSchema';
import { CharacterStateSchema } from './templates/character/CharacterStateSchema';
import { DefaultNetworkSchema } from './templates/networking/DefaultNetworkSchema';
import { createWorker, WorkerProxy } from './worker/MessageQueue';
import { createCanvas } from './renderer/functions/createCanvas';
import { Engine } from './ecs/classes/Engine';
import { EngineProxy, EngineMessageType } from './EngineProxy';

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
  }

  loadScene(result) {
    this.workerProxy.sendEvent(EngineMessageType.ENGINE_CALL, result);
  }
  
  transferNetworkBuffer(buffer, delta) {
    this.workerProxy.sendEvent(EngineMessageType.ENGINE_CALL, { type: 'transferNetworkBuffer', detail: [buffer, delta] }, [buffer]);
  }
}

export async function initializeWorker(initOptions: any = DefaultInitializationOptions): Promise<void> {
    const options = _.defaultsDeep({}, initOptions, DefaultInitializationOptions);
    const workerProxy: WorkerProxy = await createWorker(
      new Worker(new URL('./entry.worker.ts', import.meta.url)),//, { type: 'module' }),
      (options.renderer.canvas || createCanvas()),
      {
        env: { 
          ...process?.env,
          useWebXR: !isSafari
        }
      }
    );
    EngineProxy.instance = new WorkerEngineProxy(workerProxy);
}
