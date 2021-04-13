---
id: "worker_messagequeue"
title: "Module: worker/MessageQueue"
sidebar_label: "worker/MessageQueue"
custom_edit_url: null
hide_title: true
---

# Module: worker/MessageQueue

## Table of contents

### Enumerations

- [MessageType](../enums/worker_messagequeue.messagetype.md)

### Classes

- [AudioDocumentElementProxy](../classes/worker_messagequeue.audiodocumentelementproxy.md)
- [DocumentElementProxy](../classes/worker_messagequeue.documentelementproxy.md)
- [EventDispatcherProxy](../classes/worker_messagequeue.eventdispatcherproxy.md)
- [MainProxy](../classes/worker_messagequeue.mainproxy.md)
- [MessageQueue](../classes/worker_messagequeue.messagequeue.md)
- [Object3DProxy](../classes/worker_messagequeue.object3dproxy.md)
- [VideoDocumentElementProxy](../classes/worker_messagequeue.videodocumentelementproxy.md)
- [WorkerProxy](../classes/worker_messagequeue.workerproxy.md)
- [XRSessionProxy](../classes/worker_messagequeue.xrsessionproxy.md)

### Interfaces

- [Message](../interfaces/worker_messagequeue.message.md)

## Variables

### MESSAGE\_QUEUE\_EVENT\_BEFORE\_SEND\_QUEUE

• `Const` **MESSAGE\_QUEUE\_EVENT\_BEFORE\_SEND\_QUEUE**: *MESSAGE_QUEUE_EVENT_BEFORE_SEND_QUEUE*= 'MESSAGE\_QUEUE\_EVENT\_BEFORE\_SEND\_QUEUE'

Defined in: [packages/engine/src/worker/MessageQueue.ts:68](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L68)

___

### OFFSCREEN\_XR\_EVENTS

• `Const` **OFFSCREEN\_XR\_EVENTS**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`SESSION_CREATED` | *string* |
`SESSION_END` | *string* |
`SESSION_START` | *string* |

Defined in: [packages/engine/src/worker/MessageQueue.ts:1097](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L1097)

## Functions

### applyElementArguments

▸ `Const`**applyElementArguments**(`el`: *any*, `args`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`el` | *any* |
`args` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/worker/MessageQueue.ts:979](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L979)

___

### createWorker

▸ **createWorker**(`worker`: Worker, `canvas`: HTMLCanvasElement, `userArgs`: *any*): *Promise*<[*WorkerProxy*](../classes/worker_messagequeue.workerproxy.md)\>

#### Parameters:

Name | Type |
:------ | :------ |
`worker` | Worker |
`canvas` | HTMLCanvasElement |
`userArgs` | *any* |

**Returns:** *Promise*<[*WorkerProxy*](../classes/worker_messagequeue.workerproxy.md)\>

Defined in: [packages/engine/src/worker/MessageQueue.ts:687](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L687)

___

### receiveWorker

▸ **receiveWorker**(`onCanvas`: *any*): *Promise*<[*MainProxy*](../classes/worker_messagequeue.mainproxy.md)\>

#### Parameters:

Name | Type |
:------ | :------ |
`onCanvas` | *any* |

**Returns:** *Promise*<[*MainProxy*](../classes/worker_messagequeue.mainproxy.md)\>

Defined in: [packages/engine/src/worker/MessageQueue.ts:1191](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L1191)
