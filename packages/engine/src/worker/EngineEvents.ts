import { EventDispatcher } from "../EventDispatcher";

export class EngineEvents extends EventDispatcher {
  static instance: EngineEvents;
  constructor() {
    super();
    EngineEvents.instance = this;
  }
}