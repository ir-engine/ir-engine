---
id: "worker_messagequeue.messagequeue"
title: "Class: MessageQueue"
sidebar_label: "MessageQueue"
custom_edit_url: null
hide_title: true
---

# Class: MessageQueue

[worker/MessageQueue](../modules/worker_messagequeue.md).MessageQueue

## Hierarchy

* [*EventDispatcherProxy*](worker_messagequeue.eventdispatcherproxy.md)

  ↳ **MessageQueue**

  ↳↳ [*WorkerProxy*](worker_messagequeue.workerproxy.md)

  ↳↳ [*MainProxy*](worker_messagequeue.mainproxy.md)

## Constructors

### constructor

\+ **new MessageQueue**(`__namedParameters`: { `eventListener`: *any* ; `eventTarget`: EventTarget ; `messagePort`: *any*  }): [*MessageQueue*](worker_messagequeue.messagequeue.md)

#### Parameters:

Name | Type |
:------ | :------ |
`__namedParameters` | *object* |
`__namedParameters.eventListener` | *any* |
`__namedParameters.eventTarget` | EventTarget |
`__namedParameters.messagePort` | *any* |

**Returns:** [*MessageQueue*](worker_messagequeue.messagequeue.md)

Overrides: [EventDispatcherProxy](worker_messagequeue.eventdispatcherproxy.md)

Defined in: [packages/engine/src/worker/MessageQueue.ts:199](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L199)

## Properties

### \_listeners

• **\_listeners**: *any*

Inherited from: [EventDispatcherProxy](worker_messagequeue.eventdispatcherproxy.md).[_listeners](worker_messagequeue.eventdispatcherproxy.md#_listeners)

Defined in: [packages/engine/src/worker/MessageQueue.ts:121](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L121)

___

### eventListener

• **eventListener**: *any*

Inherited from: [EventDispatcherProxy](worker_messagequeue.eventdispatcherproxy.md).[eventListener](worker_messagequeue.eventdispatcherproxy.md#eventlistener)

Defined in: [packages/engine/src/worker/MessageQueue.ts:119](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L119)

___

### eventTarget

• **eventTarget**: EventTarget

Overrides: [EventDispatcherProxy](worker_messagequeue.eventdispatcherproxy.md).[eventTarget](worker_messagequeue.eventdispatcherproxy.md#eventtarget)

Defined in: [packages/engine/src/worker/MessageQueue.ts:198](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L198)

___

### interval

• **interval**: *Timeout*

Defined in: [packages/engine/src/worker/MessageQueue.ts:196](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L196)

___

### messagePort

• **messagePort**: *any*

Defined in: [packages/engine/src/worker/MessageQueue.ts:194](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L194)

___

### messageTypeFunctions

• **messageTypeFunctions**: *Map*<string \| [*MessageType*](../enums/worker_messagequeue.messagetype.md), any\>

Inherited from: [EventDispatcherProxy](worker_messagequeue.eventdispatcherproxy.md).[messageTypeFunctions](worker_messagequeue.eventdispatcherproxy.md#messagetypefunctions)

Defined in: [packages/engine/src/worker/MessageQueue.ts:120](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L120)

___

### object3dProxies

• **object3dProxies**: [*Object3DProxy*](worker_messagequeue.object3dproxy.md)[]

Defined in: [packages/engine/src/worker/MessageQueue.ts:199](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L199)

___

### queue

• **queue**: [*Message*](../interfaces/worker_messagequeue.message.md)[]

Defined in: [packages/engine/src/worker/MessageQueue.ts:195](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L195)

___

### remoteDocumentObjects

• **remoteDocumentObjects**: *Map*<string, [*DocumentElementProxy*](worker_messagequeue.documentelementproxy.md)\>

Defined in: [packages/engine/src/worker/MessageQueue.ts:197](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L197)

## Methods

### addEventListener

▸ **addEventListener**(`type`: *string*, `listener`: (`event`: *any*) => *void*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`type` | *string* |
`listener` | (`event`: *any*) => *void* |

**Returns:** *void*

Overrides: [EventDispatcherProxy](worker_messagequeue.eventdispatcherproxy.md)

Defined in: [packages/engine/src/worker/MessageQueue.ts:284](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L284)

___

### dispatchEvent

▸ **dispatchEvent**(`ev`: *any*, `fromSelf?`: *boolean*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`ev` | *any* |
`fromSelf?` | *boolean* |

**Returns:** *void*

Overrides: [EventDispatcherProxy](worker_messagequeue.eventdispatcherproxy.md)

Defined in: [packages/engine/src/worker/MessageQueue.ts:306](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L306)

___

### hasEventListener

▸ **hasEventListener**(`type`: *string*, `listener`: *any*): *boolean*

#### Parameters:

Name | Type |
:------ | :------ |
`type` | *string* |
`listener` | *any* |

**Returns:** *boolean*

Inherited from: [EventDispatcherProxy](worker_messagequeue.eventdispatcherproxy.md)

Defined in: [packages/engine/src/worker/MessageQueue.ts:164](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L164)

___

### receiveQueue

▸ **receiveQueue**(`queue`: *object*[]): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`queue` | *object*[] |

**Returns:** *void*

Defined in: [packages/engine/src/worker/MessageQueue.ts:266](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L266)

___

### removeEventListener

▸ **removeEventListener**(`type`: *string*, `listener`: (`event`: *any*) => *void*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`type` | *string* |
`listener` | (`event`: *any*) => *void* |

**Returns:** *void*

Overrides: [EventDispatcherProxy](worker_messagequeue.eventdispatcherproxy.md)

Defined in: [packages/engine/src/worker/MessageQueue.ts:295](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L295)

___

### sendEvent

▸ **sendEvent**(`type`: *string*, `detail`: *any*, `transferables?`: Transferable[]): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`type` | *string* |
`detail` | *any* |
`transferables?` | Transferable[] |

**Returns:** *void*

Defined in: [packages/engine/src/worker/MessageQueue.ts:227](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L227)

___

### sendQueue

▸ **sendQueue**(): *void*

**Returns:** *void*

Defined in: [packages/engine/src/worker/MessageQueue.ts:244](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L244)

___

### transfer

▸ **transfer**(`transferables`: Transferable[]): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`transferables` | Transferable[] |

**Returns:** *void*

Defined in: [packages/engine/src/worker/MessageQueue.ts:237](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L237)
