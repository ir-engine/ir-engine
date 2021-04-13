---
id: "input_types_webxr.xrinputsourceevent"
title: "Interface: XRInputSourceEvent"
sidebar_label: "XRInputSourceEvent"
custom_edit_url: null
hide_title: true
---

# Interface: XRInputSourceEvent

[input/types/WebXR](../modules/input_types_webxr.md).XRInputSourceEvent

## Hierarchy

* *Event*

  ↳ **XRInputSourceEvent**

## Properties

### AT\_TARGET

• `Readonly` **AT\_TARGET**: *number*

Inherited from: void

Defined in: node_modules/typescript/lib/lib.dom.d.ts:5408

___

### BUBBLING\_PHASE

• `Readonly` **BUBBLING\_PHASE**: *number*

Inherited from: void

Defined in: node_modules/typescript/lib/lib.dom.d.ts:5409

___

### CAPTURING\_PHASE

• `Readonly` **CAPTURING\_PHASE**: *number*

Inherited from: void

Defined in: node_modules/typescript/lib/lib.dom.d.ts:5410

___

### NONE

• `Readonly` **NONE**: *number*

Inherited from: void

Defined in: node_modules/typescript/lib/lib.dom.d.ts:5411

___

### bubbles

• `Readonly` **bubbles**: *boolean*

Returns true or false depending on how event was initialized. True if event goes through its target's ancestors in reverse tree order, and false otherwise.

Inherited from: void

Defined in: node_modules/typescript/lib/lib.dom.d.ts:5350

___

### cancelBubble

• **cancelBubble**: *boolean*

Inherited from: void

Defined in: node_modules/typescript/lib/lib.dom.d.ts:5351

___

### cancelable

• `Readonly` **cancelable**: *boolean*

Returns true or false depending on how event was initialized. Its return value does not always carry meaning, but true can indicate that part of the operation during which event was dispatched, can be canceled by invoking the preventDefault() method.

Inherited from: void

Defined in: node_modules/typescript/lib/lib.dom.d.ts:5355

___

### composed

• `Readonly` **composed**: *boolean*

Returns true or false depending on how event was initialized. True if event invokes listeners past a ShadowRoot node that is the root of its target, and false otherwise.

Inherited from: void

Defined in: node_modules/typescript/lib/lib.dom.d.ts:5359

___

### currentTarget

• `Readonly` **currentTarget**: EventTarget

Returns the object whose event listener's callback is currently being invoked.

Inherited from: void

Defined in: node_modules/typescript/lib/lib.dom.d.ts:5363

___

### defaultPrevented

• `Readonly` **defaultPrevented**: *boolean*

Returns true if preventDefault() was invoked successfully to indicate cancelation, and false otherwise.

Inherited from: void

Defined in: node_modules/typescript/lib/lib.dom.d.ts:5367

___

### eventPhase

• `Readonly` **eventPhase**: *number*

Returns the event's phase, which is one of NONE, CAPTURING_PHASE, AT_TARGET, and BUBBLING_PHASE.

Inherited from: void

Defined in: node_modules/typescript/lib/lib.dom.d.ts:5371

___

### frame

• `Readonly` **frame**: [*XRFrame*](input_types_webxr.xrframe.md)

Defined in: [packages/engine/src/input/types/WebXR.ts:145](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/types/WebXR.ts#L145)

___

### inputSource

• `Readonly` **inputSource**: [*XRInputSource*](input_types_webxr.xrinputsource.md)

Defined in: [packages/engine/src/input/types/WebXR.ts:146](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/types/WebXR.ts#L146)

___

### isTrusted

• `Readonly` **isTrusted**: *boolean*

Returns true if event was dispatched by the user agent, and false otherwise.

Inherited from: void

Defined in: node_modules/typescript/lib/lib.dom.d.ts:5375

___

### returnValue

• **returnValue**: *boolean*

Inherited from: void

Defined in: node_modules/typescript/lib/lib.dom.d.ts:5376

___

### srcElement

• `Readonly` **srcElement**: EventTarget

**`deprecated`** 

Inherited from: void

Defined in: node_modules/typescript/lib/lib.dom.d.ts:5378

___

### target

• `Readonly` **target**: EventTarget

Returns the object to which event is dispatched (its target).

Inherited from: void

Defined in: node_modules/typescript/lib/lib.dom.d.ts:5382

___

### timeStamp

• `Readonly` **timeStamp**: *number*

Returns the event's timestamp as the number of milliseconds measured relative to the time origin.

Inherited from: void

Defined in: node_modules/typescript/lib/lib.dom.d.ts:5386

___

### type

• `Readonly` **type**: *string*

Returns the type of event, e.g. "click", "hashchange", or "submit".

Inherited from: void

Defined in: node_modules/typescript/lib/lib.dom.d.ts:5390

## Methods

### composedPath

▸ **composedPath**(): EventTarget[]

Returns the invocation target objects of event's path (objects on which listeners will be invoked), except for any nodes in shadow trees of which the shadow root's mode is "closed" that are not reachable from event's currentTarget.

**Returns:** EventTarget[]

Inherited from: void

Defined in: node_modules/typescript/lib/lib.dom.d.ts:5394

___

### initEvent

▸ **initEvent**(`type`: *string*, `bubbles?`: *boolean*, `cancelable?`: *boolean*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`type` | *string* |
`bubbles?` | *boolean* |
`cancelable?` | *boolean* |

**Returns:** *void*

Inherited from: void

Defined in: node_modules/typescript/lib/lib.dom.d.ts:5395

___

### preventDefault

▸ **preventDefault**(): *void*

If invoked when the cancelable attribute value is true, and while executing a listener for the event with passive set to false, signals to the operation that caused event to be dispatched that it needs to be canceled.

**Returns:** *void*

Inherited from: void

Defined in: node_modules/typescript/lib/lib.dom.d.ts:5399

___

### stopImmediatePropagation

▸ **stopImmediatePropagation**(): *void*

Invoking this method prevents event from reaching any registered event listeners after the current one finishes running and, when dispatched in a tree, also prevents event from reaching any other objects.

**Returns:** *void*

Inherited from: void

Defined in: node_modules/typescript/lib/lib.dom.d.ts:5403

___

### stopPropagation

▸ **stopPropagation**(): *void*

When dispatched in a tree, invoking this method prevents event from reaching any objects other than the current object.

**Returns:** *void*

Inherited from: void

Defined in: node_modules/typescript/lib/lib.dom.d.ts:5407
