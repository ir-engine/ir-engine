import { System } from "../ecs/classes/System";
import { WebGLRendererSystem } from "../renderer/WebGLRendererSystem";
import { MessageQueue } from './MessageQueue';


// this can exist isomorphically on either side of the worker context

export class SystemProxy extends System {
  static instance;
  systemLabel: string;  
  constructor(systemLabel: string) {
    super()
    this.systemLabel = systemLabel;
  }
}