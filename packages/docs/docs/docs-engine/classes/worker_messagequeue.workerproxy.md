---
id: "worker_messagequeue.workerproxy"
title: "Class: WorkerProxy"
sidebar_label: "WorkerProxy"
custom_edit_url: null
hide_title: true
---

# Class: WorkerProxy

[worker/MessageQueue](../modules/worker_messagequeue.md).WorkerProxy

## Hierarchy

* [*MessageQueue*](worker_messagequeue.messagequeue.md)

  ↳ **WorkerProxy**

## Constructors

### constructor

\+ **new WorkerProxy**(`__namedParameters`: { `eventTarget`: EventTarget ; `messagePort`: *any*  }): [*WorkerProxy*](worker_messagequeue.workerproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`__namedParameters` | *object* |
`__namedParameters.eventTarget` | EventTarget |
`__namedParameters.messagePort` | *any* |

**Returns:** [*WorkerProxy*](worker_messagequeue.workerproxy.md)

Overrides: [MessageQueue](worker_messagequeue.messagequeue.md)

Defined in: [packages/engine/src/worker/MessageQueue.ts:611](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L611)

## Properties

### \_listeners

• **\_listeners**: *any*

Inherited from: [MessageQueue](worker_messagequeue.messagequeue.md).[_listeners](worker_messagequeue.messagequeue.md#_listeners)

Defined in: [packages/engine/src/worker/MessageQueue.ts:121](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L121)

___

### canvas

• **canvas**: HTMLCanvasElement

Defined in: [packages/engine/src/worker/MessageQueue.ts:611](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L611)

___

### eventListener

• **eventListener**: *any*

Inherited from: [MessageQueue](worker_messagequeue.messagequeue.md).[eventListener](worker_messagequeue.messagequeue.md#eventlistener)

Defined in: [packages/engine/src/worker/MessageQueue.ts:119](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L119)

___

### eventTarget

• **eventTarget**: EventTarget

Inherited from: [MessageQueue](worker_messagequeue.messagequeue.md).[eventTarget](worker_messagequeue.messagequeue.md#eventtarget)

Defined in: [packages/engine/src/worker/MessageQueue.ts:198](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L198)

___

### interval

• **interval**: *Timeout*

Inherited from: [MessageQueue](worker_messagequeue.messagequeue.md).[interval](worker_messagequeue.messagequeue.md#interval)

Defined in: [packages/engine/src/worker/MessageQueue.ts:196](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L196)

___

### messagePort

• **messagePort**: *any*

Inherited from: [MessageQueue](worker_messagequeue.messagequeue.md).[messagePort](worker_messagequeue.messagequeue.md#messageport)

Defined in: [packages/engine/src/worker/MessageQueue.ts:194](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L194)

___

### messageTypeFunctions

• **messageTypeFunctions**: *Map*<string \| [*MessageType*](../enums/worker_messagequeue.messagetype.md), any\>

Inherited from: [MessageQueue](worker_messagequeue.messagequeue.md).[messageTypeFunctions](worker_messagequeue.messagequeue.md#messagetypefunctions)

Defined in: [packages/engine/src/worker/MessageQueue.ts:120](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L120)

___

### object3dProxies

• **object3dProxies**: [*Object3DProxy*](worker_messagequeue.object3dproxy.md)[]

Inherited from: [MessageQueue](worker_messagequeue.messagequeue.md).[object3dProxies](worker_messagequeue.messagequeue.md#object3dproxies)

Defined in: [packages/engine/src/worker/MessageQueue.ts:199](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L199)

___

### queue

• **queue**: [*Message*](../interfaces/worker_messagequeue.message.md)[]

Inherited from: [MessageQueue](worker_messagequeue.messagequeue.md).[queue](worker_messagequeue.messagequeue.md#queue)

Defined in: [packages/engine/src/worker/MessageQueue.ts:195](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L195)

___

### remoteDocumentObjects

• **remoteDocumentObjects**: *Map*<string, [*DocumentElementProxy*](worker_messagequeue.documentelementproxy.md)\>

Inherited from: [MessageQueue](worker_messagequeue.messagequeue.md).[remoteDocumentObjects](worker_messagequeue.messagequeue.md#remotedocumentobjects)

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

Inherited from: [MessageQueue](worker_messagequeue.messagequeue.md)

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

Inherited from: [MessageQueue](worker_messagequeue.messagequeue.md)

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

Inherited from: [MessageQueue](worker_messagequeue.messagequeue.md)

Defined in: [packages/engine/src/worker/MessageQueue.ts:164](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L164)

___

### receiveQueue

▸ **receiveQueue**(`queue`: *object*[]): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`queue` | *object*[] |

**Returns:** *void*

Inherited from: [MessageQueue](worker_messagequeue.messagequeue.md)

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

Inherited from: [MessageQueue](worker_messagequeue.messagequeue.md)

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

Inherited from: [MessageQueue](worker_messagequeue.messagequeue.md)

Defined in: [packages/engine/src/worker/MessageQueue.ts:227](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L227)

___

### sendQueue

▸ **sendQueue**(): *void*

**Returns:** *void*

Inherited from: [MessageQueue](worker_messagequeue.messagequeue.md)

Defined in: [packages/engine/src/worker/MessageQueue.ts:244](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L244)

___

### transfer

▸ **transfer**(`transferables`: Transferable[]): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`transferables` | Transferable[] |

**Returns:** *void*

Inherited from: [MessageQueue](worker_messagequeue.messagequeue.md)

Defined in: [packages/engine/src/worker/MessageQueue.ts:237](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L237)
