import { Component } from "./Component";
import { Entity } from "./Entity";
/**
 * @private
 * @class EventDispatcher
 */
export declare class EventDispatcher {
    _listeners: {};
    stats: {
        fired: number;
        handled: number;
    };
    constructor();
    /**
     * Add an event listener
     * @param {String} eventName Name of the event to listen
     * @param {Function} listener Callback to trigger when the event is fired
     */
    addEventListener(eventName: string | number, listener: any): void;
    /**
     * Check if an event listener is already added to the list of listeners
     * @param {String} eventName Name of the event to check
     * @param {Function} listener Callback for the specified event
     */
    hasEventListener(eventName: string | number, listener: any): boolean;
    /**
     * Remove an event listener
     * @param {String} eventName Name of the event to remove
     * @param {Function} listener Callback for the specified event
     */
    removeEventListener(eventName: string | number, listener: any): void;
    /**
     * Dispatch an event
     * @param {String} eventName Name of the event to dispatch
     * @param {Entity} entity (Optional) Entity to emit
     * @param {Component} component
     */
    dispatchEvent(eventName: string | number, entity: Entity, component?: Component<any>): void;
    /**
     * Reset stats counters
     */
    resetCounters(): void;
}
