import { EventDispatcher } from 'three'

export enum MessageType {
  ADD_EVENT,
  REMOVE_EVENT,
  EVENT,
}

export interface Message {
  messageType: MessageType | string;
  message: object;
  transferables?: Transferable[];
}

export class EventDispatcherProxy {
  //extends ExtendableProxy {
  [x: string]: any;
  eventTarget: EventDispatcher = new EventDispatcher();
  eventListener: any;
  messageTypeFunctions: Map<MessageType | string, any>;
  _listeners: any;

  constructor() {
    this._listeners = {};
    this.eventListener = (args: any) => {
      this.queue.push({
        messageType: MessageType.EVENT,
        message: simplifyObject(args),
      } as Message);
    };
    this.messageTypeFunctions = new Map<MessageType | string, any>();

    this.messageTypeFunctions.set(MessageType.EVENT, (event: any) => {
      event.preventDefault = () => {};
      event.stopPropagation = () => {};
      delete event.target;
      this.dispatchEvent(event, true);
    });
    this.messageTypeFunctions.set(MessageType.ADD_EVENT, ({ type }: { type: string }) => {
      this.eventTarget.addEventListener(type, this.eventListener);
    });
    this.messageTypeFunctions.set(MessageType.REMOVE_EVENT, ({ type }: { type: string }) => {
      this.eventTarget.removeEventListener(type, this.eventListener);
    });
  }

  addEventListener(type: string, listener: any) {
    if (this._listeners[type] === undefined) {
      this._listeners[type] = [];
    }
    if (this._listeners[type].indexOf(listener) === -1) {
      this._listeners[type].push(listener);
    }
  }

  hasEventListener(type: string, listener: any) {
    return this._listeners[type] !== undefined && this._listeners[type].indexOf(listener) !== -1;
  }

  removeEventListener(type: string, listener: any) {
    const listenerArray = this._listeners[type];
    if (listenerArray !== undefined) {
      const index = listenerArray.indexOf(listener);
      if (index !== -1) {
        listenerArray.splice(index, 1);
      }
    }
  }

  dispatchEvent(event: any, fromSelf?: boolean) {
    const listenerArray = this._listeners[event.type];
    if (listenerArray !== undefined) {
      event.target = this;
      const array = listenerArray.slice(0);
      for (let i = 0, l = array.length; i < l; i++) {
        array[i].call(this, event);
      }
    }
  }
}

export class MessageQueue extends EventDispatcherProxy {
  messagePort: any;
  queue: Message[];
  interval: any;
  eventTarget: EventDispatcher = new EventDispatcher();
  toTransfer: Transferable[] = [];

  constructor(messagePort: any) {
    super();
    this.messagePort = messagePort;
    this.queue = [];

    this.messagePort.onmessage = this.receiveQueue.bind(this);
    //   message.data as object[]);
    // };
    this.interval = setInterval(() => {
      this.sendQueue();
    }, 1000 / 120);
  }
  sendEvent(type: string, detail: any, transferables: Transferable[] = []) {
    this.queue.push({
      messageType: MessageType.EVENT,
      message: {
        type,
        detail,
      },
      transferables,
    } as Message);
  }
  sendQueue() {
    if (!this.queue?.length) return;
    const messages: object[] = [];
    const transferables: Transferable[] = [];
    this.queue.forEach((message: Message) => {
      messages.push({
        messageType: message.messageType,
        message: message.message,
      });
      transferables.push(...message.transferables);
    });
    try {
      this.messagePort.postMessage(messages, transferables);
    } catch (e) {
      console.log(e, messages, this, globalThis);
    }
    this.queue = [];
  }

  receiveQueue(message) {
    message.data.forEach((element: Message) => {
      const { messageType, message } = element;
      if (this.messageTypeFunctions.has(messageType)) {
        this.messageTypeFunctions.get(messageType)(message);
      }
    });
  }

  addEventListener(type: string, listener: (event: any) => void): void {
    this.queue.push({
      messageType: MessageType.ADD_EVENT,
      message: { type },
      transferables: [],
    } as Message);
    super.addEventListener(type, listener);
  }

  removeEventListener(type: string, listener: (event: any) => void): void {
    this.queue.push({
      messageType: MessageType.REMOVE_EVENT,
      message: { type },
      transferables: [],
    } as Message);
    super.removeEventListener(type, listener);
  }

  dispatchEvent(ev: any, fromSelf?: boolean): void {
    if (!fromSelf) {
      this.queue.push({
        messageType: MessageType.EVENT,
        message: simplifyObject(ev),
        transferables: [],
      } as Message);
    }
    super.dispatchEvent(ev);
  }
}

function simplifyObject(object: any): any {
  const messageData = {};
  for (const prop in object) if (typeof object[prop] !== 'function') messageData[prop] = object[prop];
  return messageData;
}
