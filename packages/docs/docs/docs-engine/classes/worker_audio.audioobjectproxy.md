---
id: "worker_audio.audioobjectproxy"
title: "Class: AudioObjectProxy"
sidebar_label: "AudioObjectProxy"
custom_edit_url: null
hide_title: true
---

# Class: AudioObjectProxy

[worker/Audio](../modules/worker_audio.md).AudioObjectProxy

## Hierarchy

* [*Object3DProxy*](worker_messagequeue.object3dproxy.md)

  ↳ **AudioObjectProxy**

  ↳↳ [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

## Constructors

### constructor

\+ **new AudioObjectProxy**(`listener`: [*AudioListenerProxy*](worker_audio.audiolistenerproxy.md)): [*AudioObjectProxy*](worker_audio.audioobjectproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`listener` | [*AudioListenerProxy*](worker_audio.audiolistenerproxy.md) |

**Returns:** [*AudioObjectProxy*](worker_audio.audioobjectproxy.md)

Overrides: [Object3DProxy](worker_messagequeue.object3dproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:33](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L33)

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

### connect

▸ **connect**(): [*AudioObjectProxy*](worker_audio.audioobjectproxy.md)

**Returns:** [*AudioObjectProxy*](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:111](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L111)

___

### disconnect

▸ **disconnect**(): [*AudioObjectProxy*](worker_audio.audioobjectproxy.md)

**Returns:** [*AudioObjectProxy*](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:115](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L115)

___

### getDetune

▸ **getDetune**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/worker/Audio.ts:132](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L132)

___

### getFilter

▸ **getFilter**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/worker/Audio.ts:135](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L135)

___

### getFilters

▸ **getFilters**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/worker/Audio.ts:119](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L119)

___

### getLoop

▸ **getLoop**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/worker/Audio.ts:152](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L152)

___

### getOutput

▸ **getOutput**(): *void*

**Returns:** *void*

Defined in: [packages/engine/src/worker/Audio.ts:59](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L59)

___

### getPlaybackRate

▸ **getPlaybackRate**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/worker/Audio.ts:146](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L146)

___

### getVolume

▸ **getVolume**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/worker/Audio.ts:165](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L165)

___

### onEnded

▸ **onEnded**(): *void*

**Returns:** *void*

Defined in: [packages/engine/src/worker/Audio.ts:149](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L149)

___

### pause

▸ **pause**(): [*AudioObjectProxy*](worker_audio.audioobjectproxy.md)

**Returns:** [*AudioObjectProxy*](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:103](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L103)

___

### play

▸ **play**(): [*AudioObjectProxy*](worker_audio.audioobjectproxy.md)

**Returns:** [*AudioObjectProxy*](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:99](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L99)

___

### setBuffer

▸ **setBuffer**(`bufferID`: *string*): [*AudioObjectProxy*](worker_audio.audioobjectproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`bufferID` | *string* |

**Returns:** [*AudioObjectProxy*](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:89](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L89)

___

### setDetune

▸ **setDetune**(`detune`: *any*): [*AudioObjectProxy*](worker_audio.audioobjectproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`detune` | *any* |

**Returns:** [*AudioObjectProxy*](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:127](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L127)

___

### setFilter

▸ **setFilter**(`filter`: *any*): [*AudioObjectProxy*](worker_audio.audioobjectproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`filter` | *any* |

**Returns:** [*AudioObjectProxy*](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:138](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L138)

___

### setFilters

▸ **setFilters**(`filters`: *any*): [*AudioObjectProxy*](worker_audio.audioobjectproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`filters` | *any* |

**Returns:** [*AudioObjectProxy*](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:122](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L122)

___

### setLoop

▸ **setLoop**(`loop`: *boolean*): [*AudioObjectProxy*](worker_audio.audioobjectproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`loop` | *boolean* |

**Returns:** [*AudioObjectProxy*](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:155](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L155)

___

### setMediaElementSource

▸ **setMediaElementSource**(`source`: [*AudioDocumentElementProxy*](worker_messagequeue.audiodocumentelementproxy.md)): [*AudioObjectProxy*](worker_audio.audioobjectproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`source` | [*AudioDocumentElementProxy*](worker_messagequeue.audiodocumentelementproxy.md) |

**Returns:** [*AudioObjectProxy*](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:67](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L67)

___

### setMediaStreamSource

▸ **setMediaStreamSource**(`sourceID`: *string*): [*AudioObjectProxy*](worker_audio.audioobjectproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`sourceID` | *string* |

**Returns:** [*AudioObjectProxy*](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:78](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L78)

___

### setNodeSource

▸ **setNodeSource**(`audioNodeProxyID`: *any*): [*AudioObjectProxy*](worker_audio.audioobjectproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`audioNodeProxyID` | *any* |

**Returns:** [*AudioObjectProxy*](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:62](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L62)

___

### setPlaybackRate

▸ **setPlaybackRate**(`playbackRate`: *any*): [*AudioObjectProxy*](worker_audio.audioobjectproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`playbackRate` | *any* |

**Returns:** [*AudioObjectProxy*](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:141](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L141)

___

### setVolume

▸ **setVolume**(`volume`: *number*): [*AudioObjectProxy*](worker_audio.audioobjectproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`volume` | *number* |

**Returns:** [*AudioObjectProxy*](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:160](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L160)

___

### stop

▸ **stop**(): [*AudioObjectProxy*](worker_audio.audioobjectproxy.md)

**Returns:** [*AudioObjectProxy*](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:107](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L107)
