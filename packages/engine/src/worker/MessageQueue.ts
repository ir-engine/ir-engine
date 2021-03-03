import {
  Audio as THREE_Audio,
  AudioListener as THREE_AudioListener,
  AudioLoader as THREE_AudioLoader,
  Event as DispatchEvent,
  Matrix4,
  Object3D,
  PositionalAudio as THREE_PositionalAudio,
  Scene,
} from 'three';
import { MathUtils } from 'three';
import { isWebWorker } from '../common/functions/getEnvironment';
const { generateUUID } = MathUtils;

export interface Message {
  messageType: MessageType | string;
  message: object;
  transferables?: Transferable[];
}

export enum MessageType {
  OFFSCREEN_CANVAS,
  CANVAS_CREATED,
  ADD_EVENT,
  REMOVE_EVENT,
  EVENT,
  TRANSFER,
  DOCUMENT_ELEMENT_CREATE,
  DOCUMENT_ELEMENT_FUNCTION_CALL,
  DOCUMENT_ELEMENT_PARAM_SET,
  DOCUMENT_ELEMENT_ADD_EVENT,
  DOCUMENT_ELEMENT_REMOVE_EVENT,
  DOCUMENT_ELEMENT_EVENT,
  DOCUMENT_ELEMENT_PROP_UPDATE,
  VIDEO_ELEMENT_CREATE,
  VIDEO_ELEMENT_FRAME,
  OBJECT3D_CREATE,
  OBJECT3D_DESTROY,
  OBJECT3D_MATRIX,
  OBJECT3D_PARAM_SET,
  OBJECT3D_FUNCTION_CALL,
  AUDIO_BUFFER_LOAD,
  AUDIO_BUFFER_SET,
  AUDIO_SOURCE_STREAM_SET,
  AUDIO_SOURCE_ELEMENT_SET,
}

function simplifyObject(object: any): any {
  const messageData = {};
  for (const prop in object)
    if (typeof object[prop] !== 'function')
      messageData[prop] = object[prop];
  return messageData;
}

/**
 * should do this the other way, create a map of arrays of keys and add objects only if the array that corresponds
 *    to that event key contains it. this allows us to catch weird edge cases instead of just deleting as many
 *    things as we can find, and also reduces how much we are sending over the worker
 */
function fixDocumentEvent(event: any) {
  const obj = simplifyObject(event);
  switch(obj.srcElement) {
    case (window as any): obj.targetElement = 'window'; break;
    case (document as any): obj.targetElement = 'document'; break;
    case ((globalThis as any).__messageQueue as WorkerProxy).canvas: obj.targetElement = 'canvas'; break;
    default: break;
  }
  delete obj.currentTarget;
  delete obj.path;
  delete obj.srcElement;
  delete obj.target;
  delete obj.view;
  delete obj.sourceCapabilities;
  delete obj.toElement;
  delete obj.relatedTarget;
  delete obj.fromElement;
  return obj;
}

class ExtendableProxy {
  constructor(
    getset = {
      get(target: any, name: any, receiver: any) {
        if (!Reflect.has(target, name)) {
          return undefined;
        }
        return Reflect.get(target, name, receiver);
      },
      set(target: any, name: any, value: any, receiver: any) {
        return Reflect.set(target, name, value, receiver);
      },
    },
  ) {
    return new Proxy(this, getset);
  }
}

export class EventDispatcherProxy extends ExtendableProxy {
  [x: string]: any;
  eventTarget: EventTarget;
  eventListener: any;
  messageTypeFunctions: Map<MessageType, any>;
  _listeners: any;

  constructor({
    eventTarget,
    eventListener,
    getset,
  }: {
    eventTarget: EventTarget;
    eventListener: any;
    getset?: any;
  }) {
    super(getset);
    this._listeners = {};
    this.eventTarget = eventTarget;
    this.eventListener = eventListener;
    this.messageTypeFunctions = new Map<MessageType, any>();

    this.messageTypeFunctions.set(MessageType.EVENT, (event: any) => {
      event.preventDefault = () => {};
      event.stopPropagation = () => {};
      delete event.target;
      this.dispatchEvent(event, true);
    });
    this.messageTypeFunctions.set(
      MessageType.ADD_EVENT,
      ({ type }: { type: string }) => {
        this.eventTarget.addEventListener(type, eventListener);
      },
    );
    this.messageTypeFunctions.set(
      MessageType.REMOVE_EVENT,
      ({ type }: { type: string }) => {
        this.eventTarget.removeEventListener(type, eventListener);
      },
    );
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
    return (
      this._listeners[type] !== undefined &&
      this._listeners[type].indexOf(listener) !== -1
    );
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
  interval: NodeJS.Timeout;
  remoteDocumentObjects: Map<string, DocumentElementProxy>;
  eventTarget: EventTarget;
  object3dProxies: Object3DProxy[] = [];

  constructor({
    messagePort,
    eventTarget,
    eventListener
  }: {
    messagePort: any;
    eventTarget: EventTarget;
    eventListener: any;
  }) {
    super({
      eventTarget,
      eventListener
    });
    this.messagePort = messagePort;
    this.eventTarget = eventTarget;
    this.queue = [];
    this.remoteDocumentObjects = new Map<string, DocumentElementProxy>();

    this.messagePort.onmessage = (message: any) => {
      this.receiveQueue(message.data as object[]);
    };
    this.interval = setInterval(() => {
      this.sendQueue();
    }, 1000 / 60);
  }
  sendEvent(type: string, detail: any, transferables?: Transferable[]) {
    this.queue.push({
      messageType: MessageType.EVENT,
      message: {
        type,
        detail,
      },
      transferables
    } as Message);
  }
  transfer(transferables: Transferable[]) {
    this.queue.push({
      messageType: MessageType.TRANSFER,
      message: {},
      transferables
    });
  }
  sendQueue() {
    if (!this.queue?.length) return;
    const messages: object[] = [];
    this.queue.forEach((message: Message) => {
      messages.push({
        messageType: message.messageType,
        message: message.message,
      });
    });
    const transferables: Transferable[] = [];
    this.queue.forEach((message: Message) => {
      message.transferables && transferables.push(...message.transferables);
    });
    try {
      this.messagePort.postMessage(messages, transferables);
    } catch (e) {
      console.log(e, messages, this);
    }
    this.queue = [];
  }

  receiveQueue(queue: object[]) {
    queue.forEach((element: object) => {
      /** @ts-ignore */
      const { messageType, message } = element;
      if (!message.returnID || message.returnID === '') {
        if (this.messageTypeFunctions.has(messageType)) {
          this.messageTypeFunctions.get(messageType)(message);
        }
      } else {
        if (this.remoteDocumentObjects.get(message.returnID)) {
          this.remoteDocumentObjects
            .get(message.returnID)
            ?.messageTypeFunctions.get(messageType)(message);
        }
      }
    });
  }

  addEventListener(
    type: string,
    listener: (event: DispatchEvent) => void,
  ): void {
    this.queue.push({
      messageType: MessageType.ADD_EVENT,
      message: { type },
    } as Message);
    super.addEventListener(type, listener);
  }

  removeEventListener(
    type: string,
    listener: (event: DispatchEvent) => void,
  ): void {
    this.queue.push({
      messageType: MessageType.REMOVE_EVENT,
      message: { type },
    } as Message);
    super.removeEventListener(type, listener);
  }

  dispatchEvent(
    ev: any,
    fromSelf?: boolean
  ): void {
    if(!fromSelf) {
      this.queue.push({
        messageType: MessageType.EVENT,
        message: simplifyObject(ev),
      } as Message);
    }
    super.dispatchEvent(ev);
  }
}

class DocumentElementProxy extends EventDispatcherProxy {
  messageQueue: MessageQueue;
  uuid: string;
  type: string;
  eventTarget: EventTarget;
  transferedProps: string[] = [];
  remoteCalls: string[];

  constructor({
    messageQueue,
    type,
    remoteCalls,
    eventTarget,
  }: {
    messageQueue: MessageQueue;
    type: string;
    remoteCalls?: string[];
    eventTarget?: EventTarget;
  }) {
    super({
      eventTarget: eventTarget || messageQueue.eventTarget,
      eventListener: (args: any) => {
        this.messageQueue.queue.push({
          messageType: MessageType.EVENT,
          message: simplifyObject(args),
        } as Message);
      },
      getset: {
        get(target: any, name: any, receiver: any) {
          if (!Reflect.has(target, name)) {
            return undefined;
          }
          return Reflect.get(target, name, receiver);
        },
        set(target: any, name: any, value: any, receiver: any) {
          const props = Reflect.get(target, 'transferedProps') as string[];
          if (props?.includes(name)) {
            Reflect.get(target, 'messageQueue').queue.push({
              messageType: MessageType.DOCUMENT_ELEMENT_PARAM_SET,
              message: {
                param: name,
                uuid: Reflect.get(target, 'uuid'),
                arg: value,
              },
            } as Message);
          }
          return Reflect.set(target, name, value, receiver);
        },
      },
    });
    this.remoteCalls = remoteCalls || [];
    for (const call of this.remoteCalls) {
      this[call] = (...args: any) => {
        this.messageQueue.queue.push({
          messageType: MessageType.DOCUMENT_ELEMENT_FUNCTION_CALL,
          message: {
            call,
            uuid: this.uuid,
            args,
          },
        } as Message);
        return true;
      };
    }
    this.type = type;
    this.messageQueue = messageQueue;
    this.eventTarget = eventTarget || messageQueue.eventTarget;
    this.uuid = generateUUID();
    this.messageQueue.remoteDocumentObjects.set(this.uuid, this);
    this.messageQueue.queue.push({
      messageType: MessageType.DOCUMENT_ELEMENT_CREATE,
      message: {
        type,
        uuid: this.uuid,
      },
    } as Message);
  }

  addEventListener(
    type: string,
    listener: (event: DispatchEvent) => void,
  ): void {
    this.messageQueue.queue.push({
      messageType: MessageType.DOCUMENT_ELEMENT_ADD_EVENT,
      message: { type, uuid: this.uuid },
    } as Message);
    super.addEventListener(type, listener);
  }

  removeEventListener(
    type: string,
    listener: (event: DispatchEvent) => void,
  ): void {
    this.messageQueue.queue.push({
      messageType: MessageType.DOCUMENT_ELEMENT_REMOVE_EVENT,
      message: { type, uuid: this.uuid },
    } as Message);
    super.removeEventListener(type, listener);
  }

  dispatchEvent(
    ev: any,
    fromMain?: boolean
  ): void {
    if(!fromMain) {
      ev.uuid = this.uuid;
      this.messageQueue.queue.push({
        messageType: MessageType.DOCUMENT_ELEMENT_EVENT,
        message: simplifyObject(ev),
      } as Message);
    } 
    super.dispatchEvent(ev);
  }
}

const audioRemoteFunctionCalls: string[] = ['play'];
const audioRemoteProps: string[] = ['src'];

class AudioDocumentElementProxy extends DocumentElementProxy {
  constructor({
    messageQueue,
    type = 'audio',
    remoteCalls = [],
  }: {
    messageQueue: MessageQueue;
    type?: string;
    remoteCalls?: string[];
  }) {
    super({
      messageQueue,
      type,
      remoteCalls: [...remoteCalls, ...audioRemoteFunctionCalls],
    });
    this.transferedProps.push(...audioRemoteProps);
  }
}

const videoRemoteFunctionCalls: string[] = [];
const videoRemoteProps: string[] = [];

export class VideoDocumentElementProxy extends AudioDocumentElementProxy {
  frameCallback: any;
  width: number;
  height: number;
  video: ImageData | null;
  readyState: number;

  constructor({ messageQueue }: { messageQueue: MessageQueue }) {
    super({
      messageQueue,
      type: 'video',
      remoteCalls: [],
    });
    this.video = null;
    this.width = 0;
    this.height = 0;
    this.readyState = 0;
    this.messageTypeFunctions.set(
      MessageType.VIDEO_ELEMENT_CREATE,
      ({ width, height }: { width: number; height: number }) => {
        this.width = width;
        this.height = height;
        this.video = new ImageData(
          new Uint8ClampedArray(4 * this.width * this.height).fill(0),
          this.width,
          this.height,
        );
      },
    );
    this.messageTypeFunctions.set(
      MessageType.VIDEO_ELEMENT_FRAME,
      ({
        imageBuffer,
        readyState,
      }: {
        imageBuffer: ArrayBuffer;
        readyState: number;
      }) => {
        this.video = new ImageData(
          new Uint8ClampedArray(imageBuffer),
          this.width,
          this.height,
        );
        this.readyState = readyState;
        if (this.frameCallback) {
          this.frameCallback();
        }
      },
    );

    this.transferedProps.push(...videoRemoteProps);
  }
  requestVideoFrameCallback(callback: any) {
    this.frameCallback = callback;
  }
}
class Object3DProxy extends Object3D {
  [x: string]: any;
  proxyID: string;
  setQueue: Map<string, any> = new Map<string, any>();
  messageQueue: MainProxy;

  constructor(args: any = {}) {
    super();
    this.type = args.type || 'Object3D';
    this.proxyID = generateUUID();
    this.messageQueue = (globalThis as any).__messageQueue as MainProxy;
    this.messageQueue.object3dProxies.push(this);
    this.messageQueue.queue.push({
      messageType: MessageType.OBJECT3D_CREATE,
      message: {
        proxyID: this.proxyID,
        type: this.type,
      },
    } as Message);

    this.addEventListener('removed', () => {
      this.messageQueue.object3dProxies.splice(
        this.messageQueue.object3dProxies.indexOf(this),
        1,
      );
      this.messageQueue.queue.push({
        messageType: MessageType.OBJECT3D_DESTROY,
        message: {
          proxyID: this.proxyID,
        },
      } as Message);
    });
  }
  __callFunc(call: string, ...args: any) {
    this.messageQueue.queue.push({
      messageType: MessageType.OBJECT3D_FUNCTION_CALL,
      message: {
        call,
        proxyID: this.proxyID,
        args,
      },
    } as Message);
  }
}

export class AudioListenerProxy extends Object3DProxy {
  constructor() {
    super({ type: 'AudioListener' });
  }
}

export type AudioBufferProxyID = string;

export class AudioLoaderProxy {
  constructor() {}
  load(url: string, callback: any) {
    const requestCallback = (event: DispatchEvent) => {
      callback(event.type as AudioBufferProxyID);
      ((globalThis as any).__messageQueue as MessageQueue).removeEventListener(
        url,
        requestCallback,
      );
    };
    ((globalThis as any).__messageQueue as MessageQueue).addEventListener(
      url,
      requestCallback,
    );
    ((globalThis as any).__messageQueue as MessageQueue).queue.push({
      messageType: MessageType.AUDIO_BUFFER_LOAD,
      message: {
        url,
      },
    } as Message);
  }
}

export class AudioObjectProxy extends Object3DProxy {
  constructor(args: any = {}) {
    super({ type: args.type || 'Audio' });
  }
  // HTMLMediaElement - <audio> & <video>
  setMediaElementSource(source: AudioDocumentElementProxy) {
    ((globalThis as any).__messageQueue as MessageQueue).queue.push({
      messageType: MessageType.AUDIO_SOURCE_ELEMENT_SET,
      message: {
        sourceID: source.uuid,
        proxyID: this.proxyID,
      },
    } as Message);
  }
  // HTMLMediaStream - Webcams
  // this might need to be implemented at application level
  // setMediaStreamSource(source: AudioDocumentElementProxy) {
  //   ((globalThis as any).__messageQueue as MessageQueue).queue.push({
  //     messageType: MessageType.AUDIO_SOURCE_STREAM_SET,
  //     message: {
  //       sourceID: source.uuid,
  //       proxyID: this.proxyID,
  //     },
  //   } as Message);
  // }
  // AudioBuffer - AudioLoader.load
  setBuffer(buffer: AudioBufferProxyID) {
    ((globalThis as any).__messageQueue as MessageQueue).queue.push({
      messageType: MessageType.AUDIO_BUFFER_SET,
      message: {
        buffer,
        proxyID: this.proxyID,
      },
    } as Message);
  }
  setLoop(loop: boolean) {
    this.__callFunc('setLoop', loop);
  }
  setVolume(volume: number) {
    this.__callFunc('setVolume', volume);
  }
  play() {
    this.__callFunc('play');
  }
}

export class PositionalAudioObjectProxy extends AudioObjectProxy {
  constructor() {
    super({ type: 'PositionalAudio' });
  }
}
export class WorkerProxy extends MessageQueue {
  canvas: HTMLCanvasElement;
  constructor({
    messagePort,
    eventTarget,
  }: {
    messagePort: any;
    eventTarget: EventTarget;
  }) {
    super({ messagePort, eventTarget, eventListener: (args: any) => {
      this.queue.push({
        messageType: MessageType.EVENT,
        message: fixDocumentEvent(args),
      } as Message);
    }, });

    this.canvas = eventTarget as HTMLCanvasElement;
  }
}

export class MainProxy extends MessageQueue {
  canvas: OffscreenCanvas | null;
  width: number;
  height: number;
  devicePixelRatio: number;

  constructor({
    messagePort,
    eventTarget = new EventTarget(),
  }: {
    messagePort: any;
    eventTarget?: EventTarget;
  }) {
    super({ messagePort, eventTarget, eventListener: (args: any) => {
      this.queue.push({
        messageType: MessageType.EVENT,
        message: simplifyObject(args),
      } as Message);
    }, });

    this.canvas = null;
    this.width = 0;
    this.height = 0;
    this.devicePixelRatio = 0;

    this.focus = this.focus.bind(this);
  }
  focus() {}
  get ownerDocument() {
    return this;
  }
  get clientWidth() {
    return this.width;
  }
  get clientHeight() {
    return this.height;
  }
  get innerWidth() {
    return this.width;
  }
  get innerHeight() {
    return this.height;
  }
  sendQueue() {
    for (const obj of this.object3dProxies) {
      this.queue.push({
        messageType: MessageType.OBJECT3D_MATRIX,
        message: {
          matrixWorld: obj.matrixWorld,
          proxyID: obj.proxyID,
        },
      } as Message);
    }
    super.sendQueue();
  }
}

export async function createWorker(
  worker: Worker,
  canvas: HTMLCanvasElement,
  userArgs: any
) {
  const messageQueue = new WorkerProxy({
    messagePort: worker,
    eventTarget: canvas,
  });
  const { width, height } = canvas.getBoundingClientRect();
  const offscreen = canvas.transferControlToOffscreen();
  const documentElementMap = new Map<string, any>();
  messageQueue.messageTypeFunctions.set(
    MessageType.DOCUMENT_ELEMENT_FUNCTION_CALL,
    ({ call, uuid, args }: { call: string; uuid: string; args: any[] }) => {
      documentElementMap.get(uuid)[call](...args);
    },
  );
  messageQueue.messageTypeFunctions.set(
    MessageType.DOCUMENT_ELEMENT_PARAM_SET,
    ({ param, uuid, arg }: { param: string; uuid: string; arg: any }) => {
      documentElementMap.get(uuid)[param] = arg;
    },
  );
  messageQueue.messageTypeFunctions.set(
    MessageType.DOCUMENT_ELEMENT_EVENT,
    ({ type, uuid, detail }: { type: string; uuid: string, detail: any }) => {
      documentElementMap.get(uuid)?.dispatchEvent(new CustomEvent(type, { detail }))
    },
  );
  messageQueue.messageTypeFunctions.set(
    MessageType.DOCUMENT_ELEMENT_ADD_EVENT,
    ({ type, uuid }: { type: string; uuid: string }) => {

      // TODO add in an options parameter to message to enable piping through preventDefault & passive etc - must then be added during adding event listener in InputSchema
      if (documentElementMap.get(uuid)) {
        const listener = (ev: any) => {
          const event = fixDocumentEvent(ev) as any;
          event.type = type;
          event.returnID = uuid;
          messageQueue.queue.push({
            messageType: MessageType.EVENT,
            message: event,
          } as Message);
        };
        documentElementMap.get(uuid).addEventListener(type, listener);
        documentElementMap.get(uuid).proxyListener = listener;
      }
    },
  );
  messageQueue.messageTypeFunctions.set(
    MessageType.DOCUMENT_ELEMENT_REMOVE_EVENT,
    ({ type, uuid }: { type: string; uuid: string }) => {
      if (documentElementMap.get(uuid)) {
        documentElementMap
          .get(uuid)
          .removeEventListener(
            type,
            documentElementMap.get(uuid).proxyListener,
          );
        delete documentElementMap.get(uuid).proxyListener;
      }
    },
  );
  messageQueue.messageTypeFunctions.set(
    MessageType.DOCUMENT_ELEMENT_CREATE,
    ({ type, uuid }: { type: string; uuid: string }) => {
      switch (type) {
        case 'window': documentElementMap.set(uuid, (window as any)); break;
        case 'document': documentElementMap.set(uuid, (document as any)); break;
        case 'canvas': documentElementMap.set(uuid, canvas); break;
        case 'audio':
          const audio = document.createElement('audio') as HTMLVideoElement;
          documentElementMap.set(uuid, audio);
          break;
        case 'video':
          const video = document.createElement('video') as HTMLVideoElement;
          documentElementMap.set(uuid, video);
          video.onplay = (ev: any) => {
            const drawCanvas = document.createElement(
              'canvas',
            ) as HTMLCanvasElement;
            drawCanvas.width = video.videoWidth;
            drawCanvas.height = video.videoHeight;
            const context = drawCanvas.getContext('2d');
            messageQueue.queue.push({
              messageType: MessageType.VIDEO_ELEMENT_CREATE,
              message: {
                width: video.videoWidth,
                height: video.videoHeight,
                returnID: uuid,
              },
            } as Message);

            const sendFrame = async () => {
              context?.drawImage(video, 0, 0);
              const imageBuffer = context?.getImageData(
                0,
                0,
                video.videoWidth,
                video.videoHeight,
              ).data.buffer;
              if (imageBuffer) {
                messageQueue.queue.push({
                  messageType: MessageType.VIDEO_ELEMENT_FRAME,
                  message: {
                    imageBuffer,
                    readyState: video.readyState,
                    returnID: uuid,
                  },
                  transferables: [imageBuffer],
                } as Message);
              }
              /** @ts-ignore */
              video.requestVideoFrameCallback(sendFrame);
            };
            /** @ts-ignore */
            video.requestVideoFrameCallback(sendFrame);
          };
          break;
        default:
          break;
      }
    },
  );
  const sceneObjects: Map<string, Object3D> = new Map<string, Object3D>();
  const audioScene = new Scene();
  const audioLoader = new THREE_AudioLoader();
  const audioBuffers: Map<string, AudioBuffer> = new Map<string, AudioBuffer>();
  let audioListener: any = undefined;

  messageQueue.messageTypeFunctions.set(
    MessageType.AUDIO_BUFFER_LOAD,
    ({ url }: { url: string }) => {
      audioLoader.load(url, (buffer: AudioBuffer) => {
        audioBuffers.set(url, buffer);
        messageQueue.queue.push({
          messageType: MessageType.EVENT,
          message: {
            type: url,
          },
        } as Message);
      });
    },
  );
  messageQueue.messageTypeFunctions.set(
    MessageType.AUDIO_BUFFER_SET,
    ({ buffer, proxyID }: { buffer: string; proxyID: string }) => {
      const audioBuffer = audioBuffers.get(buffer) as AudioBuffer;
      const obj = sceneObjects.get(proxyID) as THREE_Audio;
      if (audioBuffer && obj) {
        obj.setBuffer(audioBuffer);
      }
    },
  );
  messageQueue.messageTypeFunctions.set(
    MessageType.AUDIO_SOURCE_ELEMENT_SET,
    ({ sourceID, proxyID }: { sourceID: string; proxyID: string }) => {
      const source = documentElementMap.get(sourceID) as HTMLMediaElement;
      const obj = sceneObjects.get(proxyID) as THREE_Audio;
      if (source && obj) {
        obj.setMediaElementSource(source);
      }
    },
  );
  messageQueue.messageTypeFunctions.set(
    MessageType.OBJECT3D_CREATE,
    ({
      type,
      proxyID,
      args,
    }: {
      type: string;
      proxyID: string;
      args: any[];
    }) => {
      let obj;
      switch (type) {
        case 'Audio':
          obj = new THREE_Audio(audioListener);
          break;
        case 'PositionalAudio':
          obj = new THREE_PositionalAudio(audioListener);
          break;
        case 'AudioListener':
          obj = new THREE_AudioListener();
          audioListener = obj;
          break;
        default:
          break;
      }

      if (obj) {
        audioScene.add(obj);
        sceneObjects.set(proxyID, obj);
      }
    },
  );
  messageQueue.messageTypeFunctions.set(
    MessageType.OBJECT3D_PARAM_SET,
    ({ param, proxyID, arg }: { param: string; proxyID: string; arg: any }) => {
      const obj = sceneObjects.get(proxyID) as any;
      if (obj) {
        obj[param] = arg;
      }
    },
  );
  messageQueue.messageTypeFunctions.set(
    MessageType.OBJECT3D_FUNCTION_CALL,
    ({
      call,
      proxyID,
      args,
    }: {
      call: string;
      proxyID: string;
      args: any[];
    }) => {
      const obj = sceneObjects.get(proxyID) as any;
      if (obj) {
        obj[call](...args);
      }
    },
  );
  messageQueue.messageTypeFunctions.set(
    MessageType.OBJECT3D_MATRIX,
    ({ matrixWorld, proxyID }: { matrixWorld: Matrix4; proxyID: string }) => {
      const obj = sceneObjects.get(proxyID);
      if (obj) {
        obj.matrixWorld = matrixWorld;
        obj.matrixWorldNeedsUpdate = true;
      }
    },
  );
  messageQueue.messageTypeFunctions.set(
    MessageType.OBJECT3D_DESTROY,
    ({ proxyID }: { proxyID: string }) => {
      const obj = sceneObjects.get(proxyID);
      if (obj?.parent) {
        obj.parent.remove(obj);
      }
    },
  );
  window.addEventListener('resize', () => {
    messageQueue.queue.push({
      messageType: MessageType.EVENT,
      message: {
        type: 'resize',
        detail: {
          width: canvas.clientWidth,
          height: canvas.clientHeight,
        }
      },
    } as Message);
  });
  messageQueue.queue.push({
    messageType: MessageType.OFFSCREEN_CANVAS,
    message: {
      width,
      height,
      canvas: offscreen,
      devicePixelRatio: window.devicePixelRatio,
      userArgs
    },
    transferables: [offscreen],
  } as Message);
  await new Promise<void>((resolve) => {
    const createOffscreenCanvasListener = () => {
      messageQueue.messageTypeFunctions.delete(MessageType.CANVAS_CREATED);
      resolve();
    }
    messageQueue.messageTypeFunctions.set(MessageType.CANVAS_CREATED, createOffscreenCanvasListener);
  });
  (globalThis as any).__messageQueue = messageQueue;
  return messageQueue;
}

class WindowProxy extends DocumentElementProxy {
  constructor({
    messageQueue,
    type = 'window',
    remoteCalls = [],
  }: {
    messageQueue: MessageQueue;
    type?: string;
    remoteCalls?: string[];
  }) {
    super({
      messageQueue,
      type,
      remoteCalls: [...remoteCalls],
    });
    // this.transferedProps.push();
  }
  focus: () => {}
  get ownerDocument() {
    return (globalThis as any).document;
  }
  get width() {
    return this.messageQueue.width;
  }
  get height() {
    return this.messageQueue.height;
  }
  get clientWidth() {
    return this.messageQueue.width;
  }
  get clientHeight() {
    return this.messageQueue.height;
  }
  get innerWidth() {
    return this.messageQueue.width;
  }
  get innerHeight() {
    return this.messageQueue.height;
  }
  get devicePixelRatio() {
    return this.messageQueue.devicePixelRatio;
  }
}

class DocumentProxy extends DocumentElementProxy {
  constructor({
    messageQueue,
    type = 'document',
    remoteCalls = [],
  }: {
    messageQueue: MessageQueue;
    type?: string;
    remoteCalls?: string[];
  }) {
    super({
      messageQueue,
      type,
      remoteCalls: [...remoteCalls],
    });
    // this.transferedProps.push();
  }
  get ownerDocument() {
    return (globalThis as any).document
  }
  createElement(type: string): DocumentElementProxy | null {
    switch (type) {
      case 'audio':
        return new AudioDocumentElementProxy({ messageQueue: this.messageQueue });
      case 'video':
        return new VideoDocumentElementProxy({ messageQueue: this.messageQueue });
      default:
        return null;
    }
  }
}

class CanvasProxy extends DocumentElementProxy {
  constructor({
    messageQueue,
    type = 'canvas',
    remoteCalls = [],
  }: {
    messageQueue: MessageQueue;
    type?: string;
    remoteCalls?: string[];
  }) {
    super({
      messageQueue,
      type,
      remoteCalls: [...remoteCalls],
    });
    // this.transferedProps.push();
  }
}

export async function receiveWorker(onCanvas: any) {
  const messageQueue = new MainProxy({ messagePort: globalThis as any });
  const canvasProxy = new CanvasProxy({ messageQueue });
  messageQueue.messageTypeFunctions.set(
    MessageType.OFFSCREEN_CANVAS,
    (args: any) => {
      const {
        canvas,
        height,
        width,
        devicePixelRatio
      }: {
        canvas: OffscreenCanvas;
        width: number;
        height: number;
        devicePixelRatio: number;
      } = args;
      messageQueue.canvas = canvas;
      messageQueue.width = width;
      messageQueue.height = height;
      messageQueue.devicePixelRatio = devicePixelRatio;
      canvas.addEventListener = (
        type: string,
        listener: (event: any) => void,
      ) => {
        canvasProxy.addEventListener(type, listener);
      };
      canvas.removeEventListener = (
        type: string,
        listener: (event: any) => void,
      ) => {
        canvasProxy.removeEventListener(type, listener);
      };
      canvas.dispatchEvent = (
        event: any
      ): boolean => {
        delete event.target;
        canvasProxy.dispatchEvent(event);
        return true;
      };
      /** @ts-ignore */
      canvas.ownerDocument = (globalThis as any).document;
      (globalThis as any).window = new WindowProxy({ messageQueue });
      (globalThis as any).document = new DocumentProxy({ messageQueue });
      onCanvas(args, messageQueue);
      messageQueue.queue.push({
        messageType: MessageType.CANVAS_CREATED,
        message: {}
      });
    },
  );
  messageQueue.addEventListener('resize', (ev: any) => {
    if(ev) {
      messageQueue.width = ev.detail.width;
      messageQueue.height = ev.detail.height;
    }
  });
  (globalThis as any).__messageQueue = messageQueue;
  return messageQueue;
}
