/**
 * this class forces us to communicate with the engine with the same interface regardless if we are the server, on the main thread or across the worker thread
 * this will be the ONLY communication channel between the engine and the outside world
 * */

import { EventDispatcher } from 'three';
import { Network } from './networking/classes/Network';
import { applyNetworkStateToClient } from './networking/functions/applyNetworkStateToClient';
import { WorldStateModel } from './networking/schema/worldStateSchema';
import { loadScene } from './scene/functions/SceneLoading';

export class EngineProxy extends EventDispatcher {
  static instance: EngineProxy;
  constructor() {
    super();
    EngineProxy.instance = this;
  }
  loadScene(result) {
    loadScene(result);
  }
  transferNetworkBuffer(buffer, delta) {
    const unbufferedState = WorldStateModel.fromBuffer(buffer);
    if(!unbufferedState) console.warn("Couldn't deserialize buffer, probably still reading the wrong one")
    if(unbufferedState) applyNetworkStateToClient(unbufferedState, delta);
  }
  sendData(buffer) {
    Network.instance.transport.sendData(buffer);
  }
}