import { BehaviorValue } from "./BehaviorValue";

export interface DomEventBehaviorValue extends BehaviorValue {
  selector?: string;
  passive?: boolean;
  element?: 'viewport'|'document'|'window';
}
