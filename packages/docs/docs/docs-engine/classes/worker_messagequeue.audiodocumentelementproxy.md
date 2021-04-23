---
id: "worker_messagequeue.audiodocumentelementproxy"
title: "Class: AudioDocumentElementProxy"
sidebar_label: "AudioDocumentElementProxy"
custom_edit_url: null
hide_title: true
---

# Class: AudioDocumentElementProxy

[worker/MessageQueue](../modules/worker_messagequeue.md).AudioDocumentElementProxy

## Hierarchy

* [*DocumentElementProxy*](worker_messagequeue.documentelementproxy.md)

  ↳ **AudioDocumentElementProxy**

  ↳↳ [*VideoDocumentElementProxy*](worker_messagequeue.videodocumentelementproxy.md)

## Constructors

### constructor

\+ **new AudioDocumentElementProxy**(`__namedParameters`: { `elementArgs?`: *any* ; `messageQueue`: [*MessageQueue*](worker_messagequeue.messagequeue.md) ; `type?`: *string*  }): [*AudioDocumentElementProxy*](worker_messagequeue.audiodocumentelementproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`__namedParameters` | *object* |
`__namedParameters.elementArgs?` | *any* |
`__namedParameters.messageQueue` | [*MessageQueue*](worker_messagequeue.messagequeue.md) |
`__namedParameters.type?` | *string* |

**Returns:** [*AudioDocumentElementProxy*](worker_messagequeue.audiodocumentelementproxy.md)

Overrides: [DocumentElementProxy](worker_messagequeue.documentelementproxy.md)

Defined in: [packages/engine/src/worker/MessageQueue.ts:450](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L450)

## Properties

### \_autoplay

• **\_autoplay**: *string*

Defined in: [packages/engine/src/worker/MessageQueue.ts:449](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L449)

___

### \_isPlaying

• **\_isPlaying**: *boolean*= false

Defined in: [packages/engine/src/worker/MessageQueue.ts:450](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L450)

___

### \_listeners

• **\_listeners**: *any*

Inherited from: [DocumentElementProxy](worker_messagequeue.documentelementproxy.md).[_listeners](worker_messagequeue.documentelementproxy.md#_listeners)

Defined in: [packages/engine/src/worker/MessageQueue.ts:121](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L121)

___

### \_src

• **\_src**: *string*

Defined in: [packages/engine/src/worker/MessageQueue.ts:448](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L448)

___

### eventListener

• **eventListener**: *any*

Inherited from: [DocumentElementProxy](worker_messagequeue.documentelementproxy.md).[eventListener](worker_messagequeue.documentelementproxy.md#eventlistener)

Defined in: [packages/engine/src/worker/MessageQueue.ts:119](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L119)

___

### eventTarget

• **eventTarget**: EventTarget

Inherited from: [DocumentElementProxy](worker_messagequeue.documentelementproxy.md).[eventTarget](worker_messagequeue.documentelementproxy.md#eventtarget)

Defined in: [packages/engine/src/worker/MessageQueue.ts:324](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L324)

___

### messageQueue

• **messageQueue**: [*MessageQueue*](worker_messagequeue.messagequeue.md)

Inherited from: [DocumentElementProxy](worker_messagequeue.documentelementproxy.md).[messageQueue](worker_messagequeue.documentelementproxy.md#messagequeue)

Defined in: [packages/engine/src/worker/MessageQueue.ts:321](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L321)

___

### messageTypeFunctions

• **messageTypeFunctions**: *Map*<string \| [*MessageType*](../enums/worker_messagequeue.messagetype.md), any\>

Inherited from: [DocumentElementProxy](worker_messagequeue.documentelementproxy.md).[messageTypeFunctions](worker_messagequeue.documentelementproxy.md#messagetypefunctions)

Defined in: [packages/engine/src/worker/MessageQueue.ts:120](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L120)

___

### type

• **type**: *string*

Inherited from: [DocumentElementProxy](worker_messagequeue.documentelementproxy.md).[type](worker_messagequeue.documentelementproxy.md#type)

Defined in: [packages/engine/src/worker/MessageQueue.ts:323](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L323)

___

### uuid

• **uuid**: *string*

Inherited from: [DocumentElementProxy](worker_messagequeue.documentelementproxy.md).[uuid](worker_messagequeue.documentelementproxy.md#uuid)

Defined in: [packages/engine/src/worker/MessageQueue.ts:322](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L322)

## Accessors

### autoplay

• get **autoplay**(): *string*

**Returns:** *string*

Defined in: [packages/engine/src/worker/MessageQueue.ts:473](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L473)

• set **autoplay**(`value`: *string*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *string* |

**Returns:** *void*

Defined in: [packages/engine/src/worker/MessageQueue.ts:476](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L476)

___

### isPlaying

• get **isPlaying**(): *boolean*

**Returns:** *boolean*

Defined in: [packages/engine/src/worker/MessageQueue.ts:480](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L480)

___

### src

• get **src**(): *string*

**Returns:** *string*

Defined in: [packages/engine/src/worker/MessageQueue.ts:466](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L466)

• set **src**(`value`: *string*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *string* |

**Returns:** *void*

Defined in: [packages/engine/src/worker/MessageQueue.ts:469](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L469)

## Methods

### \_\_callFunc

▸ **__callFunc**(`call`: *string*, ...`args`: *any*): *boolean*

#### Parameters:

Name | Type |
:------ | :------ |
`call` | *string* |
`...args` | *any* |

**Returns:** *boolean*

Inherited from: [DocumentElementProxy](worker_messagequeue.documentelementproxy.md)

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

Inherited from: [DocumentElementProxy](worker_messagequeue.documentelementproxy.md)

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

Inherited from: [DocumentElementProxy](worker_messagequeue.documentelementproxy.md)

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

Inherited from: [DocumentElementProxy](worker_messagequeue.documentelementproxy.md)

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

Overrides: [DocumentElementProxy](worker_messagequeue.documentelementproxy.md)

Defined in: [packages/engine/src/worker/MessageQueue.ts:489](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L489)

___

### hasEventListener

▸ **hasEventListener**(`type`: *string*, `listener`: *any*): *boolean*

#### Parameters:

Name | Type |
:------ | :------ |
`type` | *string* |
`listener` | *any* |

**Returns:** *boolean*

Inherited from: [DocumentElementProxy](worker_messagequeue.documentelementproxy.md)

Defined in: [packages/engine/src/worker/MessageQueue.ts:164](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L164)

___

### pause

▸ **pause**(): *void*

**Returns:** *void*

Defined in: [packages/engine/src/worker/MessageQueue.ts:486](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L486)

___

### play

▸ **play**(): *void*

**Returns:** *void*

Defined in: [packages/engine/src/worker/MessageQueue.ts:483](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L483)

___

### removeEventListener

▸ **removeEventListener**(`type`: *string*, `listener`: (`event`: *any*) => *void*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`type` | *string* |
`listener` | (`event`: *any*) => *void* |

**Returns:** *void*

Inherited from: [DocumentElementProxy](worker_messagequeue.documentelementproxy.md)

Defined in: [packages/engine/src/worker/MessageQueue.ts:421](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L421)
