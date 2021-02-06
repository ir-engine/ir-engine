import { Component } from './Component';
import { Entity } from './Entity';
/**
 * This class provides methods to manage events dispatches.
 */
export declare class EventDispatcher {
    /** Map to store listeners by event names. */
    _listeners: {};
    /** Keeps count of fired and handled events. */
    stats: {
        fired: number;
        handled: number;
    };
    constructor();
    /** Resets the Dispatcher */
    reset(): void;
    /**
     * Adds an event listener.
     * @param eventName Name of the event to listen.
     * @param listener Callback to trigger when the event is fired.
     */
    addEventListener(eventName: string | number, listener: Function): void;
    /**
     * Checks if an event listener is already added to the list of listeners.
     * @param eventName Name of the event to check.
     * @param listener Callback for the specified event.
     */
    hasEventListener(eventName: string | number, listener: Function): boolean;
    /**
     * Removes an event listener.
     * @param eventName Name of the event to remove.
     * @param listener Callback for the specified event.
     */
    removeEventListener(eventName: string | number, listener: Function): void;
    /**
     * Dispatches an event with given Entity and Component and increases fired event's count.
     * @param eventName Name of the event to dispatch.
     * @param entity Entity to emit.
     * @param component Component to emit.
     */
    dispatchEvent(eventName: string | number, entity: Entity, component?: Component<any>): void;
    /**
     * Reset stats counters.
     */
    resetCounters(): void;
}
