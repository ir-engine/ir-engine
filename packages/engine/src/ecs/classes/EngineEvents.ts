import { EventDispatcher } from "../../common/classes/EventDispatcher";

export class EngineEvents extends EventDispatcher {
  static instance: EngineEvents;
  constructor() {
    super();
    EngineEvents.instance = this;
  }
}