---
id: "worker_audio.audiolistenerproxy"
title: "Class: AudioListenerProxy"
sidebar_label: "AudioListenerProxy"
custom_edit_url: null
hide_title: true
---

# Class: AudioListenerProxy

[worker/Audio](../modules/worker_audio.md).AudioListenerProxy

## Hierarchy

* [*Object3DProxy*](worker_messagequeue.object3dproxy.md)

  ↳ **AudioListenerProxy**

## Constructors

### constructor

\+ **new AudioListenerProxy**(): [*AudioListenerProxy*](worker_audio.audiolistenerproxy.md)

**Returns:** [*AudioListenerProxy*](worker_audio.audiolistenerproxy.md)

Overrides: [Object3DProxy](worker_messagequeue.object3dproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:230](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L230)

## Properties

### messageQueue

• **messageQueue**: [*MainProxy*](worker_messagequeue.mainproxy.md)

Inherited from: [Object3DProxy](worker_messagequeue.object3dproxy.md).[messageQueue](worker_messagequeue.object3dproxy.md#messagequeue)

Defined in: [packages/engine/src/worker/MessageQueue.ts:569](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L569)

___

### proxyID

• **proxyID**: *string*

Inherited from: [Object3DProxy](worker_messagequeue.object3dproxy.md).[proxyID](worker_messagequeue.object3dproxy.md#proxyid)

Defined in: [packages/engine/src/worker/MessageQueue.ts:567](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L567)

___

### setQueue

• **setQueue**: *Map*<string, any\>

Inherited from: [Object3DProxy](worker_messagequeue.object3dproxy.md).[setQueue](worker_messagequeue.object3dproxy.md#setqueue)

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

Inherited from: [Object3DProxy](worker_messagequeue.object3dproxy.md)

Defined in: [packages/engine/src/worker/MessageQueue.ts:598](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L598)

___

### getFilter

▸ **getFilter**(): [*AudioListenerProxy*](worker_audio.audiolistenerproxy.md)

**Returns:** [*AudioListenerProxy*](worker_audio.audiolistenerproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:243](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L243)

___

### getInput

▸ **getInput**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/worker/Audio.ts:237](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L237)

___

### getMasterVolume

▸ **getMasterVolume**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/worker/Audio.ts:252](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L252)

___

### removeFilter

▸ **removeFilter**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/worker/Audio.ts:240](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L240)

___

### setFilter

▸ **setFilter**(`filter`: *any*): [*AudioListenerProxy*](worker_audio.audiolistenerproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`filter` | *any* |

**Returns:** [*AudioListenerProxy*](worker_audio.audiolistenerproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:247](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L247)

___

### setMasterVolume

▸ **setMasterVolume**(`volume`: *any*): [*AudioListenerProxy*](worker_audio.audiolistenerproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`volume` | *any* |

**Returns:** [*AudioListenerProxy*](worker_audio.audiolistenerproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:255](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L255)
