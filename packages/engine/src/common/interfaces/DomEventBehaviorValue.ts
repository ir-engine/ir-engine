import { BehaviorValue } from "./BehaviorValue";

export interface DomEventBehaviorValue extends BehaviorValue {
  selector?: string;
  element?: 'viewport'|'document'|'window';
}
