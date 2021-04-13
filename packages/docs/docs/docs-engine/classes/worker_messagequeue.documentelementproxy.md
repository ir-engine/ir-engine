---
id: "worker_messagequeue.documentelementproxy"
title: "Class: DocumentElementProxy"
sidebar_label: "DocumentElementProxy"
custom_edit_url: null
hide_title: true
---

# Class: DocumentElementProxy

[worker/MessageQueue](../modules/worker_messagequeue.md).DocumentElementProxy

## Hierarchy

* [*EventDispatcherProxy*](worker_messagequeue.eventdispatcherproxy.md)

  ↳ **DocumentElementProxy**

  ↳↳ [*AudioDocumentElementProxy*](worker_messagequeue.audiodocumentelementproxy.md)

  ↳↳ [*XRSessionProxy*](worker_messagequeue.xrsessionproxy.md)

## Constructors

### constructor

\+ **new DocumentElementProxy**(`__namedParameters`: { `elementArgs?`: *any* ; `eventTarget?`: EventTarget ; `ignoreCreate?`: *boolean* ; `messageQueue`: [*MessageQueue*](worker_messagequeue.messagequeue.md) ; `type`: *string* ; `uuid?`: *string*  }): [*DocumentElementProxy*](worker_messagequeue.documentelementproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`__namedParameters` | *object* |
`__namedParameters.elementArgs?` | *any* |
`__namedParameters.eventTarget?` | EventTarget |
`__namedParameters.ignoreCreate?` | *boolean* |
`__namedParameters.messageQueue` | [*MessageQueue*](worker_messagequeue.messagequeue.md) |
`__namedParameters.type` | *string* |
`__namedParameters.uuid?` | *string* |

**Returns:** [*DocumentElementProxy*](worker_messagequeue.documentelementproxy.md)

Overrides: [EventDispatcherProxy](worker_messagequeue.eventdispatcherproxy.md)

Defined in: [packages/engine/src/worker/MessageQueue.ts:324](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L324)

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

Defined in: [packages/engine/src/worker/MessageQueue.ts:324](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L324)

___

### messageQueue

• **messageQueue**: [*MessageQueue*](worker_messagequeue.messagequeue.md)

Defined in: [packages/engine/src/worker/MessageQueue.ts:321](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L321)

___

### messageTypeFunctions

• **messageTypeFunctions**: *Map*<string \| [*MessageType*](../enums/worker_messagequeue.messagetype.md), any\>

Inherited from: [EventDispatcherProxy](worker_messagequeue.eventdispatcherproxy.md).[messageTypeFunctions](worker_messagequeue.eventdispatcherproxy.md#messagetypefunctions)

Defined in: [packages/engine/src/worker/MessageQueue.ts:120](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L120)

___

### type

• **type**: *string*

Defined in: [packages/engine/src/worker/MessageQueue.ts:323](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L323)

___

### uuid

• **uuid**: *string*

Defined in: [packages/engine/src/worker/MessageQueue.ts:322](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L322)

## Methods

### \_\_callFunc

▸ **__callFunc**(`call`: *string*, ...`args`: *any*): *boolean*

#### Parameters:

Name | Type |
:------ | :------ |
`call` | *string* |
`...args` | *any* |

**Returns:** *boolean*

Defined in: [packages/engine/src/worker/MessageQueue.ts:366](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L366)

___

### \_\_callFuncAsync

▸ **__callFuncAsync**(`call`: *string*, ...`args`: *any*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`call` | *string* |
`...args` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/engine/src/worker/MessageQueue.ts:377](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L377)

___

### \_\_setValue

▸ **__setValue**(`prop`: *any*, `value`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`prop` | *any* |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/worker/MessageQueue.ts:400](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L400)

___

### addEventListener

▸ **addEventListener**(`type`: *string*, `listener`: (`event`: *any*) => *void*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`type` | *string* |
`listener` | (`event`: *any*) => *void* |

**Returns:** *void*

Overrides: [EventDispatcherProxy](worker_messagequeue.eventdispatcherproxy.md)

Defined in: [packages/engine/src/worker/MessageQueue.ts:410](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L410)

___

### dispatchEvent

▸ **dispatchEvent**(`ev`: *any*, `fromMain?`: *boolean*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`ev` | *any* |
`fromMain?` | *boolean* |

**Returns:** *void*

Overrides: [EventDispatcherProxy](worker_messagequeue.eventdispatcherproxy.md)

Defined in: [packages/engine/src/worker/MessageQueue.ts:432](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L432)

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

### removeEventListener

▸ **removeEventListener**(`type`: *string*, `listener`: (`event`: *any*) => *void*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`type` | *string* |
`listener` | (`event`: *any*) => *void* |

**Returns:** *void*

Overrides: [EventDispatcherProxy](worker_messagequeue.eventdispatcherproxy.md)

Defined in: [packages/engine/src/worker/MessageQueue.ts:421](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L421)
