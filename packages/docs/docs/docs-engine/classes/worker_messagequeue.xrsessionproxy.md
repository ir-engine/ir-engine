---
id: "worker_messagequeue.xrsessionproxy"
title: "Class: XRSessionProxy"
sidebar_label: "XRSessionProxy"
custom_edit_url: null
hide_title: true
---

# Class: XRSessionProxy

[worker/MessageQueue](../modules/worker_messagequeue.md).XRSessionProxy

## Hierarchy

* [*DocumentElementProxy*](worker_messagequeue.documentelementproxy.md)

  ↳ **XRSessionProxy**

## Implements

* [*XRSession*](../interfaces/input_types_webxr.xrsession.md)

## Constructors

### constructor

\+ **new XRSessionProxy**(`__namedParameters`: { `messageQueue`: [*MessageQueue*](worker_messagequeue.messagequeue.md) ; `uuid`: *string*  }): [*XRSessionProxy*](worker_messagequeue.xrsessionproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`__namedParameters` | *object* |
`__namedParameters.messageQueue` | [*MessageQueue*](worker_messagequeue.messagequeue.md) |
`__namedParameters.uuid` | *string* |

**Returns:** [*XRSessionProxy*](worker_messagequeue.xrsessionproxy.md)

Overrides: [DocumentElementProxy](worker_messagequeue.documentelementproxy.md)

Defined in: [packages/engine/src/worker/MessageQueue.ts:1158](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L1158)

## Properties

### \_listeners

• **\_listeners**: *any*

Inherited from: [DocumentElementProxy](worker_messagequeue.documentelementproxy.md).[_listeners](worker_messagequeue.documentelementproxy.md#_listeners)

Defined in: [packages/engine/src/worker/MessageQueue.ts:121](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L121)

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

### inputSources

• **inputSources**: [*XRInputSource*](../interfaces/input_types_webxr.xrinputsource.md)[]

Implementation of: [XRSession](../interfaces/input_types_webxr.xrsession.md).[inputSources](../interfaces/input_types_webxr.xrsession.md#inputsources)

Defined in: [packages/engine/src/worker/MessageQueue.ts:1158](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L1158)

___

### messageQueue

• **messageQueue**: [*MessageQueue*](worker_messagequeue.messagequeue.md)

Overrides: [DocumentElementProxy](worker_messagequeue.documentelementproxy.md).[messageQueue](worker_messagequeue.documentelementproxy.md#messagequeue)

Defined in: [packages/engine/src/worker/MessageQueue.ts:1155](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L1155)

___

### messageTypeFunctions

• **messageTypeFunctions**: *Map*<string \| [*MessageType*](../enums/worker_messagequeue.messagetype.md), any\>

Inherited from: [DocumentElementProxy](worker_messagequeue.documentelementproxy.md).[messageTypeFunctions](worker_messagequeue.documentelementproxy.md#messagetypefunctions)

Defined in: [packages/engine/src/worker/MessageQueue.ts:120](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L120)

___

### renderState

• **renderState**: *any*

Implementation of: [XRSession](../interfaces/input_types_webxr.xrsession.md).[renderState](../interfaces/input_types_webxr.xrsession.md#renderstate)

Defined in: [packages/engine/src/worker/MessageQueue.ts:1157](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L1157)

___

### requestAnimationFrame

• **requestAnimationFrame**: *any*

Implementation of: [XRSession](../interfaces/input_types_webxr.xrsession.md).[requestAnimationFrame](../interfaces/input_types_webxr.xrsession.md#requestanimationframe)

Defined in: [packages/engine/src/worker/MessageQueue.ts:1156](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L1156)

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

Implementation of: void

Inherited from: [DocumentElementProxy](worker_messagequeue.documentelementproxy.md)

Defined in: [packages/engine/src/worker/MessageQueue.ts:410](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L410)

___

### createOffscreenSession

▸ **createOffscreenSession**(`layerInit`: *any*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`layerInit` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/engine/src/worker/MessageQueue.ts:1186](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L1186)

___

### dispatchEvent

▸ **dispatchEvent**(`ev`: *any*, `fromMain?`: *boolean*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`ev` | *any* |
`fromMain?` | *boolean* |

**Returns:** *void*

Inherited from: [DocumentElementProxy](worker_messagequeue.documentelementproxy.md)

Defined in: [packages/engine/src/worker/MessageQueue.ts:432](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L432)

___

### end

▸ **end**(): *Promise*<void\>

**Returns:** *Promise*<void\>

Implementation of: [XRSession](../interfaces/input_types_webxr.xrsession.md)

Defined in: [packages/engine/src/worker/MessageQueue.ts:1170](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L1170)

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

### removeEventListener

▸ **removeEventListener**(`type`: *string*, `listener`: (`event`: *any*) => *void*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`type` | *string* |
`listener` | (`event`: *any*) => *void* |

**Returns:** *void*

Implementation of: void

Inherited from: [DocumentElementProxy](worker_messagequeue.documentelementproxy.md)

Defined in: [packages/engine/src/worker/MessageQueue.ts:421](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L421)

___

### requestHitTest

▸ **requestHitTest**(`ray`: [*XRRay*](input_types_webxr.xrray.md), `referenceSpace`: [*XRReferenceSpace*](../interfaces/input_types_webxr.xrreferencespace.md)): *Promise*<[*XRHitResult*](../interfaces/input_types_webxr.xrhitresult.md)[]\>

#### Parameters:

Name | Type |
:------ | :------ |
`ray` | [*XRRay*](input_types_webxr.xrray.md) |
`referenceSpace` | [*XRReferenceSpace*](../interfaces/input_types_webxr.xrreferencespace.md) |

**Returns:** *Promise*<[*XRHitResult*](../interfaces/input_types_webxr.xrhitresult.md)[]\>

Implementation of: [XRSession](../interfaces/input_types_webxr.xrsession.md)

Defined in: [packages/engine/src/worker/MessageQueue.ts:1180](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L1180)

___

### requestHitTestSource

▸ **requestHitTestSource**(`options`: [*XRHitTestOptionsInit*](../interfaces/input_types_webxr.xrhittestoptionsinit.md)): *Promise*<[*XRHitTestSource*](../interfaces/input_types_webxr.xrhittestsource.md)\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | [*XRHitTestOptionsInit*](../interfaces/input_types_webxr.xrhittestoptionsinit.md) |

**Returns:** *Promise*<[*XRHitTestSource*](../interfaces/input_types_webxr.xrhittestsource.md)\>

Implementation of: [XRSession](../interfaces/input_types_webxr.xrsession.md)

Defined in: [packages/engine/src/worker/MessageQueue.ts:1174](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L1174)

___

### requestHitTestSourceForTransientInput

▸ **requestHitTestSourceForTransientInput**(`options`: [*XRTransientInputHitTestOptionsInit*](../interfaces/input_types_webxr.xrtransientinputhittestoptionsinit.md)): *Promise*<[*XRTransientInputHitTestSource*](../interfaces/input_types_webxr.xrtransientinputhittestsource.md)\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | [*XRTransientInputHitTestOptionsInit*](../interfaces/input_types_webxr.xrtransientinputhittestoptionsinit.md) |

**Returns:** *Promise*<[*XRTransientInputHitTestSource*](../interfaces/input_types_webxr.xrtransientinputhittestsource.md)\>

Implementation of: [XRSession](../interfaces/input_types_webxr.xrsession.md)

Defined in: [packages/engine/src/worker/MessageQueue.ts:1177](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L1177)

___

### requestReferenceSpace

▸ **requestReferenceSpace**(`type`: [*XRReferenceSpaceType*](../modules/input_types_webxr.md#xrreferencespacetype)): *Promise*<[*XRReferenceSpace*](../interfaces/input_types_webxr.xrreferencespace.md)\>

#### Parameters:

Name | Type |
:------ | :------ |
`type` | [*XRReferenceSpaceType*](../modules/input_types_webxr.md#xrreferencespacetype) |

**Returns:** *Promise*<[*XRReferenceSpace*](../interfaces/input_types_webxr.xrreferencespace.md)\>

Implementation of: [XRSession](../interfaces/input_types_webxr.xrsession.md)

Defined in: [packages/engine/src/worker/MessageQueue.ts:1163](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L1163)

___

### updateRenderState

▸ **updateRenderState**(`XRRenderStateInit`: *any*): *Promise*<void\>

#### Parameters:

Name | Type |
:------ | :------ |
`XRRenderStateInit` | *any* |

**Returns:** *Promise*<void\>

Implementation of: [XRSession](../interfaces/input_types_webxr.xrsession.md)

Defined in: [packages/engine/src/worker/MessageQueue.ts:1166](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L1166)

___

### updateWorldTrackingState

▸ **updateWorldTrackingState**(`options`: { `planeDetectionState?`: { `enabled`: *boolean*  }  }): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *object* |
`options.planeDetectionState?` | *object* |
`options.planeDetectionState.enabled` | *boolean* |

**Returns:** *void*

Implementation of: [XRSession](../interfaces/input_types_webxr.xrsession.md)

Defined in: [packages/engine/src/worker/MessageQueue.ts:1183](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/worker/MessageQueue.ts#L1183)
