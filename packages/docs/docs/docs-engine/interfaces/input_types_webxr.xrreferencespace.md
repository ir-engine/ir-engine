---
id: "input_types_webxr.xrreferencespace"
title: "Interface: XRReferenceSpace"
sidebar_label: "XRReferenceSpace"
custom_edit_url: null
hide_title: true
---

# Interface: XRReferenceSpace

[input/types/WebXR](../modules/input_types_webxr.md).XRReferenceSpace

## Hierarchy

* [*XRSpace*](../modules/input_types_webxr.md#xrspace)

  ↳ **XRReferenceSpace**

## Properties

### onreset

• **onreset**: *any*

Defined in: [packages/engine/src/input/types/WebXR.ts:76](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/types/WebXR.ts#L76)

## Methods

### addEventListener

▸ **addEventListener**(`type`: *string*, `listener`: EventListenerOrEventListenerObject, `options?`: *boolean* \| AddEventListenerOptions): *void*

Appends an event listener for events whose type attribute value is type. The callback argument sets the callback that will be invoked when the event is dispatched.

The options argument sets listener-specific options. For compatibility this can be a boolean, in which case the method behaves exactly as if the value was specified as options's capture.

When set to true, options's capture prevents callback from being invoked when the event's eventPhase attribute value is BUBBLING_PHASE. When false (or not present), callback will not be invoked when event's eventPhase attribute value is CAPTURING_PHASE. Either way, callback will be invoked if event's eventPhase attribute value is AT_TARGET.

When set to true, options's passive indicates that the callback will not cancel the event by invoking preventDefault(). This is used to enable performance optimizations described in § 2.8 Observing event listeners.

When set to true, options's once indicates that the callback will only be invoked once after which the event listener will be removed.

The event listener is appended to target's event listener list and is not appended if it has the same type, callback, and capture.

#### Parameters:

Name | Type |
:------ | :------ |
`type` | *string* |
`listener` | EventListenerOrEventListenerObject |
`options?` | *boolean* \| AddEventListenerOptions |

**Returns:** *void*

Inherited from: void

Defined in: node_modules/typescript/lib/lib.dom.d.ts:5485

___

### dispatchEvent

▸ **dispatchEvent**(`event`: Event): *boolean*

Dispatches a synthetic event event to target and returns true if either event's cancelable attribute value is false or its preventDefault() method was not invoked, and false otherwise.

#### Parameters:

Name | Type |
:------ | :------ |
`event` | Event |

**Returns:** *boolean*

Inherited from: void

Defined in: node_modules/typescript/lib/lib.dom.d.ts:5489

___

### getOffsetReferenceSpace

▸ **getOffsetReferenceSpace**(`originOffset`: [*XRRigidTransform*](../classes/input_types_webxr.xrrigidtransform.md)): [*XRReferenceSpace*](input_types_webxr.xrreferencespace.md)

#### Parameters:

Name | Type |
:------ | :------ |
`originOffset` | [*XRRigidTransform*](../classes/input_types_webxr.xrrigidtransform.md) |

**Returns:** [*XRReferenceSpace*](input_types_webxr.xrreferencespace.md)

Defined in: [packages/engine/src/input/types/WebXR.ts:75](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/types/WebXR.ts#L75)

___

### removeEventListener

▸ **removeEventListener**(`type`: *string*, `callback`: EventListenerOrEventListenerObject, `options?`: *boolean* \| EventListenerOptions): *void*

Removes the event listener in target's event listener list with the same type, callback, and options.

#### Parameters:

Name | Type |
:------ | :------ |
`type` | *string* |
`callback` | EventListenerOrEventListenerObject |
`options?` | *boolean* \| EventListenerOptions |

**Returns:** *void*

Inherited from: void

Defined in: node_modules/typescript/lib/lib.dom.d.ts:5493
