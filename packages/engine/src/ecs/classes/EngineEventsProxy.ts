import { EngineEvents } from "./EngineEvents";
import { MessageQueue } from "../../worker/MessageQueue";

// This is a bi-directional event dispatcher across MessageQueue events 

const ENGINE_EVENTS_PROXY = {
  EVENT: 'ENGINE_EVENTS_PROXY_EVENT',
  EVENT_ADD: 'ENGINE_EVENTS_PROXY_EVENT_ADD',
  EVENT_REMOVE: 'ENGINE_EVENTS_PROXY_EVENT_REMOVE',
};

export class EngineEventsProxy extends EngineEvents {
  messageQueue: MessageQueue;
  constructor(messageQueue: MessageQueue) {
    super();
    this.messageQueue = messageQueue;
    const listener = (event: any) => {
      this.messageQueue.sendEvent(ENGINE_EVENTS_PROXY.EVENT, { event })
    };
    this.messageQueue.addEventListener(ENGINE_EVENTS_PROXY.EVENT_ADD, (ev: any) => {
      const { type } = ev.detail;
      this.addEventListener(type, listener, true)
    });
    this.messageQueue.addEventListener(ENGINE_EVENTS_PROXY.EVENT_REMOVE, (ev: any) => {
      const { type } = ev.detail;
      this.removeEventListener(type, listener, true)
    });
    this.messageQueue.addEventListener(ENGINE_EVENTS_PROXY.EVENT, (ev: any) => {
      const { event } = ev.detail;
      this.dispatchEvent(event, true);
    });
  }

  addEventListener(type: string, listener: any, fromSelf?: boolean) {
    if(!fromSelf) {
      this.messageQueue.sendEvent(ENGINE_EVENTS_PROXY.EVENT_ADD, { type });
    }
    super.addEventListener(type, listener)
  }
  
  removeEventListener(type: string, listener: any, fromSelf?: boolean) {
    if(!fromSelf) {
      this.messageQueue.sendEvent(ENGINE_EVENTS_PROXY.EVENT_REMOVE, { type });
    }
    super.removeEventListener(type, listener)
  }
  
  dispatchEvent (event: any, fromSelf?: boolean, transferable?: Transferable[]) {
    if(!fromSelf) {
      this.messageQueue.sendEvent(ENGINE_EVENTS_PROXY.EVENT, { event }, transferable);
    }
    super.dispatchEvent(event);
  }
}