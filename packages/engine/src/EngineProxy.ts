/**
 * this class forces us to communicate with the engine with the same interface regardless if we are the server, on the main thread or across the worker thread
 * this will be the ONLY communication channel between the engine and the outside world
 * */

 import { loadScene } from './scene/functions/SceneLoading';

export class EngineProxy {
  constructor() {
    
  }

  loadScene(result) {
    loadScene(result);
  }
}

export enum EngineMessageType {
  ENGINE_CALL = "ENGINE_CALL",

} 