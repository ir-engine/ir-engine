import _ from 'lodash';
import { CharacterInputSchema } from './templates/character/CharacterInputSchema';
import { CharacterStateSchema } from './templates/character/CharacterStateSchema';
import { DefaultNetworkSchema } from './templates/networking/DefaultNetworkSchema';
import { createWorker, OFFSCREEN_XR_EVENTS, WorkerProxy } from './worker/MessageQueue';
import { createCanvas } from './renderer/functions/createCanvas';
import { ClientNetworkSystem } from './networking/systems/ClientNetworkSystem';
import { MediaStreamSystem } from './networking/systems/MediaStreamSystem';
import { registerSystem } from './ecs/functions/SystemFunctions';
import { Engine } from './ecs/classes/Engine';
import { Timer } from './common/functions/Timer';
import { execute, initialize } from "./ecs/functions/EngineFunctions";
import { SystemUpdateType } from './ecs/functions/SystemUpdateType';
import { EngineEvents } from './ecs/classes/EngineEvents';
import { EngineEventsProxy, addOutgoingEvents } from './ecs/classes/EngineEvents';
import { Network } from './networking/classes/Network';
import { ClientInputSystem } from './input/systems/ClientInputSystem';
import { WebXROffscreenRendererSystem } from './renderer/WebXROffscreenRendererSystem';

const webXRShouldBeAvailable = typeof navigator === 'undefined' || /Version\/[\d\.]+.*Safari/.test(window.navigator.userAgent);

export const DefaultInitializationOptions = {
  input: {
    schema: CharacterInputSchema,
    useWebXR: webXRShouldBeAvailable,
  },
  networking: {
    schema: DefaultNetworkSchema
  },
  state: {
    schema: CharacterStateSchema
  },
};

export async function initializeWorker(initOptions: any = DefaultInitializationOptions): Promise<void> {
  const options = _.defaultsDeep({}, initOptions, DefaultInitializationOptions);

  const workerProxy: WorkerProxy = await createWorker(
    // @ts-ignore
    new Worker(new URL('./worker/workerEntry.ts', import.meta.url)),
    (options.renderer.canvas || createCanvas()),
    {
      useWebXR: webXRShouldBeAvailable,
      // initOptions
    }
  );
  EngineEvents.instance = new EngineEventsProxy(workerProxy);
  Engine.viewportElement = options.renderer.canvas;

  addOutgoingEvents();

  initialize();

  const networkSystemOptions = { schema: options.networking.schema, app: options.networking.app };
  registerSystem(ClientNetworkSystem, { ...networkSystemOptions, priority: -1 });
  registerSystem(MediaStreamSystem);
  registerSystem(ClientInputSystem, { useWebXR: DefaultInitializationOptions.input.useWebXR });
  registerSystem(WebXROffscreenRendererSystem);
  Engine.engineTimer = Timer({
    networkUpdate: (delta:number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Network),
    fixedUpdate: (delta:number, elapsedTime: number) => execute(delta, elapsedTime, SystemUpdateType.Fixed),
    update: (delta, elapsedTime) => execute(delta, elapsedTime, SystemUpdateType.Free)
  }, Engine.physicsFrameRate, Engine.networkFramerate).start();

  const onNetworkConnect = (ev: any) => {
    EngineEvents.instance.dispatchEvent({ type: ClientNetworkSystem.EVENTS.INITIALIZE, userId: Network.instance.userId });
    EngineEvents.instance.removeEventListener(EngineEvents.EVENTS.CONNECT_TO_WORLD, onNetworkConnect);
  }
  EngineEvents.instance.addEventListener(EngineEvents.EVENTS.CONNECT_TO_WORLD, onNetworkConnect);
}