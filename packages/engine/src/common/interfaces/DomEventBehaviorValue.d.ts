import { BehaviorValue } from "./BehaviorValue";
/**
 * Interface for DOM Event Behavior.
 */
export interface DomEventBehaviorValue extends BehaviorValue {
    /** Selector string for the DOM element. */
    selector?: string;
    /** Is the Event listener passive. */
    passive?: boolean;
    /** Container element in which behavior will be captured. */
    element?: 'viewport' | 'document' | 'window';
}
