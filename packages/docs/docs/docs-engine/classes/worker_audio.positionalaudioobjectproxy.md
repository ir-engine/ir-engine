---
id: "worker_audio.positionalaudioobjectproxy"
title: "Class: PositionalAudioObjectProxy"
sidebar_label: "PositionalAudioObjectProxy"
custom_edit_url: null
hide_title: true
---

# Class: PositionalAudioObjectProxy

[worker/Audio](../modules/worker_audio.md).PositionalAudioObjectProxy

## Hierarchy

* [*AudioObjectProxy*](worker_audio.audioobjectproxy.md)

  ↳ **PositionalAudioObjectProxy**

## Constructors

### constructor

\+ **new PositionalAudioObjectProxy**(`listener`: [*AudioListenerProxy*](worker_audio.audiolistenerproxy.md)): [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`listener` | [*AudioListenerProxy*](worker_audio.audiolistenerproxy.md) |

**Returns:** [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

Overrides: [AudioObjectProxy](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:171](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L171)

## Properties

### messageQueue

• **messageQueue**: [*MainProxy*](worker_messagequeue.mainproxy.md)

Inherited from: [AudioObjectProxy](worker_audio.audioobjectproxy.md).[messageQueue](worker_audio.audioobjectproxy.md#messagequeue)

Defined in: [packages/engine/src/worker/MessageQueue.ts:569](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L569)

___

### proxyID

• **proxyID**: *string*

Inherited from: [AudioObjectProxy](worker_audio.audioobjectproxy.md).[proxyID](worker_audio.audioobjectproxy.md#proxyid)

Defined in: [packages/engine/src/worker/MessageQueue.ts:567](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L567)

___

### setQueue

• **setQueue**: *Map*<string, any\>

Inherited from: [AudioObjectProxy](worker_audio.audioobjectproxy.md).[setQueue](worker_audio.audioobjectproxy.md#setqueue)

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

Inherited from: [AudioObjectProxy](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/MessageQueue.ts:598](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L598)

___

### connect

▸ **connect**(): [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

**Returns:** [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

Inherited from: [AudioObjectProxy](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:111](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L111)

___

### disconnect

▸ **disconnect**(): [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

**Returns:** [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

Inherited from: [AudioObjectProxy](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:115](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L115)

___

### getDetune

▸ **getDetune**(): *any*

**Returns:** *any*

Inherited from: [AudioObjectProxy](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:132](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L132)

___

### getDistanceModel

▸ **getDistanceModel**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/worker/Audio.ts:194](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L194)

___

### getFilter

▸ **getFilter**(): *any*

**Returns:** *any*

Inherited from: [AudioObjectProxy](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:135](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L135)

___

### getFilters

▸ **getFilters**(): *any*

**Returns:** *any*

Inherited from: [AudioObjectProxy](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:119](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L119)

___

### getLoop

▸ **getLoop**(): *any*

**Returns:** *any*

Inherited from: [AudioObjectProxy](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:152](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L152)

___

### getMaxDistance

▸ **getMaxDistance**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/worker/Audio.ts:202](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L202)

___

### getOutput

▸ **getOutput**(): *void*

**Returns:** *void*

Overrides: [AudioObjectProxy](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:177](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L177)

___

### getPlaybackRate

▸ **getPlaybackRate**(): *any*

**Returns:** *any*

Inherited from: [AudioObjectProxy](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:146](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L146)

___

### getRefDistance

▸ **getRefDistance**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/worker/Audio.ts:178](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L178)

___

### getRolloffFactor

▸ **getRolloffFactor**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/worker/Audio.ts:186](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L186)

___

### getVolume

▸ **getVolume**(): *any*

**Returns:** *any*

Inherited from: [AudioObjectProxy](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:165](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L165)

___

### onEnded

▸ **onEnded**(): *void*

**Returns:** *void*

Inherited from: [AudioObjectProxy](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:149](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L149)

___

### pause

▸ **pause**(): [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

**Returns:** [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

Inherited from: [AudioObjectProxy](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:103](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L103)

___

### play

▸ **play**(): [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

**Returns:** [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

Inherited from: [AudioObjectProxy](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:99](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L99)

___

### setBuffer

▸ **setBuffer**(`bufferID`: *string*): [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`bufferID` | *string* |

**Returns:** [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

Inherited from: [AudioObjectProxy](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:89](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L89)

___

### setDetune

▸ **setDetune**(`detune`: *any*): [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`detune` | *any* |

**Returns:** [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

Inherited from: [AudioObjectProxy](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:127](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L127)

___

### setDirectionalCone

▸ **setDirectionalCone**(`coneInnerAngle`: *any*, `coneOuterAngle`: *any*, `coneOuterGain`: *any*): [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`coneInnerAngle` | *any* |
`coneOuterAngle` | *any* |
`coneOuterGain` | *any* |

**Returns:** [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:210](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L210)

___

### setDistanceModel

▸ **setDistanceModel**(`distanceModel`: *any*): [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`distanceModel` | *any* |

**Returns:** [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:197](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L197)

___

### setFilter

▸ **setFilter**(`filter`: *any*): [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`filter` | *any* |

**Returns:** [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

Inherited from: [AudioObjectProxy](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:138](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L138)

___

### setFilters

▸ **setFilters**(`filters`: *any*): [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`filters` | *any* |

**Returns:** [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

Inherited from: [AudioObjectProxy](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:122](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L122)

___

### setLoop

▸ **setLoop**(`loop`: *boolean*): [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`loop` | *boolean* |

**Returns:** [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

Inherited from: [AudioObjectProxy](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:155](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L155)

___

### setMaxDistance

▸ **setMaxDistance**(`maxDistance`: *any*): [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`maxDistance` | *any* |

**Returns:** [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:205](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L205)

___

### setMediaElementSource

▸ **setMediaElementSource**(`source`: [*AudioDocumentElementProxy*](worker_messagequeue.audiodocumentelementproxy.md)): [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`source` | [*AudioDocumentElementProxy*](worker_messagequeue.audiodocumentelementproxy.md) |

**Returns:** [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

Inherited from: [AudioObjectProxy](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:67](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L67)

___

### setMediaStreamSource

▸ **setMediaStreamSource**(`sourceID`: *string*): [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`sourceID` | *string* |

**Returns:** [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

Inherited from: [AudioObjectProxy](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:78](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L78)

___

### setNodeSource

▸ **setNodeSource**(`audioNodeProxyID`: *any*): [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`audioNodeProxyID` | *any* |

**Returns:** [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

Inherited from: [AudioObjectProxy](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:62](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L62)

___

### setPlaybackRate

▸ **setPlaybackRate**(`playbackRate`: *any*): [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`playbackRate` | *any* |

**Returns:** [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

Inherited from: [AudioObjectProxy](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:141](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L141)

___

### setRefDistance

▸ **setRefDistance**(`refDistance`: *any*): [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`refDistance` | *any* |

**Returns:** [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:181](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L181)

___

### setRolloffFactor

▸ **setRolloffFactor**(`rolloffFactor`: *any*): [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`rolloffFactor` | *any* |

**Returns:** [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:189](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L189)

___

### setVolume

▸ **setVolume**(`volume`: *number*): [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`volume` | *number* |

**Returns:** [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

Inherited from: [AudioObjectProxy](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:160](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L160)

___

### stop

▸ **stop**(): [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

**Returns:** [*PositionalAudioObjectProxy*](worker_audio.positionalaudioobjectproxy.md)

Inherited from: [AudioObjectProxy](worker_audio.audioobjectproxy.md)

Defined in: [packages/engine/src/worker/Audio.ts:107](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/Audio.ts#L107)
