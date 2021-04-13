---
id: "worker_messagequeue.object3dproxy"
title: "Class: Object3DProxy"
sidebar_label: "Object3DProxy"
custom_edit_url: null
hide_title: true
---

# Class: Object3DProxy

[worker/MessageQueue](../modules/worker_messagequeue.md).Object3DProxy

## Hierarchy

* *Object3D*

  ↳ **Object3DProxy**

  ↳↳ [*AudioObjectProxy*](worker_audio.audioobjectproxy.md)

  ↳↳ [*AudioListenerProxy*](worker_audio.audiolistenerproxy.md)

## Indexable

▪ [x: *string*]: *any*

## Constructors

### constructor

\+ **new Object3DProxy**(`args?`: *any*): [*Object3DProxy*](worker_messagequeue.object3dproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`args` | *any* |

**Returns:** [*Object3DProxy*](worker_messagequeue.object3dproxy.md)

Overrides: void

Defined in: [packages/engine/src/worker/MessageQueue.ts:569](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L569)

## Properties

### messageQueue

• **messageQueue**: [*MainProxy*](worker_messagequeue.mainproxy.md)

Defined in: [packages/engine/src/worker/MessageQueue.ts:569](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L569)

___

### proxyID

• **proxyID**: *string*

Defined in: [packages/engine/src/worker/MessageQueue.ts:567](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L567)

___

### setQueue

• **setQueue**: *Map*<string, any\>

Defined in: [packages/engine/src/worker/MessageQueue.ts:568](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L568)

## Methods

### \_\_callFunc

▸ **__callFunc**(`call`: *string*, ...`args`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`call` | *string* |
`...args` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/worker/MessageQueue.ts:598](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L598)
