---
id: "worker_messagequeue.eventdispatcherproxy"
title: "Class: EventDispatcherProxy"
sidebar_label: "EventDispatcherProxy"
custom_edit_url: null
hide_title: true
---

# Class: EventDispatcherProxy

[worker/MessageQueue](../modules/worker_messagequeue.md).EventDispatcherProxy

## Hierarchy

* **EventDispatcherProxy**

  ↳ [*MessageQueue*](worker_messagequeue.messagequeue.md)

  ↳ [*DocumentElementProxy*](worker_messagequeue.documentelementproxy.md)

## Indexable

▪ [x: *string*]: *any*

## Constructors

### constructor

\+ **new EventDispatcherProxy**(`__namedParameters`: { `eventListener`: *any* ; `eventTarget`: EventTarget  }): [*EventDispatcherProxy*](worker_messagequeue.eventdispatcherproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`__namedParameters` | *object* |
`__namedParameters.eventListener` | *any* |
`__namedParameters.eventTarget` | EventTarget |

**Returns:** [*EventDispatcherProxy*](worker_messagequeue.eventdispatcherproxy.md)

Defined in: [packages/engine/src/worker/MessageQueue.ts:121](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L121)

## Properties

### \_listeners

• **\_listeners**: *any*

Defined in: [packages/engine/src/worker/MessageQueue.ts:121](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L121)

___

### eventListener

• **eventListener**: *any*

Defined in: [packages/engine/src/worker/MessageQueue.ts:119](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L119)

___

### eventTarget

• **eventTarget**: EventTarget

Defined in: [packages/engine/src/worker/MessageQueue.ts:118](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L118)

___

### messageTypeFunctions

• **messageTypeFunctions**: *Map*<string \| [*MessageType*](../enums/worker_messagequeue.messagetype.md), any\>

Defined in: [packages/engine/src/worker/MessageQueue.ts:120](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L120)

## Methods

### addEventListener

▸ **addEventListener**(`type`: *string*, `listener`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`type` | *string* |
`listener` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/worker/MessageQueue.ts:155](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L155)

___

### dispatchEvent

▸ **dispatchEvent**(`event`: *any*, `fromSelf?`: *boolean*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *any* |
`fromSelf?` | *boolean* |

**Returns:** *void*

Defined in: [packages/engine/src/worker/MessageQueue.ts:181](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L181)

___

### hasEventListener

▸ **hasEventListener**(`type`: *string*, `listener`: *any*): *boolean*

#### Parameters:

Name | Type |
:------ | :------ |
`type` | *string* |
`listener` | *any* |

**Returns:** *boolean*

Defined in: [packages/engine/src/worker/MessageQueue.ts:164](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L164)

___

### removeEventListener

▸ **removeEventListener**(`type`: *string*, `listener`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`type` | *string* |
`listener` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/worker/MessageQueue.ts:171](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L171)
