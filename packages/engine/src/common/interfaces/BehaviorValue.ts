import { Behavior } from './Behavior';

export interface BehaviorValue {
  behavior: Behavior;
  networked?: boolean;
  args?: any;
}
