import { Component } from './Component';
import { Entity } from './Entity';

/**
 * @private
 * @class EventDispatcher
 */
export class EventDispatcher {
  _listeners: {}
  stats: { fired: number, handled: number }
  constructor () {
    this._listeners = {};
    this.stats = {
      fired: 0,
      handled: 0
    };
  }

  public reset(): void {
    Object.keys(this._listeners).forEach(key => {
      delete this._listeners[key];
    });
    this.resetCounters();
  }

  /**
   * Add an event listener
   * @param {String} eventName Name of the event to listen
   * @param {Function} listener Callback to trigger when the event is fired
   */
  addEventListener (eventName: string | number, listener: any): void {
    const listeners = this._listeners;
    if (listeners[eventName] === undefined) {
      listeners[eventName] = [];
    }

    if (listeners[eventName].indexOf(listener) === -1) {
      listeners[eventName].push(listener);
    }
  }

  /**
   * Check if an event listener is already added to the list of listeners
   * @param {String} eventName Name of the event to check
   * @param {Function} listener Callback for the specified event
   */
  hasEventListener (eventName: string | number, listener: any): boolean {
    return this._listeners[eventName] !== undefined && this._listeners[eventName].indexOf(listener) !== -1;
  }

  /**
   * Remove an event listener
   * @param {String} eventName Name of the event to remove
   * @param {Function} listener Callback for the specified event
   */
  removeEventListener (eventName: string | number, listener: any): void {
    const listenerArray = this._listeners[eventName];
    if (listenerArray !== undefined) {
      const index = listenerArray.indexOf(listener);
      if (index !== -1) {
        listenerArray.splice(index, 1);
      }
    }
  }

  /**
   * Dispatch an event
   * @param {String} eventName Name of the event to dispatch
   * @param {Entity} entity (Optional) Entity to emit
   * @param {Component} component
   */
  dispatchEvent (eventName: string | number, entity: Entity, component?: Component<any>): void {
    this.stats.fired++;

    const listenerArray = this._listeners[eventName];
    if (listenerArray !== undefined) {
      const array = listenerArray.slice(0);

      for (let i = 0; i < array.length; i++) {
        array[i].call(this, entity, component);
      }
    }
  }

  /**
   * Reset stats counters
   */
  resetCounters (): void {
    this.stats.fired = this.stats.handled = 0;
  }
}
