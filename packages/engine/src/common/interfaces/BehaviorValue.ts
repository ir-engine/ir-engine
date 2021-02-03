import { Behavior } from './Behavior';

/** Interface for Value of Behavior. */
export interface BehaviorValue {
  /** Type of Behavior. */
  behavior: Behavior;
  /** Whether Behavior is Networked or not. */
  networked?: boolean;
  /** Args of Behavior. */
  args?: any;
}
