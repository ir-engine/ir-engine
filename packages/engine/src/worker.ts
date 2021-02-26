import { receiveWorker } from './worker/MessageQueue';
import { initializeEngineOffscreen } from './initializeOffscreen'
import { EngineMessageType, EngineProxy } from './EngineProxy'

const engineProxy = new EngineProxy();

receiveWorker((args: any) => {
  initializeEngineOffscreen(args)
}).then((proxy) => {
  proxy.addEventListener(EngineMessageType.ENGINE_CALL, (ev: CustomEvent) => {
    if(typeof engineProxy[ev.type] === 'function') {
      engineProxy[ev.type](ev.detail);
    }
  })
});
