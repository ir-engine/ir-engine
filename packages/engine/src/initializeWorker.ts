import _ from 'lodash';
import { CharacterInputSchema } from './templates/character/CharacterInputSchema';
import { CharacterStateSchema } from './templates/character/CharacterStateSchema';
import { DefaultNetworkSchema } from './templates/networking/DefaultNetworkSchema';
import { createWorker, WorkerProxy } from './worker/MessageQueue';
import { createCanvas } from './renderer/functions/createCanvas';
import { EngineMessageType, EngineProxy } from './EngineProxy'

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

class WorkerEngineProxy {
  workerProxy: WorkerProxy;
  constructor(workerProxy: WorkerProxy) {
    this.workerProxy = workerProxy;
  }

  loadScene(result) {
    this.workerProxy.sendEvent(EngineMessageType.ENGINE_CALL, result);
  }
}

export async function initializeWorker(initOptions: any = DefaultInitializationOptions): Promise<WorkerEngineProxy> {
  return await new Promise((resolve) => {
    const options = _.defaultsDeep({}, initOptions, DefaultInitializationOptions);
    createWorker(
      new URL('./worker.ts', import.meta.url),
      (options.renderer.canvas || createCanvas()),
      {}
    ).then((workerProxy: WorkerProxy) => {
      const workerEngineProxy = new WorkerEngineProxy(workerProxy);
      (window as any).EngineProxy = workerEngineProxy;
      resolve(workerEngineProxy);
    })
  })
}
