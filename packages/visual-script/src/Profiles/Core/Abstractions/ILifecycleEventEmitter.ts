import { EventEmitter } from '../../../VisualScriptModule'

export interface ILifecycleEventEmitter {
  startEvent: EventEmitter<void>
  endEvent: EventEmitter<void>
  tickEvent: EventEmitter<void>
}
